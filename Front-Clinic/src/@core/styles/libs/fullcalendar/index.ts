// ** MUI imports
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

// ** Hooks Imports
import useBgColor, { UseBgColorType } from 'src/@core/hooks/useBgColor'

// ** utilities
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const CalendarWrapper = styled(Box)<BoxProps>(({ theme }) => {
  // ** Hook
  const bgColors: UseBgColorType = useBgColor()

  return {
    display: 'flex',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    '& .fc': {
      zIndex: 1,

      '.fc-col-header, .fc-daygrid-body, .fc-scrollgrid-sync-table, .fc-timegrid-body, .fc-timegrid-body table': {
        width: '100% !important'
      },

      // ** Toolbar
      '& .fc-toolbar': {
        flexWrap: 'wrap',
        flexDirection: 'row !important',
        '&.fc-header-toolbar': {
          marginBottom: theme.spacing(3.75)
        },
        '.fc-prev-button, & .fc-next-button': {
          display: 'inline-block',
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          '& .fc-icon': {
            color: theme.palette.text.primary,
            fontSize: theme.typography.h4.fontSize
          },
          '&:hover, &:active, &:focus': {
            boxShadow: 'none !important',
            borderColor: 'transparent !important',
            backgroundColor: 'transparent !important'
          }
        },
        '& .fc-prev-button': {
          paddingLeft: '0 !important'
        },
        '& .fc-toolbar-chunk:first-of-type': {
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          [theme.breakpoints.down('md')]: {
            '& div:first-of-type': {
              display: 'flex',
              alignItems: 'center'
            }
          }
        },
        '& .fc-button': {
          padding: theme.spacing(),
          '&:active, .&:focus': {
            boxShadow: 'none'
          }
        },
        '& .fc-button-group': {
          '& .fc-button': {
            textTransform: 'capitalize',
            '&:focus': {
              boxShadow: 'none'
            }
          },
          '& .fc-button-primary': {
            fontWeight: 500,
            fontSize: '.875rem',
            letterSpacing: '.4px',
            textTransform: 'uppercase',

            '&:not(.fc-prev-button):not(.fc-next-button)': {
              backgroundColor: 'transparent',
              padding: theme.spacing(1.5, 5.08),
              color: theme.palette.primary.main,
              borderColor: hexToRGBA(theme.palette.primary.main, 0.5),
              '&.fc-button-active, &:hover': {
                borderColor: hexToRGBA(theme.palette.primary.main, 0.5),
                backgroundColor: hexToRGBA(theme.palette.primary.main, 0.05)
              }
            }
          },
          '& .fc-sidebarToggle-button': {
            border: 0,
            lineHeight: 0.8,
            borderColor: 'transparent',
            paddingBottom: '0 !important',
            backgroundColor: 'transparent',
            marginLeft: `${theme.spacing(-2)} !important`,
            padding: `${theme.spacing(1.275, 2)} !important`,
            color: `${theme.palette.text.primary} !important`,
            '&:focus': {
              outline: 0,
              boxShadow: 'none'
            },
            '&:not(.fc-prev-button):not(.fc-next-button):hover': {
              backgroundColor: 'transparent !important'
            },
            '& + div': {
              marginLeft: 0
            }
          },
          '.fc-dayGridMonth-button, .fc-timeGridWeek-button, .fc-timeGridDay-button, & .fc-listMonth-button': {
            padding: theme.spacing(2.2, 6),

            '&:last-of-type, &:first-of-type': {
              borderRadius: theme.shape.borderRadius
            },
            '&:first-of-type': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0
            },
            '&:last-of-type': {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0
            }
          }
        },
        '& > * > :not(:first-of-type)': {
          marginLeft: 0
        },
        '& .fc-toolbar-title': {
          fontWeight: 500,
          lineHeight: '2rem',
          marginRight: theme.spacing(4),
          marginLeft: theme.spacing(2.5),
          fontSize: theme.typography.h5.fontSize
        },
        '.fc-button:empty:not(.fc-sidebarToggle-button), & .fc-toolbar-chunk:empty': {
          display: 'none'
        }
      },

      // ** Calendar head & body common
      '& tbody td, & thead th': {
        borderColor: theme.palette.divider,
        '&.fc-col-header-cell': {
          borderLeft: 0,
          borderRight: 0
        },
        '&[role="presentation"]': {
          borderRightWidth: 0
        }
      },

      // ** Event Colors
      '& .fc-event': {
        borderRadius: 4,
        '&:not(.fc-list-event)': {
          '&.bg-primary': {
            borderColor: 'transparent',
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.primary.contrastText, 
            }
          },
          '&.bg-success': {
            borderColor: 'transparent',
            color: theme.palette.success.main,
            backgroundColor: theme.palette.success.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.success.contrastText
            }
          },
          '&.bg-error': {
            borderColor: 'transparent',
            color: theme.palette.error.main,
            backgroundColor: theme.palette.error.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.error.contrastText
            }
          },
          '&.bg-warning': {
            borderColor: 'transparent',
            color: theme.palette.warning.main,
            backgroundColor: theme.palette.warning.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.warning.contrastText
            }
          },
          '&.bg-info': {
            borderColor: 'transparent',
            color: theme.palette.info.main,
            backgroundColor: theme.palette.info.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.info.contrastText
            }
          },
          '&.bg-orange': {
            borderColor: 'transparent',
            color: theme.palette.orange.contrastText, 
            backgroundColor: theme.palette.orange.main, 
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.orange.contrastText, 
            },
          },

          '&.bg-bic': {
            borderColor: 'transparent',
            color: theme.palette.bic.contrastText, 
            backgroundColor: theme.palette.bic.main, 
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.bic.contrastText, 
            },
          },

           '&.bg-purple': {
            borderColor: 'transparent',
            color: theme.palette.purple.contrastText, 
            backgroundColor: theme.palette.purple.main, 
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.purple.contrastText, 
            },
          },

          '&.bg-turquoise': {
            borderColor: 'transparent',
            color: theme.palette.turquoise.contrastText,
            backgroundColor: theme.palette.turquoise.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.turquoise.contrastText,
            },
          },
          '&.bg-lightYellow': {
            borderColor: 'transparent',
            color: theme.palette.lightYellow.contrastText,
            backgroundColor: theme.palette.lightYellow.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.lightYellow.contrastText,
            },
          },
          '&.bg-skyBlue': {
            borderColor: 'transparent',
            color: theme.palette.skyBlue.contrastText,
            backgroundColor: theme.palette.skyBlue.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.skyBlue.contrastText,
            },
          },
          '&.bg-lavender': {
            borderColor: 'transparent',
            color: theme.palette.lavender.contrastText,
            backgroundColor: theme.palette.lavender.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.lavender.contrastText,
            },
          },
          '&.bg-taupe': {
            borderColor: 'transparent',
            color: theme.palette.taupe.contrastText,
            backgroundColor: theme.palette.taupe.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.taupe.contrastText,
            },
          },
          '&.bg-periwinkle': {
            borderColor: 'transparent',
            color: theme.palette.periwinkle.contrastText,
            backgroundColor: theme.palette.periwinkle.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.periwinkle.contrastText,
            },
          },
          '&.bg-salmon': {
            borderColor: 'transparent',
            color: theme.palette.salmon.contrastText,
            backgroundColor: theme.palette.salmon.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.salmon.contrastText,
            },
          },
          '&.bg-rose': {
            borderColor: 'transparent',
            color: theme.palette.rose.contrastText,
            backgroundColor: theme.palette.rose.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.rose.contrastText,
            },
          },
          '&.bg-lime': {
            borderColor: 'transparent',
            color: theme.palette.lime.contrastText,
            backgroundColor: theme.palette.lime.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.lime.contrastText,
            },
          },
          '&.bg-orangeMedium': {
            borderColor: 'transparent',
            color: theme.palette.orangeMedium.contrastText,
            backgroundColor: theme.palette.orangeMedium.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.orangeMedium.contrastText,
            },
          },
          '&.bg-dustyRose': {
            borderColor: 'transparent',
            color: theme.palette.dustyRose.contrastText,
            backgroundColor: theme.palette.dustyRose.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.dustyRose.contrastText,
            },
          },
          '&.bg-cyan': {
            borderColor: 'transparent',
            color: theme.palette.cyan.contrastText,
            backgroundColor: theme.palette.cyan.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.cyan.contrastText,
            },
          },
          '&.bg-steelBlue': {
            borderColor: 'transparent',
            color: theme.palette.steelBlue.contrastText,
            backgroundColor: theme.palette.steelBlue.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.steelBlue.contrastText,
            },
          },
          '&.bg-tealDark': {
            borderColor: 'transparent',
            color: theme.palette.tealDark.contrastText,
            backgroundColor: theme.palette.tealDark.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.tealDark.contrastText,
            },
          },
          '&.bg-grayDark': {
            borderColor: 'transparent',
            color: theme.palette.grayDark.contrastText,
            backgroundColor: theme.palette.grayDark.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.grayDark.contrastText,
            },
          },
          '&.bg-neonGreen': {
            borderColor: 'transparent',
            color: theme.palette.neonGreen.contrastText,
            backgroundColor: theme.palette.neonGreen.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.neonGreen.contrastText,
            },
          },
          '&.bg-khakiDark': {
            borderColor: 'transparent',
            color: theme.palette.khakiDark.contrastText,
            backgroundColor: theme.palette.khakiDark.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.khakiDark.contrastText,
            },
          },
          '&.bg-purpleDeep': {
            borderColor: 'transparent',
            color: theme.palette.purpleDeep.contrastText,
            backgroundColor: theme.palette.purpleDeep.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.purpleDeep.contrastText,
            },
          },
          '&.bg-coral': {
            borderColor: 'transparent',
            color: theme.palette.coral.contrastText,
            backgroundColor: theme.palette.coral.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.coral.contrastText,
            },
          },
          '&.bg-fuchsia': {
            borderColor: 'transparent',
            color: theme.palette.fuchsia.contrastText,
            backgroundColor: theme.palette.fuchsia.main,
            '& .fc-event-title, & .fc-event-time': {
              color: theme.palette.fuchsia.contrastText,
            },
          },


        },
        '&.bg-primary': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.primary.light, 1)
          }
        },
        '&.bg-success': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.success.main,
            backgroundColor: theme.palette.success.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.success.light, 1)
          }
        },
        '&.bg-error': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.error.light, 1)
          }
        },
        '&.bg-warning': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.warning.main,
            backgroundColor: theme.palette.warning.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.warning.light, 1)
          }
        },
        '&.bg-info': {
          '& .fc-list-event-dot': {
            borderColor: theme.palette.info.main,
            backgroundColor: theme.palette.info.main
          },
          '&:hover td': {
            backgroundColor: hexToRGBA(theme.palette.info.light, 1)
          }
        },
       '&.fc-daygrid-event': {
  marginLeft: '2px',
  marginRight: '0px', // evita empurrar para cima o evento seguinte
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 1
},
'& .fc-daygrid-event-harness:not(:last-of-type)': {
  '& .fc-event': {
    boxShadow: 'inset -2px 0 0 rgba(255, 255, 255, 0.9)' // cria uma separação clara entre os eventos
  }
}
      },

      '& .fc-view-harness': {
        minHeight: '650px',
        margin: theme.spacing(0, -5.25),
        width: `calc(100% + ${theme.spacing(5.25 * 2)})`
      },

      // ** Calendar Head
      '& .fc-col-header': {
        '& .fc-col-header-cell': {
          fontWeight: 600,
          fontSize: '.875rem',
          letterSpacing: '.15px',
          color: theme.palette.text.primary,
          '& .fc-col-header-cell-cushion': {
            padding: theme.spacing(2),
            textDecoration: 'none !important'
          }
        }
      },

      // ** Daygrid
      '& .fc-scrollgrid-section-liquid > td': {
        borderBottom: 0
      },
      '& .fc-daygrid-event-harness': {
        lineHeight: 1.25,
        '& .fc-event': {
          fontWeight: 500,
          fontSize: '0.75rem',
          padding: theme.spacing(0, 1),
          '& .fc-event-time': {
            fontWeight: 500
          }
        },
        '&:not(:last-of-type)': {
          marginBottom: theme.spacing(1.2)
        }
      },
      '& .fc-daygrid-day-bottom': {
        marginTop: theme.spacing(1.2)
      },
      '& .fc-daygrid-day': {
        padding: '5px',
        '& .fc-daygrid-day-top': {
          flexDirection: 'row'
        },
        '&.fc-day-other': {
          '& .fc-daygrid-day-top': {
            opacity: 1,
            '& .fc-daygrid-day-number': {
              color: `${theme.palette.text.disabled} !important`
            }
          }
        },
        '&.fc-day-past:not(.fc-day-other)': {
          '& .fc-daygrid-day-number': {
            color: `${theme.palette.text.secondary} !important`
          }
        }
      },
      '& .fc-scrollgrid': {
        borderColor: theme.palette.divider
      },
      '& .fc-day-past, & .fc-day-future': {
        '&.fc-daygrid-day-number': {
          color: theme.palette.text.disabled
        }
      },

      // ** All Views Event
      '& .fc-daygrid-day-number': {
        fontSize: '1rem',
        paddingTop: 0,
        paddingLeft: theme.spacing(2)
      },
      '& .fc-daygrid-day-number, & .fc-timegrid-slot-label-cushion, & .fc-list-event-time': {
        textDecoration: 'none !important',
        color: `${theme.palette.text.primary} !important`
      },
      '& .fc-day-today:not(.fc-popover)': {
        '&:not(.fc-col-header-cell)': {
          background: `${theme.palette.background.default} !important`,
          backgroundColor: theme.palette.primary.light, // tom bem clarinho
        }
      },

      // ** WeekView
      '& .fc-timegrid': {
        '& .fc-scrollgrid-section': {
          '& .fc-col-header-cell, & .fc-timegrid-axis': {
            borderLeft: 0,
            borderRight: 0,
            borderColor: theme.palette.divider
          },
          '& .fc-timegrid-axis': {
            borderColor: theme.palette.divider
          }
        },
        '& .fc-timegrid-axis': {
          '&.fc-scrollgrid-shrink': {
            '& .fc-timegrid-axis-cushion': {
              fontSize: '.75rem',
              lineHeight: '15px',
              letterSpacing: '0.4px',
              textTransform: 'capitalize',
              color: theme.palette.text.disabled
            }
          }
        },
        '& .fc-timegrid-slots': {
          '& .fc-timegrid-slot': {
            height: '3rem',
            borderColor: theme.palette.divider,
            '&.fc-timegrid-slot-label': {
              borderRight: 0
            },
            '&.fc-timegrid-slot-lane': {
              borderLeft: 0
            },
            '& .fc-timegrid-slot-label-frame': {
              textAlign: 'center',
              '& .fc-timegrid-slot-label-cushion': {
                fontSize: '.75rem',
                lineHeight: '15px',
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              }
            }
          }
        },
        '& .fc-timegrid-divider': {
          display: 'none'
        },
        '& .fc-timegrid-event': {
          borderRadius: 0,
          boxShadow: 'none',
          paddingTop: theme.spacing(2),
          paddingLeft: theme.spacing(2),
          '& .fc-event-time': {
            marginBottom: '2px'
          },
          '& .fc-event-time, & .fc-event-title': {
            fontSize: '.75rem',
            lineHeight: '15px',
            letterSpacing: '0.4px'
          }
        }
      },

      // ** List View
      '& .fc-list': {
        border: 'none',
        '& th[colspan="3"]': {
          position: 'relative'
        },
        '& .fc-list-day-cushion': {
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          background: theme.palette.background.default,
          '& .fc-list-day-text, & .fc-list-day-side-text': {
            fontWeight: 600
          }
        },
        '.fc-list-event': {
          cursor: 'pointer',
          '&:hover': {
            '& td': {
              backgroundColor: theme.palette.action.hover
            }
          },
          '& td': {
            borderColor: theme.palette.divider
          }
        },
        '& .fc-list-day': {
          backgroundColor: theme.palette.customColors.lightBg,

          '& .fc-list-day-text, & .fc-list-day-side-text': {
            fontSize: '.875rem',
            textDecoration: 'none'
          },

          '&  >  *': {
            background: 'none',
            borderColor: theme.palette.divider
          }
        },
        '& .fc-list-event-title': {
          fontSize: '.875rem',
          verticalAlign: 'middle',
          paddingLeft: theme.spacing(2.5),
          color: theme.palette.text.secondary
        },
        '& .fc-list-event-time': {
          fontSize: '.875rem',
          paddingLeft: theme.spacing(4),
          color: `${theme.palette.text.secondary} !important`
        }
      },

      // ** Popover
      '& .fc-popover': {
        zIndex: 20,
        boxShadow: 1,
        borderColor: theme.palette.divider,
        background: theme.palette.background.paper,
        '& .fc-popover-header': {
          padding: theme.spacing(2),
          background: theme.palette.action.hover,
          '& .fc-popover-title, & .fc-popover-close': {
            color: theme.palette.text.primary
          }
        },
        '& .fc-popover-body': {
          '& *:not(.fc-event-main):not(:last-of-type)': {
            marginBottom: theme.spacing(1.2)
          }
        }
      },

      // ** Media Queries
      [theme.breakpoints.up('md')]: {
        '& .fc-sidebarToggle-button': {
          display: 'none'
        },
        '& .fc-toolbar-title': {
          marginLeft: 0
        }
      },
      '@media (max-width:610px)': {
        '& .fc-header-toolbar .fc-toolbar-chunk:last-of-type': {
          marginTop: theme.spacing(4)
        }
      }
    }
  }
})

export default CalendarWrapper
