// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => {
  return [
    {
      title: 'Inicio',
      icon: 'mdi:home-outline',
      badgeColor: 'error',
      path: '/start'
    },
    {
      title: 'Painel',
      icon: 'mdi:home-outline',
      badgeColor: 'error',
      path: '/home'
    },
    {
      title: 'Dashboard',
      icon: 'mdi:home-outline',
      badgeColor: 'error',
      path: '/dashboard'
    },
    {
      icon: 'mdi:apps',
      title: 'Recursos & Rotinas',
      children: [
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
        //   auth: true
        // },
      ]
    },
    {
      icon: 'mdi:palette-swatch-outline',
      title: 'Administração',
      children: [
        {
          title: 'Clínica',
          icon: 'mdi:home-city-outline',
          path: '/clinic/account-settings/account',

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
          auth: true,
        }, 

        {
          title: 'CRC',
          icon: 'icon-park-outline:sales-report',
          path: '',
          auth: true,
        },
        {
          title: 'Estoque',
          icon: 'vaadin:stock',
          path: '/stock'
        }
      ]
    },
    {
      icon: 'mdi:file-document-outline',
      title: 'Outros',
      children: [
        {
          title: 'Configurações',
          icon: 'icon-park-outline:setting-config',
          path: '/pages/account-settings/account'
        },

        // {
        //   title: 'Cursos Prime',
        //   icon: 'mdi:storefront-outline',
        //   path: '/apps/invoice/list',
    
        // },
        
        {
          title: 'Como Funciona?',
          icon: 'solar:help-linear',
          path: '/pages/help-center'
        },
        {
          title: 'Contato Vendedor',
          icon: 'mdi:account-tie-outline',
          path: '/apps/invoice/list'
        }

        // {
        //   path: '/acl',
        //   action: 'read',
        //   subject: 'acl-page',
        //   title: 'Access Control',
        //   icon: 'mdi:shield-outline'
        // }
      ]
    }
  ]
}

export default navigation
