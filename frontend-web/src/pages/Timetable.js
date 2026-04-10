import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, Box } from '@mui/material';
import API from '../utils/api';

const Timetable = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableData, setTimetableData] = useState([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await API.get('/classes');
        setClasses(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    try {
      const { data } = await API.get(`/timetable/class/${classId}`);
      setTimetableData(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDaySchedule = (day) => {
    const dayData = timetableData.find(d => d.day === day);
    return dayData ? dayData.schedule : [];
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Weekly Timetable</Typography>
      <Box sx={{ mb: 4 }}>
        <Select
          value={selectedClass}
          onChange={handleClassChange}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>Select Class to View Timetable</MenuItem>
          {classes.map(cls => (
            <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
          ))}
        </Select>
      </Box>

      {selectedClass && (
        <Grid container spacing={2}>
          {days.map(day => (
            <Grid item xs={12} key={day}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="h6">{day}</Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Room</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getDaySchedule(day).length > 0 ? (
                      getDaySchedule(day).map((slot, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                          <TableCell>{slot.subject?.name || 'N/A'}</TableCell>
                          <TableCell>{slot.room || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No classes scheduled</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Timetable;
