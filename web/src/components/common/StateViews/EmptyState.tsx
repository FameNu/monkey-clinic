import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import { Paper, Typography } from "@mui/material"

export default function EmptyState({
  title = 'ไม่พบข้อมูล',
  description = 'ยังไม่มีรายการข้อมูลในส่วนนี้',
  action,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <Paper
      variant='outlined'
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderStyle: 'dashed',
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
      <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mb: action ? 2 : 0 }}
      >
        {description}
      </Typography>
      {action}
    </Paper>
  )
}
