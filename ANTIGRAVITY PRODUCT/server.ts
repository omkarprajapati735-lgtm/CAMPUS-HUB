import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import {
  initDB, getDB, saveDB,
  type User, type Student, type Notice, type StudyMaterial,
  type Timetable, type Book, type BorrowRecord, type Transaction,
  type Result, type Notification, type Attendance, type Assignment,
} from "./server/database.ts";

initDB();

const app = express();
const PORT = 3000;

// ─── File Upload Setup ──────────────────────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|png|jpg|jpeg|gif|webp|doc|docx|ppt|pptx|xls|xlsx|zip|txt|csv/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("File type not supported"));
  },
});

// Serve uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Access token required" });

  const parts = token.split(":");
  if (parts.length < 2) return res.status(403).json({ success: false, message: "Invalid token" });

  const [userId, role] = parts;
  const db = getDB();
  const user = db.users.find(u => u._id === userId && u.role === role);
  if (!user) return res.status(403).json({ success: false, message: "Session expired" });

  req.user = user;
  next();
}

function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
}

// Helper: get student profile for a user
function getStudentForUser(userId: string): Student | undefined {
  return getDB().students.find(s => s.userId === userId);
}

// ═══════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);
  if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

  const token = `${user._id}:${user.role}`;
  const student = user.role === "student" ? db.students.find(s => s.userId === user._id) : undefined;
  const teacher = user.role === "teacher" ? db.teachers.find(t => t.userId === user._id) : undefined;

  return res.json({
    success: true, message: "Login successful",
    data: {
      token, user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
      studentProfile: student, teacherProfile: teacher,
    },
  });
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, password, rollNumber, semester, batch, phone, parentContact } = req.body;
  if (!fullName || !email || !password || !rollNumber) {
    return res.status(400).json({ success: false, message: "Name, email, password, and roll number are required" });
  }

  const db = getDB();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const uid = "u-" + Math.random().toString(36).substring(2, 9);
  const sid = "s-" + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  const newUser: User = {
    _id: uid, fullName, email: email.toLowerCase(), passwordHash: password,
    role: "student", isVerified: true, status: "active", createdAt: now, updatedAt: now,
  };

  const newStudent: Student = {
    _id: sid, userId: uid, rollNumber, registrationNumber: `REG-${new Date().getFullYear()}-CSE-${Math.floor(Math.random() * 900 + 100)}`,
    email: email.toLowerCase(), phone: phone || "", department: "CSE", program: "B.Tech",
    semester: Number(semester) || 1, batch: batch || "2023-2027",
    attendancePercentage: 0, currentGPA: 0, currentCGPA: 0,
    parentContact: parentContact || "", emergencyContact: "", address: "",
    verified: true, verificationDocuments: ["ID_Card.pdf"],
  };

  db.users.push(newUser);
  db.students.push(newStudent);
  db.progress.push({
    _id: "p-" + Math.random().toString(36).substring(2, 9),
    studentId: sid, currentCGPA: 0, totalCredits: 0, passedCredits: 0,
    currentSemester: Number(semester) || 1, academicHistory: [],
  });
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: sid, title: "Welcome to Campus Hub!",
    message: `Welcome ${fullName}! Your student portal is now active. Roll: ${rollNumber}.`,
    category: "academic", isRead: false, createdAt: now,
  });

  saveDB();
  const token = `${uid}:student`;
  return res.json({
    success: true, message: "Registration successful",
    data: {
      token, user: { _id: uid, fullName, email: newUser.email, role: "student" },
      studentProfile: newStudent,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// PROFILE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const db = getDB();
  const u = req.user;
  const student = u.role === "student" ? db.students.find(s => s.userId === u._id) : undefined;
  const teacher = u.role === "teacher" ? db.teachers.find(t => t.userId === u._id) : undefined;

  return res.json({
    success: true, data: {
      user: { _id: u._id, fullName: u.fullName, email: u.email, role: u.role, profilePhoto: u.profilePhoto },
      studentProfile: student, teacherProfile: teacher,
    },
  });
});

app.put("/api/profile", authenticateToken, (req: any, res) => {
  const db = getDB();
  const u = db.users.find(x => x._id === req.user._id);
  if (!u) return res.status(404).json({ success: false, message: "User not found" });

  const { fullName, phone, parentContact, address, semester, designation, qualifications } = req.body;
  if (fullName) u.fullName = fullName;
  u.updatedAt = new Date().toISOString();

  if (u.role === "student") {
    const student = db.students.find(s => s.userId === u._id);
    if (student) {
      if (phone !== undefined) student.phone = phone;
      if (parentContact !== undefined) student.parentContact = parentContact;
      if (address !== undefined) student.address = address;
      if (semester) student.semester = Number(semester);
    }
  }

  if (u.role === "teacher") {
    const teacher = db.teachers.find(t => t.userId === u._id);
    if (teacher) {
      if (phone !== undefined) teacher.phone = phone;
      if (designation) teacher.designation = designation;
      if (qualifications) teacher.qualifications = Array.isArray(qualifications) ? qualifications : qualifications.split(",").map((q: string) => q.trim());
    }
  }

  saveDB();
  const student = db.students.find(s => s.userId === u._id);
  const teacher = db.teachers.find(t => t.userId === u._id);
  return res.json({
    success: true, message: "Profile updated",
    data: { user: { _id: u._id, fullName: u.fullName, email: u.email, role: u.role }, studentProfile: student, teacherProfile: teacher },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// STUDENTS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/students", authenticateToken, (req: any, res) => {
  const db = getDB();
  const { search, semester, department, page = "1", limit = "20" } = req.query;
  let list = db.students.map(s => {
    const u = db.users.find(x => x._id === s.userId);
    return { ...s, fullName: u?.fullName || "Unknown", email: u?.email || "" };
  });

  if (search) list = list.filter(s => s.fullName.toLowerCase().includes(String(search).toLowerCase()) || s.rollNumber.toLowerCase().includes(String(search).toLowerCase()));
  if (semester) list = list.filter(s => s.semester === Number(semester));
  if (department) list = list.filter(s => s.department === department);

  const p = Number(page), l = Number(limit);
  const paginated = list.slice((p - 1) * l, p * l);
  return res.json({ success: true, data: paginated, total: list.length, page: p, limit: l });
});

// ═══════════════════════════════════════════════════════════════════════
// TEACHERS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/teachers", authenticateToken, (req: any, res) => {
  const db = getDB();
  return res.json({ success: true, data: db.teachers });
});

// ═══════════════════════════════════════════════════════════════════════
// DEPARTMENTS & SUBJECTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/departments", (req, res) => res.json({ success: true, data: getDB().departments }));
app.get("/api/subjects", (req, res) => {
  const { semester, department } = req.query;
  let list = getDB().subjects;
  if (semester) list = list.filter(s => s.semester === Number(semester));
  if (department) list = list.filter(s => s.department === department);
  return res.json({ success: true, data: list });
});

// ═══════════════════════════════════════════════════════════════════════
// NOTICES ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/notices", (req, res) => {
  const { category, search } = req.query;
  let list = getDB().notices.filter(n => n.isPublished);
  if (category && category !== "all") list = list.filter(n => n.category === category);
  if (search) list = list.filter(n => n.title.toLowerCase().includes(String(search).toLowerCase()) || n.description.toLowerCase().includes(String(search).toLowerCase()));
  return res.json({ success: true, data: list });
});

app.post("/api/notices", authenticateToken, requireRole("admin", "teacher", "admin-officer"), (req: any, res) => {
  const { title, description, category, targetRoles } = req.body;
  if (!title || !description) return res.status(400).json({ success: false, message: "Title and description required" });

  const db = getDB();
  const now = new Date().toISOString();
  const notice: Notice = {
    _id: "n-" + Math.random().toString(36).substring(2, 9),
    title, description, category: category || "academic", attachments: [],
    createdBy: req.user._id, createdByName: req.user.fullName,
    targetRoles: targetRoles || ["student", "teacher"], isPublished: true,
    createdAt: now, updatedAt: now,
  };
  db.notices.unshift(notice);
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: "all", title: `New Notice: ${title}`,
    message: description.substring(0, 120) + (description.length > 120 ? "..." : ""),
    category: "academic", isRead: false, createdAt: now,
  });
  saveDB();
  return res.json({ success: true, message: "Notice published", data: notice });
});

app.delete("/api/notices/:id", authenticateToken, requireRole("admin", "teacher"), (req: any, res) => {
  const db = getDB();
  const idx = db.notices.findIndex(n => n._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Notice not found" });
  db.notices.splice(idx, 1);
  saveDB();
  return res.json({ success: true, message: "Notice deleted" });
});

// ═══════════════════════════════════════════════════════════════════════
// STUDY MATERIALS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/study-materials", (req, res) => {
  const { subject, semester, category, search } = req.query;
  let list = getDB().studyMaterials;
  if (subject) list = list.filter(m => m.subject.toLowerCase().includes(String(subject).toLowerCase()));
  if (semester) list = list.filter(m => m.semester === Number(semester));
  if (category && category !== "all") list = list.filter(m => m.category === category);
  if (search) list = list.filter(m => m.title.toLowerCase().includes(String(search).toLowerCase()) || m.subject.toLowerCase().includes(String(search).toLowerCase()));
  return res.json({ success: true, data: list });
});

app.get("/api/study-materials/:id/download", (req, res) => {
  const db = getDB();
  const material = db.studyMaterials.find(m => m._id === req.params.id);
  if (!material) return res.status(404).json({ success: false, message: "Material not found" });
  
  if (material.downloadUrl === "#") {
    return res.status(404).send("This is a demo material and has no actual file attached.");
  }
  
  material.downloads += 1;
  saveDB();
  
  // Redirect to the actual file
  return res.redirect(material.downloadUrl);
});

app.post("/api/study-materials", authenticateToken, requireRole("teacher", "admin"), upload.single("file"), (req: any, res) => {
  const { title, description, subject, subjectId, semester, fileName, category } = req.body;
  if (!title || !subject) return res.status(400).json({ success: false, message: "Title and subject required" });

  const db = getDB();
  const file = req.file;
  const actualFileName = file ? file.originalname : (fileName || "untitled.pdf");
  const actualFileSize = file ? (file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`) : `${(Math.random() * 4 + 1).toFixed(1)} MB`;
  const actualFileType = file ? path.extname(file.originalname).replace(".", "").toLowerCase() : "pdf";
  const downloadUrl = file ? `/uploads/${file.filename}` : "#";

  const material: StudyMaterial = {
    _id: "sm-" + Math.random().toString(36).substring(2, 9),
    title, description: description || "", subject, subjectId: subjectId || "",
    semester: Number(semester) || 6, uploadedBy: req.user._id, uploadedByName: req.user.fullName,
    fileName: actualFileName, fileSize: actualFileSize, fileType: actualFileType,
    downloadUrl, category: category || "lecture-notes", views: 0, downloads: 0,
    createdAt: new Date().toISOString(),
  };
  db.studyMaterials.unshift(material);
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: "all", title: "New Study Material",
    message: `${req.user.fullName} uploaded "${title}" for ${subject}.`,
    category: "academic", isRead: false, createdAt: new Date().toISOString(),
  });
  saveDB();
  return res.json({ success: true, message: "Material uploaded", data: material });
});

// ═══════════════════════════════════════════════════════════════════════
// TIMETABLE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/timetable", (req, res) => {
  const { semester, department, day } = req.query;
  let list = getDB().timetables;
  if (semester) list = list.filter(t => t.semester === Number(semester));
  if (department) list = list.filter(t => t.department === department);
  if (day) list = list.filter(t => t.day === day);
  return res.json({ success: true, data: list });
});

app.post("/api/timetable", authenticateToken, requireRole("admin", "teacher"), (req: any, res) => {
  const { subjectId, subjectName, classroom, day, startTime, endTime, semester, department, type } = req.body;
  if (!subjectName || !day || !startTime || !endTime || !classroom) {
    return res.status(400).json({ success: false, message: "All slot parameters required" });
  }
  const db = getDB();
  const slot: Timetable = {
    _id: "tt-" + Math.random().toString(36).substring(2, 9),
    subjectId: subjectId || "", subjectName, teacherId: req.user._id, teacherName: req.user.fullName,
    classroom, day, startTime, endTime, semester: Number(semester) || 6,
    department: department || "CSE", type: type || "lecture",
  };
  db.timetables.push(slot);
  saveDB();
  return res.json({ success: true, message: "Slot added", data: slot });
});

// ═══════════════════════════════════════════════════════════════════════
// LIBRARY ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/books", (req, res) => {
  const { search, category } = req.query;
  let list = getDB().books;
  if (search) list = list.filter(b => b.title.toLowerCase().includes(String(search).toLowerCase()) || b.author.toLowerCase().includes(String(search).toLowerCase()));
  if (category && category !== "all") list = list.filter(b => b.category === category);
  return res.json({ success: true, data: list });
});

app.post("/api/books", authenticateToken, requireRole("librarian", "admin"), (req: any, res) => {
  const { title, author, isbn, category, quantity, description, publishedYear, location } = req.body;
  if (!title || !author || !isbn) return res.status(400).json({ success: false, message: "Title, author, and ISBN required" });

  const db = getDB();
  const book: Book = {
    _id: "b-" + Math.random().toString(36).substring(2, 9),
    title, author, isbn, category: category || "General",
    quantity: Number(quantity) || 1, availableQuantity: Number(quantity) || 1,
    location: location || "Shelf A1", publishedYear: Number(publishedYear) || new Date().getFullYear(),
    description: description || "", createdAt: new Date().toISOString(),
  };
  db.books.push(book);
  saveDB();
  return res.json({ success: true, message: "Book added", data: book });
});

app.get("/api/book-transactions", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = getStudentForUser(req.user._id);
  if (student) {
    const records = db.borrowRecords.filter(r => r.studentId === student._id);
    return res.json({ success: true, data: records });
  }
  return res.json({ success: true, data: db.borrowRecords });
});

app.post("/api/books/issue", authenticateToken, requireRole("librarian"), (req: any, res) => {
  const { bookId, studentId } = req.body;
  const db = getDB();
  const student = db.students.find(s => s._id === studentId || s.rollNumber.toLowerCase() === (studentId || "").toLowerCase());
  if (!student) return res.status(400).json({ success: false, message: "Student not found" });

  const book = db.books.find(b => b._id === bookId);
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  if (book.availableQuantity <= 0) return res.status(400).json({ success: false, message: "Book not available" });

  book.availableQuantity -= 1;
  const due = new Date(); due.setDate(due.getDate() + 14);
  const record: BorrowRecord = {
    _id: "br-" + Math.random().toString(36).substring(2, 9),
    studentId: student._id, studentName: student.rollNumber,
    bookId: book._id, bookTitle: book.title, bookAuthor: book.author,
    issueDate: new Date().toISOString().split("T")[0], dueDate: due.toISOString().split("T")[0],
    fineAmount: 0, status: "borrowed",
  };
  db.borrowRecords.push(record);
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: student._id, title: "Book Issued",
    message: `"${book.title}" issued. Return by ${record.dueDate}.`,
    category: "library", isRead: false, createdAt: new Date().toISOString(),
  });
  saveDB();
  return res.json({ success: true, message: "Book issued", data: record });
});

app.post("/api/books/return", authenticateToken, requireRole("librarian"), (req: any, res) => {
  const { recordId } = req.body;
  const db = getDB();
  const record = db.borrowRecords.find(r => r._id === recordId);
  if (!record) return res.status(404).json({ success: false, message: "Record not found" });
  if (record.status === "returned") return res.status(400).json({ success: false, message: "Already returned" });

  const book = db.books.find(b => b._id === record.bookId);
  if (book) book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
  record.returnDate = new Date().toISOString().split("T")[0];
  record.status = "returned";
  saveDB();
  return res.json({ success: true, message: "Book returned", data: record });
});

// ═══════════════════════════════════════════════════════════════════════
// FEES & TRANSACTIONS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/transactions", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = getStudentForUser(req.user._id);
  if (student) {
    const txns = db.transactions.filter(t => t.studentId === student._id);
    return res.json({ success: true, data: txns });
  }
  return res.json({ success: true, data: db.transactions });
});

app.post("/api/payments", authenticateToken, (req: any, res) => {
  const { transactionId: txnId } = req.body;
  if (!txnId) return res.status(400).json({ success: false, message: "Transaction ID required" });

  const db = getDB();
  const txn = db.transactions.find(t => t._id === txnId);
  if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
  if (txn.status === "paid") return res.status(400).json({ success: false, message: "Already paid" });

  txn.status = "paid";
  txn.paidAt = new Date().toISOString();
  txn.paymentMethod = "Online";
  txn.transactionId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);

  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: txn.studentId, title: "Payment Successful",
    message: `Payment of ₹${txn.amount} for ${txn.feeType} fees processed. Ref: ${txn.transactionId}.`,
    category: "fee", isRead: false, createdAt: new Date().toISOString(),
  });
  saveDB();
  return res.json({ success: true, message: "Payment processed", data: txn });
});

// ═══════════════════════════════════════════════════════════════════════
// RESULTS & PROGRESS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/results", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = getStudentForUser(req.user._id);
  if (student) {
    return res.json({
      success: true,
      data: {
        results: db.results.filter(r => r.studentId === student._id),
        progress: db.progress.find(p => p.studentId === student._id),
      },
    });
  }
  return res.json({ success: true, data: { results: db.results, progress: db.progress } });
});

app.post("/api/results", authenticateToken, requireRole("teacher", "admin"), (req: any, res) => {
  const { studentId, subjectId, subjectName, semester, marksObtained, totalMarks, grade, gpa, credits } = req.body;
  if (!studentId || !subjectName || !semester || marksObtained === undefined || !grade) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const db = getDB();
  const result: Result = {
    _id: "r-" + Math.random().toString(36).substring(2, 9),
    studentId, subjectId: subjectId || "", subjectName,
    semester: Number(semester), marksObtained: Number(marksObtained),
    totalMarks: Number(totalMarks) || 100, grade, gpa: Number(gpa) || 0,
    credits: Number(credits) || 4, publishedBy: req.user._id,
    createdAt: new Date().toISOString(),
  };
  db.results.push(result);

  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: studentId, title: "Result Published",
    message: `Grade for ${subjectName} (Sem ${semester}): ${grade}.`,
    category: "examination", isRead: false, createdAt: new Date().toISOString(),
  });
  saveDB();
  return res.json({ success: true, message: "Result published", data: result });
});

// ═══════════════════════════════════════════════════════════════════════
// ATTENDANCE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/attendance/student/:id", authenticateToken, (req: any, res) => {
  const db = getDB();
  const sid = req.params.id === "me" ? getStudentForUser(req.user._id)?._id : req.params.id;
  const records = db.attendance.filter(a => a.studentId === sid);
  return res.json({ success: true, data: records });
});

app.post("/api/attendance", authenticateToken, requireRole("teacher", "admin"), (req: any, res) => {
  const { records } = req.body; // Array of { studentId, subjectId, subjectName, date, status }
  if (!records || !Array.isArray(records)) return res.status(400).json({ success: false, message: "Records array required" });

  const db = getDB();
  const created: Attendance[] = [];
  for (const r of records) {
    const att: Attendance = {
      _id: "att-" + Math.random().toString(36).substring(2, 9),
      studentId: r.studentId, subjectId: r.subjectId, subjectName: r.subjectName || "",
      teacherId: req.user._id, date: r.date || new Date().toISOString().split("T")[0],
      status: r.status || "present",
    };
    db.attendance.push(att);
    created.push(att);
  }
  saveDB();
  return res.json({ success: true, message: `${created.length} records saved`, data: created });
});

// ═══════════════════════════════════════════════════════════════════════
// ASSIGNMENTS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/assignments", authenticateToken, (req: any, res) => {
  const db = getDB();
  const { subjectId } = req.query;
  let list = db.assignments;
  if (subjectId) list = list.filter(a => a.subjectId === subjectId);
  if (req.user.role === "teacher") list = list.filter(a => a.teacherId === req.user._id);
  return res.json({ success: true, data: list });
});

app.post("/api/assignments", authenticateToken, requireRole("teacher"), (req: any, res) => {
  const { title, description, subjectId, subjectName, dueDate, totalMarks } = req.body;
  if (!title || !subjectName || !dueDate) return res.status(400).json({ success: false, message: "Title, subject, and due date required" });

  const db = getDB();
  const assignment: Assignment = {
    _id: "asgn-" + Math.random().toString(36).substring(2, 9),
    title, description: description || "", subjectId: subjectId || "", subjectName,
    teacherId: req.user._id, teacherName: req.user.fullName,
    dueDate, attachments: [], totalMarks: Number(totalMarks) || 100,
    status: "active", createdAt: new Date().toISOString(),
  };
  db.assignments.push(assignment);
  db.notifications.push({
    _id: "nt-" + Math.random().toString(36).substring(2, 9),
    recipientId: "all", title: "New Assignment",
    message: `${req.user.fullName} posted "${title}" for ${subjectName}. Due: ${dueDate}.`,
    category: "academic", isRead: false, createdAt: new Date().toISOString(),
  });
  saveDB();
  return res.json({ success: true, message: "Assignment created", data: assignment });
});

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATIONS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/notifications", authenticateToken, (req: any, res) => {
  const db = getDB();
  const student = getStudentForUser(req.user._id);
  const myId = student?._id || req.user._id;
  const list = db.notifications.filter(n => n.recipientId === "all" || n.recipientId === myId);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, data: list });
});

app.post("/api/notifications/read", authenticateToken, (req: any, res) => {
  const { id } = req.body;
  const db = getDB();
  if (id) {
    const n = db.notifications.find(x => x._id === id);
    if (n) n.isRead = true;
  } else {
    const student = getStudentForUser(req.user._id);
    const myId = student?._id || req.user._id;
    db.notifications.forEach(n => {
      if (n.recipientId === "all" || n.recipientId === myId) n.isRead = true;
    });
  }
  saveDB();
  return res.json({ success: true, message: "Marked as read" });
});

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD STATS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/dashboard/admin", authenticateToken, requireRole("admin"), (req: any, res) => {
  const db = getDB();
  const totalStudents = db.students.length;
  const totalTeachers = db.teachers.length;
  const totalBooks = db.books.length;
  const booksIssued = db.borrowRecords.filter(r => r.status === "borrowed").length;
  const overdueBooks = db.borrowRecords.filter(r => r.status === "overdue").length;
  const totalFeeCollected = db.transactions.filter(t => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = db.transactions.filter(t => t.status === "pending").length;
  const totalNotices = db.notices.length;
  const totalDepartments = db.departments.length;
  const totalSubjects = db.subjects.length;

  return res.json({
    success: true, data: {
      totalStudents, totalTeachers, totalBooks, booksIssued, overdueBooks,
      totalFeeCollected, pendingPayments, totalNotices, totalDepartments, totalSubjects,
      recentNotices: db.notices.slice(0, 5), recentTransactions: db.transactions.filter(t => t.status === "paid").slice(-5).reverse(),
    },
  });
});

app.get("/api/dashboard/librarian", authenticateToken, requireRole("librarian"), (req: any, res) => {
  const db = getDB();
  return res.json({
    success: true, data: {
      totalBooks: db.books.length,
      availableBooks: db.books.reduce((s, b) => s + b.availableQuantity, 0),
      borrowedBooks: db.borrowRecords.filter(r => r.status === "borrowed").length,
      overdueBooks: db.borrowRecords.filter(r => r.status === "overdue").length,
      totalFines: db.borrowRecords.reduce((s, r) => s + r.fineAmount, 0),
      recentActivity: db.borrowRecords.slice(-5).reverse(),
      popularBooks: db.books.sort((a, b) => (a.quantity - a.availableQuantity) - (b.quantity - b.availableQuantity)).slice(0, 5),
    },
  });
});

app.get("/api/dashboard/finance", authenticateToken, requireRole("finance"), (req: any, res) => {
  const db = getDB();
  const paid = db.transactions.filter(t => t.status === "paid");
  const pending = db.transactions.filter(t => t.status === "pending");
  return res.json({
    success: true, data: {
      totalRevenue: paid.reduce((s, t) => s + t.amount, 0),
      pendingAmount: pending.reduce((s, t) => s + t.amount, 0),
      totalTransactions: db.transactions.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      recentTransactions: db.transactions.slice(-10).reverse(),
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// VITE DEV SERVER
// ═══════════════════════════════════════════════════════════════════════
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎓 Campus Hub server running on http://localhost:${PORT}`);
  });
}

startServer();
