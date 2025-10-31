'use client'


import { useEffect, useState } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem } from '@menu/vertical-menu'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'



type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav();

    const [userData, setUserData] = useState<{ role?: string }>({})

  useEffect(() => {
    const storedData = localStorage.getItem('userData');

    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

 

  const menuItems = [
    { href: "/home", icon: <i className="ri-home-smile-line" />, label: "Home", roles: ["admin", "dev", "seller", "support", ""] },
    { href: "/access", icon: <i className="ri-shield-check-line" />, label: "Controle de Acesso", roles: ["admin", "seller"] },
    { href: "/sales", icon: <i className="ri-bar-chart-2-line" />, label: "Controle de Vendas", roles: ["admin", "seller", "support", "dev"] },
    { href: "/code", icon: <i className="ri-bar-chart-2-line" />, label: "Cupons", roles: ["admin"] },
    { href: "/finance", icon: <i className="ri-money-dollar-box-line" />, label: "Financeiro", roles: ["admin", "finance"] },

    // { href: "/about", icon: <i className="ri-information-line" />, label: "About", roles: ["admin"] },
    { href: "/export", icon: <i className="ri-information-line" />, label: "Base Export", roles: ["admin"] },
    { href: "/import", icon: <i className="ri-information-line" />, label: "Base Import", roles: ["admin"] },
    { href: "/whatsapp", icon: <i className="ri-whatsapp-line" />, label: "WhatsApp", roles: ["admin"] },
    { href: "/clinicorp", icon: <i className="ri-information-line" />, label: "Bkp Clini", roles: ["admin"] },
  ];


  const filteredMenuItems = userData?.role
    ? menuItems.filter(item => item.roles.includes(userData.role as string))
    : []

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className="ri-circle-fill" /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {filteredMenuItems.map(item => (
          <MenuItem key={item.href} href={item.href} icon={item.icon}>
            {item.label}
          </MenuItem>
        ))}
        </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
