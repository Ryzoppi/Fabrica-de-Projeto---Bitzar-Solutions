import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0d9488',
      light: '#14b8a6',
      dark: '#0f766e',
      contrastText: '#f0fdfb',
    },
    secondary: {
      main: '#2dd4bf',
      contrastText: '#0d0d0f',
    },
    background: {
      default: '#0d0d0f',
      paper: '#111114',
    },
    text: {
      primary: '#f1f1f0',
      secondary: '#888888',
      disabled: '#444444',
    },
    divider: '#1e1e22',
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#22c55e',
    },
  },

  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.6875rem',
      color: '#888888',
    },
  },

  shape: {
    borderRadius: 8,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0d0d0f',
          scrollbarColor: '#2a2a2e #111114',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#111114',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2a2a2e',
            borderRadius: '3px',
            '&:hover': {
              background: '#3a3a3e',
            },
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111114',
          border: '0.5px solid #1e1e22',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: '#0d9488',
          color: '#f0fdfb',
          '&:hover': {
            backgroundColor: '#0f766e',
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px !important',
          border: '0.5px solid #2a2a2e !important',
          color: '#888888',
          '&.Mui-selected': {
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            color: '#2dd4bf',
            borderColor: '#0d9488 !important',
            '&:hover': {
              backgroundColor: 'rgba(13, 148, 136, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#0d9488',
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#1e1e22',
        },
      },
    },

    MuiModal: {
      styleOverrides: {
        backdrop: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: '#141416',
          border: '0.5px solid #242428',
          color: '#888888',
          fontSize: '0.75rem',
          '&:hover': {
            backgroundColor: '#1a1a1e',
            borderColor: '#0d9488',
            color: '#f1f1f0',
          },
        },
      },
    },
  },
})

export default theme
