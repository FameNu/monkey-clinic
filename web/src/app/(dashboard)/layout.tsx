'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReactNode, Suspense, useState, useSyncExternalStore } from 'react'

import { useAuthStore } from '@/store/useAuthStore'
import { UserRole } from '@/types'

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  roles: UserRole[]
}

const DRAWER_WIDTH = 250

const NAV_ITEMS: NavItem[] = [
  {
    label: 'ภาพรวมคลินิก (Dashboard)',
    href: '/dashboard',
    icon: <DashboardOutlinedIcon />,
    roles: ['admin', 'receptionist', 'doctor'],
  },
  {
    label: 'คิวตรวจและนัดหมาย',
    href: '/appointments',
    icon: <EventNoteOutlinedIcon />,
    roles: ['admin', 'receptionist', 'doctor'],
  },
  {
    label: 'ทะเบียนคนไข้ (CRM)',
    href: '/patients',
    icon: <PeopleAltOutlinedIcon />,
    roles: ['admin', 'receptionist', 'doctor'],
  },
  {
    label: 'คลังยาและเวชภัณฑ์',
    href: '/medications',
    icon: <MedicationOutlinedIcon />,
    roles: ['admin', 'receptionist', 'doctor'],
  },
  {
    label: 'การเงินและใบเสร็จ',
    href: '/invoices',
    icon: <ReceiptLongOutlinedIcon />,
    roles: ['admin', 'receptionist'],
  },
  {
    label: 'จัดการแพทย์',
    href: '/doctors',
    icon: <LocalHospitalIcon />,
    roles: ['admin', 'receptionist', 'doctor'],
  },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const [mobileOpen, setMobileOpen] = useState(false)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!user || !isAuthenticated || !hydrated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    )
  }
  const allowedMenus = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role),
  )

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ gap: 1.5, px: 2.5 }}>
        <LocalHospitalIcon color='primary' fontSize='large' />
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            ClinicCare
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Internal Management
          </Typography>
        </Box>
      </Toolbar>
      <Divider />

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {allowedMenus.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={active}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: 'error.main' }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'error.main' }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary='ออกจากระบบ'
            sx={{ fontSize: 14, fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position='fixed'
        color='inherit'
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            edge='start'
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={user.role.toUpperCase()}
              size='small'
              color='primary'
              variant='outlined'
              sx={{ fontWeight: 700 }}
            />
            <Typography
              variant='body2'
              sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}
            >
              {user.prefix}
              {user.full_name}
            </Typography>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: 14,
              }}
            >
              {user.full_name.charAt(0)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile menu */}
      <Drawer
        variant='permanent'
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop menu */}
      <Drawer
        variant='permanent'
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
