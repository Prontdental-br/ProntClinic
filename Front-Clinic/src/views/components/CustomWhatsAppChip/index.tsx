import { Chip } from '@mui/material'
import { useState } from 'react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils
import { FormatMask } from 'src/@core/utils/FormatMask'

const CustomWhatsAppChip = ({ phoneNumber }: { phoneNumber: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clicked, setClicked] = useState(false)
  const formatter = new FormatMask()
  const cleanedNumber = phoneNumber.replace(/\D/g, '')
  const withDDI = cleanedNumber.startsWith('55') ? cleanedNumber : '55' + cleanedNumber
  const formatted = (formatter.setPhoneFormatMask(withDDI) ?? phoneNumber).replace(/^\+55\s*/, '')

  const handleClick = () => {
    setClicked(true)
    window.open(`https://wa.me/${cleanedNumber.startsWith('55') ? cleanedNumber : '55' + cleanedNumber}`, '_blank')
  }

  return (
    <Chip
      variant='filled'
      size='small'
      sx={{
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        padding: '0.25rem',
        cursor: 'pointer'
      }}
      icon={
        <Icon
          icon='mdi:whatsapp'
          style={{
            color: '#FFFFFF',
            marginRight: '0.25rem',
            width: '1.5rem',
            height: '1.5rem'
          }}
        />
      }
      label={formatted}
      onClick={handleClick}
    />
  )
}

export default CustomWhatsAppChip
