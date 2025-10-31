// React Imports
import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

// MUI Import
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Switch from '@mui/material/Switch'
import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'

// Third Party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { ProfileUserType, setUserStatus, StatusType } from 'src/store/apps/chat-v2'
import { AppDispatch } from 'src/store'
import AvatarWithBadge from './AvatarWithBadge'
import { statusObj } from './SidebarLeft'

// Type Imports


// Slice Imports

// Component Imports



type Props = {
  userSidebar: boolean
  setUserSidebar: (open: boolean) => void
  profileUserData: ProfileUserType
  dispatch: AppDispatch
  isBelowLgScreen: boolean
  isBelowSmScreen: boolean
}

const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return (
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {children}
      </div>
    )
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
  }
}

const UserProfileLeft = (props: Props) => {
  // Props
  const { userSidebar, setUserSidebar, profileUserData, dispatch, isBelowLgScreen, isBelowSmScreen } = props

  // States
  const [twoStepVerification, setTwoStepVerification] = useState<boolean>(true)
  const [notification, setNotification] = useState<boolean>(false)

  const handleTwoStepVerification = () => {
    setTwoStepVerification(!twoStepVerification)
  }

  const handleNotification = () => {
    setNotification(!notification)
  }

  const handleUserStatus = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserStatus({ status: e.target.value as StatusType }))
  }

  return profileUserData ? (
   <>
  <Drawer
    open={userSidebar}
    anchor='left'
    variant='persistent'
    ModalProps={{ keepMounted: true }}
    onClose={() => setUserSidebar(false)}
    sx={{
      zIndex: 13,
      '& .MuiDrawer-paper': {
        width: isBelowSmScreen ? '100%' : '370px',
        position: 'absolute',
        border: 0
      }
    }}
  >
    <IconButton
      onClick={() => setUserSidebar(false)}
      style={{
        position: 'absolute',
        top: '1rem', // block-start-4
        right: '1rem' // inline-end-4
      }}
    >
      <i className='ri-close-line' />
    </IconButton>

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBlockStart: '1.5rem', // mbs-6
        paddingInline: '1.25rem',   // pli-5
        paddingBlockStart: '1.25rem', // pbs-5
        paddingBlockEnd: '0.25rem',   // pbe-1
    
      }}
    >
      <AvatarWithBadge
        alt={profileUserData.fullName}
        src={profileUserData.profilePicUrl}
        badgeColor={statusObj[profileUserData.status]}
        badgeSize={12}
      />
      <div style={{ textAlign: 'center' }}>
        <Typography variant='h5'>{profileUserData.fullName}</Typography>
        <Typography>{profileUserData.role}</Typography>
      </div>
    </div>

    <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '1.25rem'
        }}
      >
        {/* About */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Typography style={{ textTransform: 'uppercase' }} color='text.disabled'>
            About
          </Typography>
          <TextField fullWidth rows={3} multiline id='about-textarea' defaultValue={profileUserData.about} />
        </div>

        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <FormLabel
            id='status-radio-buttons-group-label'
            style={{ textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)' }}
          >
            Status
          </FormLabel>
          <RadioGroup
            value={profileUserData.status}
            name='radio-buttons-group'
            onChange={handleUserStatus}
            aria-labelledby='status-radio-buttons-group-label'
          >
            <FormControlLabel value='online' control={<Radio color='success' />} label='Online' />
            <FormControlLabel value='away' control={<Radio color='warning' />} label='Away' />
            <FormControlLabel value='busy' control={<Radio color='error' />} label='Do not disturb' />
            <FormControlLabel value='offline' control={<Radio color='secondary' />} label='Offline' />
          </RadioGroup>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Typography style={{ textTransform: 'uppercase' }} color='text.disabled'>
            Settings
          </Typography>
          <List>
            <ListItem
              disablePadding
              secondaryAction={<Switch checked={twoStepVerification} onChange={handleTwoStepVerification} />}
            >
              <ListItemButton onClick={handleTwoStepVerification} style={{ padding: '0.5rem' }}>
                <ListItemIcon>
                  <i className='ri-lock-password-line' />
                </ListItemIcon>
                <ListItemText primary='Two-step Verification' />
              </ListItemButton>
            </ListItem>

            <ListItem
              disablePadding
              secondaryAction={<Switch checked={notification} onChange={handleNotification} />}
            >
              <ListItemButton onClick={handleNotification} style={{ padding: '0.5rem' }}>
                <ListItemIcon>
                  OI
                </ListItemIcon>
                <ListItemText primary='Notification' />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton style={{ padding: '0.5rem' }}>
                <ListItemIcon>
                  OI
                </ListItemIcon>
                <ListItemText primary='Invite Friends' />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton style={{ padding: '0.5rem' }}>
                <ListItemIcon>
                  OI
                </ListItemIcon>
                <ListItemText primary='Delete Account' />
              </ListItemButton>
            </ListItem>
          </List>
        </div>

        {/* Logout Button */}
        <Button
          variant='contained'
          fullWidth
          endIcon={<i className='ri-logout-box-r-line' />}
          style={{ marginBlockStart: 'auto' }} // mbs-auto
        >
          Logout
        </Button>
      </div>
    </ScrollWrapper>
  </Drawer>

  <Backdrop
    open={userSidebar}
    onClick={() => setUserSidebar(false)}
    style={{
      position: 'absolute',
      zIndex: 12
    }}
  />
</>
  ) : null
}

export default UserProfileLeft
