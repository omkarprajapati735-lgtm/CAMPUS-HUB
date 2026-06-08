import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  initDB,
  getDB,
  saveDB,
  User,
  StudentProfile,
  Notice,
  ClassroomNote,
  TimeTableSlot,
  LibraryBook,
  BorrowRecord,
  ExamFee,
  ExamResult,
  Notification
} from "./server/database.ts";

// Initialize fake DB from storage or seeds
initDB();

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth helper middleware: verifies a mock bearer token 'Bearer userId-role'
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Token is formatted simple as userId:role
  const parts = token.split(":");
  if (parts.length < 2) {
    return res.status(403).json({ error: "Invalid token structure" });
  }

  const userId = parts[0];
  const role = parts[1];

  const db = getDB();
  const user = db.users.find((u) => u._id === userId && u.role === role);
  if (!user) {
    return res.status(403).json({ error: "User session not found" });
  }

  req.user = user;
  next();
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = getDB();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = `${user._id}:${user.role}`;
  let studentProfile: StudentProfile | undefined;

  if (user.role === "student") {
    studentProfile = db.students.find((s) => s.userId === user._id);
  }

  return res.json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    studentProfile
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, rollNo, semester, batch, phone, parentContact } = req.body;

  if (!name || !email || !password || !rollNo) {
    return res.status(400).json({ error: "Name, email, password, and roll number are required" });
  }

  const db = getDB();
  const userExists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUserId = "u-" + Math.random().toString(36).substring(2, 9);
  const newStudentId = "s-" + Math.random().toString(36).substring(2, 9);

  const newUser: User = {
    _id: newUserId,
    email: email.toLowerCase(),
    passwordHash: password,
    role: "student",
    name
  };

  const newStudent: StudentProfile = {
    _id: newStudentId,
    userId: newUserId,
    rollNo,
    semester: Number(semester) || 1,
    batch: batch || "2024-2028",
    verified: true,
    phone: phone || "+1 555-0100",
    gpa: 0.0,
    parentContact: parentContact || "+1 555-0101",
    verificationDocuments: ["ID_Card.pdf"]
  };

  db.users.push(newUser);
  db.students.push(newStudent);

  // Add a welcoming notification
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: newStudentId,
    title: "Account Registered Successfully",
    message: `Welcome ${name}! Your student portal profile is now active under roll number ${rollNo}.`,
    type: "academic",
    read: false,
    createdAt: new Date().toISOString()
  });

  // Seed default progress tracking data
  db.progress.push({
    _id: "p-" + Math.random().toString(36).substring(2, 9),
    studentId: newStudentId,
    currentCGPA: 0.0,
    totalCredits: 0,
    passedCredits: 0,
    currentSemester: Number(semester) || 1,
    academicHistory: []
  });

  saveDB();

  const token = `${newUserId}:student`;

  return res.json({
    message: "Registration successful",
    token,
    user: {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    },
    studentProfile: newStudent
  });
});

// -------------------------------------------------------------
// STUDENT PROFILE ENDPOINTS
// -------------------------------------------------------------
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;
  let studentProfile = db.students.find((s) => s.userId === user._id);

  return res.json({
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    studentProfile
  });
});

app.put("/api/profile", authenticateToken, (req: any, res) => {
  const db = getDB();
  const user = req.user;
  const { name, phone, parentContact, semester, profileImage } = req.body;

  // Update user name
  const dbUser = db.users.find((u) => u._id === user._id);
  if (dbUser && name) {
    dbUser.name = name;
  }

  // Update student specific details
  if (user.role === "student") {
    const student = db.students.find((s) => s.userId === user._id);
    if (student) {
      if (phone) student.phone = phone;
      if (parentContact) student.parentContact = parentContact;
      if (semester) student.semester = Number(semester);
      if (profileImage) student.profileImage = profileImage;
    }
  }

  saveDB();

  let studentProfile = db.students.find((s) => s.userId === user._id);
  return res.json({
    message: "Profile updated successfully",
    user: {
      _id: dbUser?._id,
      email: dbUser?.email,
      role: dbUser?.role,
      name: dbUser?.name
    },
    studentProfile
  });
});

// Helper route to get all students (for teachers/admins)
app.get("/api/students", authenticateToken, (req: any, res) => {
  const db = getDB();
  const resultsList = db.students.map((student) => {
    const relatedUser = db.users.find((u) => u._id === student.userId);
    return {
      ...student,
      name: relatedUser ? relatedUser.name : "Unknown",
      email: relatedUser ? relatedUser.email : ""
    };
  });
  return res.json(resultsList);
});

// -------------------------------------------------------------
// NOTICE BOARD ENDPOINTS
// -------------------------------------------------------------
app.get("/api/notices", (req, res) => {
  const db = getDB();
  return res.json(db.notices);
});

app.post("/api/notices", authenticateToken, (req: any, res) => {
  const { title, description, importance, category } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const db = getDB();
  const newNotice: Notice = {
    _id: "n-" + Math.random().toString(36).substring(2, 9),
    title,
    description,
    importance: importance || "medium",
    category: category || "general",
    postedBy: req.user._id,
    postedByName: `${req.user.name} (${req.user.role.toUpperCase()})`,
    createdAt: new Date().toISOString()
  };

  db.notices.unshift(newNotice);

  // Broadcast Notification
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: "all",
    title: `New Notice: ${title}`,
    message: description.substring(0, 100) + (description.length > 100 ? "..." : ""),
    type: "notice",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Notice posted successfully", notice: newNotice });
});

app.delete("/api/notices/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const { id } = req.params;
  const db = getDB();
  const index = db.notices.findIndex((n) => n._id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Notice not found" });
  }

  db.notices.splice(index, 1);
  saveDB();
  return res.json({ message: "Notice deleted successfully" });
});

// -------------------------------------------------------------
// CLASSROOM NOTES ENDPOINTS
// -------------------------------------------------------------
app.get("/api/notes", (req, res) => {
  const db = getDB();
  return res.json(db.notes);
});

app.post("/api/notes", authenticateToken, (req: any, res) => {
  const { subject, fileName, semester, description } = req.body;
  if (!subject || !fileName || !semester) {
    return res.status(400).json({ error: "Subject, file name, and semester are required" });
  }

  const db = getDB();
  const newNote: ClassroomNote = {
    _id: "cn-" + Math.random().toString(36).substring(2, 9),
    subject,
    uploadedBy: req.user.name,
    fileName,
    semester: Number(semester),
    fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
    views: 0,
    description: description || "No description provided.",
    createdAt: new Date().toISOString(),
    downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  };

  db.notes.unshift(newNote);

  // Send broad notification
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: "all",
    title: `New Study Material Uploaded`,
    message: `${req.user.name} posted notes for '${subject}': ${fileName}`,
    type: "academic",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Classroom note shared successfully", note: newNote });
});

app.post("/api/notes/:id/view", (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const note = db.notes.find((n) => n._id === id);
  if (note) {
    note.views += 1;
    saveDB();
    return res.json({ views: note.views });
  }
  return res.status(404).json({ error: "Note not found" });
});

// -------------------------------------------------------------
// TIMETABLE ENDPOINTS
// -------------------------------------------------------------
app.get("/api/timetable", (req, res) => {
  const db = getDB();
  return res.json(db.timetables);
});

app.post("/api/timetable", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const { semester, day, startTime, endTime, subject, instructor, classroom } = req.body;
  if (!semester || !day || !startTime || !endTime || !subject || !classroom) {
    return res.status(400).json({ error: "All slot parameters are required" });
  }

  const db = getDB();
  const newSlot: TimeTableSlot = {
    _id: "t-" + Math.random().toString(36).substring(2, 9),
    semester: Number(semester),
    batch: "2023-2027",
    day,
    startTime,
    endTime,
    subject,
    instructor: instructor || req.user.name,
    classroom
  };

  db.timetables.push(newSlot);
  saveDB();
  return res.json({ message: "Timetable slot added successfully", slot: newSlot });
});

// -------------------------------------------------------------
// LIBRARY ENDPOINTS
// -------------------------------------------------------------
app.get("/api/library/books", (req, res) => {
  const db = getDB();
  return res.json(db.books);
});

app.get("/api/library/history", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = db.students.find((s) => s.userId === req.user._id);
  if (!student) {
    return res.json([]);
  }
  const history = db.borrowHistory.filter((bh) => bh.studentId === student._id);
  return res.json(history);
});

app.post("/api/library/borrow", authenticateToken, (req: any, res) => {
  const { bookId } = req.body;
  const db = getDB();

  const student = db.students.find((s) => s.userId === req.user._id);
  if (!student) {
    return res.status(400).json({ error: "Only students can borrow books" });
  }

  const book = db.books.find((b) => b._id === bookId);
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (book.available <= 0) {
    return res.status(400).json({ error: "Book is currently out of stock" });
  }

  // Decrement book availability
  book.available -= 1;

  // Create borrows log
  const due = new Date();
  due.setDate(due.getDate() + 14); // 2 weeks due

  const record: BorrowRecord = {
    _id: "br-" + Math.random().toString(36).substring(2, 9),
    studentId: student._id,
    bookId: book._id,
    bookTitle: book.title,
    bookAuthor: book.author,
    borrowedDate: new Date().toISOString().split("T")[0],
    dueDate: due.toISOString().split("T")[0],
    status: "borrowed",
    fines: 0
  };

  db.borrowHistory.push(record);

  // Send confirmation notification
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: student._id,
    title: "Book Issued Successfully",
    message: `You successfully borrowed "${book.title}". Please return by ${record.dueDate} to avoid fines.`,
    type: "library",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Book issued successfully", record });
});

app.post("/api/library/return", authenticateToken, (req: any, res) => {
  const { recordId } = req.body;
  const db = getDB();

  const record = db.borrowHistory.find((br) => br._id === recordId);
  if (!record) {
    return res.status(404).json({ error: "Borrow record not found" });
  }

  if (record.status === "returned") {
    return res.status(400).json({ error: "Book already returned" });
  }

  const book = db.books.find((b) => b._id === record.bookId);
  if (book) {
    book.available = Math.min(book.quantity, book.available + 1);
  }

  record.returnDate = new Date().toISOString().split("T")[0];
  record.status = "returned";

  // Notify student
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: record.studentId,
    title: "Book Returned",
    message: `Thank you for returning "${record.bookTitle}". Your account is clear.`,
    type: "library",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Book returned successfully", record });
});

// Admin endpoint to manage books catalog
app.post("/api/library/books", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "librarian") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const { title, author, isbn, category, quantity, description, publishedYear } = req.body;
  if (!title || !author || !isbn || !quantity) {
    return res.status(400).json({ error: "Title, author, isbn, and quantity are required" });
  }

  const db = getDB();
  const newBook: LibraryBook = {
    _id: "b-" + Math.random().toString(36).substring(2, 9),
    title,
    author,
    isbn,
    category: category || "General",
    quantity: Number(quantity),
    available: Number(quantity),
    description: description || "",
    publishedYear: Number(publishedYear) || new Date().getFullYear()
  };

  db.books.push(newBook);
  saveDB();

  return res.json({ message: "Book added catalog successfully", book: newBook });
});

// -------------------------------------------------------------
// EXAM FEE ENDPOINTS
// -------------------------------------------------------------
app.get("/api/fees", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = db.students.find((s) => s.userId === req.user._id);

  if (!student) {
    // If not student, return all fees (for Admin, Finance Staff)
    return res.json(db.examFees);
  }

  const fees = db.examFees.filter((f) => f.studentId === student._id);
  return res.json(fees);
});

app.post("/api/fees/pay", authenticateToken, (req: any, res) => {
  const { feeId, cardNumber, cardExpiry, cvv } = req.body;
  if (!feeId) {
    return res.status(400).json({ error: "Fee ID is required for transaction" });
  }

  const db = getDB();
  const fee = db.examFees.find((f) => f._id === feeId);

  if (!fee) {
    return res.status(404).json({ error: "Fee statement not found" });
  }

  if (fee.paid) {
    return res.status(400).json({ error: "This invoice is already paid" });
  }

  // Simulate payment processing
  fee.paid = true;
  fee.paymentDate = new Date().toISOString().split("T")[0];
  fee.transactionId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);

  // Send notification
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: fee.studentId,
    title: "Exam Fee Receipt Issued",
    message: `Your payment of $${fee.amount} for Semester ${fee.semester} exam fees succeeded. Transaction reference: ${fee.transactionId}.`,
    type: "fee",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Payment processed successfully", fee });
});

// Admin/Finance endpoint to create custom invoices
app.post("/api/fees/invoice", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "finance") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const { studentId, semester, amount, dueDate } = req.body;
  if (!studentId || !semester || !amount) {
    return res.status(400).json({ error: "Student, semester, and amount are required" });
  }

  const db = getDB();
  const newInvoice: ExamFee = {
    _id: "ef-" + Math.random().toString(36).substring(2, 9),
    studentId,
    semester: Number(semester),
    amount: Number(amount),
    paid: false,
    dueDate: dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0] // 15 days
  };

  db.examFees.push(newInvoice);

  // Alert student
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: studentId,
    title: "New Academic Invoice Released",
    message: `An invoice of $${amount} has been raised for Sem ${semester} Exam Fees. Due date: ${newInvoice.dueDate}`,
    type: "fee",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Invoice created successfully", invoice: newInvoice });
});

// -------------------------------------------------------------
// RESULTS & PROGRESS ENDPOINTS
// -------------------------------------------------------------
app.get("/api/results", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = db.students.find((s) => s.userId === req.user._id);

  if (!student) {
    // If Admin/Teacher is querying results, return all results
    return res.json({
      results: db.results,
      progress: db.progress
    });
  }

  const studentResults = db.results.filter((r) => r.studentId === student._id);
  const studentProgress = db.progress.find((p) => p.studentId === student._id);

  return res.json({
    results: studentResults,
    progress: studentProgress
  });
});

app.post("/api/results", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  const { studentId, semester, subject, marks, totalMarks, grade } = req.body;
  if (!studentId || !semester || !subject || marks === undefined || !grade) {
    return res.status(400).json({ error: "Student ID, semester, subject, marks, and grade are required" });
  }

  const db = getDB();
  const newResult: ExamResult = {
    _id: "r-" + Math.random().toString(36).substring(2, 9),
    studentId,
    semester: Number(semester),
    subject,
    marks: Number(marks),
    totalMarks: totalMarks ? Number(totalMarks) : 100,
    grade,
    publishedDate: new Date().toISOString().split("T")[0]
  };

  db.results.push(newResult);

  // Recalculate CGPA of the student for simulated academic dashboard
  const progressRecord = db.progress.find((p) => p.studentId === studentId);
  if (progressRecord) {
    // Add dummy history update if missing
    const semesterNumber = Number(semester);
    const existingHist = progressRecord.academicHistory.find((h) => h.semester === semesterNumber);

    // Dynamic fake calculation: Map marks to GPA on 10.0 scale, average
    const relevantResults = db.results.filter((r) => r.studentId === studentId && r.semester === semesterNumber);
    const totalGpaSum = relevantResults.reduce((acc, current) => {
      let gpa = 4.0;
      if (current.grade.includes("A+")) gpa = 10.0;
      else if (current.grade.includes("A")) gpa = 9.0;
      else if (current.grade.includes("B+")) gpa = 8.0;
      else if (current.grade.includes("B")) gpa = 7.0;
      else if (current.grade.includes("C")) gpa = 6.0;
      return acc + gpa;
    }, 0);
    const computedSgpa = Math.round((totalGpaSum / relevantResults.length || 8.5) * 100) / 100;

    if (existingHist) {
      existingHist.sgpa = computedSgpa;
    } else {
      progressRecord.academicHistory.push({
        semester: semesterNumber,
        sgpa: computedSgpa,
        credits: 24
      });
    }

    // Sort history
    progressRecord.academicHistory.sort((a,b) => a.semester - b.semester);

    // Compute CGPA
    const sgpaSum = progressRecord.academicHistory.reduce((acc, h) => acc + h.sgpa, 0);
    const finalGpaVal = Math.round((sgpaSum / progressRecord.academicHistory.length) * 100) / 100;

    progressRecord.currentCGPA = finalGpaVal;
    progressRecord.totalCredits = progressRecord.academicHistory.length * 24;
    progressRecord.passedCredits = progressRecord.totalCredits;

    // Update Student model field gpa
    const studentItem = db.students.find((s) => s._id === studentId);
    if (studentItem) {
      studentItem.gpa = finalGpaVal;
    }
  }

  // Push notification of grade release
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: studentId,
    title: "Exam Results Published",
    message: `Your grade for ${subject} (Semester ${semester}) has been published. Earned: ${grade}.`,
    type: "academic",
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDB();
  return res.json({ message: "Result published successfully", result: newResult });
});

// -------------------------------------------------------------
// NOTIFICATIONS ENDPOINTS
// -------------------------------------------------------------
app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = db.students.find((s) => s.userId === req.user._id);

  if (!student) {
    // Return alerts targeted for general staff/all
    const alerts = db.notifications.filter((n) => n.recipientId === "all");
    return res.json(alerts);
  }

  const list = db.notifications.filter((n) => n.recipientId === "all" || n.recipientId === student._id);
  return res.json(list);
});

app.post("/api/notifications/read", authenticateToken, (req: any, res) => {
  const { id } = req.body;
  const db = getDB();

  if (id) {
    const notify = db.notifications.find((n) => n._id === id);
    if (notify) {
      notify.read = true;
    }
  } else {
    // Read all
    const student = db.students.find((s) => s.userId === req.user._id);
    const recId = student ? student._id : "all";
    db.notifications.forEach((n) => {
      if (n.recipientId === "all" || n.recipientId === recId) {
        n.read = true;
      }
    });
  }

  saveDB();
  return res.json({ success: true });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
