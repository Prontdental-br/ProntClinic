// MUI Imports
import type { AvatarProps } from '@mui/material/Avatar'
import type { ChipProps } from '@mui/material/Chip'
import { CustomAvatarProps } from 'src/@core/components/mui/AvatarCustom'
import { ThemeColor } from 'src/@core/layouts/types'

// Type Imports


export type CardStatsVerticalProps = {
  title: string
  stats: string
  avatarIcon: string
  chipText: string
  chipColor?: ChipProps['color']
  trendNumber: string
  trend?: 'positive' | 'negative'
  avatarColor?: ThemeColor
  avatarIconSize?: number
  avatarSize?: number
  avatarSkin?: CustomAvatarProps['skin']
}

export type CardStatsCharacterProps = {
  stats: string
  title: string
  trendNumber: string
  chipText: string
  src: string
  trend?: 'positive' | 'negative'
  chipColor?: ThemeColor
}

export type CardStatsHorizontalProps = {
  title: string
  stats: string
  avatarIcon: string
  trendNumber: string
  trend?: string
  avatarColor?: ThemeColor
  avatarIconSize?: number
  avatarSize?: number
  avatarSkin?: CustomAvatarProps['skin']
}

export type CardStatsHorizontalWithAvatarProps = {
  stats: string
  title: string
  avatarIcon: string
  avatarColor?: ThemeColor
  avatarVariant?: AvatarProps['variant']
  avatarSkin?: CustomAvatarProps['skin']
  avatarIconSize?: number
  avatarSize?: number
}

export type CardStatsHorizontalWithBorderProps = {
  title: string
  stats: number
  trendNumber: number
  avatarIcon: string
  color?: ThemeColor
}

export type CardStatsCustomerStatsProps = {
  title: string
  avatarIcon: string
  color?: ThemeColor
  description: string
} & (
  | {
      stats?: string
      content?: string
      chipLabel?: never
    }
  | {
      chipLabel?: string
      stats?: never
      content?: never
    }
)

export type CardStatsType = {
  statsVertical: CardStatsVerticalProps[]
  statsCharacter: CardStatsCharacterProps[]
  statsHorizontal: CardStatsHorizontalProps[]
  statsHorizontalWithAvatar: CardStatsHorizontalWithAvatarProps[]
  statsHorizontalWithBorder: CardStatsHorizontalWithBorderProps[]
  customerStats: CardStatsCustomerStatsProps[]
}
