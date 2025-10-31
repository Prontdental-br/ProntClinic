// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Third-party Imports
import classnames from 'classnames'
import { CardStatsVerticalProps } from 'src/types/apps/widgetTypes'
import CustomAvatar from 'src/@core/components/mui/AvatarCustom'

// Types Imports


// Components Imports


const CardStatVertical = (props: CardStatsVerticalProps) => {
  // Props
  const {
    title,
    stats,
    avatarIcon,
    avatarIconSize,
    avatarColor,
    trendNumber,
    trend,
    chipText,
    chipColor,
    avatarSkin,
    avatarSize
  } = props

  return (
    <Card>
      <CardContent className='flex flex-wrap justify-between items-start gap-2'>
        <CustomAvatar size={avatarSize} variant='rounded' skin={avatarSkin} color={avatarColor}>
          <i className={classnames(avatarIcon, `text-[${avatarIconSize}px]`)} />
        </CustomAvatar>
        <div className='flex items-center'>
          <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
            {`${trend === 'negative' ? '-' : '+'}${trendNumber}`}
          </Typography>
          <i
            className={classnames(
              'text-lg',
              trend === 'negative' ? 'ri-arrow-down-s-line text-error' : 'ri-arrow-up-s-line text-success'
            )}
          ></i>
        </div>
      </CardContent>
      <CardContent className='flex flex-col items-start gap-4'>
        <div className='flex flex-col flex-wrap gap-1'>
          <Typography variant='h5'>{stats}</Typography>
          <Typography>{title}</Typography>
        </div>
        <Chip size='small' variant='filled' label={chipText} color={chipColor} />
      </CardContent>
    </Card>
  )
}

export default CardStatVertical
