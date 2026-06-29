// ─── User & Auth ─────────────────────────────────────────────────────
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "student" | "teacher" | "admin" | "admin-officer" | "librarian" | "finance";
  profilePhoto?: string;
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

// ─── Academic ────────────────────────────────────────────────────────
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

// ─── Notices & Materials ─────────────────────────────────────────────
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

// ─── Library ─────────────────────────────────────────────────────────
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

// ─── Finance ─────────────────────────────────────────────────────────
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

// ─── Notifications ───────────────────────────────────────────────────
export interface Notification {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────
export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalBooks: number;
  booksIssued: number;
  overdueBooks: number;
  totalFeeCollected: number;
  pendingPayments: number;
  totalNotices: number;
  totalDepartments: number;
  totalSubjects: number;
  recentNotices: Notice[];
  recentTransactions: Transaction[];
}

export interface LibrarianDashboardStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalFines: number;
  recentActivity: BorrowRecord[];
  popularBooks: Book[];
}

export interface FinanceDashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  totalTransactions: number;
  paidCount: number;
  pendingCount: number;
  recentTransactions: Transaction[];
}
