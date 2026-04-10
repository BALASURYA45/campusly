# Smart Curriculum - Setup & User Import Guide

## Prerequisites
Make sure your backend is configured with MongoDB connection in `.env` file.

---

## 🔧 Initial Setup (Run These in Order)

### Step 1: Create Admin Account
```bash
cd backend
npm run seed:admin
```
**Admin Credentials:**
- Email: `admin@smartcurriculum.edu`
- Password: `Admin@123`

---

### Step 2: Import Students
```bash
npm run import:students
```
**Requirements:**
- File: `Credentials/studentuserdetails.xlsx`
- Columns: 
  - **A & B**: Roll Number & Password (first 2 users)
  - **D & E**: Roll Number & Password (remaining users)

**Login for Students:**
- Roll Number: From Excel
- Password: From Excel

---

### Step 3: Import Teachers
```bash
npm run import:teachers
```
**Requirements:**
- File: `Credentials/teachercredentials.xlsx`
- Columns: Name, ID, Password

**Login for Teachers:**
- Email: `id@teacher.edu` (or as provided in Excel)
- Password: From Excel

---

### Step 4: Import Parents (Optional)
```bash
npm run import:parents
```
**Requirements:**
- File: `Credentials/parentcredentials.xlsx`
- Columns: Name, ID, Password

**Login for Parents:**
- Email: `id@parent.edu` (or as provided in Excel)
- Password: From Excel

---

## ✅ Complete Setup Summary

```bash
# Run all imports in sequence
npm run seed:admin
npm run import:students
npm run import:teachers
npm run import:parents
```

---

## 🔐 Login Credentials by Role

| Role | Login With | Username | Password |
|------|-----------|----------|----------|
| **Admin** | Email + Password | admin@smartcurriculum.edu | Admin@123 |
| **Student** | Roll Number + Password | 23CS001 | From Excel |
| **Teacher** | Email + Password | teacher_id@teacher.edu | From Excel |
| **Parent** | Email + Password | parent_id@parent.edu | From Excel |

---

## 📋 Excel File Format Requirements

### Student File: `studentuserdetails.xlsx`
```
Column A: Roll Number  (e.g., 23CS001)
Column B: Password
Column D: Roll Number  (e.g., 23CS010)
Column E: Password
```

### Teacher File: `teachercredentials.xlsx`
```
Column A: Name
Column B: ID
Column C: Password
```

### Parent File: `parentcredentials.xlsx`
```
Column A: Name
Column B: ID
Column C: Password
```

---

## 🚀 Starting the Application

### Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
cd frontend-web
npm start
```
Frontend runs on: `http://localhost:3000`

---

## 🌐 Access Application

1. Open `http://localhost:3000` in your browser
2. Click **"Sign In Now"** button
3. Select your role (Student, Teacher, Parent, Admin)
4. Enter credentials from setup step above

---

## ⚠️ Troubleshooting

### "User not found" error
- Ensure import scripts have run successfully
- Check that Excel files exist in `Credentials/` folder
- Verify column names match the requirements

### Import shows 0 created
- Check column headers in Excel file
- Ensure data exists in the correct columns
- Verify MongoDB is running and connected

### Backend won't start
- Check `MONGO_URI` in `.env` file
- Ensure MongoDB Atlas or local MongoDB is running
- Check for port 5000 conflicts

---

## 📞 Support

For detailed API documentation, see `API_DOCUMENTATION.md`
