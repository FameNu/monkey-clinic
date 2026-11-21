'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#0284c7', // Medical Blue
    },
    secondary: {
      main: '#0d9488', // Teal
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), "Noto Sans Thai", sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})
