'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/axios'

import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { Alert, Box, Button, Card, CardContent, Container, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await apiClient.post('/auth/login', { email, password })
      const { token, user } = res.data.data
      setAuth(token, user)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
      setError(message)
    } finally {
      setLoading(false)
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
                ClinicCare System
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
              <TextField
                label='อีเมล (Email)'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label='รหัสผ่าน (Password)'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
