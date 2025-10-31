// ** React Imports
import { useState, SyntheticEvent, Fragment, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'

// ** Type Imports
import { Settings } from 'src/@core/context/settingsContext'
import { UserDataType } from 'src/context/types'
import { Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'

interface Props {
  settings: Settings
}

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = (props: Props) => {
  // ** Props
  const { settings } = props

  // ** States
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const [user, setUser] = useState<UserDataType | null>()
  const [openFaq, setOpenFAQ] = useState(false);
  const [openSuport, setOpenSuport] = useState(false);
  const store = useSelector((state: RootState) => state.clinic);

  // ** Hooks
  const router = useRouter()
  const { logout } = useAuth()

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = (url?: string) => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.375rem',
      color: 'text.primary'
    }
  }

  const handleLogout = () => {
    console.log
    logout()
    handleDropdownClose()
  }

  useEffect(() => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    setUser(userData)
  }, [])

  return (
    <Fragment>


      <Dialog
        open={openFaq}
        onClose={() => setOpenFAQ(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <DialogContentText variant='body2' id='item-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
            <h3>Email</h3>
            <span>atendimento@clairis.com.br</span>
          </DialogContentText>
          <DialogContentText variant='body2' id='item-view-edit-description' sx={{ textAlign: 'center', mb: 7 }}>
            <h3>Telefone</h3>
            <span>11 9 9880-8944</span>
          </DialogContentText>

          <DialogActions>
            <Button variant='contained' type='submit' sx={{ mr: 2 }} onClick={() => setOpenFAQ(false)} color='secondary'>OK</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openSuport}
        onClose={() => setOpenSuport(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(8)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`]
          }}
        >
          <Link href="https://wa.me/5511998808944" style={{textDecoration: 'none'}}>
            <Card sx={{ display: 'flex', marginBottom: 10 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingLeft: 5, paddingRight: 10 }}>
                <Icon icon='mdi:whatsapp' fontSize={35} />
                <CardContent sx={{ flex: '1 0 auto', width: 400 }}>
                  <h3>Via WhatsApp</h3>
                  <span>
                    Use esta opção para que o vendedor entre em contato através de seu WhatsApp
                  </span>
                </CardContent>
              </Box>
            </Card>
          </Link>
          <Card sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingLeft: 5, paddingRight: 10 }}>
              <Icon icon='mdi:phone' fontSize={35} />
              <CardContent sx={{ flex: '1 0 auto', width: 400 }}>
                <h3>Telefone - (11) 9.9880-8944</h3>
                <span style={{width: 10}}>
                  Use esta opção para que o vendedor entre em contato através do telefone
                </span>
              </CardContent>
            </Box>

          </Card>

          <DialogActions>
            <Button variant='contained' type='submit' sx={{ mr: 2 }} onClick={() => setOpenSuport(false)} color='secondary'>OK</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <Avatar
          alt='John Doe'
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src={store.clinic.profilePic}
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <Avatar alt='John Doe' src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
            </Badge>
            <Box sx={{ display: 'flex', ml: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 600 }}> {user?.fullName} </Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: '0 !important' }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/pages/account-settings/account')}>
          <Box sx={styles}>
            <Icon icon='mdi:account-outline' />
            Perfil
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => setOpenSuport(true)}>
          <Box sx={styles}>
            <Icon icon='mdi:email-outline' />
            Suporte
          </Box>
        </MenuItem>
        {/* <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/apps/chat')}>
          <Box sx={styles}>
            <Icon icon='mdi:message-outline' />
            Chat
          </Box>
        </MenuItem> */}
        <Divider />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/pages/account-settings/account')}>
          <Box sx={styles}>
            <Icon icon='mdi:cog-outline' />
            Configurações
          </Box>
        </MenuItem>
        {/* <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose('/pages/pricing')}>
          <Box sx={styles}>
            <Icon icon='mdi:currency-usd' />
            Pricing
          </Box>
        </MenuItem> */}
        <MenuItem sx={{ p: 0 }} onClick={() => setOpenFAQ(true)}>
          <Box sx={styles}>
            <Icon icon='mdi:help-circle-outline' />
            FAQ
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 2, '& svg': { mr: 2, fontSize: '1.375rem', color: 'text.primary' } }}
        >
          <Icon icon='mdi:logout-variant' />
          Sair
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
