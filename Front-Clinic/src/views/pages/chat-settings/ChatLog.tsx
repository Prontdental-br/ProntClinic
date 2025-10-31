// React Imports
import { useRef, useEffect } from 'react'
import type { MutableRefObject, ReactNode } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import CardContent from '@mui/material/CardContent'

// Third-party Imports
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports


// Component Imports

import { ChatDataType, ChatType, ProfileUserType, UserChatType } from 'src/store/apps/chat-v2'
import { getInitials } from './utils'
import CustomAvatar from 'src/@core/components/mui/AvatarCustom'
import { useSettings } from 'src/@core/hooks/useSettings'


// Util Imports


type MsgGroupType = {
  senderId: number
  messages: Omit<UserChatType, 'senderId'>[]
}

type ChatLogProps = {
  chatStore: ChatDataType
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
}

// Formats the chat data into a structured format for display.
const formatedChatData = (chats: ChatType['chat'], profileUser: ProfileUserType) => {
  const formattedChatData: MsgGroupType[] = []
  let chatMessageSenderId = chats[0] ? chats[0].senderId : profileUser.id
  let msgGroup: MsgGroupType = {
    senderId: chatMessageSenderId,
    messages: []
  }

  chats.forEach((chat, index) => {
    if (chatMessageSenderId === chat.senderId) {
      msgGroup.messages.push({
        time: chat.time,
        message: chat.message,
        msgStatus: chat.msgStatus
      })
    } else {
      chatMessageSenderId = chat.senderId

      formattedChatData.push(msgGroup)
      msgGroup = {
        senderId: chat.senderId,
        messages: [
          {
            time: chat.time,
            message: chat.message,
            msgStatus: chat.msgStatus
          }
        ]
      }
    }

    if (index === chats.length - 1) formattedChatData.push(msgGroup)
  })

  return formattedChatData
}



const ScrollWrapper = ({ children, scrollRef, isBelowLgScreen }: {
children: ReactNode
isBelowLgScreen: boolean
scrollRef: MutableRefObject<null>
className?: string }) => {
  return (
    <div
      ref={scrollRef}
      style={{
        height: isBelowLgScreen ? 'calc(100vh - 150px)' : '500px',
        overflowY: 'auto',
        padding: '1rem'
      }}
    >
      {children}
    </div>
  );
};

const ChatLog = ({ chatStore, isBelowLgScreen, isBelowMdScreen, isBelowSmScreen }: ChatLogProps) => {
  // Props
  const { profileUser, contacts } = chatStore

  const { settings } = useSettings();

  // Vars
  const activeUserChat = chatStore.chats.find((chat: ChatType) => chat.userId === chatStore.activeUser?.id)

  // Refs
  const scrollRef = useRef<any>(null)

  // Function to scroll to bottom when new message is sent
const scrollToBottom = () => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
};

  // Scroll to bottom on new message
  useEffect(() => {
    if (activeUserChat && activeUserChat.chat && activeUserChat.chat.length) {
      scrollToBottom()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStore])

  return (
    <ScrollWrapper
      isBelowLgScreen={isBelowLgScreen}
      scrollRef={scrollRef}
    >
      <CardContent style={{ padding: 0 }}>
        {activeUserChat &&
          formatedChatData(activeUserChat.chat, profileUser).map((msgGroup, index) => {
            const isSender = msgGroup.senderId === profileUser.id

            return (
              <div key={index} style={{
                          display: 'flex',
                          gap: '16px',
                          padding: '20px',

                          ...(isSender && { flexDirection: 'row-reverse' })
                        }}
                >
                {!isSender ? (
                  contacts.find(contact => contact.id === activeUserChat?.userId)?.profilePicUrl ? (
                    <Avatar
                      alt={contacts.find(contact => contact.id === activeUserChat?.userId)?.name}
                      src={contacts.find(contact => contact.id === activeUserChat?.userId)?.profilePicUrl}
                      style={{ inlineSize: '2rem', blockSize: '2rem' }}
                    />
                  ) : (
                    <CustomAvatar
                      color={contacts.find(contact => contact.id === activeUserChat?.userId)?.avatarColor}
                      skin='light'
                      size={32}
                    >
                      {getInitials(contacts.find(contact => contact.id === activeUserChat?.userId)?.name as string)}
                      
                    </CustomAvatar>
                  )
                ) : profileUser.avatar ? (
                  <Avatar alt={profileUser.fullName} src={profileUser.avatar} style={{ inlineSize: '2rem', blockSize: '2rem' }} />
                ) : (
                  <CustomAvatar alt={profileUser.fullName} src={profileUser.avatar} size={32} />
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    ...(isSender && { alignItems: 'flex-end' }),
                    ...(!isBelowMdScreen && { maxWidth: '65%' }),
                    ...(isBelowMdScreen && !isBelowSmScreen && { maxWidth: '75%' }),
                    ...(isBelowSmScreen && { maxWidth: 'calc(100% - 5.75rem)' })
                  }}
                >
                  {msgGroup.messages.map((msg, index) => (
                   <Typography
                      key={index}
                      style={{
                        whiteSpace: 'pre-wrap',
                        paddingInline: '16px',
                        paddingBlock: '8px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.103)',
                        wordBreak: 'break-word',
                        width: 'fit-content',
                        maxWidth: '100%', 
                        ...(isSender
                          ? {
                              backgroundColor: '#087a64',
                              color: '#FFF',
                              borderTopLeftRadius: '8px',
                              borderBottomRightRadius: '8px',
                              borderBottomLeftRadius: '8px',
                            }
                          : {
                              backgroundColor: settings.mode === 'light' ? '#ffffff' : '#3F425C',
                              borderTopRightRadius: '8px',
                              borderBottomLeftRadius: '8px',
                              borderBottomRightRadius: '8px',
                            })
                      }}
                    >
                      {msg.message}
                    </Typography>

                  ))}
                  {msgGroup.messages.map(
                    (msg, index) =>
                      index === msgGroup.messages.length - 1 &&
                      (isSender ? (
                        <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem' 
                            }}>
                          {msg.msgStatus?.isSeen ? (
                            <i className='ri-check-double-line text-success text-base' />
                          ) : msg.msgStatus?.isDelivered ? (
                            <i className='ri-check-double-line text-base' />
                          ) : (
                            msg.msgStatus?.isSent && <i className='ri-check-line text-base' />
                          )}
                          {index === activeUserChat.chat.length - 1 ? (
                            <Typography variant='caption'>
                              {new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                            </Typography>
                          ) : msg.time ? (
                            <Typography variant='caption'>
                              {new Date(msg.time).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                              })}
                            </Typography>
                          ) : null}
                        </div>
                      ) : index === activeUserChat.chat.length - 1 ? (
                        <Typography key={index} variant='caption'>
                          {new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                        </Typography>
                      ) : msg.time ? (
                        <Typography key={index} variant='caption'>
                          {new Date(msg.time).toLocaleString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </Typography>
                      ) : null)
                  )}
                </div>
              </div>
            )
          })}
      </CardContent>
    </ScrollWrapper>
  )
}

export default ChatLog
