import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import API from '../utils/api';
import { useSelector } from 'react-redux';

const ReportingDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [format, setFormat] = useState('json');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReports();
    fetchClasses();
    fetchStudents();
  }, [reportType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/reports?type=${reportType}&limit=10`);
      setReports(data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await API.get('/classes');
      setClasses(data.data);
      if (data.data.length > 0) {
        setSelectedClass(data.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/users?role=student');
      setStudents(data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      let endpoint = '/reports';
      let payload = { format };

      switch (reportType) {
        case 'attendance':
          endpoint += '/attendance';
          payload = { ...payload, classId: selectedClass, month, year };
          break;
        case 'performance':
          endpoint += '/performance';
          payload = { ...payload, studentId: selectedStudent };
          break;
        case 'class':
          endpoint += '/class';
          payload = { ...payload, classId: selectedClass };
          break;
        default:
          break;
      }

      const { data } = await API.post(endpoint, payload);
      setMessage('Report generated successfully!');
      fetchReports();
      setOpenDialog(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error generating report: ' + err.response?.data?.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    } else {
      alert('File not available');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this report?')) {
      try {
        await API.delete(`/reports/${id}`);
        fetchReports();
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      attendance: 'Attendance',
      performance: 'Student Performance',
      class: 'Class Performance',
    };
    return labels[type] || type;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reporting & Analytics</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Generate New Report
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.includes('Error') ? 'error' : 'success'}
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Total Reports Generated
              </Typography>
              <Typography variant="h5">{reports.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <DescriptionIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography color="textSecondary" gutterBottom>
                Available for Download
              </Typography>
              <Typography variant="h5">
                {reports.filter(r => r.fileUrl).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={reportType}
            label="Report Type"
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="attendance">Attendance Report</MenuItem>
            <MenuItem value="performance">Student Performance</MenuItem>
            <MenuItem value="class">Class Performance</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Alert severity="info">No reports generated yet. Create your first report to get started!</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Generated</TableCell>
                <TableCell>Format</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id} hover>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={getReportTypeLabel(report.type)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{report.format.toUpperCase()}</TableCell>
                  <TableCell align="right">
                    {report.fileUrl && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownload(report)}
                        title="Download"
                      >
                        <GetAppIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(report._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New Report</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="performance">Student Performance</MenuItem>
              <MenuItem value="class">Class Performance</MenuItem>
            </Select>
          </FormControl>

          {(reportType === 'attendance' || reportType === 'class') && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                label="Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {reportType === 'performance' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Student"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.name} ({student.rollNumber || student.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {reportType === 'attendance' && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Month"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                  />
                </Grid>
              </Grid>
            </>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={format}
              label="Export Format"
              onChange={(e) => setFormat(e.target.value)}
            >
              <MenuItem value="json">View Online (JSON)</MenuItem>
              <MenuItem value="csv">Download as CSV</MenuItem>
              <MenuItem value="excel">Download as Excel</MenuItem>
              <MenuItem value="pdf">Download as PDF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={
              generating ||
              !selectedClass ||
              (reportType === 'performance' && !selectedStudent)
            }
          >
            {generating ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportingDashboard;
