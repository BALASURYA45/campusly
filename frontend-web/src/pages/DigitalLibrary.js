import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, Button, 
  Chip, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, 
  DialogActions, Select, MenuItem, FormControl, InputLabel, IconButton, 
  CircularProgress, Alert, Tab, Tabs
} from '@mui/material';
import { 
  Search, CloudUpload, PlayCircleFilled, MenuBook, Description, 
  FilterList, MoreVert, Download
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import API from '../utils/api';

const DigitalLibrary = () => {
  const [contents, setContents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [openUpload, setOpenUpload] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '', description: '', contentType: 'Video', subject: '', class: '', fileUrl: ''
  });
  const { user } = useSelector((state) => state.auth);
  const currentRole = (user?.user?.role || user?.role || '').toLowerCase();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        API.get('/content'),
        API.get('/subjects')
      ]);
      setContents(cRes.data.data);
      setSubjects(sRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      await API.post('/content', newContent);
      setOpenUpload(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const filteredContents = contents.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || c.contentType === selectedType;
    return matchesSearch && matchesType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'Video': return <PlayCircleFilled sx={{ color: '#F44336' }} />;
      case 'E-Book': return <MenuBook sx={{ color: '#2196F3' }} />;
      default: return <Description sx={{ color: '#4CAF50' }} />;
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#1E293B">Digital Repository</Typography>
          <Typography variant="body1" color="text.secondary">Access study materials, lectures, and interactive resources</Typography>
        </Box>
        {['teacher', 'admin', 'superadmin'].includes(currentRole) && (
          <Button 
            variant="contained" 
            startIcon={<CloudUpload />}
            onClick={() => setOpenUpload(true)}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1, bgcolor: '#0062FF', '&:hover': { bgcolor: '#0052D9' } }}
          >
            Upload Content
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search materials, subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FFF' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Tabs 
          value={selectedType} 
          onChange={(e, v) => setSelectedType(v)}
          sx={{ '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}
        >
          {['All', 'Video', 'E-Book', 'Study Material'].map(type => (
            <Tab key={type} label={type} value={type} sx={{ fontWeight: '600', textTransform: 'none' }} />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {filteredContents.map((content) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={content._id}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden', height: '100%', border: '1px solid #E2E8F0', transition: '0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={content.thumbnailUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400'}
                  alt={content.title}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip 
                      label={content.contentType} 
                      size="small" 
                      icon={getIcon(content.contentType)}
                      sx={{ fontWeight: '600', height: 24, fontSize: '0.7rem', bgcolor: '#F1F5F9' }}
                    />
                    <Typography variant="caption" color="text.secondary">{content.subject?.name}</Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="700" noWrap sx={{ color: '#1E293B', mb: 0.5 }}>{content.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrientation: 'vertical', overflow: 'hidden', height: 40, mb: 2 }}>
                    {content.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">By {content.uploadedBy?.name || 'Unknown'}</Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<Download />}
                      href={content.fileUrl}
                      target="_blank"
                      sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#E2E8F0', color: '#64748B' }}
                    >
                      View
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: '700' }}>Upload New Material</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Title" 
                value={newContent.title}
                onChange={(e) => setNewContent({...newContent, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Description" multiline rows={2}
                value={newContent.description}
                onChange={(e) => setNewContent({...newContent, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newContent.contentType}
                  label="Type"
                  onChange={(e) => setNewContent({...newContent, contentType: e.target.value})}
                >
                  {['Video', 'E-Book', 'Study Material', 'Other'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={newContent.subject}
                  label="Subject"
                  onChange={(e) => setNewContent({...newContent, subject: e.target.value})}
                >
                  {subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Class (e.g., I-CSE)" 
                value={newContent.class}
                onChange={(e) => setNewContent({...newContent, class: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="File/Video URL" 
                placeholder="https://..."
                value={newContent.fileUrl}
                onChange={(e) => setNewContent({...newContent, fileUrl: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenUpload(false)} sx={{ color: '#64748B' }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} sx={{ bgcolor: '#0062FF' }}>Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalLibrary;
