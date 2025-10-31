// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

function removeByTitles(items: VerticalNavItemsType, titles: string[]): VerticalNavItemsType {
  return items.filter(item => !('title' in item && titles.includes(item.title)))
}

const navigation = (): VerticalNavItemsType => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')

  const professional = userData?.professional
  const planType = userData?.planType || null

  console.log('Professional:', professional) 
  console.log('PlanType:', planType)         

  const isAdmin = (professional?.isAdmin === true || !professional)
  console.log('IsAdmin:', isAdmin) 

  const isRecepcionista = professional?.specialty === 'recepcionista' && !!professional
  const isProfissional = professional?.specialty !== 'recepcionista' && !!professional


  let items: VerticalNavItemsType = [
    {
      title: 'Início',
      icon: 'mdi:home-outline',
      badgeColor: 'error',
      path: '/start'
    },
    {
      title: 'Painel',
      icon: 'mdi:view-dashboard-outline',
      badgeColor: 'error',
      path: '/home'
    },
    {
      title: 'Dashboard',
      icon: 'mdi:view-dashboard-outline',
      badgeColor: 'error',
      path: '/dashboard'
    },
    {
      sectionTitle: 'Recursos & Rotinas'
    },
    {
      title: 'Paciente',
      icon: 'mdi:account-outline',
      path: '/patient/list'
    },
    {
      title: 'Agenda',
      icon: 'mdi:calendar-blank-outline',
      path: '/calendar'
    },
    {
      title: 'Orçamentos',
      icon: 'mdi:finance',
      path: '/budgets'
    },

    // {
    //   title: 'Marketing',
    //   icon: 'material-symbols:campaign',
    //   path: '/marketing',
    //   auth: true,
    // },
    
    {
      sectionTitle: 'Administração'
    },
    {
      title: 'Clínica',
      icon: 'mdi:home-city-outline',
      path: isAdmin
        ? '/pages/account-settings/account/'
        : '/pages/account-settings/billing/'
    },
    {
      title: 'Contratos',
      icon: 'material-symbols-light:contract',
      path: '/contracts',
      auth: true,
    },
    {
      title: 'Financeiro',
      icon: 'mdi:currency-usd',
      path: '/financial',
      
      auth: true,
    },

    // {
    //   title: 'Clara IA',
    //   icon: 'mdi:message-outline',
    //   path: '/ia-agent/settings/create',
    //   auth: true
    // },

    // {
    //   title: 'Tarefas',
    //   path: '/kanban',
    //   icon: 'mdi:format-list-bulleted-type',
    //   auth: true,
    // },

    {
      title: 'Protético',
      path: '/prosthesis',
      icon: 'mdi:tooth-outline',
      auth: true,
    },

    {
      title: 'Chat CRM',
      icon: 'mdi:message-text-outline',
      path: '/chat/conversation',

      // auth: true,
    }, 
    
    {
      title: 'CRC',
      path: '/crc',
      icon: 'mdi:cash',

      // auth: true,
    },
    {
      title: 'Estoque',
      icon: 'vaadin:stock',
      path: '/stock'
    },
    {
      sectionTitle: 'Outros'
    },

    {
      title: 'Planos',
      icon: 'mdi:storefront-outline',
      path: '/pricing',
    },
    
    {
      title: 'Tutorial',
      icon: 'solar:help-linear',
      path: '/help-center'
    },
    {
      title: 'Suporte',
      icon: 'mdi:account-tie-outline',
      path: '/contact-seller'
    }

    // {
    //   path: '/acl',
    //   action: 'read',
    //   subject: 'acl-page',
    //   title: 'Access Control',
    //   icon: 'mdi:shield-outline'
    // }
  ]

  if (!isAdmin && isRecepcionista) {
    items = removeByTitles(items, ['Financeiro'])
  }

  if (!isAdmin && isProfissional) {
    items = removeByTitles(items, ['Financeiro', 'Chat CRM', 'CRC'])
  }

  if (planType === 'E') {
    items = removeByTitles(items, ['Protético', 'Contratos', 'Chat CRM', 'CRC'])
  }

  return items
}

export default navigation