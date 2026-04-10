import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme as customTheme } from './theme';
import Header from './components/Header';
import Notification from './components/Notification';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import ParentLogin from './pages/ParentLogin';
import AdminLogin from './pages/AdminLogin';
import AttendanceMarking from './pages/AttendanceMarking';
import SubjectList from './pages/SubjectList';
import ActivityManagement from './pages/ActivityManagement';
import StudentAssignmentView from './pages/StudentAssignmentView';
import QRCodeAttendance from './pages/QRCodeAttendance';
import EnhancedTimetable from './pages/EnhancedTimetable';
import ClassManagement from './pages/ClassManagement';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import AdminManagement from './pages/AdminManagement';
import AdminStudentManagement from './pages/AdminStudentManagement';
import TeacherAssignmentManagement from './pages/TeacherAssignmentManagement';
import StudentAttendanceView from './pages/StudentAttendanceView';
import ParentDashboard from './pages/ParentDashboard';
import ParentChildAttendance from './pages/ParentChildAttendance';
import ParentChildPerformance from './pages/ParentChildPerformance';
import ParentMessages from './pages/ParentMessages';
import AttendanceReport from './pages/AttendanceReport';
import CurriculumManagement from './pages/CurriculumManagement';
import TeacherActivityManagement from './pages/TeacherActivityManagement';
import NotificationCenter from './pages/NotificationCenter';
import ReportingDashboard from './pages/ReportingDashboard';
import ThemeCustomization from './pages/ThemeCustomization';
import TeacherResourceManagement from './pages/TeacherResourceManagement';
import TeacherQuizManagement from './pages/TeacherQuizManagement';
import StudentResourceView from './pages/StudentResourceView';
import StudentQuizView from './pages/StudentQuizView';
import DigitalLibrary from './pages/DigitalLibrary';
import TeacherIntervention from './pages/TeacherIntervention';

function App() {
  const { user } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => customTheme(mode), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header toggleColorMode={toggleColorMode} mode={mode} />
        <Notification />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/teacher" element={<TeacherLogin />} />
          <Route path="/login/parent" element={<ParentLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/" />} 
          />
          <Route path="/attendance" element={user ? <AttendanceMarking /> : <Navigate to="/" />} />
          <Route path="/attendance-report" element={user?.role === 'teacher' || user?.role === 'admin' ? <AttendanceReport /> : <Navigate to="/dashboard" />} />
          <Route path="/my-attendance" element={user?.role === 'student' || user?.user?.role === 'student' ? <StudentAttendanceView /> : <Navigate to="/dashboard" />} />
          <Route path="/subjects" element={user ? <SubjectList /> : <Navigate to="/" />} />
          <Route path="/activities" element={user ? <ActivityManagement /> : <Navigate to="/" />} />
          <Route path="/my-assignments" element={user ? <StudentAssignmentView /> : <Navigate to="/" />} />
          <Route path="/qr-attendance" element={user ? <QRCodeAttendance /> : <Navigate to="/" />} />
          <Route path="/timetable" element={user ? <EnhancedTimetable /> : <Navigate to="/" />} />
          <Route path="/classes" element={user ? <ClassManagement /> : <Navigate to="/" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" />} />
          <Route path="/teacher/assignments" element={user?.role === 'teacher' || user?.user?.role === 'teacher' ? <TeacherAssignmentManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/manage" element={user?.user?.role === 'admin' || user?.role === 'admin' ? <AdminManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/admin/students" element={user?.user?.role === 'admin' || user?.role === 'admin' ? <AdminStudentManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/parent" element={user?.role === 'parent' || user?.user?.role === 'parent' ? <ParentDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="/parent/child/:childId/attendance" element={user?.role === 'parent' || user?.user?.role === 'parent' ? <ParentChildAttendance /> : <Navigate to="/dashboard" />} />
          <Route path="/parent/child/:childId/performance" element={user?.role === 'parent' || user?.user?.role === 'parent' ? <ParentChildPerformance /> : <Navigate to="/dashboard" />} />
          <Route path="/parent/child/:childId/messages" element={user?.role === 'parent' || user?.user?.role === 'parent' ? <ParentMessages /> : <Navigate to="/dashboard" />} />
          <Route path="/curriculum" element={user?.role === 'teacher' || user?.user?.role === 'teacher' ? <CurriculumManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/teacher/activities" element={user?.role === 'teacher' || user?.user?.role === 'teacher' ? <TeacherActivityManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/notifications" element={user ? <NotificationCenter /> : <Navigate to="/" />} />
          <Route path="/reports" element={user?.role === 'teacher' || user?.role === 'admin' || user?.user?.role === 'teacher' || user?.user?.role === 'admin' ? <ReportingDashboard /> : <Navigate to="/dashboard" />} />
          <Route path="/theme" element={user?.role === 'admin' || user?.role === 'superadmin' ? <ThemeCustomization /> : <Navigate to="/dashboard" />} />
          <Route path="/resources" element={user ? <StudentResourceView /> : <Navigate to="/" />} />
          <Route path="/quizzes" element={user ? <StudentQuizView /> : <Navigate to="/" />} />
          <Route path="/library" element={user ? <DigitalLibrary /> : <Navigate to="/" />} />
          <Route path="/teacher/resources" element={user?.role === 'teacher' || user?.user?.role === 'teacher' ? <TeacherResourceManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/teacher/quizzes" element={user?.role === 'teacher' || user?.user?.role === 'teacher' ? <TeacherQuizManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/teacher/intervention/:studentId" element={user?.role === 'teacher' || user?.user?.role === 'teacher' ? <TeacherIntervention /> : <Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
