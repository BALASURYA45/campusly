import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, 
  TextField, Select, MenuItem, FormControl, InputLabel, 
  Table, TableBody, TableCell, TableHead, TableRow, 
  IconButton, Box, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, Stack, Chip, LinearProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import API from '../utils/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LinkIcon from '@mui/icons-material/Link';

const TeacherResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Study Material',
    subject: '',
    topic: '',
    class: '',
  });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, subRes, clsRes] = await Promise.all([
        API.get('/resources'),
        API.get('/subjects'),
        API.get('/classes')
      ]);
      setResources(resRes.data.data);
      setSubjects(subRes.data.data);
      setClasses(clsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setFormData({
      title: '',
      description: '',
      type: 'Study Material',
      subject: '',
      topic: '',
      class: '',
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (file) data.append('file', file);

    setLoading(true);
    try {
      await API.post('/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Resource uploaded successfully!' });
      fetchData();
      handleClose();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload resource.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      fetchData();
      setMessage({ type: 'success', text: 'Resource deleted.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Delete failed.' });
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'Video': return <VideoLibraryIcon color="primary" />;
      case 'E-book': return <PictureAsPdfIcon color="error" />;
      case 'Link': return <LinkIcon color="info" />;
      default: return <InsertDriveFileIcon color="action" />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>Digital Content Repository</Typography>
          <Typography variant="subtitle1" color="text.secondary">Centralized hub for all study materials and resources</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
          sx={{ borderRadius: 3, px: 3, py: 1.5 }}
        >
          Add New Resource
        </Button>
      </Stack>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800 }}>TYPE</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>TITLE</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>SUBJECT / TOPIC</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>TARGET CLASS</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>UPLOADED BY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource._id} hover>
                    <TableCell>{getResourceIcon(resource.type)}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>{resource.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{resource.fileName || 'Online Resource'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={resource.subject?.name} size="small" variant="outlined" sx={{ mr: 1 }} />
                      <Typography variant="caption">{resource.topic}</Typography>
                    </TableCell>
                    <TableCell>{resource.class?.name || 'All Classes'}</TableCell>
                    <TableCell>{resource.uploadedBy?.name}</TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => handleDelete(resource._id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Upload Study Material</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Resource Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <MenuItem value="Study Material">Study Material</MenuItem>
                    <MenuItem value="Video">Video Lecture</MenuItem>
                    <MenuItem value="E-book">E-Book (PDF)</MenuItem>
                    <MenuItem value="Link">External Link</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Topic"
              fullWidth
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Target Class (Optional)</InputLabel>
              <Select
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ py: 2, borderStyle: 'dashed' }}
            >
              {file ? file.name : 'Choose File (Max 50MB)'}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading || !formData.title}>
            {loading ? 'Uploading...' : 'Upload Resource'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherResourceManagement;
