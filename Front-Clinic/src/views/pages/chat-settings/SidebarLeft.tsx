// React Imports
import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports

// Slice Imports

// Component Imports

import UserProfileLeft from './UserProfileLeft'
import AvatarWithBadge from './AvatarWithBadge'

// Util Imports

import { formatDateToMonthShort, getInitials } from './utils'
import { addNewChat, ChatDataType, StatusObjType } from 'src/store/apps/chat-v2'
import { AppDispatch } from 'src/store'
import CustomAvatar from 'src/@core/components/mui/AvatarCustom'
import { ThemeColor } from 'src/@core/layouts/types'
import { Button } from '@mui/material'

export const statusObj: StatusObjType = {
  busy: 'error',
  away: 'warning',
  online: 'success',
  offline: 'secondary'
}

type Props = {
  chatStore: ChatDataType
  getActiveUserData: (id: number) => void
  dispatch: AppDispatch
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
}

type RenderChatType = {
  chatStore: ChatDataType
  getActiveUserData: (id: number) => void
  setSidebarOpen: (value: boolean) => void
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  isBelowMdScreen: boolean
  showAllContacts?: boolean
  limitContacts?: number
}

// Render chat list
const renderChat = (props: RenderChatType) => {
  const {
    chatStore,
    getActiveUserData,
    setSidebarOpen,
    backdropOpen,
    setBackdropOpen,
    isBelowMdScreen,
    showAllContacts,
    limitContacts
  } = props

  const chatsSorted = [...chatStore.chats].sort((a, b) => {
    const aTime = a.chat[a.chat.length - 1]?.time
    const bTime = b.chat[b.chat.length - 1]?.time

    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  const chatsToRender = showAllContacts ? chatsSorted : chatsSorted.slice(0, limitContacts)

  return chatsToRender.map(chat => {
    const contact = chatStore.contacts.find(c => c.id === chat.userId)

    if (!contact) return null

    const isChatActive = chatStore.activeUser?.id === contact.id
    const lastMsg = chat.chat[chat.chat.length - 1]

    return (
      <li
        key={chat.id}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          paddingInline: '12px',
          paddingBlock: '8px',
          cursor: 'pointer',
          borderRadius: '8px',
          marginBlockEnd: '4px',
          ...(isChatActive && {
            backgroundColor: '#8B18BB',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            color: '#F7FFF8'
          })
        }}
        onClick={() => {
          getActiveUserData(chat.userId)
          isBelowMdScreen && setSidebarOpen(false)
          isBelowMdScreen && backdropOpen && setBackdropOpen(false)
        }}
      >
        <AvatarWithBadge
          src={contact.profilePicUrl || ''}
          isChatActive={isChatActive}
          alt={contact.name}
          badgeColor={statusObj[contact.status]}
          color={contact.avatarColor}
        />
        <div style={{ minInlineSize: 0, flex: '1 1 auto' }}>
          <Typography color='inherit'>{contact?.name || 'Contato'}</Typography>

          <Typography
            variant='body2'
            color={isChatActive ? 'inherit' : 'text.secondary'}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {lastMsg?.message || contact?.role || 'Nova conversa'}
          </Typography>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-start'
          }}
        >
          {lastMsg?.time && (
            <Typography
              variant='body2'
              color='inherit'
              className={classnames('truncate', {
                'text-textDisabled': !isChatActive
              })}
            >
              {formatDateToMonthShort(lastMsg.time)}
            </Typography>
          )}
          {chat.unseenMsgs > 0 ? <Chip label={chat.unseenMsgs} color='error' size='small' /> : null}
        </div>
      </li>
    )
  })
}

// Scroll wrapper for chat list
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

const SidebarLeft = (props: Props) => {
  // Props
  const {
    chatStore,
    getActiveUserData,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    messageInputRef
  } = props

  // States
  const [userSidebar, setUserSidebar] = useState(false)
  const [searchValue, setSearchValue] = useState<string | null>()
  const [showAllContacts, setShowAllContacts] = useState(false)

  const limitContacts = 8

  const handleChange = (event: any, newValue: string | null) => {
    setSearchValue(newValue)
    dispatch(addNewChat({ id: chatStore.contacts.find(contact => contact.name === newValue)?.id }))
    getActiveUserData(
      chatStore.contacts.find(contact => contact.name === newValue)?.id || (chatStore.activeUser?.id as number)
    )
    isBelowMdScreen && setSidebarOpen(false)
    setBackdropOpen(false)
    setSearchValue(null)
    messageInputRef.current?.focus()
  }

  return (
    <>
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
        ModalProps={{
          disablePortal: true,
          keepMounted: true
        }}
        sx={{
          zIndex: isBelowMdScreen && sidebarOpen ? 11 : 10,
          position: !isBelowMdScreen ? 'static' : 'absolute',
          ...(isBelowSmScreen && sidebarOpen && { width: '100%' }),
          '& .MuiDrawer-paper': {
            overflow: 'hidden',
            boxShadow: 'none',
            width: isBelowSmScreen ? '100%' : '370px',
            position: !isBelowMdScreen ? 'static' : 'absolute'
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            paddingBlock: '18px',
            paddingInline: '20px',
            gap: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <AvatarWithBadge
            alt={chatStore.profileUser.fullName}
            src={chatStore.profileUser.avatar}
            badgeColor={statusObj[chatStore.profileUser.status]}
            onClick={() => setUserSidebar(true)}
          />
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap',
              rowGap: '0.5rem',
              columnGap: isBelowSmScreen ? '0.75rem' : '1rem'
            }}
          >
            <Autocomplete
              fullWidth
              size='small'
              id='select-contact'
              options={chatStore.contacts.map(contact => contact.name) || []}
              value={searchValue || null}
              onChange={handleChange}
              renderInput={params => (
                <TextField
                  {...params}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '999px !important'
                    }
                  }}
                  placeholder='Pesquisar Contatos'
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-search-line' style={{ fontSize: '1.25rem' }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => {
                const contact = chatStore.contacts.find(contact => contact.name === option)

                return (
                  <li
                    {...props}
                    key={option.toLowerCase().replace(/\s+/g, '-')}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      paddingInline: isBelowSmScreen ? '12px' : undefined
                    }}
                  >
                    {contact ? (
                      contact.profilePicUrl ? (
                        <Avatar alt={contact.name} src={contact.profilePicUrl} />
                      ) : (
                        <CustomAvatar color={contact.avatarColor as ThemeColor} skin='light'>
                          {getInitials(contact.name)}
                        </CustomAvatar>
                      )
                    ) : null}
                    {option}
                  </li>
                )
              }}
            />
            {isBelowMdScreen && (
              <IconButton
                onClick={() => {
                  setSidebarOpen(false)
                  setBackdropOpen(false)
                }}
                style={{
                  padding: 0,
                  marginInlineStart: '0.5rem'
                }}
              >
                <i className='ri-close-line' />
              </IconButton>
            )}
          </div>
        </div>

        <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
          <ul
            style={{
              padding: '12px',
              paddingBlockStart: '16px',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {renderChat({
              chatStore,
              getActiveUserData,
              backdropOpen,
              setSidebarOpen,
              isBelowMdScreen,
              setBackdropOpen,
              showAllContacts,
              limitContacts
            })}
            {chatStore.chats.length > limitContacts && (
              <div style={{ padding: '12px', textAlign: 'center' }}>
                <Button variant='outlined' onClick={() => setShowAllContacts(prev => !prev)}>
                  {showAllContacts ? 'Listar menos contatos' : 'Listar mais contatos'}
                </Button>
              </div>
            )}
          </ul>
        </ScrollWrapper>
      </Drawer>

      <UserProfileLeft
        userSidebar={userSidebar}
        setUserSidebar={setUserSidebar}
        profileUserData={chatStore.profileUser}
        dispatch={dispatch}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
      />
    </>
  )
}

export default SidebarLeft
