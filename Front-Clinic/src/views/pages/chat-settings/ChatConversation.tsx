'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Backdrop from '@mui/material/Backdrop'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

// Type Imports


// Slice Imports


// Component Imports


// Hook Imports


// Util Imports
import { useSettings } from 'src/@core/hooks/useSettings'
import { RootState } from 'src/store'
import { ChatDataType, getActiveUserData, loadChatsFromMessages, receiveMsg, resetChat, setActiveChatId, setContacts, setProfileUser, setSelectChatId } from 'src/store/apps/chat-v2'
import SidebarLeft from './SidebarLeft'
import ChatContent from './ChatContent'
import { useWhatsappSocket } from 'src/hooks/useWhatsAppSockets'
import api from 'src/@core/components/api-client'

export const commonLayoutClasses = {
  contentHeightFixed: 'ts-layout-content-height-fixed'
}

export const ChatConversation = () => {
  // States
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Refs
  const messageInputRef = useRef<HTMLDivElement>(null)

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  
  // Hooks
  const { settings } = useSettings();
  const dispatch = useDispatch()
  const chatStore = useSelector((state: RootState) => state.chatReducer as ChatDataType)
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))


  async function loadContacts() {
    const response = await api.get('chat/contacts')
    dispatch(setContacts(response.data))
  }

  async function loadProfile() {
    const response = await api.get(`whatsapp/chat/profile`);
   
    const data = response.data

    dispatch(setProfileUser({
      name: data.name,
      avatar: data.profilePicUrl,
    }))
  }

  async function loadMessages() {
    const response = await api.get('chat/messages')
    dispatch(loadChatsFromMessages({ messages: response.data }))
  }

  useEffect(() => {
  loadMessages();
  loadContacts();
  loadProfile();

   return () => {
    dispatch(resetChat())
  }
}, [])


  // const contacts = useSelector((state: any) => state.chat.contacts)
  // const chats = useSelector((state: any) => state.chat.chats);
  useEffect(() => {
    const selectedChatId = chatStore.selectedChatId; 

    if (selectedChatId && chatStore.contacts.length > 0) {
        
        dispatch(setActiveChatId(selectedChatId))
        dispatch(setSelectChatId("")); 
    }
}, [chatStore.selectedChatId, chatStore.contacts.length, dispatch]);


useWhatsappSocket(userData?.accountId, (message) => {
 dispatch(receiveMsg({ message }));
 loadContacts();
});
  

 console.log('chatStore', chatStore);

  // Get active user’s data
  const activeUser = (id: number) => {
    dispatch(getActiveUserData(id))
  }

  // Focus on message input when active user changes
  useEffect(() => {
    if (chatStore.activeUser?.id !== null && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [chatStore.activeUser])

  // Close backdrop when sidebar is open on below md screen
  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen])

  // Open backdrop when sidebar is open on below sm screen
  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen])

  // Close sidebar when backdrop is closed on below md screen
  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  return (
    <div
  style={{
    display: 'flex',
    width: '100%', 
    overflow: 'hidden',
    borderRadius: '0.25rem', 
    position: 'relative',
    backgroundColor: settings.mode === 'light' ? '#F7F7F9' : '#282A42',
    border: settings.skin === 'bordered' ? '1px solid #e5e7eb' : 'none', 
    boxShadow: settings.skin !== 'bordered' ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' : 'none' 
  }}
>
      <SidebarLeft
        chatStore={chatStore}
        getActiveUserData={activeUser}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
      />

      <ChatContent
        chatStore={chatStore}
        dispatch={dispatch}
        backdropOpen={backdropOpen}
        setBackdropOpen={setBackdropOpen}
        setSidebarOpen={setSidebarOpen}
        isBelowMdScreen={isBelowMdScreen}
        isBelowLgScreen={isBelowLgScreen}
        isBelowSmScreen={isBelowSmScreen}
        messageInputRef={messageInputRef}
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  )
}
