// React Imports
import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'

// Type Imports


// Component Imports
import AvatarWithBadge from './AvatarWithBadge'
import { statusObj } from './SidebarLeft'
import ChatLog from './ChatLog'
import SendMsgForm from './SendMsgForm'
import UserProfileRight from './UserProfileRight'
import { ChatDataType, clearChatMessages, ContactType, removeContact } from 'src/store/apps/chat-v2'
import { AppDispatch } from 'src/store'
import CustomAvatar from 'src/@core/components/mui/AvatarCustom'
import OptionMenu from 'src/@core/components/mui/option-menu'
import { ChatBubbleOutline, MoreVert, PhoneOutlined, SearchOutlined, VideoCallOutlined } from '@mui/icons-material'
import api from 'src/@core/components/api-client'


type Props = {
  chatStore: ChatDataType
  dispatch: AppDispatch
  backdropOpen: boolean
  setBackdropOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  isBelowMdScreen: boolean
  isBelowLgScreen: boolean
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
}

// Renders the user avatar with badge and user information
const UserAvatar = ({
  activeUser,
  setUserProfileLeftOpen,
  setBackdropOpen
}: {
  activeUser: ContactType
  setUserProfileLeftOpen: (open: boolean) => void
  setBackdropOpen: (open: boolean) => void
}) => (
  <div
    className='flex items-center gap-4 cursor-pointer'
    onClick={() => {
      setUserProfileLeftOpen(true)
      setBackdropOpen(true)
    }}
  >
    <AvatarWithBadge
      alt={activeUser?.name}
      src={activeUser?.profilePicUrl}
      color={activeUser?.avatarColor}
      badgeColor={statusObj[activeUser?.status || 'offline']}
    />
    <div>
      <Typography color='text.primary'>{activeUser?.name}</Typography>
      <Typography variant='body2'>{activeUser?.role}</Typography>
    </div>
  </div>
)

const ChatContent = (props: Props) => {
  // Props
  const {
    chatStore,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    setSidebarOpen,
    isBelowMdScreen,
    isBelowSmScreen,
    isBelowLgScreen,
    messageInputRef
  } = props

  const { activeUser } = chatStore

  // States
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false)

  // Close user profile right drawer if backdrop is closed and user profile right drawer is open
  useEffect(() => {
    if (!backdropOpen && userProfileRightOpen) {
      setUserProfileRightOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  async function handleClearChat(contactId: string) {
    try {
      await api.delete(`chat/clear/${contactId}`);
      dispatch(clearChatMessages(contactId as any));
    } catch (err) {
      console.error('Erro ao limpar conversa:', err);
    }
  }

  const handleDeleteContact = async (contactId: number) => {
  try {
    await api.delete(`/chat/contact/${contactId}`)
    dispatch(removeContact(contactId))
  } catch (error) {
    console.error('Erro ao excluir contato:', error)
  }
}

  return !chatStore.activeUser ? (
    <CardContent 
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '18px'
      }}
    >
      <CustomAvatar variant='circular' size={98}  sx={{ backgroundColor: '#C9E8DF' }}>
        <ChatBubbleOutline style={{ fontSize: 50 }} />
      </CustomAvatar>
      <Typography className='text-center'>Selecione um contato para conversar.</Typography>
      {isBelowMdScreen && (
        <Button
          variant='contained'
          className='rounded-full'
          onClick={() => {
            setSidebarOpen(true)
            isBelowSmScreen ? setBackdropOpen(false) : setBackdropOpen(true)
          }}
        >
          Selecione Contato
        </Button>
      )}
    </CardContent>
  ) : (
    <>
      {activeUser && (
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: '100%'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBlockEnd: '1px solid',
              paddingBlock: '17px',
              paddingInline: '20px',
              backgroundColor: 'var(--mui-palette-customColors-chatBg)'
            }}
          >
            {isBelowMdScreen ? (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',

                }}
              >
                <IconButton
                  onClick={() => {
                    setSidebarOpen(true)
                    setBackdropOpen(true)
                  }}
                >
                  <i className='ri-menu-line text-textSecondary text-xl' />
                </IconButton>
                <UserAvatar
                  activeUser={activeUser}
                  setBackdropOpen={setBackdropOpen}
                  setUserProfileLeftOpen={setUserProfileRightOpen}
                />
              </div>
            ) : (
              <UserAvatar
                activeUser={activeUser}
                setBackdropOpen={setBackdropOpen}
                setUserProfileLeftOpen={setUserProfileRightOpen}
              />
            )}
            {isBelowMdScreen ? (
              <OptionMenu
                icon={<MoreVert />}
                options={[
                  {
                    text: 'Visualizar Contato',
                    menuItemProps: {
                      onClick: () => {
                        setUserProfileRightOpen(true)
                        setBackdropOpen(true)
                      }
                    }
                  },
                  'Limpar conversa',
                  'Excluir Contato'
                ]}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              >
                {/* <IconButton size='small'>
                  <PhoneOutlined />
                </IconButton>
                <IconButton size='small'>
                   <VideoCallOutlined fontSize='small' color='action' />
                </IconButton>
                <IconButton size='small'>
                  <SearchOutlined fontSize='small' color='action' />
                </IconButton> */}
                <OptionMenu
                  icon={<MoreVert />}
                  options={[
                    // {
                    //   text: 'Visualizar Contato',
                    //   menuItemProps: {
                    //     onClick: () => {
                    //       setUserProfileRightOpen(true)
                    //       setBackdropOpen(true)
                    //     }
                    //   }
                    // },
                    {
                    text: 'Limpar conversa',
                    menuItemProps: {
                      onClick: () => {
                        if (activeUser) {
                              handleClearChat(activeUser.id as any)
                           }
                        }
                      },
                    },
                    {
                    text: 'Excluir Contato',
                    menuItemProps: {
                      onClick: () => {
                        if (activeUser) {
                              handleDeleteContact(activeUser.id as any)
                           }
                        }
                      },
                    },
                    
                  ]}
                />
              </div>
            )}
          </div>

          <ChatLog
            chatStore={chatStore}
            isBelowMdScreen={isBelowMdScreen}
            isBelowSmScreen={isBelowSmScreen}
            isBelowLgScreen={isBelowLgScreen}
          />

          <SendMsgForm
            dispatch={dispatch}
            activeUser={activeUser}
            isBelowSmScreen={isBelowSmScreen}
            messageInputRef={messageInputRef}
          />
        </div>
      )}

      {activeUser && (
        <UserProfileRight
          open={userProfileRightOpen}
          handleClose={() => {
            setUserProfileRightOpen(false)
            setBackdropOpen(false)
          }}
          activeUser={activeUser}
          isBelowSmScreen={isBelowSmScreen}
          isBelowLgScreen={isBelowLgScreen}
        />
      )}
    </>
  )
}

export default ChatContent
