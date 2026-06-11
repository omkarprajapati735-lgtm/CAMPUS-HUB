# CAMPUS HUB MERN Stack MVP - Security Audit & Code Quality Report

**Generated:** June 11, 2026  
**Auditor:** GitHub Copilot Security Analysis  
**Repository:** omkarprajapati735-lgtm/CAMPUS-HUB  
**Folder Analyzed:** `CAMPUS HUB (MERN STACK MVP)`

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. **Plaintext Password Storage (CRITICAL)**
**Location:** `server/database.ts` (lines 163-168), `server.ts` (line 67)

**Issue:** Passwords are stored as plaintext in `passwordHash` field and compared directly.

```typescript
// Database - INSECURE
{ passwordHash: "admin123", ... }
{ passwordHash: "student123", ... }

// Login - INSECURE
const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);
```

**Impact:** HIGH - Complete account compromise if database is exposed.

**Recommendation:**
- Use `bcrypt` or `argon2` for password hashing
- Never store plaintext passwords
- Implement proper password hashing in registration and login endpoints

```typescript
import bcrypt from 'bcrypt';

// During registration
const hashedPassword = await bcrypt.hash(password, 10);

// During login
const isValid = await bcrypt.compare(password, user.passwordHash);
```

---

### 2. **Insecure Token Generation & Storage (CRITICAL)**
**Location:** `server.ts` (lines 74, 107-108, 158)

**Issue:** Tokens are simple concatenation of userId and role without encryption or signature.

```typescript
// INSECURE Token Format
const token = `${user._id}:${user.role}`;
// Example: "u-admin:admin"
```

**Threats:**
- Token can be easily forged (e.g., change role from "student" to "admin")
- No expiration mechanism
- No signature validation
- No rotation policy

**Impact:** CRITICAL - Role escalation vulnerability

**Recommendation:**
- Use JWT (JSON Web Tokens) with HS256 or RS256 signing
- Implement token expiration (15-30 minutes)
- Add refresh token mechanism
- Use `jsonwebtoken` package

```typescript
import jwt from 'jsonwebtoken';
const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
```

---

### 3. **Missing Authentication on Public Endpoints (CRITICAL)**
**Location:** `server.ts` (lines 246, 306, 363, 399)

**Issue:** Multiple endpoints don't require authentication:

```typescript
// PUBLIC - No auth required
app.get("/api/notices", (req, res) => { return res.json(db.notices); });
app.get("/api/notes", (req, res) => { return res.json(db.notes); });
app.get("/api/timetable", (req, res) => { return res.json(db.timetables); });
app.get("/api/library/books", (req, res) => { return res.json(db.books); });
```

**Impact:** Sensitive academic and administrative data exposed to unauthenticated users.

**Recommendation:**
- Apply `authenticateToken` middleware to all protected endpoints
- Implement role-based access control (RBAC)
- Default to deny unless explicitly allowed

```typescript
app.get("/api/notices", authenticateToken, (req, res) => { ... });
```

---

### 4. **No Input Validation or Sanitization (HIGH)**
**Location:** `server.ts` (multiple endpoints)

**Issue:** Request bodies are used directly without validation or sanitization.

```typescript
// UNSAFE - Direct object assignment
const { title, description, importance, category } = req.body;
const newNotice: Notice = {
  _id: "n-" + Math.random().toString(36).substring(2, 9),
  title,  // No validation
  description,  // No validation
  importance: importance || "medium",
  category: category || "general",
  // ...
};
```

**Threats:**
- XSS (Cross-Site Scripting) via stored data
- NoSQL injection (if connected to MongoDB)
- Buffer overflow with large inputs
- Null/undefined crashes

**Recommendation:**
- Use `joi` or `zod` for schema validation
- Implement input size limits
- Sanitize HTML content

```typescript
import { z } from 'zod';

const NoticeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  importance: z.enum(['high', 'medium', 'low']),
  category: z.enum(['academic', 'event', 'exam', 'general'])
});

const validated = NoticeSchema.parse(req.body);
```

---

### 5. **Weak Authorization Checks (HIGH)**
**Location:** `server.ts` (lines 287-289, 369-371, 506-508, 589-591)

**Issue:** Role checks are fragile and don't verify user ownership.

```typescript
// Line 287 - Only checks role
app.delete("/api/notices/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "admin" && req.user.role !== "teacher") {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  // Allows ANY admin/teacher to delete ANY notice
});

// Missing check: Does this user own the resource?
```

**Impact:** Users can manipulate other users' data if they have the same role.

**Recommendation:**
- Verify resource ownership before modification
- Implement granular permissions
- Create ownership records for each resource

```typescript
app.delete("/api/notices/:id", authenticateToken, async (req: any, res) => {
  const notice = db.notices.find(n => n._id === req.params.id);
  if (!notice) return res.status(404).json({ error: "Not found" });
  
  if (notice.postedBy !== req.user._id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  // Safe to delete
});
```

---

### 6. **No HTTPS Enforcement (HIGH)**
**Location:** `server.ts` (line 795)

**Issue:** Server runs on plain HTTP without TLS/SSL.

```typescript
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Impact:** Credentials transmitted in plaintext, susceptible to MITM attacks.

**Recommendation:**
- Use HTTPS in production
- Implement HSTS header
- Use TLS 1.2+

```typescript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(3000);
```

---

### 7. **No CORS Policy (MEDIUM)**
**Location:** `server.ts` (missing)

**Issue:** No CORS headers configured, allowing any origin to access API.

**Impact:** Vulnerable to CSRF attacks from malicious domains.

**Recommendation:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 8. **Insecure Payment Processing (CRITICAL)**
**Location:** `server.ts` (lines 550-585)

**Issue:** Card details sent in plaintext through request body and stored in response.

```typescript
// INSECURE - Credit card data in plaintext
app.post("/api/fees/pay", authenticateToken, (req: any, res) => {
  const { feeId, cardNumber, cardExpiry, cvv } = req.body;
  // Data is not encrypted or hashed
  // No PCI-DSS compliance
});
```

**Impact:** CRITICAL - Exposes payment card data (PCI-DSS violation).

**Recommendation:**
- Use PCI-compliant payment gateway (Stripe, PayPal, Razorpay)
- Never store card details server-side
- Use tokenization
- Implement proper encryption

```typescript
// Use Stripe API instead
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentIntent = await stripe.paymentIntents.create({
  amount: fee.amount * 100,
  currency: 'usd',
  metadata: { feeId, studentId: fee.studentId }
});
```

---

### 9. **No Rate Limiting (MEDIUM)**
**Location:** `server.ts` (missing)

**Issue:** API endpoints have no rate limiting, vulnerable to brute force and DoS.

**Recommendation:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
app.post('/api/auth/login', authLimiter, ...);
```

---

### 10. **SQL/NoSQL Injection Risks (HIGH)**
**Location:** `server.ts` (lines 66-67, 102, 230)

**Issue:** String-based searches without parameterization.

```typescript
// If database switched to MongoDB/SQL
const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
// In real DB, vulnerable to injection attacks
```

**Recommendation:**
- Always use parameterized queries
- Use ORM/ODM libraries (Mongoose, TypeORM)
- Validate and sanitize all inputs

---

## ⚠️ HIGH PRIORITY CODE ISSUES

### 11. **No Error Handling & Logging (HIGH)**
**Location:** `server.ts` (multiple catch blocks with empty handlers)

**Issue:**
```typescript
catch (e) {} // Silent failures
catch (e: any) {} // No error logging
```

**Impact:** Debugging impossible, security issues undetectable.

**Recommendation:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

try {
  // ...
} catch (error) {
  logger.error('Error occurred:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

---

### 12. **Non-Cryptographically Secure ID Generation (MEDIUM)**
**Location:** `server.ts` (lines 107-108, 259, 319, 440, etc.)

**Issue:**
```typescript
// Weak ID generation
const newUserId = "u-" + Math.random().toString(36).substring(2, 9);
// Predictable and not collision-free
```

**Recommendation:**
```typescript
import { v4 as uuidv4 } from 'uuid';
const newUserId = "u-" + uuidv4();
```

---

### 13. **Missing Data Persistence Layer (HIGH)**
**Location:** `server/database.ts` (lines 4, 440-457)

**Issue:** Using JSON file for persistence instead of proper database.

```typescript
const DB_FILE = path.join(process.cwd(), "server_db.json");
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
```

**Problems:**
- Race conditions on concurrent writes
- No transactions
- No atomicity guarantees
- Scalability issues
- No indexing for queries

**Recommendation:** Use MongoDB or PostgreSQL

```typescript
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'] }
});

const User = mongoose.model('User', userSchema);
```

---

### 14. **No Environment Configuration (HIGH)**
**Location:** `server.ts`, `database.ts` (hardcoded values)

**Issue:** Hardcoded ports, database paths, and secrets.

```typescript
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "server_db.json");
// Payment credentials hardcoded
```

**Recommendation:** Use `.env` file

```typescript
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'server_db.json';
const JWT_SECRET = process.env.JWT_SECRET;
```

---

### 15. **Missing Data Validation on Fee/Payment (CRITICAL)**
**Location:** `server.ts` (line 551-570)

**Issue:**
```typescript
const { feeId, cardNumber, cardExpiry, cvv } = req.body;
// No validation of card format, amount, etc.
```

**Risks:**
- Negative or zero amounts
- Invalid card numbers
- No verification of student ID matches fee

**Recommendation:**
```typescript
app.post("/api/fees/pay", authenticateToken, (req: any, res) => {
  const schema = z.object({
    feeId: z.string().min(1),
    amount: z.number().positive()
  });
  
  const { feeId, amount } = schema.parse(req.body);
  
  // Verify fee amount hasn't changed
  const fee = db.examFees.find(f => f._id === feeId);
  if (fee.amount !== amount) {
    return res.status(400).json({ error: 'Amount mismatch' });
  }
});
```

---

### 16. **No Session Timeout (MEDIUM)**
**Location:** `App.tsx` (line 85)

**Issue:** Tokens stored in localStorage never expire.

```typescript
const savedToken = localStorage.getItem("campus_token");
// No expiration check
```

**Recommendation:**
```typescript
useEffect(() => {
  const savedToken = localStorage.getItem("campus_token");
  const tokenExpiry = localStorage.getItem("token_expiry");
  
  if (savedToken && tokenExpiry) {
    if (new Date() > new Date(tokenExpiry)) {
      handleLogout(); // Auto-logout on expiry
    } else {
      fetchSession(savedToken);
    }
  }
}, []);
```

---

### 17. **No Request Body Size Limit (MEDIUM)**
**Location:** `server.ts` (line 26)

**Issue:**
```typescript
app.use(express.json()); // No size limit
```

**Risk:** DoS attacks with large payloads.

**Recommendation:**
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
```

---

### 18. **Missing Audit Logging (HIGH)**
**Location:** All endpoints

**Issue:** No logging of user actions, especially for sensitive operations.

**Recommendation:**
```typescript
function auditLog(userId: string, action: string, resource: string, changes?: any) {
  logger.info({
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    changes,
    ip: req.ip
  });
}

// Usage
auditLog(req.user._id, 'DELETE', 'notice', { noticeId: id });
```

---

### 19. **No Database Constraints (MEDIUM)**
**Location:** `server/database.ts`

**Issue:** TypeScript types alone don't enforce data integrity.

**Problems:**
- Duplicate emails possible
- Invalid semester values
- Orphaned foreign keys
- Null GPA values

**Recommendation:** Use proper database with constraints

```typescript
const studentSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  semester: { type: Number, min: 1, max: 8, required: true },
  gpa: { type: Number, min: 0, max: 10, default: 0 }
}, { timestamps: true });
```

---

### 20. **Missing File Upload Security (HIGH)**
**Location:** `server.ts` (lines 320-328)

**Issue:** Files referenced but not validated.

```typescript
fileName,
fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`, // Fake
downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
```

**Recommendation:** Implement proper file upload handling

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(new Error('Invalid file type'));
    } else {
      cb(null, true);
    }
  }
});

app.post('/api/notes', authenticateToken, upload.single('file'), (req, res) => {
  // Handle uploaded file
});
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 21. **No HTTPS & Security Headers (MEDIUM)**
**Location:** `server.ts`

**Missing Security Headers:**
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security
- Content-Security-Policy

**Recommendation:**
```typescript
import helmet from 'helmet';

app.use(helmet());
```

---

### 22. **Unused/Mock Dependencies (LOW)**
**Location:** `package.json` (line 13)

```json
"@google/genai": "^2.4.0", // Not used anywhere
```

**Recommendation:** Remove unused dependencies to reduce attack surface.

---

### 23. **No API Documentation (MEDIUM)**
**Location:** Missing

**Recommendation:** Add Swagger/OpenAPI documentation

```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

---

### 24. **Type Safety Issues (LOW)**
**Location:** `server.ts` (lines 29, 193, 404)

**Issue:**
```typescript
function authenticateToken(req: any, res: any, next: any) {
  // Using 'any' defeats TypeScript benefits
}
```

**Recommendation:**
```typescript
import { Request, Response, NextFunction } from 'express';

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Proper typing
}
```

---

### 25. **No Database Backup Strategy (MEDIUM)**
**Location:** `server/database.ts`

**Issue:** Single file database with no backup mechanism.

**Recommendation:**
```typescript
import cron from 'node-cron';

// Daily backup
cron.schedule('0 2 * * *', async () => {
  const backup = JSON.stringify(db, null, 2);
  fs.writeFileSync(`backups/db-${Date.now()}.json`, backup);
});
```

---

## 📋 SUMMARY TABLE

| Issue | Severity | Category | Status |
|-------|----------|----------|--------|
| Plaintext Passwords | 🔴 CRITICAL | Security | ❌ Not Fixed |
| Weak Token Generation | 🔴 CRITICAL | Security | ❌ Not Fixed |
| Missing Auth on APIs | 🔴 CRITICAL | Security | ❌ Not Fixed |
| No Input Validation | 🔴 CRITICAL | Security | ❌ Not Fixed |
| Weak Authorization | 🟠 HIGH | Security | ❌ Not Fixed |
| No HTTPS | 🟠 HIGH | Security | ❌ Not Fixed |
| No CORS | 🟠 HIGH | Security | ❌ Not Fixed |
| Card Data Exposure | 🔴 CRITICAL | Security | ❌ Not Fixed |
| No Rate Limiting | 🟠 HIGH | Security | ❌ Not Fixed |
| Injection Vulnerabilities | 🟠 HIGH | Security | ❌ Not Fixed |
| Error Handling | 🟠 HIGH | Code Quality | ❌ Not Fixed |
| Weak ID Generation | 🟡 MEDIUM | Security | ❌ Not Fixed |
| JSON DB Instead of DB | 🟠 HIGH | Architecture | ❌ Not Fixed |
| No Environment Config | 🟠 HIGH | Security | ❌ Not Fixed |
| No Session Timeout | 🟡 MEDIUM | Security | ❌ Not Fixed |
| No Body Size Limit | 🟡 MEDIUM | Security | ❌ Not Fixed |
| No Audit Logging | 🟠 HIGH | Security | ❌ Not Fixed |
| No DB Constraints | 🟡 MEDIUM | Data Quality | ❌ Not Fixed |
| No File Upload Security | 🟠 HIGH | Security | ❌ Not Fixed |
| Missing Headers | 🟡 MEDIUM | Security | ❌ Not Fixed |

---

## 🔧 IMMEDIATE ACTION ITEMS

### Priority 1 (Deploy Immediately):
1. ✅ Implement bcrypt password hashing
2. ✅ Replace token system with JWT
3. ✅ Add authentication to all sensitive endpoints
4. ✅ Implement input validation with zod/joi
5. ✅ Move to HTTPS with certificate

### Priority 2 (Within 1 Week):
6. ✅ Migrate to proper database (MongoDB/PostgreSQL)
7. ✅ Implement rate limiting
8. ✅ Add proper error handling & logging
9. ✅ Integrate PCI-compliant payment processor
10. ✅ Add CORS & security headers

### Priority 3 (Within 1 Month):
11. ✅ Add comprehensive audit logging
12. ✅ Implement automated backups
13. ✅ Add API documentation
14. ✅ Conduct penetration testing
15. ✅ Implement database constraints & validation

---

## 📝 RECOMMENDATIONS FOR PRODUCTION DEPLOYMENT

1. **Use environment variables** for all configuration
2. **Implement automated testing** (unit, integration, security tests)
3. **Set up CI/CD pipeline** with security checks
4. **Enable WAF (Web Application Firewall)**
5. **Implement DDoS protection**
6. **Regular security audits and penetration testing**
7. **Keep dependencies updated** (run `npm audit fix` regularly)
8. **Implement proper monitoring** and alerting
9. **Create incident response plan**
10. **Encrypt sensitive data at rest**

---

## 🔐 COMPLIANCE ISSUES

- ❌ **GDPR:** No data export/deletion mechanisms
- ❌ **FERPA:** Student data not properly protected
- ❌ **PCI-DSS:** Payment processing not compliant
- ❌ **OWASP Top 10:** Multiple vulnerabilities present

---

**Report Ends**

*This audit is based on static code analysis. Please conduct a comprehensive penetration test before production deployment.*
