import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  CircularProgress, Chip, Grid, Card, CardContent, IconButton, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import API from '../utils/api';

const AdminStudentManagement = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchRoll, setSearchRoll] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (searchRoll.trim()) {
      const filtered = students.filter(
        (s) =>
          s.rollNumber?.toLowerCase().includes(searchRoll.toLowerCase()) &&
          !classStudents.some((cs) => cs._id === s._id)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [searchRoll, students, classStudents]);

  const fetchClasses = async () => {
    try {
      const response = await API.get('/classes');
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await API.get('/users?role=student');
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const classData = classes.find((c) => c._id === selectedClass);
      if (classData) {
        const studentsData = await Promise.all(
          classData.students.map((id) =>
            API.get(`/users/${id}`)
          )
        );
        setClassStudents(studentsData.map((r) => r.data.data));
      }
    } catch (err) {
      console.error('Error fetching class students:', err);
    }
  };

  const handleOpenDialog = () => {
    setSearchRoll('');
    setSelectedStudents([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchRoll('');
    setSelectedStudents([]);
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await API.put(
        `/classes/${selectedClass}/add-students`,
        { studentIds: selectedStudents }
      );

      setSuccess(`${selectedStudents.length} student(s) added successfully!`);
      setClassStudents([
        ...classStudents,
        ...students.filter((s) => selectedStudents.includes(s._id)),
      ]);
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding students');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;

    setLoading(true);
    setError('');

    try {
      await API.put(
        `/classes/${selectedClass}/remove-student`,
        { studentId }
      );

      setClassStudents(classStudents.filter((s) => s._id !== studentId));
      setSuccess('Student removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing student');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Student Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage students in classes - add or remove from enrollment
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Select Class"
            >
              <MenuItem value="">
                <em>Choose a class</em>
              </MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name} ({cls.section || 'No Section'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={8}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={!selectedClass}
            fullWidth
            sx={{ height: '56px' }}
          >
            Add Students to Class
          </Button>
        </Grid>
      </Grid>

      {selectedClass && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Students in {classes.find((c) => c._id === selectedClass)?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Total: {classStudents.length} students
            </Typography>

            {classStudents.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No students in this class yet. Click "Add Students" to add them.
              </Typography>
            ) : (
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell fontWeight="bold">Roll Number</TableCell>
                      <TableCell fontWeight="bold">Name</TableCell>
                      <TableCell fontWeight="bold">Email</TableCell>
                      <TableCell align="center" fontWeight="bold">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classStudents.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Chip
                            label={student.rollNumber}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Remove Student">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleRemoveStudent(student._id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Students to Class</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by Roll Number (e.g., 23CS001)"
            value={searchRoll}
            onChange={(e) => setSearchRoll(e.target.value)}
            startAdornment={<SearchIcon sx={{ mr: 1 }} />}
            sx={{ mb: 2 }}
          />

          {filteredStudents.length > 0 && (
            <Box sx={{ border: '1px solid #ddd', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
              {filteredStudents.map((student) => (
                <Box
                  key={student._id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    bgcolor: selectedStudents.includes(student._id)
                      ? 'primary.light'
                      : 'transparent',
                  }}
                  onClick={() => toggleSelectStudent(student._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => toggleSelectStudent(student._id)}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {student.rollNumber}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {student.name}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {searchRoll && filteredStudents.length === 0 && (
            <Alert severity="info">
              No available students found with that roll number.
            </Alert>
          )}

          {selectedStudents.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Selected: {selectedStudents.length} student(s)
              </Typography>
              <Box sx={{ mt: 1 }}>
                {selectedStudents.map((id) => {
                  const student = filteredStudents.find((s) => s._id === id);
                  return (
                    <Chip
                      key={id}
                      label={student?.rollNumber}
                      onDelete={() => toggleSelectStudent(id)}
                      sx={{ mr: 1, mt: 1 }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddStudents}
            variant="contained"
            color="success"
            disabled={loading || selectedStudents.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Selected'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminStudentManagement;
