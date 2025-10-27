/**
 * Material-UI Theme Configuration
 * Provides light and dark mode themes with custom styling
 */

import { createTheme } from '@mui/material/styles';

// Color palette
const colors = {
  primary: {
    light: '#667eea',
    main: '#5a67d8',
    dark: '#4c51bf',
    contrastText: '#ffffff',
  },
  secondary: {
    light: '#ed64a6',
    main: '#d53f8c',
    dark: '#b83280',
    contrastText: '#ffffff',
  },
  success: {
    light: '#48bb78',
    main: '#38a169',
    dark: '#2f855a',
  },
  error: {
    light: '#fc8181',
    main: '#f56565',
    dark: '#e53e3e',
  },
  warning: {
    light: '#f6ad55',
    main: '#ed8936',
    dark: '#dd6b20',
  },
  info: {
    light: '#63b3ed',
    main: '#4299e1',
    dark: '#3182ce',
  },
};

// Common theme options
const commonTheme = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    ...colors,
    background: {
      default: '#f7fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2d3748',
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    ...colors,
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
  },
  components: {
    ...commonTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#f1f5f9',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          ...commonTheme.components.MuiCard.styleOverrides.root,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

export default { lightTheme, darkTheme };
