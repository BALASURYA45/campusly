import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode
          primary: {
            main: '#0062ff',
            light: '#3381ff',
            dark: '#0044b2',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7c4dff',
            light: '#9670ff',
            dark: '#5635b2',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f4f7fe',
            paper: '#ffffff',
          },
          text: {
            primary: '#1b2559',
            secondary: '#a3aed0',
          },
          success: {
            main: '#01b574',
            light: '#33c38f',
            dark: '#007e51',
          },
          warning: {
            main: '#ffb547',
          },
          error: {
            main: '#ee5d50',
          },
          divider: 'rgba(0, 0, 0, 0.08)',
        }
      : {
          // Dark Mode
          primary: {
            main: '#7551ff',
            light: '#9073ff',
            dark: '#5238b2',
          },
          secondary: {
            main: '#39b1ff',
          },
          background: {
            default: '#0b1437',
            paper: '#111c44',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a3aed0',
          },
          success: {
            main: '#05cd99',
          },
          divider: 'rgba(255, 255, 255, 0.1)',
        }),
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.875rem', fontWeight: 700 },
    h4: { fontSize: '1.5rem', fontWeight: 700 },
    h5: { fontSize: '1.25rem', fontWeight: 700 },
    h6: { fontSize: '1rem', fontWeight: 700 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.57 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.05)',
    '0px 8px 16px rgba(0,0,0,0.05)',
    '0px 12px 24px rgba(0,0,0,0.05)',
    '0px 16px 32px rgba(0,0,0,0.05)',
    ...Array(19).fill('0px 20px 40px rgba(0,0,0,0.05)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0062ff 0%, #3381ff 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: mode === 'light' ? '#f4f7fe' : '#111c44',
          color: '#a3aed0',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
  },
});

export const theme = (mode) => createTheme(getDesignTokens(mode));
