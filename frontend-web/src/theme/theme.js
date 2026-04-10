import { createTheme } from '@mui/material/styles';
import { getMuiTypography } from '../utils/typography';

const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#f05545',
    dark: '#9a0036',
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',
    light: '#ef5350',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
  },
};

const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#bbdefb',
    dark: '#42a5f5',
  },
  secondary: {
    main: '#f48fb1',
    light: '#f8bbd0',
    dark: '#ec407a',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#43a047',
  },
  error: {
    main: '#ef5350',
    light: '#e57373',
    dark: '#e53935',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#ff7043',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
  },
};

export const getTheme = (mode = 'light') => {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: getMuiTypography(),
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
          contained: {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
          outlined: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            },
          },
        },
        defaultProps: {
          disableElevation: false,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 8px 24px rgba(0,0,0,0.12)'
                : '0 8px 24px rgba(0,0,0,0.4)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${palette.primary.main}22`,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '16px',
            boxShadow: mode === 'light'
              ? '0 8px 32px rgba(0,0,0,0.1)'
              : '0 8px 32px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            fontWeight: 600,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 2px 8px rgba(0,0,0,0.08)'
              : '0 2px 8px rgba(0,0,0,0.3)',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'collapse',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#e0e0e0' : '#424242',
            padding: '16px',
          },
          head: {
            fontWeight: 700,
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#2a2a2a',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(25, 118, 210, 0.05)'
                : 'rgba(144, 202, 249, 0.05)',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontSize: '0.95rem',
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            bottom: '24px',
            right: '24px',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            height: '4px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: mode === 'light'
                ? 'rgba(25, 118, 210, 0.08)'
                : 'rgba(144, 202, 249, 0.08)',
            },
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 2px 4px rgba(0,0,0,0.08)',
      '0 4px 8px rgba(0,0,0,0.1)',
      '0 8px 16px rgba(0,0,0,0.12)',
      '0 12px 24px rgba(0,0,0,0.15)',
      '0 16px 32px rgba(0,0,0,0.18)',
      ...Array(19).fill('0 20px 40px rgba(0,0,0,0.2)'),
    ],
  });
};

export default {
  light: getTheme('light'),
  dark: getTheme('dark'),
};
