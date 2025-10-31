// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports


// Component Imports

import AvatarWithBadge from './AvatarWithBadge'
import { ContactType } from 'src/store/apps/chat-v2'
import { statusObj } from './SidebarLeft'

type Props = {
  open: boolean
  handleClose: () => void
  activeUser: ContactType
  isBelowLgScreen: boolean
  isBelowSmScreen: boolean
}

const ScrollWrapper = ({
  children,
  isBelowLgScreen,
  className,
  style,
}: {
  children: ReactNode
  isBelowLgScreen: boolean
  className?: string
  style: any
}) => {
  if (isBelowLgScreen) {
    return <div
        className={className}
        style={style}
      >{children}</div>
  } else {
    return (
      <PerfectScrollbar options={{ wheelPropagation: false }} className={className}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const UserProfileRight = (props: Props) => {
  // Props
  const { open, handleClose, activeUser, isBelowLgScreen, isBelowSmScreen } = props

  return activeUser ? (
   <Drawer
  open={open}
  anchor='right'
  variant='persistent'
  ModalProps={{ keepMounted: true }}
  sx={{
    zIndex: 12,
    '& .MuiDrawer-paper': {
      width: isBelowSmScreen ? '100%' : '370px',
      position: 'absolute',
      border: 0
    }
  }}
>
  <IconButton
    onClick={handleClose}
    style={{
      position: 'absolute',
      top: '1rem',   // block-start-4
      right: '1rem'  // inline-end-4
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
      marginBlockStart: '1.5rem',  // mbs-6
      paddingInline: '1.25rem',    // pli-5
      paddingBlockStart: '1.25rem',// pbs-5
      paddingBlockEnd: '0.25rem'   // pbe-1
    }}
  >
    <AvatarWithBadge
      alt={activeUser.name}
      src={activeUser.profilePicUrl}
      color={activeUser.avatarColor}
      badgeColor={statusObj[activeUser.status]}
      badgeSize={12}
      
    />
    <div style={{ textAlign: 'center' }}>
      <Typography variant='h5'>{activeUser.name}</Typography>
      <Typography>{activeUser.role}</Typography>
    
    </div>
  </div>

  <ScrollWrapper
    isBelowLgScreen={isBelowLgScreen}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '1.25rem',
      height: '100%',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}
  >
    {/* About Section */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Typography style={{ textTransform: 'uppercase' }} color='text.disabled'>
        About
      </Typography>
      <Typography>{activeUser.about}</Typography>
    </div>

    {/* Personal Information */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Typography style={{ textTransform: 'uppercase' }} color='text.disabled'>
        Personal Information
      </Typography>
      <List style={{ paddingBlock: 0 }}>
        <ListItem style={{ padding: '0.5rem', gap: '0.5rem' }}>
          <ListItemIcon>
            <i className='ri-mail-line' />
          </ListItemIcon>
          <ListItemText primary={`${activeUser.name.toLowerCase().replace(/\s/g, '_')}@email.com`} />
        </ListItem>
        <ListItem style={{ padding: '0.5rem', gap: '0.5rem' }}>
          <ListItemIcon>
            <i className='ri-phone-line' />
          </ListItemIcon>
          <ListItemText primary='+1(123) 456 - 7890' />
        </ListItem>
        <ListItem style={{ padding: '0.5rem', gap: '0.5rem' }}>
          <ListItemIcon>
            <i className='ri-time-line' />
          </ListItemIcon>
          <ListItemText primary='Mon - Fri 10AM - 8PM' />
        </ListItem>
      </List>
    </div>

    {/* Options */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <Typography style={{ textTransform: 'uppercase' }} color='text.disabled'>
        Options
      </Typography>
      <List style={{ paddingBlock: 0 }}>
        <ListItem disablePadding>
          <ListItemButton style={{ padding: '0.5rem' }}>
            <ListItemIcon>
              <i className='ri-bookmark-line' />
            </ListItemIcon>
            <ListItemText primary='Add Tag' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton style={{ padding: '0.5rem' }}>
            <ListItemIcon>
              <i className='ri-user-star-line' />
            </ListItemIcon>
            <ListItemText primary='Important Contact' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton style={{ padding: '0.5rem' }}>
            <ListItemIcon>
              <i className='ri-image-2-line' />
            </ListItemIcon>
            <ListItemText primary='Shared Image' />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton style={{ padding: '0.5rem' }}>
            <ListItemIcon>
              <i className='ri-forbid-2-line' />
            </ListItemIcon>
            <ListItemText primary='Block Contact' />
          </ListItemButton>
        </ListItem>
      </List>
    </div>

    {/* Delete Button */}
    <Button
      variant='contained'
      color='error'
      fullWidth
      endIcon={<i className='ri-delete-bin-7-line' />}
      style={{ marginBlockStart: 'auto' }} // mbs-auto
    >
      Delete Contact
    </Button>
  </ScrollWrapper>
</Drawer>
  ) : null
}

export default UserProfileRight
