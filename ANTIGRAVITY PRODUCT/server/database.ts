import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "server_db.json");

// ─── Type Definitions ────────────────────────────────────────────────
export interface User {
  _id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "student" | "teacher" | "admin" | "admin-officer" | "librarian" | "finance";
  isVerified: boolean;
  status: "active" | "inactive" | "suspended";
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  userId: string;
  rollNumber: string;
  registrationNumber: string;
  email: string;
  phone: string;
  department: string;
  program: string;
  semester: number;
  batch: string;
  attendancePercentage: number;
  currentGPA: number;
  currentCGPA: number;
  parentContact: string;
  emergencyContact: string;
  profilePhoto?: string;
  address: string;
  verified: boolean;
  verificationDocuments: string[];
}

export interface Teacher {
  _id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  assignedSubjects: string[];
  profilePhoto?: string;
  joiningDate: string;
  qualifications: string[];
  experience: number;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  hod: string;
}

export interface Subject {
  _id: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  credits: number;
  department: string;
  assignedTeacher: string;
}

export interface Notice {
  _id: string;
  title: string;
  description: string;
  category: "academic" | "examination" | "administration" | "events" | "placement" | "emergency";
  attachments: string[];
  createdBy: string;
  createdByName: string;
  targetRoles: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  subject: string;
  subjectId: string;
  semester: number;
  uploadedBy: string;
  uploadedByName: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
  category: "lecture-notes" | "assignments" | "lab-manuals" | "question-banks" | "reference" | "project-guidelines";
  views: number;
  downloads: number;
  createdAt: string;
}

export interface Timetable {
  _id: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  classroom: string;
  day: string;
  startTime: string;
  endTime: string;
  semester: number;
  department: string;
  type: "lecture" | "lab" | "tutorial";
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  location: string;
  coverImage?: string;
  publishedYear: number;
  description: string;
  createdAt: string;
}

export interface BorrowRecord {
  _id: string;
  studentId: string;
  studentName: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: "borrowed" | "returned" | "overdue";
}

export interface Transaction {
  _id: string;
  studentId: string;
  studentName: string;
  feeType: "tuition" | "examination" | "library" | "laboratory" | "miscellaneous";
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: "pending" | "paid" | "failed" | "refunded";
  semester: number;
  paidAt?: string;
  dueDate: string;
}

export interface Result {
  _id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  semester: number;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  gpa: number;
  credits: number;
  publishedBy: string;
  createdAt: string;
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

export interface Attendance {
  _id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  date: string;
  status: "present" | "absent" | "late";
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  attachments: string[];
  totalMarks: number;
  status: "active" | "closed";
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  category: "academic" | "examination" | "fee" | "library" | "event" | "administrative" | "emergency";
  isRead: boolean;
  createdAt: string;
}

export interface CampusHubDB {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  departments: Department[];
  subjects: Subject[];
  notices: Notice[];
  studyMaterials: StudyMaterial[];
  timetables: Timetable[];
  books: Book[];
  borrowRecords: BorrowRecord[];
  transactions: Transaction[];
  results: Result[];
  progress: StudentProgress[];
  attendance: Attendance[];
  assignments: Assignment[];
  notifications: Notification[];
  userLibraries?: Record<string, { books: Book[]; borrowRecords: BorrowRecord[] }>;
}

// ─── Global DB Store ─────────────────────────────────────────────────
let db: CampusHubDB = {
  users: [], students: [], teachers: [], departments: [], subjects: [],
  notices: [], studyMaterials: [], timetables: [], books: [],
  borrowRecords: [], transactions: [], results: [], progress: [],
  attendance: [], assignments: [], notifications: [],
  userLibraries: {},
};

// ─── Seed Data ───────────────────────────────────────────────────────
function seedInitialData(): CampusHubDB {
  const now = new Date().toISOString();

  const users: User[] = [
    { _id: "u-admin", fullName: "Dr. Alice Vance", email: "admin@campushub.com", passwordHash: "Admin@123", role: "admin", isVerified: true, status: "active", createdAt: "2025-01-01T00:00:00Z", updatedAt: now },
    { _id: "u-teacher1", fullName: "Prof. Robert Downey", email: "teacher@campushub.com", passwordHash: "Admin@123", role: "teacher", isVerified: true, status: "active", createdAt: "2025-01-15T00:00:00Z", updatedAt: now },
    { _id: "u-teacher2", fullName: "Dr. Sarah Williams", email: "sarah.w@campushub.com", passwordHash: "Admin@123", role: "teacher", isVerified: true, status: "active", createdAt: "2025-02-01T00:00:00Z", updatedAt: now },
    { _id: "u-student1", fullName: "Omkar Prajapati", email: "student@campushub.com", passwordHash: "Admin@123", role: "student", isVerified: true, status: "active", createdAt: "2025-08-01T00:00:00Z", updatedAt: now },
    { _id: "u-student2", fullName: "Priya Sharma", email: "priya.s@campushub.com", passwordHash: "Admin@123", role: "student", isVerified: true, status: "active", createdAt: "2025-08-01T00:00:00Z", updatedAt: now },
    { _id: "u-student3", fullName: "Rahul Mehta", email: "rahul.m@campushub.com", passwordHash: "Admin@123", role: "student", isVerified: true, status: "active", createdAt: "2025-08-01T00:00:00Z", updatedAt: now },
    { _id: "u-librarian", fullName: "Sarah Connor", email: "librarian@campushub.com", passwordHash: "Admin@123", role: "librarian", isVerified: true, status: "active", createdAt: "2025-01-10T00:00:00Z", updatedAt: now },
    { _id: "u-finance", fullName: "Michael Scott", email: "finance@campushub.com", passwordHash: "Admin@123", role: "finance", isVerified: true, status: "active", createdAt: "2025-01-10T00:00:00Z", updatedAt: now },
  ];

  const departments: Department[] = [
    { _id: "dept-cs", name: "Computer Science & Engineering", code: "CSE", hod: "Dr. Alice Vance" },
    { _id: "dept-it", name: "Information Technology", code: "IT", hod: "Dr. Sarah Williams" },
    { _id: "dept-ece", name: "Electronics & Communication", code: "ECE", hod: "Prof. Amit Kumar" },
  ];

  const subjects: Subject[] = [
    { _id: "sub-1", subjectCode: "CS601", subjectName: "Advanced Web Systems", semester: 6, credits: 4, department: "CSE", assignedTeacher: "u-teacher1" },
    { _id: "sub-2", subjectCode: "CS602", subjectName: "Distributed Databases", semester: 6, credits: 4, department: "CSE", assignedTeacher: "u-teacher1" },
    { _id: "sub-3", subjectCode: "CS603", subjectName: "Cloud Security & DevOps", semester: 6, credits: 3, department: "CSE", assignedTeacher: "u-teacher2" },
    { _id: "sub-4", subjectCode: "CS604", subjectName: "AI and Machine Learning", semester: 6, credits: 4, department: "CSE", assignedTeacher: "u-teacher2" },
    { _id: "sub-5", subjectCode: "CS605", subjectName: "Software Project Management", semester: 6, credits: 3, department: "CSE", assignedTeacher: "u-teacher1" },
    { _id: "sub-6", subjectCode: "CS501", subjectName: "Design & Analysis of Algorithms", semester: 5, credits: 4, department: "CSE", assignedTeacher: "u-teacher1" },
    { _id: "sub-7", subjectCode: "CS502", subjectName: "Database Management Systems", semester: 5, credits: 4, department: "CSE", assignedTeacher: "u-teacher2" },
    { _id: "sub-8", subjectCode: "CS401", subjectName: "Operating Systems", semester: 4, credits: 4, department: "CSE", assignedTeacher: "u-teacher1" },
  ];

  const students: Student[] = [
    {
      _id: "s-omkar", userId: "u-student1", rollNumber: "SV-2026-089", registrationNumber: "REG-2023-CSE-089",
      email: "student@campushub.com", phone: "+91 98765 43210", department: "CSE", program: "B.Tech",
      semester: 6, batch: "2023-2027", attendancePercentage: 87.5, currentGPA: 9.42, currentCGPA: 9.42,
      parentContact: "+91 98765 43211", emergencyContact: "+91 98765 43212", address: "Mumbai, Maharashtra",
      verified: true, verificationDocuments: ["ID_Card.pdf", "Fee_Receipt_Sem5.pdf"],
    },
    {
      _id: "s-priya", userId: "u-student2", rollNumber: "SV-2026-042", registrationNumber: "REG-2023-CSE-042",
      email: "priya.s@campushub.com", phone: "+91 91234 56789", department: "CSE", program: "B.Tech",
      semester: 6, batch: "2023-2027", attendancePercentage: 92.3, currentGPA: 8.85, currentCGPA: 8.85,
      parentContact: "+91 91234 56780", emergencyContact: "+91 91234 56781", address: "Pune, Maharashtra",
      verified: true, verificationDocuments: ["ID_Card.pdf"],
    },
    {
      _id: "s-rahul", userId: "u-student3", rollNumber: "SV-2026-103", registrationNumber: "REG-2023-CSE-103",
      email: "rahul.m@campushub.com", phone: "+91 99887 76655", department: "CSE", program: "B.Tech",
      semester: 6, batch: "2023-2027", attendancePercentage: 78.2, currentGPA: 7.95, currentCGPA: 7.95,
      parentContact: "+91 99887 76600", emergencyContact: "+91 99887 76601", address: "Delhi, India",
      verified: true, verificationDocuments: ["ID_Card.pdf"],
    },
  ];

  const teachers: Teacher[] = [
    {
      _id: "t-robert", userId: "u-teacher1", employeeId: "EMP-CSE-001", fullName: "Prof. Robert Downey",
      email: "teacher@campushub.com", phone: "+91 98000 11111", department: "CSE",
      designation: "Associate Professor", assignedSubjects: ["sub-1", "sub-2", "sub-5", "sub-6", "sub-8"],
      joiningDate: "2018-07-15", qualifications: ["Ph.D. Computer Science", "M.Tech CSE"], experience: 8,
    },
    {
      _id: "t-sarah", userId: "u-teacher2", employeeId: "EMP-IT-002", fullName: "Dr. Sarah Williams",
      email: "sarah.w@campushub.com", phone: "+91 98000 22222", department: "IT",
      designation: "Assistant Professor", assignedSubjects: ["sub-3", "sub-4", "sub-7"],
      joiningDate: "2020-01-10", qualifications: ["Ph.D. AI & ML", "M.Tech IT"], experience: 6,
    },
  ];

  const notices: Notice[] = [
    {
      _id: "n-1", title: "End Semester Examination Schedule Released",
      description: "The official examination timetable for Semester 6 has been published. Exams commence on June 22nd, 2026. Students must download hall tickets from the portal after verifying fee payment status. Any discrepancies should be reported to the examination cell within 3 working days.",
      category: "examination", attachments: ["Exam_Schedule_Sem6.pdf"], createdBy: "u-admin",
      createdByName: "Dr. Alice Vance", targetRoles: ["student", "teacher"], isPublished: true,
      createdAt: "2026-06-05T10:00:00Z", updatedAt: "2026-06-05T10:00:00Z",
    },
    {
      _id: "n-2", title: "Smart India Hackathon 2026 — Campus Round",
      description: "Submit your team proposals for the campus shortlisting rounds of Smart India Hackathon 2026. Prizes up to ₹5,00,000 for top projects. Each team must have 6 members with at least one female participant. Faculty mentors are mandatory for submission approval. Last date: June 20th.",
      category: "events", attachments: [], createdBy: "u-teacher1",
      createdByName: "Prof. Robert Downey", targetRoles: ["student"], isPublished: true,
      createdAt: "2026-06-07T14:30:00Z", updatedAt: "2026-06-07T14:30:00Z",
    },
    {
      _id: "n-3", title: "Extended Library Hours During Exam Preparation",
      description: "To support students during examination preparation, the Central Library will operate on extended hours — open 24/7 from June 15th until July 10th. Night entry requires valid student ID. Refreshments available at the reading room cafeteria.",
      category: "administration", attachments: [], createdBy: "u-librarian",
      createdByName: "Sarah Connor", targetRoles: ["student", "teacher"], isPublished: true,
      createdAt: "2026-06-08T09:15:00Z", updatedAt: "2026-06-08T09:15:00Z",
    },
    {
      _id: "n-4", title: "Examination Fee Payment — Final Deadline",
      description: "Last date to pay Semester 6 examination fees without late fine is June 14, 2026. Late payment attracts a penalty of ₹500. Students with pending fees will not be issued hall tickets. Pay online through the Fee Portal or at the accounts office.",
      category: "examination", attachments: [], createdBy: "u-finance",
      createdByName: "Michael Scott", targetRoles: ["student"], isPublished: true,
      createdAt: "2026-06-03T11:00:00Z", updatedAt: "2026-06-03T11:00:00Z",
    },
    {
      _id: "n-5", title: "Campus Placement Drive — TCS Digital",
      description: "TCS Digital is conducting an on-campus recruitment drive on June 25th. Eligible: B.Tech CSE/IT students with CGPA ≥ 7.5 and no active backlogs. Register on the placement portal by June 18th. Pre-placement talk on June 24th at 3 PM in Auditorium.",
      category: "placement", attachments: ["TCS_Digital_JD.pdf"], createdBy: "u-admin",
      createdByName: "Dr. Alice Vance", targetRoles: ["student"], isPublished: true,
      createdAt: "2026-06-10T08:00:00Z", updatedAt: "2026-06-10T08:00:00Z",
    },
    {
      _id: "n-6", title: "Workshop on Generative AI — Registration Open",
      description: "A 2-day workshop on 'Building with Generative AI' will be held on July 5-6 in the CSE department. Topics include prompt engineering, RAG architectures, and fine-tuning LLMs. Limited to 60 seats. Register through the events section.",
      category: "academic", attachments: [], createdBy: "u-teacher2",
      createdByName: "Dr. Sarah Williams", targetRoles: ["student", "teacher"], isPublished: true,
      createdAt: "2026-06-12T10:30:00Z", updatedAt: "2026-06-12T10:30:00Z",
    },
  ];

  const studyMaterials: StudyMaterial[] = [
    {
      _id: "sm-1", title: "RESTful API Design with Node.js & Express",
      description: "Comprehensive notes on designing RESTful APIs — routing, middleware, authentication patterns, and error handling strategies.",
      subject: "Advanced Web Systems", subjectId: "sub-1", semester: 6,
      uploadedBy: "u-teacher1", uploadedByName: "Prof. Robert Downey",
      fileName: "Lecture_04_NodeJS_Routing.pdf", fileSize: "1.8 MB", fileType: "pdf",
      downloadUrl: "#", category: "lecture-notes", views: 156, downloads: 89, createdAt: "2026-06-01T09:00:00Z",
    },
    {
      _id: "sm-2", title: "NoSQL Databases & Mongoose ODM",
      description: "Deep dive into document databases, collection schemas, indexing, query optimization, and Mongoose validation patterns.",
      subject: "Distributed Databases", subjectId: "sub-2", semester: 6,
      uploadedBy: "u-teacher1", uploadedByName: "Prof. Robert Downey",
      fileName: "Unit_3_NoSQL_Mongoose.pdf", fileSize: "3.2 MB", fileType: "pdf",
      downloadUrl: "#", category: "lecture-notes", views: 132, downloads: 67, createdAt: "2026-06-04T11:20:00Z",
    },
    {
      _id: "sm-3", title: "Docker & Container Orchestration",
      description: "Practical guide to Docker — multi-stage builds, networking, volumes, Docker Compose, and CI/CD pipeline integration.",
      subject: "Cloud Security & DevOps", subjectId: "sub-3", semester: 6,
      uploadedBy: "u-teacher2", uploadedByName: "Dr. Sarah Williams",
      fileName: "Docker_Orchestration.pdf", fileSize: "2.7 MB", fileType: "pdf",
      downloadUrl: "#", category: "lecture-notes", views: 198, downloads: 112, createdAt: "2026-06-05T15:10:00Z",
    },
    {
      _id: "sm-4", title: "Neural Networks & Deep Learning Fundamentals",
      description: "Introduction to neural network architectures — perceptrons, CNNs, RNNs, backpropagation, and practical TensorFlow examples.",
      subject: "AI and Machine Learning", subjectId: "sub-4", semester: 6,
      uploadedBy: "u-teacher2", uploadedByName: "Dr. Sarah Williams",
      fileName: "Deep_Learning_Fundamentals.pdf", fileSize: "4.1 MB", fileType: "pdf",
      downloadUrl: "#", category: "lecture-notes", views: 245, downloads: 178, createdAt: "2026-06-06T09:00:00Z",
    },
    {
      _id: "sm-5", title: "Lab Manual — Express.js Practical Exercises",
      description: "10 hands-on lab exercises covering Express.js setup, CRUD APIs, authentication, file uploads, and deployment.",
      subject: "Advanced Web Systems", subjectId: "sub-1", semester: 6,
      uploadedBy: "u-teacher1", uploadedByName: "Prof. Robert Downey",
      fileName: "AWS_Lab_Manual.pdf", fileSize: "2.1 MB", fileType: "pdf",
      downloadUrl: "#", category: "lab-manuals", views: 87, downloads: 54, createdAt: "2026-06-02T10:00:00Z",
    },
    {
      _id: "sm-6", title: "Previous Year Question Paper — Sem 5",
      description: "Collection of previous 3 years question papers for Design & Analysis of Algorithms with solutions.",
      subject: "Design & Analysis of Algorithms", subjectId: "sub-6", semester: 5,
      uploadedBy: "u-teacher1", uploadedByName: "Prof. Robert Downey",
      fileName: "DAA_PYQ_2023-2025.pdf", fileSize: "1.5 MB", fileType: "pdf",
      downloadUrl: "#", category: "question-banks", views: 312, downloads: 234, createdAt: "2026-05-20T14:00:00Z",
    },
  ];

  const timetables: Timetable[] = [
    { _id: "tt-1", subjectId: "sub-1", subjectName: "Advanced Web Systems", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", classroom: "Lab 3", day: "Monday", startTime: "09:00", endTime: "10:30", semester: 6, department: "CSE", type: "lab" },
    { _id: "tt-2", subjectId: "sub-2", subjectName: "Distributed Databases", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", classroom: "Room 402", day: "Monday", startTime: "10:45", endTime: "12:15", semester: 6, department: "CSE", type: "lecture" },
    { _id: "tt-3", subjectId: "sub-3", subjectName: "Cloud Security & DevOps", teacherId: "u-teacher2", teacherName: "Dr. Sarah Williams", classroom: "Room 205", day: "Tuesday", startTime: "09:00", endTime: "10:30", semester: 6, department: "CSE", type: "lecture" },
    { _id: "tt-4", subjectId: "sub-4", subjectName: "AI and Machine Learning", teacherId: "u-teacher2", teacherName: "Dr. Sarah Williams", classroom: "Seminar Hall 1", day: "Tuesday", startTime: "13:15", endTime: "14:45", semester: 6, department: "CSE", type: "lecture" },
    { _id: "tt-5", subjectId: "sub-1", subjectName: "Advanced Web Systems", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", classroom: "Room 301", day: "Wednesday", startTime: "09:00", endTime: "10:30", semester: 6, department: "CSE", type: "lecture" },
    { _id: "tt-6", subjectId: "sub-5", subjectName: "Software Project Management", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", classroom: "Room 402", day: "Wednesday", startTime: "10:45", endTime: "12:15", semester: 6, department: "CSE", type: "lecture" },
    { _id: "tt-7", subjectId: "sub-3", subjectName: "Cloud Security & DevOps", teacherId: "u-teacher2", teacherName: "Dr. Sarah Williams", classroom: "Lab 2", day: "Thursday", startTime: "10:45", endTime: "12:15", semester: 6, department: "CSE", type: "lab" },
    { _id: "tt-8", subjectId: "sub-4", subjectName: "AI and Machine Learning", teacherId: "u-teacher2", teacherName: "Dr. Sarah Williams", classroom: "Lab 4", day: "Thursday", startTime: "14:00", endTime: "16:00", semester: 6, department: "CSE", type: "lab" },
    { _id: "tt-9", subjectId: "sub-2", subjectName: "Distributed Databases", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", classroom: "Room 402", day: "Friday", startTime: "09:30", endTime: "11:00", semester: 6, department: "CSE", type: "lecture" },
    { _id: "tt-10", subjectId: "sub-5", subjectName: "Software Project Management", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", classroom: "Room 301", day: "Friday", startTime: "11:15", endTime: "12:45", semester: 6, department: "CSE", type: "tutorial" },
  ];

  const books: Book[] = [
    { _id: "b-1", title: "Modern Operating Systems", author: "Andrew S. Tanenbaum", isbn: "978-0130313583", category: "Computer Science", quantity: 12, availableQuantity: 8, location: "Shelf A3", publishedYear: 2022, description: "Classic text on OS internals covering virtualization, threads, memory management, and filesystems.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-2", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", isbn: "978-0262046305", category: "Computer Science", quantity: 8, availableQuantity: 3, location: "Shelf A1", publishedYear: 2022, description: "The definitive CLRS textbook on algorithm design and complexity analysis.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-3", title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "978-0078022159", category: "Information Systems", quantity: 15, availableQuantity: 12, location: "Shelf B2", publishedYear: 2019, description: "Comprehensive coverage of relational databases, SQL, transaction management, and query optimization.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-4", title: "Computer Networking: A Top-Down Approach", author: "James Kurose", isbn: "978-0136681533", category: "Networking", quantity: 10, availableQuantity: 6, location: "Shelf C1", publishedYear: 2020, description: "Network fundamentals from application layer to physical layer with hands-on labs.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-5", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Software Engineering", quantity: 5, availableQuantity: 0, location: "Shelf D2", publishedYear: 2008, description: "Essential guide to writing readable, maintainable, and professional software.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-6", title: "Design Patterns", author: "Gamma, Helm, Johnson, Vlissides", isbn: "978-0201633610", category: "Software Engineering", quantity: 6, availableQuantity: 4, location: "Shelf D3", publishedYear: 1994, description: "The classic Gang of Four patterns for reusable object-oriented design.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-7", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell, Peter Norvig", isbn: "978-0134610993", category: "AI & ML", quantity: 7, availableQuantity: 2, location: "Shelf E1", publishedYear: 2020, description: "The most widely used AI textbook covering search, logic, probability, ML, and NLP.", createdAt: "2024-01-15T00:00:00Z" },
    { _id: "b-8", title: "The Pragmatic Programmer", author: "David Thomas, Andrew Hunt", isbn: "978-0135957059", category: "Software Engineering", quantity: 4, availableQuantity: 3, location: "Shelf D1", publishedYear: 2019, description: "Timeless advice on software craftsmanship, from coding to career development.", createdAt: "2024-01-15T00:00:00Z" },
  ];

  const borrowRecords: BorrowRecord[] = [
    { _id: "br-1", studentId: "s-omkar", studentName: "Omkar Prajapati", bookId: "b-1", bookTitle: "Modern Operating Systems", bookAuthor: "Andrew S. Tanenbaum", issueDate: "2026-05-10", dueDate: "2026-05-24", returnDate: "2026-05-22", fineAmount: 0, status: "returned" },
    { _id: "br-2", studentId: "s-omkar", studentName: "Omkar Prajapati", bookId: "b-5", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", issueDate: "2026-05-28", dueDate: "2026-06-11", fineAmount: 0, status: "borrowed" },
    { _id: "br-3", studentId: "s-priya", studentName: "Priya Sharma", bookId: "b-2", bookTitle: "Introduction to Algorithms", bookAuthor: "CLRS", issueDate: "2026-04-15", dueDate: "2026-04-29", fineAmount: 50, status: "overdue" },
    { _id: "br-4", studentId: "s-priya", studentName: "Priya Sharma", bookId: "b-7", bookTitle: "AI: A Modern Approach", bookAuthor: "Russell & Norvig", issueDate: "2026-06-01", dueDate: "2026-06-15", fineAmount: 0, status: "borrowed" },
    { _id: "br-5", studentId: "s-rahul", studentName: "Rahul Mehta", bookId: "b-4", bookTitle: "Computer Networking", bookAuthor: "James Kurose", issueDate: "2026-06-05", dueDate: "2026-06-19", fineAmount: 0, status: "borrowed" },
  ];

  const transactions: Transaction[] = [
    { _id: "txn-1", studentId: "s-omkar", studentName: "Omkar Prajapati", feeType: "examination", amount: 3500, paymentMethod: "Online", transactionId: "TXN-88493121", status: "paid", semester: 5, paidAt: "2025-11-12T10:30:00Z", dueDate: "2025-11-15" },
    { _id: "txn-2", studentId: "s-omkar", studentName: "Omkar Prajapati", feeType: "tuition", amount: 75000, paymentMethod: "Online", transactionId: "TXN-77291044", status: "paid", semester: 6, paidAt: "2026-01-05T09:00:00Z", dueDate: "2026-01-10" },
    { _id: "txn-3", studentId: "s-omkar", studentName: "Omkar Prajapati", feeType: "examination", amount: 3500, paymentMethod: "", transactionId: "", status: "pending", semester: 6, dueDate: "2026-06-14" },
    { _id: "txn-4", studentId: "s-priya", studentName: "Priya Sharma", feeType: "examination", amount: 3500, paymentMethod: "Online", transactionId: "TXN-66182033", status: "paid", semester: 5, paidAt: "2025-11-14T11:00:00Z", dueDate: "2025-11-15" },
    { _id: "txn-5", studentId: "s-priya", studentName: "Priya Sharma", feeType: "tuition", amount: 75000, paymentMethod: "Online", transactionId: "TXN-55073022", status: "paid", semester: 6, paidAt: "2026-01-08T10:00:00Z", dueDate: "2026-01-10" },
    { _id: "txn-6", studentId: "s-priya", studentName: "Priya Sharma", feeType: "examination", amount: 3500, paymentMethod: "", transactionId: "", status: "pending", semester: 6, dueDate: "2026-06-14" },
    { _id: "txn-7", studentId: "s-rahul", studentName: "Rahul Mehta", feeType: "examination", amount: 3500, paymentMethod: "", transactionId: "", status: "pending", semester: 6, dueDate: "2026-06-14" },
    { _id: "txn-8", studentId: "s-rahul", studentName: "Rahul Mehta", feeType: "library", amount: 500, paymentMethod: "", transactionId: "", status: "pending", semester: 6, dueDate: "2026-06-20" },
  ];

  const results: Result[] = [
    // Omkar — Semester 5
    { _id: "r-1", studentId: "s-omkar", subjectId: "sub-6", subjectName: "Design & Analysis of Algorithms", semester: 5, marksObtained: 92, totalMarks: 100, grade: "A+", gpa: 10, credits: 4, publishedBy: "u-teacher1", createdAt: "2025-12-18T00:00:00Z" },
    { _id: "r-2", studentId: "s-omkar", subjectId: "sub-7", subjectName: "Database Management Systems", semester: 5, marksObtained: 95, totalMarks: 100, grade: "A+", gpa: 10, credits: 4, publishedBy: "u-teacher2", createdAt: "2025-12-18T00:00:00Z" },
    { _id: "r-3", studentId: "s-omkar", subjectId: "sub-8", subjectName: "Operating Systems", semester: 4, marksObtained: 88, totalMarks: 100, grade: "A", gpa: 9, credits: 4, publishedBy: "u-teacher1", createdAt: "2025-06-15T00:00:00Z" },
    // Priya — Semester 5
    { _id: "r-4", studentId: "s-priya", subjectId: "sub-6", subjectName: "Design & Analysis of Algorithms", semester: 5, marksObtained: 85, totalMarks: 100, grade: "A", gpa: 9, credits: 4, publishedBy: "u-teacher1", createdAt: "2025-12-18T00:00:00Z" },
    { _id: "r-5", studentId: "s-priya", subjectId: "sub-7", subjectName: "Database Management Systems", semester: 5, marksObtained: 78, totalMarks: 100, grade: "B+", gpa: 8, credits: 4, publishedBy: "u-teacher2", createdAt: "2025-12-18T00:00:00Z" },
    // Rahul — Semester 5
    { _id: "r-6", studentId: "s-rahul", subjectId: "sub-6", subjectName: "Design & Analysis of Algorithms", semester: 5, marksObtained: 72, totalMarks: 100, grade: "B", gpa: 7, credits: 4, publishedBy: "u-teacher1", createdAt: "2025-12-18T00:00:00Z" },
  ];

  const progress: StudentProgress[] = [
    {
      _id: "p-omkar", studentId: "s-omkar", currentCGPA: 9.42, totalCredits: 120, passedCredits: 120, currentSemester: 6,
      academicHistory: [
        { semester: 1, sgpa: 9.10, credits: 24 }, { semester: 2, sgpa: 9.30, credits: 24 },
        { semester: 3, sgpa: 9.25, credits: 24 }, { semester: 4, sgpa: 9.40, credits: 24 },
        { semester: 5, sgpa: 9.55, credits: 24 },
      ],
    },
    {
      _id: "p-priya", studentId: "s-priya", currentCGPA: 8.85, totalCredits: 120, passedCredits: 118, currentSemester: 6,
      academicHistory: [
        { semester: 1, sgpa: 8.50, credits: 24 }, { semester: 2, sgpa: 8.70, credits: 24 },
        { semester: 3, sgpa: 8.65, credits: 24 }, { semester: 4, sgpa: 8.90, credits: 24 },
        { semester: 5, sgpa: 9.00, credits: 24 },
      ],
    },
    {
      _id: "p-rahul", studentId: "s-rahul", currentCGPA: 7.95, totalCredits: 120, passedCredits: 116, currentSemester: 6,
      academicHistory: [
        { semester: 1, sgpa: 7.60, credits: 24 }, { semester: 2, sgpa: 7.80, credits: 24 },
        { semester: 3, sgpa: 7.75, credits: 24 }, { semester: 4, sgpa: 8.10, credits: 24 },
        { semester: 5, sgpa: 8.20, credits: 24 },
      ],
    },
  ];

  const attendance: Attendance[] = [];
  // Generate attendance records for past 30 days for omkar
  const attendanceStatuses: ("present" | "absent" | "late")[] = ["present", "present", "present", "present", "present", "present", "late", "present", "absent", "present"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let attendanceId = 1;
  for (let d = 30; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayName = dayNames[date.getDay()];
    if (dayName === "Sunday" || dayName === "Saturday") continue;

    const daySlots = timetables.filter(t => t.day === dayName && t.semester === 6);
    for (const slot of daySlots) {
      const statusIdx = (attendanceId + d) % attendanceStatuses.length;
      attendance.push({
        _id: `att-${attendanceId++}`,
        studentId: "s-omkar",
        subjectId: slot.subjectId,
        subjectName: slot.subjectName,
        teacherId: slot.teacherId,
        date: date.toISOString().split("T")[0],
        status: attendanceStatuses[statusIdx],
      });
    }
  }

  const assignments: Assignment[] = [
    { _id: "asgn-1", title: "Build a REST API with Express.js", description: "Create a CRUD API for a blog application with authentication, validation, and error handling.", subjectId: "sub-1", subjectName: "Advanced Web Systems", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", dueDate: "2026-06-20", attachments: ["Assignment_01_Spec.pdf"], totalMarks: 50, status: "active", createdAt: "2026-06-01T00:00:00Z" },
    { _id: "asgn-2", title: "MongoDB Schema Design Project", description: "Design and implement a normalized + denormalized schema for an e-commerce platform. Include indexes and aggregation pipelines.", subjectId: "sub-2", subjectName: "Distributed Databases", teacherId: "u-teacher1", teacherName: "Prof. Robert Downey", dueDate: "2026-06-25", attachments: [], totalMarks: 40, status: "active", createdAt: "2026-06-05T00:00:00Z" },
    { _id: "asgn-3", title: "Dockerize a Full-Stack Application", description: "Containerize a MERN stack application with Docker Compose. Include separate services for frontend, backend, and database.", subjectId: "sub-3", subjectName: "Cloud Security & DevOps", teacherId: "u-teacher2", teacherName: "Dr. Sarah Williams", dueDate: "2026-06-18", attachments: [], totalMarks: 30, status: "active", createdAt: "2026-06-03T00:00:00Z" },
  ];

  const notifications: Notification[] = [
    { _id: "nt-1", recipientId: "s-omkar", title: "Welcome to Campus Hub", message: "Your verified student profile is active. Roll: SV-2026-089. Access all campus services from your dashboard.", category: "academic", isRead: false, createdAt: "2026-06-08T09:00:00Z" },
    { _id: "nt-2", recipientId: "s-omkar", title: "Exam Fee Payment Due", message: "Semester 6 examination fees (₹3,500) are due by June 14th. Pay through the Fees & Payments section.", category: "fee", isRead: false, createdAt: "2026-06-08T10:15:00Z" },
    { _id: "nt-3", recipientId: "s-omkar", title: "Library Book Due Soon", message: "'Clean Code' by Robert C. Martin is due on June 11. Renew or return to avoid fines.", category: "library", isRead: false, createdAt: "2026-06-08T12:00:00Z" },
    { _id: "nt-4", recipientId: "all", title: "New Notice: Exam Schedule Released", message: "End Semester Examination schedule has been published. Check the Notice Board for details.", category: "examination", isRead: false, createdAt: "2026-06-05T10:05:00Z" },
    { _id: "nt-5", recipientId: "all", title: "Placement Drive — TCS Digital", message: "TCS Digital campus recruitment drive on June 25th. CGPA ≥ 7.5 required. Register by June 18th.", category: "event", isRead: false, createdAt: "2026-06-10T08:05:00Z" },
    { _id: "nt-6", recipientId: "s-priya", title: "Overdue Book Alert", message: "'Introduction to Algorithms' was due on April 29. Fine of ₹50 has been applied. Return immediately.", category: "library", isRead: false, createdAt: "2026-05-01T09:00:00Z" },
  ];

  return {
    users, students, teachers, departments, subjects, notices, studyMaterials,
    timetables, books, borrowRecords, transactions, results, progress,
    attendance, assignments, notifications,
  };
}

// ─── DB Operations ───────────────────────────────────────────────────
export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    db = seedInitialData();
    saveDB();
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
    } catch {
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
