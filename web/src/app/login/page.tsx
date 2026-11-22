'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/store/useAuthStore'

import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { Alert, Box, Button, Card, CardContent, Container, FormControl, FormLabel, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const clearLoginError = useAuthStore((state) => state.clearLoginError)
  const loading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.loginError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch {
      // The auth store exposes the login error for this page to render.
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth='xs'>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LocalHospitalIcon color='primary' sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Monkey Clinic System
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                ระบบจัดการคลินิกและนัดหมายผู้ป่วย
              </Typography>
            </Box>

            {error && (
              <Alert severity='error' sx={{ mb: 2.5 }}>
                {error}
              </Alert>
            )}

            <Box
              component='form'
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl fullWidth>
                <FormLabel required>อีเมล (Email)</FormLabel>
                <TextField
                  type='email'
                  value={email}
                  onChange={(e) => {
                    clearLoginError()
                    setEmail(e.target.value)
                  }}
                  required
                  fullWidth
                  autoFocus
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel required>รหัสผ่าน (Password)</FormLabel>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    clearLoginError()
                    setPassword(e.target.value)
                  }}
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge='end'
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <Button
                type='submit'
                variant='contained'
                size='large'
                disabled={loading}
                fullWidth
                sx={{ mt: 1, py: 1.3 }}
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
