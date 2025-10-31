// ** Type Imports
import { Palette } from '@mui/material'
import { Skin } from 'src/@core/layouts/types'

const DefaultPalette = (mode: Palette['mode'], skin: Skin): Palette => {
  // ** Vars
  const whiteColor = '#FFF'
  const lightColor = '76, 78, 100'
  const darkColor = '234, 234, 255'
  const mainColor = mode === 'light' ? lightColor : darkColor

  const defaultBgColor = () => {
    if (skin === 'bordered' && mode === 'light') {
      return whiteColor
    } else if (skin === 'bordered' && mode === 'dark') {
      return '#30334E'
    } else if (mode === 'light') {
      return '#f9f9fa'
    } else return '#282A42'
  }

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      darkBg: '#282A42',
      lightBg: '#F7F7F9',
      bodyBg: mode === 'light' ? '#F7F7F9' : '#282A42',
      trackBg: mode === 'light' ? '#F2F2F4' : '#41435C',
      avatarBg: mode === 'light' ? '#F1F1F3' : '#3F425C',
      tooltipBg: mode === 'light' ? '#262732' : '#464A65',
      tableHeaderBg: mode === 'light' ? '#F5F5F7' : '#3A3E5B'
    },
    mode: mode,
    common: {
      black: '#000',
      white: whiteColor
    },
    primary: {
      light: '#911bc4ff',
      main: '#8B18BB',
      dark: '#7f18acff',
      contrastText: whiteColor
    },
    secondary: {
      light: '#7F889B',
      main: '#6D788D',
      dark: '#606A7C',
      contrastText: whiteColor
    },
    error: {
      light: '#FF625F',
      main: '#FF4D49',
      dark: '#E04440',
      contrastText: whiteColor
    },
    warning: {
      light: '#FDBE42',
      main: '#FDB528',
      dark: '#DF9F23',
      contrastText: whiteColor
    },
    info: {
      light: '#40CDFA',
      main: '#26C6F9',
      dark: '#21AEDB',
      contrastText: whiteColor
    },
    success: {
      light: '#83E542',
      main: '#72E128',
      dark: '#64C623',
      contrastText: whiteColor
    },

    orange: {
      light: '#FFB547',
      main: '#ff7300',
      dark: '#DE8F1F',
      contrastText: whiteColor
    },

    bic: {
      light: '#005BAC',
      main: '#005BAC',
      dark: '#005BAC',
      contrastText: whiteColor
    },

    purple: {
      light: '#830979ff',
      main: '#830979ff',
      dark: '#830979ff',
      contrastText: whiteColor
    },

    turquoise: {
      light: '#C8E6E4',
      main: '#B2DFDB',
      dark: '#8CBFBC',
      contrastText: whiteColor
    },
    lightYellow: {
      light: '#FFFBE6',
      main: '#FFF9C4',
      dark: '#FFEF9A',
      contrastText: whiteColor
    },
    skyBlue: {
      light: '#D2E7FB',
      main: '#BBDEFB',
      dark: '#90CAF9',
      contrastText: whiteColor
    },
    lavender: {
      light: '#EED8EF',
      main: '#E1BEE7',
      dark: '#BA9CC4',
      contrastText: whiteColor
    },
    taupe: {
      light: '#D2C4BC',
      main: '#BCAAA4',
      dark: '#9F8C86',
      contrastText: whiteColor
    },
    periwinkle: {
      light: '#D5DAF3',
      main: '#C5CAE9',
      dark: '#9FA8DA',
      contrastText: whiteColor
    },
    salmon: {
      light: '#FFCCBC',
      main: '#FFAB91',
      dark: '#FF8A65',
      contrastText: whiteColor
    },
    rose: {
      light: '#FFE2E4',
      main: '#FFCDD2',
      dark: '#EF9A9A',
      contrastText: whiteColor
    },
    lime: {
      light: '#C5E1A5',
      main: '#AED581',
      dark: '#9CCC65',
      contrastText: whiteColor
    },
    orangeMedium: {
      light: '#FFCC80',
      main: '#FFB74D',
      dark: '#FFA726',
      contrastText: whiteColor
    },
    dustyRose: {
      light: '#D9A3A3',
      main: '#CA8686',
      dark: '#B36C6C',
      contrastText: whiteColor
    },
    cyan: {
      light: '#66FFFF',
      main: '#00FFFF',
      dark: '#00CCCC',
      contrastText: whiteColor
    },
    steelBlue: {
      light: '#BDBDD0',
      main: '#A1A1B9',
      dark: '#8787A0',
      contrastText: whiteColor
    },
    tealDark: {
      light: '#33A1A1',
      main: '#008B8B',
      dark: '#006666',
      contrastText: whiteColor
    },
    grayDark: {
      light: '#BEBEBE',
      main: '#A9A9A9',
      dark: '#8C8C8C',
      contrastText: whiteColor
    },
    neonGreen: {
      light: '#4DF74D',
      main: '#03F103',
      dark: '#03C103',
      contrastText: whiteColor
    },
    khakiDark: {
      light: '#D9D181',
      main: '#BDB76B',
      dark: '#A89E5E',
      contrastText: whiteColor
    },
    purpleDeep: {
      light: '#A34CA3',
      main: '#8B008B',
      dark: '#6A006A',
      contrastText: whiteColor
    },
    coral: {
      light: '#F1B7A4',
      main: '#E9967A',
      dark: '#D17D60',
      contrastText: whiteColor
    },
    fuchsia: {
      light: '#FF66FF',
      main: '#FF00FF',
      dark: '#CC00CC',
      contrastText: whiteColor
    },

    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#F5F5F5',
      A200: '#EEEEEE',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: `rgba(${mainColor}, 0.87)`,
      secondary: `rgba(${mainColor}, 0.6)`,
      disabled: `rgba(${mainColor}, 0.38)`
    },
    divider: `rgba(${mainColor}, 0.12)`,
    background: {
      paper: mode === 'light' ? whiteColor : '#30334E',
      default: defaultBgColor()
    },
    action: {
      active: `rgba(${mainColor}, 0.54)`,
      hover: 'rgba(139, 24, 187, 0.15)',
      hoverOpacity: 0.1,
      selected: `rgba(8, 122, 100, 0.2)`, // Verde um pouco mais forte
      disabled: `rgba(${mainColor}, 0.26)`,
      disabledBackground: `rgba(${mainColor}, 0.12)`,
      focus: `rgba(${mainColor}, 0.12)`
    }
  } as Palette
}

export default DefaultPalette
