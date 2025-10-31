// ** React Imports
import { ReactNode, useContext } from 'react'

// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Types
import { NavLink } from 'src/@core/layouts/types'

interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  // ** Props
  const { children, navLink } = props

  // ** Hook
  const ability = useContext(AbilityContext);

    // ** Verificar no localStorage se o usuário é um profissional
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const isProfessional = userData.professional;
  
    // Se o título for "Contratos" e o usuário não for um profissional, ocultar
    if (navLink?.title === 'Contratos' && !isProfessional) {
      return null;
    }

  if (navLink && navLink.auth === false) {
    return <>{children}</>
  } else {
    return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null
  }
}

export default CanViewNavLink
