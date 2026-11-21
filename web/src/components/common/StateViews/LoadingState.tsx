import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingState({
  message = 'กำลังโหลดข้อมูล...',
}: {
  message?: string
}) {
  return (
    <Box
      sx={{
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={36} />
      <Typography variant='body2' color='text.secondary'>
        {message}
      </Typography>
    </Box>
  )
}
