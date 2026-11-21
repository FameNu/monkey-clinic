import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Paper, Typography } from '@mui/material'

export default function ErrorState({
  message = 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <Paper
      variant='outlined'
      sx={{
        py: 5,
        px: 3,
        textAlign: 'center',
        borderColor: 'error.light',
        bgcolor: '#fef2f2',
      }}
    >
      <ErrorOutlineIcon color='error' sx={{ fontSize: 44, mb: 1 }} />
      <Typography
        variant='subtitle1'
        sx={{ fontWeight: 600, color: 'error.main' }}
      >
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant='outlined'
          color='error'
          size='small'
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          ลองใหม่อีกครั้ง
        </Button>
      )}
    </Paper>
  )
}
