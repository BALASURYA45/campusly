import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, 
  Box, Stack, Chip, LinearProgress, TextField, InputAdornment,
  Paper, Avatar, Divider
} from '@mui/material';
import API from '../utils/api';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const StudentResourceView = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/resources');
      setResources(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.topic.toLowerCase().includes(search.toLowerCase()) ||
    r.subject?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (type) => {
    switch (type) {
      case 'Video': return <PlayCircleOutlineIcon sx={{ fontSize: 40 }} color="primary" />;
      case 'E-book': return <PictureAsPdfIcon sx={{ fontSize: 40 }} color="error" />;
      case 'Link': return <LinkIcon sx={{ fontSize: 40 }} color="info" />;
      default: return <DownloadIcon sx={{ fontSize: 40 }} color="action" />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800}>Digital Library</Typography>
        <Typography variant="subtitle1" color="text.secondary">Access study materials, lectures, and academic resources</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search by subject, topic or title..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />
      </Paper>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      <Grid container spacing={3}>
        {filteredResources.map((res) => (
          <Grid item xs={12} sm={6} md={4} key={res._id}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 4, 
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'action.hover', width: 64, height: 64, borderRadius: 3 }}>
                    {getIcon(res.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Chip label={res.subject?.name} size="small" color="primary" sx={{ mb: 1, fontWeight: 700 }} />
                    <Typography variant="h6" fontWeight={700} noWrap>{res.title}</Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, height: 40, overflow: 'hidden' }}>
                  {res.description || `Learning material for ${res.topic}`}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    By {res.uploadedBy?.name}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={res.type === 'Video' ? <PlayCircleOutlineIcon /> : <DownloadIcon />}
                    href={`http://localhost:5000${res.fileUrl}`}
                    target="_blank"
                    sx={{ borderRadius: 2 }}
                  >
                    {res.type === 'Video' ? 'Watch' : (res.type === 'Link' ? 'Open' : 'View')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default StudentResourceView;
