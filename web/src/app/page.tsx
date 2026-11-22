'use client'

import Link from 'next/link'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Paper,
  Divider,
} from '@mui/material'
import {
  MedicalServices,
  AccessibilityNew,
  Spa,
  HealthAndSafety as HealthAndSafetyIcon,
  CheckCircleOutlined as CheckCircleOutline,
  AccessTime,
  PhoneInTalk,
  LocationOn,
  LocalHospital as LocalHospitalIcon,
  Star,
} from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'

const SERVICES = [
  {
    title: 'คลินิกโรคผิวหนัง',
    subtitle: 'Dermatology',
    description:
      'ตรวจวินิจฉัยและรักษาโรคผิวหนังทุกชนิด ผื่นแพ้สัมผัส ลมพิษ สิวเรื้อรัง เชื้อรา และให้คำปรึกษาการดูแลผิวอย่างถูกวิธี',
    icon: <Spa sx={{ fontSize: 36 }} />,
    tag: 'ยอดนิยม',
  },
  {
    title: 'คลินิกกระดูกและข้อ',
    subtitle: 'Orthopedics',
    description:
      'ดูแลปัญหาปวดข้อ ข้อเข่าเสื่อม หมอนรองกระดูกทับเส้นประสาท นิ้วล็อก และการบาดเจ็บของกระดูกและเส้นเอ็น',
    icon: <MedicalServices sx={{ fontSize: 36 }} />,
    tag: 'เฉพาะทาง',
  },
  {
    title: 'คลินิกกล้ามเนื้อและกายภาพ',
    subtitle: 'Physical Medicine & Rehab',
    description:
      'ฟื้นฟูอาการออฟฟิศซินโดรม ปวดตึงคอ บ่า ไหล่ หลังเรื้อรัง และกล้ามเนื้ออักเสบจากการทำงานหรือเล่นกีฬา',
    icon: <AccessibilityNew sx={{ fontSize: 36 }} />,
    tag: 'เฉพาะทาง',
  },
  {
    title: 'คลินิกตรวจโรคทั่วไป',
    subtitle: 'General Practice',
    description:
      'ตรวจรักษาอาการเจ็บป่วยทั่วไป ไข้หวัด ปวดศีรษะ ระบบทางเดินอาหาร และติดตามโรคประจำตัวเบื้องต้นอย่างใกล้ชิด',
    icon: <HealthAndSafetyIcon sx={{ fontSize: 36 }} />,
    tag: 'Walk-in / นัดหมาย',
  },
]

const STATS = [
  { value: '12,480+', label: 'ผู้เข้ารับการรักษาทั้งหมด' },
  { value: '98.5%', label: 'ความพึงพอใจของผู้ป่วย' },
  { value: '4 สาขา', label: 'คลินิกเฉพาะทางครบวงจร' },
  { value: '< 15 นาที', label: 'ระยะเวลารอพบแพทย์เฉลี่ย' },
]

const DOCTORS = [
  {
    name: 'พญ. ณัฐธิดา วงศ์สุวรรณ',
    specialty: 'แพทย์เฉพาะทางตจวิทยา (โรคผิวหนัง)',
    license: 'ว.00001',
    fee: '600 บาท',
    schedule: 'จันทร์, พุธ, ศุกร์ (10:00 - 18:00)',
    image: '/images/doctors/doc-01.jpeg',
  },
  {
    name: 'นพ. ธีรภัทร อัศวเมธี',
    specialty: 'แพทย์เฉพาะทางศัลยศาสตร์กระดูกและข้อ',
    license: 'ว.00002',
    fee: '700 บาท',
    schedule: 'อังคาร, พฤหัสบดี, เสาร์ (09:00 - 17:00)',
    image: '/images/doctors/doc-02.jpeg',
  },
  {
    name: 'นพ. ปริญญา รัตนโชติ',
    specialty: 'แพทย์เฉพาะทางเวชศาสตร์ฟื้นฟูและกล้ามเนื้อ',
    license: 'ว.00003',
    fee: '600 บาท',
    schedule: 'พุธ, เสาร์, อาทิตย์ (10:00 - 19:00)',
    image: '/images/doctors/doc-03.jpeg',
  },
  {
    name: 'พญ. กมลชนก เจริญสุข',
    specialty: 'แพทย์เวชปฏิบัติทั่วไป',
    license: 'ว.00004',
    fee: '400 บาท',
    schedule: 'ทุกวัน (09:00 - 20:00)',
    image: '/images/doctors/doc-04.jpeg',
  },
]

const whyChooseUs = [
  'ทีมแพทย์เฉพาะทางประจำ 4 สาขาหลัก ตรวจละเอียดไม่เร่งรีบ',
  'ระบบเวชระเบียนดิจิทัล ตรวจสอบประวัติแพ้ยาอัตโนมัติ 100%',
  'แจ้งค่าตรวจและค่ายาชัดเจนโปร่งใส ก่อนชำระเงินทุกครั้ง',
  'นัดหมายล่วงหน้าได้ ลดเวลารอคอยหน้าคลินิก',
]

const ThreeSimpleSteps = [
  {
    step: '01',
    title: 'ติดต่อจองคิวหรือ Walk-in',
    desc: 'เลือกแพทย์เฉพาะทางและช่วงเวลาที่สะดวกผ่านโทรศัพท์หรือหน้าเคาน์เตอร์คลินิก',
  },
  {
    step: '02',
    title: 'คัดกรองและบันทึกประวัติแพ้ยา',
    desc: 'เจ้าหน้าที่ซักประวัติเบื้องต้น วัดสัญญาณชีพ และบันทึกข้อมูลแพ้ยาลงระบบอย่างปลอดภัย',
  },
  {
    step: '03',
    title: 'พบแพทย์เฉพาะทางและรับยา',
    desc: 'ตรวจวินิจฉัยละเอียด พร้อมระบบตรวจสอบยาซ้ำซ้อนและรับคำแนะนำการดูแลตัวเอง',
  },
]

export default function MonkeyClinicLandingPage() {
  const { palette } = useTheme()
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: palette.background.default,
        color: palette.text.primary,
      }}
    >
      {/* Navbar */}
      <AppBar
        position='sticky'
        elevation={0}
        sx={{
          bgcolor: alpha(palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${palette.divider}`,
          color: palette.text.primary,
        }}
      >
        <Container maxWidth='lg'>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Stack direction='row' sx={{ spacing: 1.5, alignItems: 'center' }}>
              <LocalHospitalIcon
                color='primary'
                fontSize='large'
                sx={{ mr: 0.75 }}
              />
              <Box>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: palette.primary.main,
                  }}
                >
                  MONKEY CLINIC
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  คลินิกเวชกรรมเฉพาะทาง
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction='row'
              spacing={3}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Button href='#services' color='inherit' sx={{ fontWeight: 600 }}>
                บริการรักษา
              </Button>
              <Button href='#doctors' color='inherit' sx={{ fontWeight: 600 }}>
                ทีมแพทย์
              </Button>
              <Button href='#steps' color='inherit' sx={{ fontWeight: 600 }}>
                ขั้นตอนรับบริการ
              </Button>
              <Button href='#contact' color='inherit' sx={{ fontWeight: 600 }}>
                ติดต่อคลินิก
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${palette.primary.light} 0%, ${palette.primary.main} 65%, ${palette.primary.dark} 100%)`,
          color: palette.primary.contrastText,
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth='lg'>
          <Grid container sx={{ spacing: 4, alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Chip
                label='เปิดให้บริการทุกวัน 09:00 - 20:00 น.'
                sx={{
                  bgcolor: palette.secondary.main,
                  color: palette.secondary.contrastText,
                  fontWeight: 700,
                  mb: 2.5,
                  px: 1,
                }}
              />
              <Typography
                variant='h2'
                sx={{
                  fontSize: { xs: '2.2rem', md: '3.25rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 2,
                }}
              >
                ดูแลครบ จบทุกอาการ... <br />
                เรื่องสุขภาพให้{' '}
                <Box component='span' sx={{ color: palette.secondary.light }}>
                  Monkey Clinic
                </Box>{' '}
                ดูแลคุณ
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color: alpha(palette.primary.contrastText, 0.86),
                  fontWeight: 400,
                  mb: 4,
                  lineHeight: 1.6,
                  maxWidth: 600,
                }}
              >
                คลินิกเวชกรรมเฉพาะทางด้านผิวหนัง กระดูกและข้อ
                เวชศาสตร์ฟื้นฟูกล้ามเนื้อ และตรวจโรคทั่วไป
                ใส่ใจทุกการรักษาด้วยมาตรฐานทางการแพทย์ที่ทันสมัยและเป็นกันเอง
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  href='#doctors'
                  variant='contained'
                  size='large'
                  sx={{
                    bgcolor: palette.secondary.main,
                    color: palette.secondary.contrastText,
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2.5,
                    '&:hover': { bgcolor: palette.secondary.dark },
                  }}
                >
                  ดูตารางแพทย์และค่าตรวจ
                </Button>
                <Button
                  href='#services'
                  variant='outlined'
                  size='large'
                  sx={{
                    borderColor: palette.secondary.light,
                    color: palette.primary.contrastText,
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2.5,
                    '&:hover': {
                      borderColor: palette.primary.contrastText,
                      bgcolor: alpha(palette.primary.contrastText, 0.08),
                    },
                  }}
                >
                  บริการตรวจรักษาของเรา
                </Button>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  bgcolor: alpha(palette.background.paper, 0.98),
                  color: palette.text.primary,
                }}
              >
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 700, color: palette.primary.main }}
                  gutterBottom
                >
                  ทำไมต้องเลือก Monkey Clinic?
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {whyChooseUs.map((item, idx) => (
                    <Stack
                      key={idx}
                      direction='row'
                      sx={{ spacing: 1.5, gap: 0.5, alignItems: 'center' }}
                    >
                      <CheckCircleOutline
                        sx={{ color: palette.primary.main }}
                      />
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mock Patient Stats Banner */}
      <Container maxWidth='lg' sx={{ mt: -6, position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: palette.background.paper,
            borderTop: `4px solid ${palette.secondary.main}`,
          }}
        >
          <Grid container sx={{ spacing: 3, textAlign: 'center' }}>
            {STATS.map((stat, index) => (
              <Grid key={index} size={{ xs: 6, md: 3 }}>
                <Typography
                  variant='h4'
                  sx={{ fontWeight: 800, color: palette.primary.main }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.5, fontWeight: 600 }}
                >
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Services Section */}
      <Box id='services' sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label='OUR SPECIALTIES'
              size='small'
              sx={{
                bgcolor: alpha(palette.primary.main, 0.12),
                color: palette.primary.dark,
                fontWeight: 700,
                mb: 1,
              }}
            />
            <Typography variant='h3' sx={{ fontWeight: 800 }} gutterBottom>
              คลินิกของเราตรวจรักษาอะไรบ้าง?
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                maxWidth: 650,
                mx: 'auto',
              }}
            >
              ครอบคลุมการดูแลรักษาโรคเฉพาะทางที่พบบ่อยในชีวิตประจำวันและการทำงาน
              พร้อมจ่ายยาคุณภาพตรงตามอาการ
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {SERVICES.map((service, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: `1px solid ${palette.divider}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 12px 24px ${alpha(palette.primary.main, 0.16)}`,
                      borderColor: palette.primary.main,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction='row'
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: alpha(palette.primary.main, 0.08),
                          display: 'inline-flex',
                        }}
                      >
                        <Box sx={{ color: palette.primary.main }}>
                          {service.icon}
                        </Box>
                      </Box>
                      <Chip
                        label={service.tag}
                        size='small'
                        sx={{
                          bgcolor: palette.secondary.light,
                          color: palette.secondary.contrastText,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 700 }}
                      gutterBottom
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        color: palette.primary.main,
                        fontWeight: 600,
                        mb: 1.5,
                      }}
                    >
                      {service.subtitle}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ lineHeight: 1.6 }}
                    >
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Doctors Section */}
      <Box
        id='doctors'
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: alpha(palette.primary.light, 0.16),
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label='MEET OUR DOCTORS'
              size='small'
              sx={{
                bgcolor: palette.secondary.main,
                color: palette.secondary.contrastText,
                fontWeight: 700,
                mb: 1,
              }}
            />
            <Typography variant='h3' sx={{ fontWeight: 800 }} gutterBottom>
              ทีมแพทย์ผู้เชี่ยวชาญประจำคลินิก
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                maxWidth: 650,
                mx: 'auto',
              }}
            >
              พร้อมให้คำปรึกษาและวางแผนการรักษาอย่างใกล้ชิด เป็นกันเอง
              และเข้าใจผู้ป่วย
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {DOCTORS.map((doc, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: `1px solid ${alpha(palette.primary.main, 0.22)}`,
                    bgcolor: palette.background.paper,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ bgcolor: palette.background.paper, pt: 2, px: 2 }}>
                    <CardMedia
                      component='img'
                      image={doc.image}
                      alt={doc.name}
                      sx={{
                        height: 250,
                        objectFit: 'contain',
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Stack
                      direction='row'
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={`ใบอนุญาต ${doc.license}`}
                        size='small'
                        variant='outlined'
                        sx={{
                          fontSize: '0.72rem',
                          borderColor: palette.divider,
                        }}
                      />
                      <Stack
                        direction='row'
                        sx={{ alignItems: 'center', spacing: 0.3 }}
                      >
                        <Star
                          sx={{ fontSize: 16, color: palette.secondary.main }}
                        />
                        <Typography variant='caption' sx={{ fontWeight: 700 }}>
                          4.9
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 700 }}
                      gutterBottom
                    >
                      {doc.name}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: palette.primary.main,
                      }}
                    >
                      {doc.specialty}
                    </Typography>

                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 2,
                        borderTop: `1px dashed ${palette.divider}`,
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                      >
                        <strong>เวลาออกตรวจ:</strong> {doc.schedule}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        <strong>ค่าตรวจเบื้องต้น:</strong> {doc.fee}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3 Simple Steps */}
      <Box
        id='steps'
        sx={{ py: { xs: 8, md: 10 }, bgcolor: palette.background.paper }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant='h4'
            sx={{ fontWeight: 800, textAlign: 'center', mb: 6 }}
          >
            ขั้นตอนการเข้ารับบริการง่ายๆ ใน 3 ขั้นตอน
          </Typography>
          <Grid container spacing={4}>
            {ThreeSimpleSteps.map((item, idx) => (
              <Grid key={idx} size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: alpha(palette.primary.main, 0.045),
                    height: '100%',
                  }}
                >
                  <Typography
                    variant='h3'
                    gutterBottom
                    sx={{ fontWeight: 900, color: palette.secondary.dark }}
                  >
                    {item.step}
                  </Typography>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 700 }}
                    gutterBottom
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ lineHeight: 1.6 }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact & Footer */}
      <Box
        id='contact'
        sx={{
          bgcolor: palette.text.primary,
          color: palette.background.paper,
          py: 8,
        }}
      >
        <Container maxWidth='lg'>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack
                direction='row'
                sx={{ alignItems: 'center' }}
              >
                <LocalHospitalIcon
                  color='primary'
                  fontSize='large'
                  sx={{ mr: 0.75 }}
                />
                <Typography variant='h5' sx={{ fontWeight: 800 }}>
                  MONKEY CLINIC
                </Typography>
              </Stack>
              <Typography
                variant='body2'
                sx={{
                  lineHeight: 1.7,
                  mb: 3,
                  color: alpha(palette.background.paper, 0.72),
                }}
              >
                คลินิกเวชกรรมเฉพาะทางด้านผิวหนัง กระดูกและข้อ เวชศาสตร์ฟื้นฟู
                และตรวจโรคทั่วไป ดูแลคุณด้วยมาตรฐานทางการแพทย์ที่อบอุ่นและใส่ใจ
              </Typography>
              <Button
                component={Link}
                href='/login'
                variant='contained'
                sx={{
                  bgcolor: palette.primary.main,
                  '&:hover': { bgcolor: palette.primary.dark },
                  fontWeight: 600,
                }}
              >
                เข้าสู่ระบบจัดการคลินิก (Staff Login)
              </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, mb: 2, color: palette.secondary.main }}
              >
                ติดต่อและนัดหมาย
              </Typography>
              <Stack sx={{ gap: 0.5 }}>
                <Stack direction='row' sx={{ gap: 1, alignItems: 'center' }}>
                  <PhoneInTalk
                    sx={{ color: palette.primary.light, fontSize: 20 }}
                  />
                  <Typography variant='body2'>
                    02-123-4567 / 089-999-8888
                  </Typography>
                </Stack>
                <Stack direction='row' sx={{ gap: 1, alignItems: 'center' }}>
                  <AccessTime
                    sx={{ color: palette.primary.light, fontSize: 20 }}
                  />
                  <Typography variant='body2'>
                    เปิดทุกวัน 09:00 – 20:00 น.
                  </Typography>
                </Stack>
                <Stack
                  direction='row'
                  sx={{ gap: 1, alignItems: 'flex-start' }}
                >
                  <LocationOn
                    sx={{ color: palette.primary.light, fontSize: 20 }}
                  />
                  <Typography
                    variant='body2'
                    sx={{ color: alpha(palette.background.paper, 0.82) }}
                  >
                    99/9 ถนนพระราม 24 แขวงบางมด เขตทุ่งครุ กรุงเทพมหานคร 10410
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, mb: 2, color: palette.secondary.main }}
              >
                คลินิกเฉพาะทาง
              </Typography>
              <Stack
                spacing={1}
                sx={{ color: alpha(palette.background.paper, 0.82) }}
              >
                <Typography variant='body2'>
                  • คลินิกโรคผิวหนัง (Dermatology)
                </Typography>
                <Typography variant='body2'>
                  • คลินิกกระดูกและข้อ (Orthopedics)
                </Typography>
                <Typography variant='body2'>
                  • คลินิกกล้ามเนื้อและกายภาพบำบัด
                </Typography>
                <Typography variant='body2'>• คลินิกตรวจโรคทั่วไป</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider
            sx={{ my: 4, borderColor: alpha(palette.background.paper, 0.18) }}
          />
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              textAlign: 'center',
              color: alpha(palette.background.paper, 0.62),
            }}
          >
            © 2026 Monkey Clinic. All rights reserved. | Clinic Management
            System Portfolio
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
