import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import API from '../utils/api';

const defaultTheme = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  successColor: '#4caf50',
  errorColor: '#f44336',
  warningColor: '#ff9800',
  infoColor: '#2196f3',
};

const ThemeCustomization = () => {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const { data } = await API.get('/admin/theme');
      if (data.data) {
        setTheme({ ...defaultTheme, ...data.data });
      }
    } catch (err) {
      console.error('Error fetching theme:', err);
    }
  };

  const handleColorChange = (key, value) => {
    setTheme({ ...theme, [key]: value });
  };

  const handleSaveTheme = async () => {
    setLoading(true);
    try {
      await API.post('/admin/theme', theme);
      setMessage('Theme saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving theme: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTheme = () => {
    setTheme(defaultTheme);
  };

  const presets = [
    {
      name: 'Default Blue',
      colors: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        successColor: '#4caf50',
        errorColor: '#f44336',
        warningColor: '#ff9800',
        infoColor: '#2196f3',
      }
    },
    {
      name: 'Dark Mode',
      colors: {
        primaryColor: '#90caf9',
        secondaryColor: '#f48fb1',
        backgroundColor: '#121212',
        textColor: '#ffffff',
        successColor: '#66bb6a',
        errorColor: '#ef5350',
        warningColor: '#ffa726',
        infoColor: '#29b6f6',
      }
    },
    {
      name: 'Green Nature',
      colors: {
        primaryColor: '#2e7d32',
        secondaryColor: '#00bcd4',
        backgroundColor: '#ffffff',
        textColor: '#1b5e20',
        successColor: '#66bb6a',
        errorColor: '#f44336',
        warningColor: '#ff9800',
        infoColor: '#00bcd4',
      }
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Theme Customization
      </Typography>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Presets */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quick Presets</Typography>
        <Grid container spacing={2}>
          {presets.map((preset) => (
            <Grid item xs={12} md={4} key={preset.name}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 },
                  transition: 'all 0.3s',
                }}
                onClick={() => setTheme(preset.colors)}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{preset.name}</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    {Object.entries(preset.colors).map(([key, color]) => (
                      <Grid item xs={4} key={key}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 40,
                            backgroundColor: color,
                            borderRadius: 1,
                            border: '1px solid #ddd',
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Color Customization */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Custom Colors</Typography>
        <Grid container spacing={3}>
          {[
            { key: 'primaryColor', label: 'Primary Color' },
            { key: 'secondaryColor', label: 'Secondary Color' },
            { key: 'backgroundColor', label: 'Background Color' },
            { key: 'textColor', label: 'Text Color' },
            { key: 'successColor', label: 'Success Color' },
            { key: 'errorColor', label: 'Error Color' },
            { key: 'warningColor', label: 'Warning Color' },
            { key: 'infoColor', label: 'Info Color' },
          ].map(({ key, label }) => (
            <Grid item xs={12} md={6} key={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    backgroundColor: theme[key],
                    borderRadius: 2,
                    border: '2px solid #ddd',
                  }}
                />
                <TextField
                  label={label}
                  value={theme[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  type="color"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& input[type="color"]': {
                      cursor: 'pointer',
                    }
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveTheme}
            disabled={loading}
            size="large"
          >
            {loading ? 'Saving...' : 'Save Theme'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetTheme}
            size="large"
          >
            Reset to Default
          </Button>
        </Box>
      </Paper>

      {/* Preview */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <Typography variant="h6" sx={{ mb: 2, color: theme.primaryColor }}>Theme Preview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Button variant="contained" fullWidth sx={{ backgroundColor: theme.primaryColor }}>
              Primary
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" fullWidth sx={{ backgroundColor: theme.successColor }}>
              Success
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" fullWidth sx={{ backgroundColor: theme.errorColor }}>
              Error
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" fullWidth sx={{ backgroundColor: theme.warningColor }}>
              Warning
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ThemeCustomization;
