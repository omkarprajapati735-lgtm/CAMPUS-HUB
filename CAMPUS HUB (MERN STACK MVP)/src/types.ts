export interface User {
  _id: string;
  email: string;
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
  uploadedBy: string;
  fileName: string;
  semester: number;
  fileSize: string;
  views: number;
  createdAt: string;
  description: string;
  downloadUrl: string;
}

export interface TimeTableSlot {
  _id: string;
  semester: number;
  batch: string;
  day: string;
  startTime: string;
  endTime: string;
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
  recipientId: string;
  message: string;
  title: string;
  type: "academic" | "notice" | "library" | "fee";
  read: boolean;
  createdAt: string;
}
