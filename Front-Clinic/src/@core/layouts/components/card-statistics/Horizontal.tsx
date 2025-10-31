// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'
import CustomAvatar from 'src/@core/components/mui/AvatarCustom'
import { CardStatsHorizontalProps } from 'src/types/apps/widgetTypes'

// Types Imports


// Components Imports


const CardStatHorizontal = (props: CardStatsHorizontalProps) => {
  // Props
  const { title, stats, avatarIcon, avatarIconSize, avatarColor, trendNumber, trend, avatarSkin, avatarSize } = props

  return (
    <Card>
      <CardContent className='flex flex-wrap items-center gap-4'>
        <CustomAvatar size={avatarSize} variant='rounded' skin={avatarSkin} color={avatarColor}>
          <i className={classnames(avatarIcon, `text-[${avatarIconSize}px]`)} />
        </CustomAvatar>
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <Typography variant='h5'>{stats}</Typography>
            <div className='flex items-center'>
              <i
                className={classnames(
                  'text-xl',
                  trend === 'up' ? 'ri-arrow-up-s-line text-success' : 'ri-arrow-down-s-line text-error'
                )}
              ></i>
              <Typography variant='body2' color={trend === 'up' ? 'success.main' : 'error.main'}>
                {trendNumber}
              </Typography>
            </div>
          </div>
          <Typography>{title}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatHorizontal
