// ** React Imports
import { forwardRef, Ref, useRef, useState } from 'react'

// ** MUI Imports
import MuiAvatar from '@mui/material/Avatar'
import { lighten, useTheme } from '@mui/material/styles'

// ** Types
import { CustomAvatarProps } from './types'
import { ThemeColor } from 'src/@core/layouts/types'

import IconButton from '@mui/material/IconButton'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

// ** Hooks Imports
import useBgColor, { UseBgColorType } from 'src/@core/hooks/useBgColor'

const Avatar = forwardRef((props: CustomAvatarProps, ref: Ref<any>) => {
  // ** Props
  const { sx, src, skin, color } = props

  // ** Hook
  const theme = useTheme()
  const bgColors: UseBgColorType = useBgColor()

  const getAvatarStyles = (skin: 'filled' | 'light' | 'light-static' | undefined, skinColor: ThemeColor) => {
    let avatarStyles

    if (skin === 'light') {
      avatarStyles = { ...bgColors[`${skinColor}Light`] }
    } else if (skin === 'light-static') {
      avatarStyles = {
        color: bgColors[`${skinColor}Light`].color,
        backgroundColor: lighten(theme.palette[skinColor].main, 0.88)
      }
    } else {
      avatarStyles = { ...bgColors[`${skinColor}Filled`] }
    }

    return avatarStyles
  }

  const colors: UseBgColorType = {
    primary: getAvatarStyles(skin, 'primary'),
    secondary: getAvatarStyles(skin, 'secondary'),
    success: getAvatarStyles(skin, 'success'),
    error: getAvatarStyles(skin, 'error'),
    warning: getAvatarStyles(skin, 'warning'),
    info: getAvatarStyles(skin, 'info')
  }

  // ** State for handling image upload
  const [hovered, setHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = fileInputRef.current
    if (fileInput) {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          // Você pode definir os dados da imagem carregada em um estado ou usá-los conforme necessário
          console.log(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleFileInputClick = () => {
    const fileInput = fileInputRef.current
    if (fileInput) {
      fileInput.click()
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <MuiAvatar ref={ref} {...props} sx={!src && skin && color ? Object.assign(colors[color], sx) : sx} />
      {hovered && !src && (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '4px',
            borderRadius: '50%'
          }}
        >
          <IconButton
            onClick={handleFileInputClick}
            size='small'
            color='primary'
            aria-label='upload picture'
            component='span'
          >
            <PhotoCameraIcon />
          </IconButton>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </div>
      )}
    </div>
  )
})

Avatar.defaultProps = {
  skin: 'filled',
  color: 'primary'
}

export default Avatar


