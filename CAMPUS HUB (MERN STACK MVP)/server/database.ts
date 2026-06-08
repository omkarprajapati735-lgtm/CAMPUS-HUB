import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "server_db.json");

export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  role: "student" | "teacher" | "admin" | "librarian" | "finance";
  name: string;
}

export interface StudentProfile {
  _id: string;
  userId: string;
  rollNo: string;
  semester: number;
  batch: string;
  verified: boolean;
  phone: string;
  gpa: number;
  parentContact: string;
  profileImage?: string;
  verificationDocuments: string[];
}

export interface Notice {
  _id: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  category: "academic" | "event" | "exam" | "general";
  postedBy: string;
  postedByName: string;
  createdAt: string;
}

export interface ClassroomNote {
  _id: string;
  subject: string;
  uploadedBy: string; // teacher name
  fileName: string;
  semester: number;
  fileSize: string; // e.g., "2.4 MB"
  views: number;
  createdAt: string;
  description: string;
  downloadUrl: string;
}

export interface TimeTableSlot {
  _id: string;
  semester: number;
  batch: string;
  day: string; // "Monday", "Tuesday", etc.
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:30 AM"
  subject: string;
  instructor: string;
  classroom: string;
}

export interface LibraryBook {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
  description: string;
  publishedYear: number;
}

export interface BorrowRecord {
  _id: string;
  studentId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowedDate: string;
  dueDate: string;
  returnDate?: string;
  status: "borrowed" | "returned" | "overdue";
  fines: number;
}

export interface ExamFee {
  _id: string;
  studentId: string;
  semester: number;
  amount: number;
  paid: boolean;
  dueDate: string;
  paymentDate?: string;
  transactionId?: string;
}

export interface ExamResult {
  _id: string;
  studentId: string;
  semester: number;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
  publishedDate: string;
}

export interface StudentProgress {
  _id: string;
  studentId: string;
  currentCGPA: number;
  totalCredits: number;
  passedCredits: number;
  currentSemester: number;
  academicHistory: { semester: number; sgpa: number; credits: number }[];
}

export interface Notification {
  _id: string;
  recipientId: string; // studentId or "all"
  message: string;
  title: string;
  type: "academic" | "notice" | "library" | "fee";
  read: boolean;
  createdAt: string;
}

export interface CampusHubDB {
  users: User[];
  students: StudentProfile[];
  notices: Notice[];
  notes: ClassroomNote[];
  timetables: TimeTableSlot[];
  books: LibraryBook[];
  borrowHistory: BorrowRecord[];
  examFees: ExamFee[];
  results: ExamResult[];
  progress: StudentProgress[];
  notifications: Notification[];
}

// Global DB store
let db: CampusHubDB = {
  users: [],
  students: [],
  notices: [],
  notes: [],
  timetables: [],
  books: [],
  borrowHistory: [],
  examFees: [],
  results: [],
  progress: [],
  notifications: []
};

// Initial system seed data
function seedInitialData(): CampusHubDB {
  const users: User[] = [
    { _id: "u-admin", email: "admin@campushub.edu", passwordHash: "admin123", role: "admin", name: "Dr. Alice Vance" },
    { _id: "u-teacher", email: "teacher@campushub.edu", passwordHash: "teacher123", role: "teacher", name: "Prof. Robert Downey" },
    { _id: "u-student", email: "student@campushub.edu", passwordHash: "student123", role: "student", name: "Jane Doe" },
    { _id: "u-omkar", email: "omkar.prajapati@somaiya.edu", passwordHash: "student123", role: "student", name: "Omkar Prajapati" },
    { _id: "u-librarian", email: "librarian@campushub.edu", passwordHash: "librarian123", role: "librarian", name: "Sarah Connor" },
    { _id: "u-finance", email: "finance@campushub.edu", passwordHash: "finance123", role: "finance", name: "Michael Scott" }
  ];

  const students: StudentProfile[] = [
    {
      _id: "s-jane",
      userId: "u-student",
      rollNo: "SV-2026-002",
      semester: 6,
      batch: "2023-2027",
      verified: true,
      phone: "+1 555-0199",
      gpa: 8.85,
      parentContact: "+1 555-0188",
      verificationDocuments: ["ID_Card_Front.pdf", "Admission_Form_Signed.pdf"]
    },
    {
      _id: "s-omkar",
      userId: "u-omkar",
      rollNo: "SV-2026-089",
      semester: 6,
      batch: "2023-2027",
      verified: true,
      phone: "+91 98765 43210",
      gpa: 9.42,
      parentContact: "+91 98765 43211",
      verificationDocuments: ["Somaiya_ID_Card.pdf", "Fee_Receipt_Sem5.pdf"]
    }
  ];

  const notices: Notice[] = [
    {
      _id: "n-1",
      title: "End Semester Exams Time Table Released",
      description: "The official examination schedule or time table for Semester 6 end term examination has been published. Exams begin on June 22nd. Please download your hall tickets by logging into the student portal and verifying your fee status.",
      importance: "high",
      category: "exam",
      postedBy: "u-admin",
      postedByName: "Dr. Alice Vance (Registrar)",
      createdAt: "2026-06-05T10:00:00Z"
    },
    {
      _id: "n-2",
      title: "Smart India Hackathon 2026 Registration Open",
      description: "Submit your team proposals for the campus shortlisting rounds of Smart India Hackathon. Prizes up to $5,000 for top projects. Connect with faculty mentors for approval.",
      importance: "medium",
      category: "event",
      postedBy: "u-teacher",
      postedByName: "Prof. Robert Downey",
      createdAt: "2026-06-07T14:30:00Z"
    },
    {
      _id: "n-3",
      title: "Library Timings Extension for Exams Prep",
      description: "To assist students with exam preparations, the Central Library will remain open 24/7 beginning next week (June 15th) until the end of exams on July 10th.",
      importance: "medium",
      category: "general",
      postedBy: "u-librarian",
      postedByName: "Sarah Connor",
      createdAt: "2026-06-08T09:15:00Z"
    },
    {
      _id: "n-4",
      title: "Payment Deadline for Sem 6 Examination Fees",
      description: "The last date to pay standard exam fees without a fine is June 14, 2026. Avoid a late fee of $50 by completing the payment on the Exam Fee Portal.",
      importance: "high",
      category: "exam",
      postedBy: "u-finance",
      postedByName: "Michael Scott (Accounts Dept)",
      createdAt: "2026-06-03T11:00:00Z"
    }
  ];

  const notes: ClassroomNote[] = [
    {
      _id: "cn-1",
      subject: "Advanced Web Systems",
      uploadedBy: "Prof. Robert Downey",
      fileName: "Lecture_04_NodeJS_Routing.pdf",
      semester: 6,
      fileSize: "1.8 MB",
      views: 45,
      createdAt: "2026-06-01T09:00:00Z",
      description: "Comprehensive notes on designing RESTful APIs with Node.js and Express including query parsing, routes, and middleware architecture.",
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      _id: "cn-2",
      subject: "Distributed Databases",
      uploadedBy: "Prof. Robert Downey",
      fileName: "Unit_3_NoSQL_and_Mongoose.pdf",
      semester: 6,
      fileSize: "3.2 MB",
      views: 32,
      createdAt: "2026-06-04T11:20:00Z",
      description: "Deep dive into document databases, collection relationships, index creation, querying patterns and Mongoose ODM validation strategies.",
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      _id: "cn-3",
      subject: "Cloud Security & Devops",
      uploadedBy: "Prof. Robert Downey",
      fileName: "Docker_Container_Orchestration.pdf",
      semester: 6,
      fileSize: "2.7 MB",
      views: 56,
      createdAt: "2026-06-05T15:10:00Z",
      description: "Practical guide containing build definitions, multi-stage files, port exposures, environments, custom proxies and Docker Compose configs.",
      downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ];

  const timetables: TimeTableSlot[] = [
    { _id: "t-1", semester: 6, batch: "2023-2027", day: "Monday", startTime: "09:00 AM", endTime: "10:30 AM", subject: "Advanced Web Systems", instructor: "Prof. Robert Downey", classroom: "Lab 3" },
    { _id: "t-2", semester: 6, batch: "2023-2027", day: "Monday", startTime: "10:45 AM", endTime: "12:15 PM", subject: "Distributed Databases", instructor: "Prof. Robert Downey", classroom: "Room 402" },
    { _id: "t-3", semester: 6, batch: "2023-2027", day: "Tuesday", startTime: "09:00 AM", endTime: "10:30 AM", subject: "Cloud Security & Devops", instructor: "Prof. Robert Downey", classroom: "Room 205" },
    { _id: "t-4", semester: 6, batch: "2023-2027", day: "Tuesday", startTime: "01:15 PM", endTime: "02:45 PM", subject: "AI and Machine Learning", instructor: "Prof. Robert Downey", classroom: "Seminar Hall 1" },
    { _id: "t-5", semester: 6, batch: "2023-2027", day: "Wednesday", startTime: "09:00 AM", endTime: "10:30 AM", subject: "Advanced Web Systems", instructor: "Prof. Robert Downey", classroom: "Lab 3" },
    { _id: "t-6", semester: 6, batch: "2023-2027", day: "Wednesday", startTime: "10:45 AM", endTime: "12:15 PM", subject: "Distributed Databases", instructor: "Prof. Robert Downey", classroom: "Room 402" },
    { _id: "t-7", semester: 6, batch: "2023-2027", day: "Thursday", startTime: "10:45 AM", endTime: "12:15 PM", subject: "Cloud Security & Devops", instructor: "Prof. Robert Downey", classroom: "Room 205" },
    { _id: "t-8", semester: 6, batch: "2023-2027", day: "Friday", startTime: "09:30 AM", endTime: "11:00 AM", subject: "AI and Machine Learning", instructor: "Prof. Robert Downey", classroom: "Seminar Hall 1" }
  ];

  const books: LibraryBook[] = [
    { _id: "b-1", title: "Modern Operating Systems (5th Edition)", author: "Andrew S. Tanenbaum", isbn: "978-0130313583", category: "Computer Science", quantity: 12, available: 8, description: "Classic text on operating systems, detailing virtualization, thread management, and filesystem kernels.", publishedYear: 2022 },
    { _id: "b-2", title: "Introduction to Algorithms (4th Edition)", author: "Cormen, Leiserson, Rivest, Stein", isbn: "978-0262046305", category: "Computer Science", quantity: 8, available: 3, description: "The definitive guide to underlying algorithm complexity, dynamic programming, and network graphs.", publishedYear: 2022 },
    { _id: "b-3", title: "Database System Concepts (7th Edition)", author: "Abraham Silberschatz", isbn: "978-0078022159", category: "Information Systems", quantity: 15, available: 12, description: "Fundamentals of database transaction security, logging structure, and structured SQL design paradigms.", publishedYear: 2019 },
    { _id: "b-4", title: "Computer Networking: A Top-Down Approach", author: "James Kurose", isbn: "978-0136681533", category: "Networking", quantity: 10, available: 6, description: "Introduction to network communication and application layer routing, TCP flow control, and wireless networks.", publishedYear: 2020 },
    { _id: "b-5", title: "Clean Code: A Handbook of Agile Software Craftsmanship", author: "Robert C. Martin", isbn: "978-0132350884", category: "Software Practice", quantity: 5, available: 0, description: "Professional patterns for restructuring enterprise applications and writing readable unit tests.", publishedYear: 2008 }
  ];

  const borrowHistory: BorrowRecord[] = [
    {
      _id: "br-1",
      studentId: "s-omkar",
      bookId: "b-1",
      bookTitle: "Modern Operating Systems (5th Edition)",
      bookAuthor: "Andrew S. Tanenbaum",
      borrowedDate: "2026-05-10",
      dueDate: "2026-05-24",
      returnDate: "2026-05-24",
      status: "returned",
      fines: 0
    },
    {
      _id: "br-2",
      studentId: "s-omkar",
      bookId: "b-5",
      bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
      bookAuthor: "Robert C. Martin",
      borrowedDate: "2026-05-28",
      dueDate: "2026-06-11",
      status: "borrowed",
      fines: 0
    },
    {
      _id: "br-3",
      studentId: "s-jane",
      bookId: "b-2",
      bookTitle: "Introduction to Algorithms (4th Edition)",
      bookAuthor: "Cormen, Leiserson, Rivest, Stein",
      borrowedDate: "2026-04-15",
      dueDate: "2026-04-29",
      status: "overdue",
      fines: 10
    }
  ];

  const examFees: ExamFee[] = [
    { _id: "ef-omkar-5", studentId: "s-omkar", semester: 5, amount: 120, paid: true, dueDate: "2025-11-15", paymentDate: "2025-11-12", transactionId: "TXN-88493121" },
    { _id: "ef-omkar-6", studentId: "s-omkar", semester: 6, amount: 150, paid: false, dueDate: "2026-06-14" },
    { _id: "ef-jane-5", studentId: "s-jane", semester: 5, amount: 120, paid: true, dueDate: "2025-11-15", paymentDate: "2025-11-14", transactionId: "TXN-77981023" },
    { _id: "ef-jane-6", studentId: "s-jane", semester: 6, amount: 150, paid: false, dueDate: "2026-06-14" }
  ];

  const results: ExamResult[] = [
    // Omkar's Semester 5 (CGPA tracking)
    { _id: "r-omkar-51", studentId: "s-omkar", semester: 5, subject: "Design & Analysis of Algorithms", marks: 92, totalMarks: 100, grade: "A", publishedDate: "2025-12-18" },
    { _id: "r-omkar-52", studentId: "s-omkar", semester: 5, subject: "Database Management Systems", marks: 95, totalMarks: 100, grade: "A+", publishedDate: "2025-12-18" },
    { _id: "r-omkar-53", studentId: "s-omkar", semester: 5, subject: "Software Engineering", marks: 88, totalMarks: 100, grade: "B+", publishedDate: "2025-12-18" },
    { _id: "r-omkar-54", studentId: "s-omkar", semester: 5, subject: "Computer Network Protocols", marks: 94, totalMarks: 100, grade: "A+", publishedDate: "2025-12-18" },

    // Omkar's Semester 4
    { _id: "r-omkar-41", studentId: "s-omkar", semester: 4, subject: "Operating Systems", marks: 90, totalMarks: 100, grade: "A", publishedDate: "2025-06-15" },
    { _id: "r-omkar-42", studentId: "s-omkar", semester: 4, subject: "Theory of Computation", marks: 88, totalMarks: 100, grade: "B+", publishedDate: "2025-06-15" },
    { _id: "r-omkar-43", studentId: "s-omkar", semester: 4, subject: "Computer Architecture", marks: 91, totalMarks: 100, grade: "A", publishedDate: "2025-06-15" },

    // Jane's Semester 5
    { _id: "r-jane-51", studentId: "s-jane", semester: 5, subject: "Design & Analysis of Algorithms", marks: 85, totalMarks: 100, grade: "B+", publishedDate: "2025-12-18" },
    { _id: "r-jane-52", studentId: "s-jane", semester: 5, subject: "Database Management Systems", marks: 87, totalMarks: 100, grade: "A", publishedDate: "2025-12-18" },
    { _id: "r-jane-53", studentId: "s-jane", semester: 5, subject: "Software Engineering", marks: 84, totalMarks: 100, grade: "B", publishedDate: "2025-12-18" },
    { _id: "r-jane-54", studentId: "s-jane", semester: 5, subject: "Computer Network Protocols", marks: 89, totalMarks: 100, grade: "A", publishedDate: "2025-12-18" }
  ];

  const progress: StudentProgress[] = [
    {
      _id: "p-omkar",
      studentId: "s-omkar",
      currentCGPA: 9.42,
      totalCredits: 120,
      passedCredits: 120,
      currentSemester: 6,
      academicHistory: [
        { semester: 1, sgpa: 9.10, credits: 24 },
        { semester: 2, sgpa: 9.30, credits: 24 },
        { semester: 3, sgpa: 9.25, credits: 24 },
        { semester: 4, sgpa: 9.40, credits: 24 },
        { semester: 5, sgpa: 9.55, credits: 24 }
      ]
    },
    {
      _id: "p-jane",
      studentId: "s-jane",
      currentCGPA: 8.85,
      totalCredits: 120,
      passedCredits: 120,
      currentSemester: 6,
      academicHistory: [
        { semester: 1, sgpa: 8.50, credits: 24 },
        { semester: 2, sgpa: 8.70, credits: 24 },
        { semester: 3, sgpa: 8.65, credits: 24 },
        { semester: 4, sgpa: 8.90, credits: 24 },
        { semester: 5, sgpa: 8.80, credits: 24 }
      ]
    }
  ];

  const notifications: Notification[] = [
    {
      _id: "nt-1",
      recipientId: "s-omkar",
      title: "Welcome to Campus Hub",
      message: "Hello Omkar! Your verified profile has been initialized with Roll SV-2026-089. Enjoy your centralized college portal.",
      type: "academic",
      read: false,
      createdAt: "2026-06-08T09:00:00Z"
    },
    {
      _id: "nt-2",
      recipientId: "s-omkar",
      title: "Exam Fee Payment Requested",
      message: "Exam Fees for Semester 6 are now open for payment. Avoid late fees by paying before June 14.",
      type: "fee",
      read: false,
      createdAt: "2026-06-08T10:15:00Z"
    },
    {
      _id: "nt-3",
      recipientId: "s-omkar",
      title: "Book Overdue Warning",
      message: "Please note that 'Clean Code' is due soon on June 11. You can renew it in the Library Portal.",
      type: "library",
      read: false,
      createdAt: "2026-06-08T12:00:00Z"
    }
  ];

  return {
    users,
    students,
    notices,
    notes,
    timetables,
    books,
    borrowHistory,
    examFees,
    results,
    progress,
    notifications
  };
}

export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    db = seedInitialData();
    saveDB();
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
    } catch (e) {
      db = seedInitialData();
      saveDB();
    }
  }
}

export function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export function getDB(): CampusHubDB {
  return db;
}
