import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Box, Grid, Card, CardContent, Select, MenuItem, Alert, CircularProgress, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const QRCodeAttendance = () => {
  const [qrValue, setQrValue] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [qrExpiry, setQrExpiry] = useState(null);
  const [scannedStudents, setScannedStudents] = useState([]);
  const [mode, setMode] = useState('generate'); // 'generate' or 'verify'
  const [qrInput, setQrInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/classes');
      const teacherClasses = user.role === 'teacher' 
        ? data.data.filter(c => c.teacher && (c.teacher._id === user.id || c.teacher === user.id))
        : data.data;
      setClasses(teacherClasses);
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]._id);
        fetchSubjectsForClass(teacherClasses[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      const { data } = await API.get('/subjects');
      const classSubjects = data.data.filter(s => s.class === classId || s.class?._id === classId);
      setSubjects(classSubjects);
      if (classSubjects.length > 0) {
        setSelectedSubject(classSubjects[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateQR = () => {
    if (!selectedClass) return alert('Please select a class');

    // Create a QR code with expiry (valid for 15 minutes)
    const timestamp = Date.now();
    const expiryTime = timestamp + (15 * 60 * 1000); // 15 minutes
    const token = `ATT-${selectedClass}-${timestamp}-${Math.floor(Math.random() * 100000)}`;
    
    setQrValue(token);
    setQrExpiry(expiryTime);
    setScannedStudents([]);
    setMessage({ type: 'success', text: `QR Code generated! Valid until ${new Date(expiryTime).toLocaleTimeString()}` });

    // Auto-expire QR code after 15 minutes
    setTimeout(() => {
      setQrValue('');
      setMessage({ type: 'warning', text: 'QR Code has expired. Generate a new one.' });
    }, 15 * 60 * 1000);
  };

  const handleQRScan = async () => {
    if (!qrInput) return alert('Please enter or scan a QR code');
    
    try {
      // Verify the QR code and mark attendance
      const response = await API.post('/attendance', {
        student: user.id || user.user?.id,
        class: selectedClass,
        subject: selectedSubject || null,
        status: 'Present',
        date: new Date(),
        qrToken: qrInput
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Attendance marked successfully!' });
        setQrInput('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to verify QR code' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>QR Code Attendance System</Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Generate QR Code - For Teachers */}
        {(user.role === 'teacher' || user.role === 'admin') && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Generate QR Code (Teacher)</Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    fetchSubjectsForClass(e.target.value);
                  }}
                >
                  {classes.map(cls => (
                    <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Subject (Optional)</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects.map(sub => (
                    <MenuItem key={sub._id} value={sub._id}>{sub.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="contained" fullWidth onClick={generateQR} size="large">
                Generate QR Code
              </Button>

              {qrValue && (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Paper sx={{ p: 2, bgcolor: '#fff' }}>
                    <QRCodeSVG 
                      value={qrValue} 
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </Paper>
                  <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                    Expires at {qrExpiry ? new Date(qrExpiry).toLocaleTimeString() : 'N/A'}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => {
                      const element = document.querySelector('canvas');
                      if (element) {
                        const url = element.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'attendance_qr.png';
                        link.click();
                      }
                    }}
                  >
                    Download QR Code
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* Scan QR Code - For Students */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Mark Attendance (Student)</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Enter or scan the QR code provided by your teacher
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="QR Code"
                placeholder="Scan or paste QR code here"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
              />
              <Button variant="contained" onClick={handleQRScan}>
                Submit
              </Button>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="body2" color="textSecondary">How it works:</Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                  1. Teacher generates a QR code<br />
                  2. Students scan with their phone camera<br />
                  3. Enter the code above and submit<br />
                  4. Attendance is marked automatically
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QRCodeAttendance;
