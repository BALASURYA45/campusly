# MODULE 12 - REPORTING & ANALYTICS
## Complete Implementation Guide

---

## 📋 Overview
A comprehensive reporting and analytics system has been implemented for the Smart Curriculum application, providing detailed insights into attendance, student performance, and class metrics with multiple export formats.

---

## ✅ Features Implemented

### 1. **Attendance Reports**
- Generate detailed attendance reports by class and month
- Student-wise attendance breakdown:
  - Present count
  - Absent count
  - Late arrivals
  - Attendance percentage
- Monthly statistics
- Average attendance calculation

### 2. **Student Performance Reports**
- Individual student performance analysis
- Assignment tracking:
  - Submission status
  - Grades received
  - Teacher feedback
  - Late submission tracking
- Attendance percentage
- Activity participation
- Overall performance rating (Excellent/Good/Average/Poor)

### 3. **Class Performance Reports**
- Class-level analytics
- Student rankings
- Average submission rates
- Grade distribution
- Top performer identification
- Class-wide attendance metrics

### 4. **Export Formats**
- **JSON**: View reports online in application
- **CSV**: Excel-compatible format for data analysis
- **Excel**: Formatted spreadsheets with styling
- **PDF**: Professional printable documents

### 5. **Report Management**
- Store generated reports in database
- View report history
- Download previously generated reports
- Delete old reports
- Auto-cleanup after 90 days

---

## 🏗️ Backend Architecture

### Database Model: Report

```javascript
{
  title: String,
  type: 'attendance|performance|class|teacher|activity|assignment',
  generatedBy: ObjectId (User),
  generatedFor: ObjectId (User),
  class: ObjectId (Class),
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  data: {
    summary: Object,
    details: Object,
    statistics: Object
  },
  filters: Object,
  format: 'pdf|excel|csv|json',
  fileUrl: String,
  fileName: String,
  createdAt: Date,
  expiresAt: Date (auto-delete after 90 days)
}
```

### API Endpoints

#### Generate Attendance Report
**POST** `/api/v1/reports/attendance`
```json
{
  "classId": "class_id",
  "month": 2,
  "year": 2025,
  "format": "pdf" // optional: csv, excel, json (default)
}
```

Response includes:
```json
{
  "success": true,
  "data": {
    "report": { /* report document */ },
    "summary": {
      "class": "Class Name",
      "totalStudents": 30,
      "reportMonth": "2/2025",
      "totalDays": 28
    },
    "details": [
      {
        "rollNo": "23CS001",
        "studentName": "John Doe",
        "present": 25,
        "absent": 2,
        "late": 1,
        "total": 28,
        "percentage": "89.29%"
      }
    ],
    "statistics": {
      "totalPresent": 750,
      "totalAbsent": 30,
      "totalLate": 10,
      "averageAttendance": "88.50"
    }
  }
}
```

#### Generate Student Performance Report
**POST** `/api/v1/reports/performance`
```json
{
  "studentId": "student_id",
  "classId": "class_id", // optional
  "format": "excel" // optional
}
```

Response includes:
```json
{
  "success": true,
  "data": {
    "summary": {
      "studentName": "John Doe",
      "rollNumber": "23CS001",
      "email": "john@example.com",
      "totalAssignments": 15,
      "submittedAssignments": 14,
      "gradedAssignments": 12,
      "lateSubmissions": 2,
      "activitiesParticipated": 5
    },
    "details": [
      {
        "title": "Project 1",
        "dueDate": "2025-02-15",
        "status": "Graded",
        "submitted": "2025-02-14",
        "isLate": false,
        "grade": "A",
        "marks": 95,
        "feedback": "Excellent work!"
      }
    ],
    "statistics": {
      "averageGrade": "B",
      "submissionRate": "93.33%",
      "attendancePercentage": "88.50%",
      "overallPerformance": "Good"
    }
  }
}
```

#### Generate Class Report
**POST** `/api/v1/reports/class`
```json
{
  "classId": "class_id",
  "format": "csv" // optional
}
```

#### Get Reports
**GET** `/api/v1/reports?type=attendance&limit=10&page=1`

Parameters:
- `type` (optional): attendance, performance, class
- `limit` (default: 10)
- `page` (default: 1)

#### Get Single Report
**GET** `/api/v1/reports/:id`

#### Delete Report
**DELETE** `/api/v1/reports/:id`

#### Get Dashboard Stats
**GET** `/api/v1/reports/stats`

Returns system-wide statistics:
- Total students, teachers, classes
- Attendance statistics
- Role distribution
- Activity statistics

---

## 💾 Export Utilities

### File: `backend/src/utils/reportExport.js`

#### **generateCSV(data, title)**
Generates comma-separated values file with:
- Title and generation timestamp
- Summary section
- Detailed records
- Statistics
- Excel-compatible format

#### **generateExcel(data, title)**
Creates formatted Excel workbook with:
- Styled headers with background colors
- Summary section with formatting
- Detailed data table
- Statistics section
- Auto-calculated column widths
- Professional appearance

#### **generatePDF(data, title)**
Generates PDF document with:
- Title and timestamp
- Summary information
- Tabular data layout
- Statistics section
- Multi-page support
- Professional formatting

---

## 🎨 Frontend Components

### ReportingDashboard Page
**Location**: `frontend-web/src/pages/ReportingDashboard.js`

**Features**:
- Report type selection (Attendance, Performance, Class)
- Report generation dialog
- Dynamic form fields based on report type
- Report history table with pagination
- Download functionality
- Delete reports
- Export format selection
- Loading states
- Success/error messages

**Form Validation**:
- Class selection for attendance and class reports
- Student selection for performance reports
- Month/year input for attendance reports
- Format selection (JSON/CSV/Excel/PDF)

---

## 📊 Report Types & Calculations

### **Attendance Report**
```
Attendance % = (Present Days / Total Days) × 100

Summary:
- Class name and total students
- Month/Year of report
- Total days in period

Details per student:
- Roll number and name
- Present, Absent, Late counts
- Total attendance
- Percentage

Statistics:
- Total present across class
- Total absent across class
- Total late across class
- Average attendance percentage
```

### **Student Performance Report**
```
Submission Rate = (Submitted / Total Assignments) × 100
Average Grade = Average of all graded assignments

Summary:
- Student name, roll number, email
- Total assignments
- Submitted assignments
- Graded assignments
- Late submissions
- Activity participation

Details:
- Each assignment with:
  - Title, due date, status
  - Grade and marks obtained
  - Teacher feedback
  - Late flag

Statistics:
- Average grade (A-F)
- Submission rate percentage
- Attendance percentage
- Overall performance level
```

### **Class Performance Report**
```
Submission Rate = (Total Submissions / (Total Assignments × Students)) × 100

Summary:
- Class name
- Total students
- Total assignments
- Average submission rate

Details per student:
- Name and roll number
- Assignments submitted count
- Average grade
- Attendance percentage

Statistics:
- Top 5 performers with grades
- Class average attendance
```

---

## 🔐 Access Control

```javascript
// Attendance Report
- Teachers (their classes only)
- Admins (all classes)

// Performance Report
- Teachers
- Admins
- Parents (their children only)

// Class Report
- Teachers (their classes)
- Admins

// Report Management
- Get/Delete: Own reports or admins
```

---

## 📝 Usage Examples

### Generate via API

```bash
# Attendance Report for Feb 2025
curl -X POST http://localhost:5000/api/v1/reports/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "classId": "class_id",
    "month": 2,
    "year": 2025,
    "format": "pdf"
  }'

# Student Performance Report
curl -X POST http://localhost:5000/api/v1/reports/performance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "studentId": "student_id",
    "format": "excel"
  }'

# Class Report
curl -X POST http://localhost:5000/api/v1/reports/class \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "classId": "class_id",
    "format": "csv"
  }'
```

### Via UI
1. Click "Reports" in navigation
2. Click "Generate New Report"
3. Select report type
4. Choose class/student as needed
5. Set export format
6. Click "Generate"
7. Download or view online

---

## 📦 Dependencies

Add to `package.json`:
```json
{
  "exceljs": "^4.3.0",
  "pdfkit": "^0.13.0"
}
```

Install:
```bash
npm install exceljs pdfkit
```

---

## 🎯 Performance Rating

```javascript
Excellent: Average Grade >= 85%
Good:      Average Grade >= 70%
Average:   Average Grade >= 60%
Below Avg: Average Grade >= 50%
Poor:      Average Grade < 50%
```

---

## 💡 Key Features

| Feature | Details |
|---------|---------|
| **Real-time Generation** | Reports generated instantly |
| **Multiple Formats** | JSON, CSV, Excel, PDF |
| **Auto-expiry** | Reports auto-delete after 90 days |
| **History** | View all generated reports |
| **Download** | Export to computer for offline use |
| **Role-based** | Different access per user role |
| **Pagination** | Handle large datasets efficiently |
| **Validation** | Input validation before generation |
| **Error Handling** | Graceful error messages |
| **Timestamps** | Track generation time |

---

## 🚀 Future Enhancements

1. **Scheduled Reports**
   - Auto-generate daily/weekly/monthly
   - Email delivery
   - Report subscriptions

2. **Advanced Analytics**
   - Trend analysis
   - Predictive insights
   - Comparison reports (class vs class)

3. **Custom Reports**
   - User-defined queries
   - Flexible filtering
   - Custom visualizations

4. **Data Visualization**
   - Embedded charts in exports
   - Interactive dashboards
   - Real-time dashboards

5. **Report Templates**
   - Pre-built templates
   - Customizable layouts
   - Branding options

6. **API Integrations**
   - Export to external systems
   - Integration with data warehouses
   - Real-time data sync

---

## 📁 Files Created/Modified

### Created
```
backend/src/models/Report.js
backend/src/utils/reportExport.js
frontend-web/src/pages/ReportingDashboard.js
```

### Modified
```
backend/src/controllers/reportController.js (enhanced)
backend/src/routes/reportRoutes.js (updated endpoints)
frontend-web/src/App.js (added route)
frontend-web/src/components/Header.js (added Reports link)
```

---

## ⚙️ Configuration

### Exports Directory
Automatically created at: `backend/exports/`

Ensure write permissions:
```bash
mkdir -p backend/exports
chmod 755 backend/exports
```

### Environment Variables
```
# Optional: Set export path
EXPORT_DIR=./exports
```

---

## 🧪 Testing Checklist

- ✅ Generate attendance report
- ✅ Generate performance report
- ✅ Generate class report
- ✅ Export as CSV
- ✅ Export as Excel
- ✅ Export as PDF
- ✅ Export as JSON
- ✅ Download exported files
- ✅ View report history
- ✅ Delete reports
- ✅ Verify TTL auto-cleanup
- ✅ Test role-based access
- ✅ Validate calculations
- ✅ Test with large datasets
- ✅ UI error handling

---

## 📊 Sample Report Output

### Attendance Report Summary
```
Class: 10-A
Total Students: 30
Report Month: February 2025
Total Days: 28

Top Performer: Student A (96.4%)
Lowest Attendance: Student B (71.4%)
Class Average: 88.5%
```

### Performance Report Summary
```
Student: John Doe (23CS001)
Total Assignments: 15
Submitted: 14 (93.33%)
Average Grade: B
Attendance: 88.50%
Overall Performance: Good
```

### Class Report Summary
```
Class: 10-A
Total Students: 30
Average Submission Rate: 92%
Class Average Attendance: 88.5%
Top Performers: [5 students listed]
```

---

## 🎉 Module Status

**MODULE 12 - REPORTING & ANALYTICS: 100% COMPLETE**

All reporting features have been implemented and integrated with the existing modules. The system provides comprehensive analytics with multiple export formats and professional reporting capabilities.

### Components Completed
- ✅ Attendance Reports
- ✅ Student Performance Reports
- ✅ Class Performance Reports
- ✅ CSV Export
- ✅ Excel Export
- ✅ PDF Export
- ✅ Report History & Management
- ✅ Role-based Access Control
- ✅ Admin Dashboard Integration
- ✅ Real-time Report Generation

### Next Steps
1. Deploy to production
2. Monitor report generation performance
3. Implement scheduled reports (future)
4. Add more visualization options (future)
5. Integrate with external BI tools (future)

---

**Last Updated**: February 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
