'use client'

// ** React Imports
import { useRef, useState, useEffect } from 'react'
import type { FormEvent, KeyboardEvent, RefObject, MouseEvent } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import MicIcon from '@mui/icons-material/Mic'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

// Component Imports
import { ContactType, sendMsg } from 'src/store/apps/chat-v2'
import CustomIconButton from 'src/@core/components/mui/IconButton'
import { AppDispatch } from 'src/store'
import api from 'src/@core/components/api-client'
import { useSettings } from 'src/@core/hooks/useSettings'

type Props = {
  dispatch: AppDispatch
  activeUser: ContactType
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
}

// Emoji Picker Component for selecting emojis
const EmojiPicker = ({
  onChange,
  isBelowSmScreen,
  openEmojiPicker,
  setOpenEmojiPicker,
  anchorRef
}: {
  onChange: (value: string) => void
  isBelowSmScreen: boolean
  openEmojiPicker: boolean
  setOpenEmojiPicker: (value: boolean | ((prevVar: boolean) => boolean)) => void
  anchorRef: RefObject<HTMLButtonElement>
}) => {
  return (
    <Popper
      open={openEmojiPicker}
      transition
      disablePortal
      placement='top-start'
      style={{ zIndex: 12 }}
      anchorEl={anchorRef.current}
    >
      {({ TransitionProps, placement }) => (
        <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
          <Paper>
            <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
              <span>
                <Picker
                  emojiSize={18}
                  theme='light'
                  data={data}
                  maxFrequentRows={1}
                  onEmojiSelect={(emoji: any) => {
                    onChange(emoji.native)
                    setOpenEmojiPicker(false)
                  }}
                  {...(isBelowSmScreen && { perLine: 8 })}
                />
              </span>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  )
}

const SendMsgForm = ({ dispatch, activeUser, isBelowSmScreen, messageInputRef }: Props) => {
  // States
  const [msg, setMsg] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)
  const [isSending, setIsSending] = useState(false) // NOVO: Estado para controle de envio
  const { settings } = useSettings()

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  const open = Boolean(anchorEl)

  const handleToggle = () => {
    setOpenEmojiPicker(prevOpen => !prevOpen)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(prev => (prev ? null : event.currentTarget))
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSendMsg = async (event: FormEvent | KeyboardEvent, message: string) => {
    event.preventDefault()
    
    const finalMsg = message.trim();

    if (finalMsg === '' || isSending) {
      return
    }

    setIsSending(true)

    try {
      await api.post('/whatsapp/chat/send-message', {
        to: activeUser.id,
        message: finalMsg
      })
      dispatch(sendMsg({ msg: finalMsg }))
      setMsg('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleInputEndAdornment = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {isBelowSmScreen ? (
          <>
            <IconButton
              id='option-menu'
              aria-haspopup='true'
              {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })}
              onClick={handleClick}
              ref={anchorRef}
            >
              <MoreVertIcon className='text-textPrimary' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleToggle()
                  handleClose()
                }}
              >
                <InsertEmoticonIcon className='text-textPrimary' />
              </MenuItem>
            {/* <MenuItem onClick={handleClose}>
              <MicIcon className='text-textPrimary' />
            </MenuItem> */}
            {/* <MenuItem onClick={handleClose} className='p-0'>
              <label htmlFor='upload-img' className='plb-2 pli-5'>
                <AttachFileIcon className='text-textPrimary' />
                <input hidden type='file' id='upload-img' />
              </label>
            </MenuItem> */}
            </Menu>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
          </>
        ) : (
          <>
            <IconButton ref={anchorRef} size='small' onClick={handleToggle}>
              <InsertEmoticonIcon className='text-textPrimary' />
            </IconButton>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
          {/* <IconButton size='small'>
            <MicIcon className='text-textPrimary' />
          </IconButton> */}
          {/* <IconButton size='small' component='label' htmlFor='upload-img'>
            <AttachFileIcon className='text-textPrimary' />
            <input hidden type='file' id='upload-img' />
          </IconButton> */}
          </>
        )}
        {isSending ? ( // EXIBE O LOADING QUANDO isSending é true
            <CircularProgress size={24} color='primary' sx={{ mr: isBelowSmScreen ? 0 : 2 }} />
        ) : isBelowSmScreen ? (
          <CustomIconButton variant='contained' color='primary' type='submit' disabled={isSending}>
            <SendIcon />
          </CustomIconButton>
        ) : (
          <Button variant='contained' color='primary' type='submit' endIcon={<SendIcon />} disabled={isSending}>
            Enviar
          </Button>
        )}
      </div>
    )
  }

  useEffect(() => {
    setMsg('')
  }, [activeUser.id])

  return (
    <form
      autoComplete='off'
      onSubmit={event => handleSendMsg(event, msg)}
      className=' bg-[var(--mui-palette-customColors-chatBg)]'
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder='Digite uma mensagem'
        value={msg}
        onChange={e => setMsg(e.target.value)}
        sx={{
          '& fieldset': { border: '0' },
          '& .MuiOutlinedInput-root': {
            backgroundColor: settings.mode === 'light' ? '#ffffff' : '#3F425C',
            borderRadius: '0.7rem',
            boxShadow: 'var(--mui-customShadows-xs)'
          },
          p: 2
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault() 
            handleSendMsg(e, msg)
          }
        }}
        size='small'
        inputRef={messageInputRef}
        InputProps={{ endAdornment: handleInputEndAdornment() }}
        disabled={isSending}
      />
    </form>
  )
}

export default SendMsgForm
