'use client'

import { createTheme } from '@mui/material/styles'

const fontStack = [
  'var(--font-noto-sans-thai)',
  'var(--font-open-sans)',
  'var(--font-roboto)',
  'var(--font-inter)',
  'var(--font-lato)',
  'sans-serif',
].join(', ')

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6C8CBF', // Blue
      light: '#8FA8D1',
      dark: '#4F6D9E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E2D36B', // Yellow
      light: '#EBE08E',
      dark: '#C4B347',
      contrastText: '#1E293B',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: fontStack,
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FAFAFA',
          color: '#1E293B',
          fontFamily: fontStack,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
  },
})
