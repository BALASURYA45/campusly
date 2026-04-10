import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const ParentChildPerformance = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    graded: 0,
    pending: 0,
    avgGrade: 'N/A',
  });

  const fetchChildPerformance = useCallback(async () => {
    if (!childId) return;

    try {
      const { data: meRes } = await API.get('/auth/me');
      const linkedChild = (meRes.data.children || []).find((c) => c._id === childId);
      setChild(linkedChild || null);

      const { data: reportRes } = await API.post('/reports/performance', {
        studentId: childId,
        format: 'json',
      });
      const reportData = reportRes.data;
      const details = reportData.details || [];

      setAssignments(details);
      setStats({
        graded: details.filter((item) => item.grade && item.grade !== 'N/A').length,
        pending: details.filter((item) => item.status && item.status !== 'Graded').length,
        avgGrade: reportData.statistics?.averageGrade || 'N/A',
      });
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchChildPerformance();
  }, [fetchChildPerformance]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/parent')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Typography variant="h4" gutterBottom>
        {child?.name}'s Performance Report
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Graded Assignments
              </Typography>
              <Typography variant="h5">{stats.graded}</Typography>
              <Typography variant="caption" color="textSecondary">
                Completed with grades
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Grades
              </Typography>
              <Typography variant="h5">{stats.pending}</Typography>
              <Typography variant="caption" color="textSecondary">
                Awaiting teacher feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overall Status
              </Typography>
              <Typography variant="h5">{stats.avgGrade}</Typography>
              <Typography variant="caption" color="textSecondary">
                Based on submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assignment Details
            </Typography>

            {assignments.length === 0 ? (
              <Alert severity="info">No assignments found for this child's class.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Feedback</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment, index) => {
                      const isSubmitted = assignment.status && assignment.status !== 'Pending';
                      const isPastDue = new Date(assignment.dueDate) < new Date();

                      return (
                        <TableRow key={assignment._id || index}>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell>{assignment.subject?.name || '-'}</TableCell>
                          <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {!isSubmitted ? (
                              <Chip
                                label="Not Submitted"
                                color={isPastDue ? 'error' : 'warning'}
                                size="small"
                              />
                            ) : (
                              <Chip label={assignment.status} color="primary" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.grade && assignment.grade !== 'N/A' ? (
                              <Chip label={assignment.grade} color="success" size="small" />
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Pending
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.feedback && assignment.feedback !== 'No feedback' ? (
                              <Typography variant="caption">{assignment.feedback}</Typography>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ParentChildPerformance;
