# Smart Curriculum API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication
- **POST** `/auth/register` - Register a new user
- **POST** `/auth/login` - Login user
- **GET** `/auth/me` - Get current user profile
- **POST** `/auth/forgotpassword` - Request password reset
- **PUT** `/auth/resetpassword/:resettoken` - Reset password

## Users (Admin Only)
- **GET** `/users` - Get all users
- **POST** `/users` - Create user
- **GET** `/users/:id` - Get single user
- **PUT** `/users/:id` - Update user
- **DELETE** `/users/:id` - Delete user

## Classes
- **GET** `/classes` - Get all classes
- **POST** `/classes` - Create class (Admin)
- **PUT** `/classes/:id/add-student` - Add student to class

## Attendance
- **POST** `/attendance` - Mark attendance (Teacher/Admin)
- **GET** `/attendance/class/:classId` - Get attendance for a class
- **GET** `/attendance/me` - Get current student's attendance

## Subjects & Curriculum
- **GET** `/subjects` - Get all subjects
- **POST** `/subjects` - Create subject (Admin)
- **POST** `/subjects/:id/syllabus` - Add syllabus topic (Admin/Teacher)
- **PUT** `/subjects/:id/syllabus/:topicId` - Update topic status (Admin/Teacher)

## Assignments
- **GET** `/assignments/class/:classId` - Get assignments for a class
- **GET** `/assignments/:id` - Get single assignment with submissions (Teacher/Admin)
- **POST** `/assignments` - Create assignment (Teacher/Admin)
- **POST** `/assignments/:id/submit` - Submit assignment (Student)
- **PUT** `/assignments/:id/submissions/:submissionId/grade` - Grade a submission (Teacher/Admin)

## Timetable
- **GET** `/timetable/class/:classId` - Get timetable for a class
- **POST** `/timetable` - Upsert timetable (Admin)

## Activities
- **GET** `/activities` - Get all activities
- **POST** `/activities` - Create activity (Teacher/Admin)
- **PUT** `/activities/:id/join` - Join activity (Student)

## Reports & Analytics
- **GET** `/reports/stats` - Admin dashboard stats
- **GET** `/reports/attendance/:studentId` - Student attendance report
