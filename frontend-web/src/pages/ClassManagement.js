import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import api from '../utils/api';
import { useSelector } from 'react-redux';

const ClassManagement = () => {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      // Filter for classes taught by this teacher if role is teacher
      const filteredClasses = user.role === 'teacher' 
        ? res.data.data.filter(c => c.teacher && (c.teacher._id === user.id || c.teacher === user.id))
        : res.data.data;
      setClassList(filteredClasses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const res = await api.get(`/users?role=student&search=${search}`);
      setStudents(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to search students' });
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className) return;
    
    try {
      const res = await api.post('/classes', {
        name: className,
        section,
        students: selectedStudents,
      });
      
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Class created successfully!' });
        setClassName('');
        setSection('');
        setSelectedStudents([]);
        setStudents([]);
        fetchClasses();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create class' });
    }
  };

  const handleAddStudentsToExisting = async (classId) => {
    if (selectedStudents.length === 0) return;
    try {
      const res = await api.put(`/classes/${classId}/add-students`, {
        studentIds: selectedStudents,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Students added successfully!' });
        setSelectedStudents([]);
        fetchClasses();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add students' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Class & Student Management
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Create Class Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Create New Class
            </Typography>
            <Box component="form" onSubmit={handleCreateClass}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Class Name (e.g., 10th Grade)"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Section (Optional)"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Add Students
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search by Roll No or Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                />
                <Button variant="contained" onClick={handleSearch} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                </Button>
              </Box>

              <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.paper', border: '1px solid #ddd' }}>
                {students.map((student) => (
                  <ListItem key={student._id} dense onClick={() => toggleStudentSelection(student._id)} sx={{ cursor: 'pointer' }}>
                    <Checkbox
                      edge="start"
                      checked={selectedStudents.includes(student._id)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={student.name} secondary={student.rollNumber} />
                  </ListItem>
                ))}
                {students.length === 0 && (
                  <ListItem>
                    <ListItemText secondary="No students found. Use search." />
                  </ListItem>
                )}
              </List>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
                disabled={!className}
              >
                Create Class with {selectedStudents.length} Students
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Existing Classes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Classes
            </Typography>
            <List>
              {classList.map((cls) => (
                <React.Fragment key={cls._id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2">{cls.students?.length || 0} Students</Typography>
                        {selectedStudents.length > 0 && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleAddStudentsToExisting(cls._id)}
                          >
                            Add Selected
                          </Button>
                        )}
                      </Box>
                    }
                  >
                    <ListItemText 
                      primary={`${cls.name} ${cls.section ? `- ${cls.section}` : ''}`} 
                      secondary={`Teacher: ${cls.teacher?.name || 'You'}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {classList.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No classes found. Create one to get started.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClassManagement;
