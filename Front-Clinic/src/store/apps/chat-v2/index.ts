import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ThemeColor } from "src/@core/layouts/types"

// Type Imports
export type StatusType = 'busy' | 'away' | 'online' | 'offline'

export type StatusObjType = Record<StatusType, ThemeColor>

export type ProfileUserType = {
  id: number
  role: string
  about: string
  avatar: string
  profilePicUrl?: string
  fullName: string
  status: StatusType
  settings: {
    isNotificationsOn: boolean
    isTwoStepAuthVerificationEnabled: boolean
  }
}

export type ContactType = {
  id: number
  name: string
  role: string
  about: string
  avatar?: string
  profilePicUrl?: string
  avatarColor?: ThemeColor
  status: StatusType
}

export type UserChatType = {
  message: string
  time: string | Date
  senderId: number
  msgStatus?: Record<'isSent' | 'isDelivered' | 'isSeen', boolean>
}

export type ChatType = {
  id: number
  userId: number
  unseenMsgs: number
  chat: UserChatType[]
}

export type ChatDataType = {
  profileUser: ProfileUserType
  contacts: ContactType[]
  chats: ChatType[]
  activeUser?: ContactType
  selectedChatId: string
}


const previousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
const dayBeforePreviousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 2)

export const db: ChatDataType = {
  profileUser: {
    id: 1,
    avatar: '/images/avatars/1.png',
    fullName: 'John Doe',
    role: 'Admin',
    about:
      'Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie brownie marshmallow.',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false
    }
  },
 contacts: [],
 chats: [],
 selectedChatId: ""
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState: db,
  reducers: {
    getActiveUserData: (state, action: PayloadAction<number>) => {
      const activeUser = state.contacts.find(user => user.id === action.payload)

      const chat = state.chats.find(chat => chat.userId === action.payload)

      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0
      }

      if (activeUser) {
        state.activeUser = activeUser
      }
    },

    addNewChat: (state, action) => {
      const { id } = action.payload

      state.contacts.find(contact => {
        if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
          state.chats.unshift({
            id: state.chats.length + 1,
            userId: contact.id,
            unseenMsgs: 0,
            chat: []
          })
        }
      })
    },

    setUserStatus: (state, action: PayloadAction<{ status: StatusType }>) => {
      state.profileUser = {
        ...state.profileUser,
        status: action.payload.status
      }
    },

    sendMsg: (state, action: PayloadAction<{ msg: string }>) => {
      const { msg } = action.payload

      const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id)

      if (existingChat) {
        existingChat.chat.push({
          message: msg,
          time: new Date(),
          senderId: state.profileUser.id,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        })

        // Remove the chat from its current position
        state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id)

        // Add the chat back to the beginning of the array
        state.chats.unshift(existingChat)
      }
    },

    receiveMsg: (state, action: PayloadAction<{ message: any }>) => {
      const { message } = action.payload

      const contactId = message.contactId

      const formattedMessage: UserChatType = {
        message: message.message,
        time: message.timestamp || message.created_at,
        senderId: message.fromMe ? state.profileUser.id : contactId,
        msgStatus: {
          isSent: true,
          isDelivered: message.status === 'SERVER_ACK',
          isSeen: message.status === 'READ'
        }
      }

      const chat = state.chats.find(chat => chat.userId === contactId)

      if (!chat) {
        state.chats.unshift({
          id: state.chats.length + 1,
          userId: contactId,
          unseenMsgs: message.fromMe ? 0 : 1,
          chat: [formattedMessage]
        })
      } else {
        chat.chat.push(formattedMessage)

        if (!message.fromMe) {
          chat.unseenMsgs += 1
        }

        state.chats = [
          chat,
          ...state.chats.filter(c => c.userId !== contactId)
        ]
      }
    },

    loadChatsFromMessages: (
  state,
  action: PayloadAction<{ messages: any[] }>
) => {
  const groupedChats: any = {}

  action.payload.messages.forEach((msg) => {
    const contactId = msg.contactId

    const chatMessage = {
      message: msg.message,
      time: msg.timestamp || msg.created_at,
      senderId: msg.fromMe ? state.profileUser.id : contactId,
      msgStatus: {
        isSent: true,
        isDelivered: msg.status === 'SERVER_ACK',
        isSeen: msg.status === 'READ'
      }
    }

    if (!groupedChats[contactId]) {
      groupedChats[contactId] = [chatMessage]
    } else {
      groupedChats[contactId].push(chatMessage)
    }
  })

  for (const contactId in groupedChats) {
  
    const chat = state.chats.find((chat: any) => chat.userId === contactId);

    if (!chat) {
      state.chats.push({
        id: state.chats.length + 1,
        userId: contactId as any,
        unseenMsgs: 0,
        chat: groupedChats[contactId]
      })
    } else {
      chat.chat = [...chat.chat, ...groupedChats[contactId]]
    }
  }
    },

    resetChat: (state) => {
      state.contacts = []
      state.chats = []
      state.activeUser = undefined
    },

    clearChatMessages: (state, action: PayloadAction<number>) => {
      const contactId = action.payload

      const chat = state.chats.find(chat => chat.userId === contactId)
      if (chat) {
        chat.chat = []
        chat.unseenMsgs = 0
      }
    },

    removeContact: (state, action: PayloadAction<number>) => {
      const contactId = action.payload

      state.contacts = state.contacts.filter(contact => contact.id !== contactId)

      state.chats = state.chats.filter(chat => chat.userId !== contactId)

      if (state.activeUser?.id === contactId) {
        state.activeUser = undefined
        state.selectedChatId = ""
      }
    },

    setActiveChatId: (state, action: PayloadAction<string>) => {
      const contactIdToActivate = action.payload;

      const contact = state.contacts.find((c: any) => c.id == contactIdToActivate); 
      
      if (contact) {
        state.activeUser = contact;
        const chat = state.chats.find((c: any) => c.userId == contact.id); 
        if (chat && chat.unseenMsgs > 0) {
          chat.unseenMsgs = 0;
        }
      }
    },

    setContacts: (state, action: PayloadAction<ContactType[]>) => {
      state.contacts = action.payload
    },

    setSelectChatId: (state, action: PayloadAction<string>) => {
      state.selectedChatId = action.payload
    },

    setProfileUser: (state, action: PayloadAction<{ name: string; avatar: string }>) => {
        state.profileUser.fullName = action.payload.name || 'User WhatsApp'
        state.profileUser.avatar = action.payload.avatar || '/images/avatars/1.png'
    }
  }
})

export const { 
  getActiveUserData, 
  addNewChat, 
  setUserStatus, 
  sendMsg, 
  receiveMsg, 
  setContacts, 
  loadChatsFromMessages, 
  resetChat,
  setActiveChatId,
  setSelectChatId,
  clearChatMessages,
  removeContact,
  setProfileUser,
} = chatSlice.actions

export default chatSlice.reducer
