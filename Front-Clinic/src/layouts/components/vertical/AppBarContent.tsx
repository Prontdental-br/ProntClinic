// ** MUI Imports
import { Autocomplete, ListItem, ListItemIcon, ListItemText, TextField, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { t } from 'i18next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from 'src/@core/components/api-client'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Type Import
import { Settings } from 'src/@core/context/settingsContext'

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  const [patientResults, setPatientResults] = useState([])
  const [options, setOptions] = useState<any[]>([])

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

  const isUserAdmin = () => {
    return userData?.isAdmin === true || userData?.professional?.isAdmin === true
  }

  const fixedShortcuts = [
    {
      type: 'atalho',
      label: 'Painel',
      description: 'Painel de Controle / Visualizar',
      path: '/home',
      icon: 'mdi:home-outline'
    },
    {
      type: 'atalho',
      label: 'Orçamentos',
      description: 'Orçamentos',
      path: '/budgets',
      icon: 'mdi:file-document-outline'
    },
    {
      type: 'atalho',
      label: 'Agenda',
      description: 'Agenda / Visualizar',
      path: '/calendar',
      icon: 'mdi:calendar-month-outline'
    }
  ]
 

  const dynamicShortcuts = [
    {
      type: 'atalho',
      label: 'Novo Paciente',
      description: 'Cadastros / Novo Paciente',
      path: '/patients/list',
      icon: 'mdi:account-plus-outline'
    },
    { 
      type: 'atalho',
      label: 'Profissionais', 
      path: '/pages/account-settings/security', 
      icon: 'mdi:account-group-outline',
      description: 'Mostrar/Cadastrar profissionais' 
    },
    { 
      type: 'atalho', 
      label: 'Tratamentos', 
      path: '/pages/account-settings/treatment', 
      icon: 'mdi:medical-bag', 
      description: 'Cadastros / Novo Paciente',
    },
    { 
      type: 'atalho',
      label: 'Banco', 
      path: '/pages/account-settings/notifications', 
      icon: 'mdi:bank-outline',
      description: 'Cadastros / Novo Paciente',
      adminOnly: true
    },
    {
      type: 'atalho',
      label: 'Agenda',
      description: 'Agenda / Visualizar',
      path: '/calendar',
      icon: 'mdi:calendar-month-outline'
    },

    { 
      type: 'atalho',
      label: 'WhatsApp', 
      path: '/pages/account-settings/connect-whatsapp', 
      icon: 'mdi:whatsapp',
      adminOnly: true
    },

    { 
      type: 'atalho',
      label: 'Planos', 
      path: '/pages/account-settings/billing', 
      icon: 'mdi:clipboard-list-outline'
    },

    { 
      type: 'atalho',
      label: 'Financeiro', 
      path: '/financial', 
      icon: 'mdi:currency-usd', 
      adminOnly: true 
    },

    { 
      label: 'Tarefas', 
      path: '/kanban', 
      icon: 'mdi:clipboard-text-outline', 
      adminOnly: true 
    },

    { 
      label: 'Contratos', 
      path: '/contracts',
      icon: 'mdi:file-document-edit-outline',
      adminOnly: true,
    },

    { 
      label: 'CRC',
      description: 'CRC / Visualizar',
      path: '/crc', 
      icon: 'mdi:chart-line',
      adminOnly: true,
    },

    { 
      label: 'Chat CRM',
      description: 'Chat CRM / Visualizar',
      path: '/chat/conversation/', 
      icon: 'mdi:message-text-outline',
      adminOnly: true,
    },

    { 
      label: 'Estoques', 
      path: '/stocks', 
      icon: 'mdi:warehouse',
      adminOnly: true,
      description: 'Estoques / Visualizar'
    },

    { 
      label: 'Protético', 
      path: '/prosthesis',
      adminOnly: true,
      icon: 'mdi:tooth-outline',
      description: 'Protéticos / Visualizar'
    }
  ]
  
  const filteredShortcuts = dynamicShortcuts.filter(item => {
    if (item.adminOnly && !isUserAdmin()) return false

    return inputValue.length > 0 && item.label.toLowerCase().includes(inputValue.toLowerCase())
  })

  const displayedShortcuts = [...fixedShortcuts, ...filteredShortcuts]

  useEffect(() => {
    const fetchPatients = async () => {
      if (inputValue.length === 0) return setPatientResults([])
  
      try {
        const response = await api.get(`/patients/search?query=${inputValue}`)
        const transformed = response.data.map((patient: any) => ({
          type: 'paciente',
          label: patient.name,
          description: patient.cellPhone || 'Sem telefone',
          icon: 'mdi:account-outline',
          path: `/patient/view/about/${patient.id}`
        }))
  
        setPatientResults(transformed)
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error)
      }
    }
  
    const delayDebounce = setTimeout(fetchPatients, 300)

    return () => clearTimeout(delayDebounce)
  }, [inputValue])

  useEffect(() => {
    setOptions([...patientResults, ...displayedShortcuts])
  }, [patientResults])


  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
      {hidden ? (
        <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
          <Icon icon='mdi:menu' />
        </IconButton>
      ) : null}

      <ModeToggler settings={settings} saveSettings={saveSettings} />
    </Box>

    <Box sx={{ flexGrow: 1, maxWidth: 500, mx: 'auto' }}>
      <Autocomplete
        fullWidth
        freeSolo
        options={options}
        groupBy={(option) => option.type === 'atalho' ? 'ATALHOS DO SISTEMA' : 'PACIENTES'}
        getOptionLabel={(option: any) => option.label || ''}
        onChange={(event, newValue: any) => {
          if (!newValue) return

          if (newValue.path) {
            router.push(newValue.path)
          } else if (newValue.type === 'paciente') {
            router.push(`/pacientes/${newValue.id}`)
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        renderInput={(params) => (
          <TextField {...params} placeholder='Encontre pacientes ou funcionalidades do sistema' size='small' variant='outlined' />
        )}
        renderOption={(props, option) => (
          <ListItem {...props} key={option.label + option.type} sx={{ px: 2, py: 1.5, alignItems: 'flex-start' }}>
            {option.icon && (
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon icon={option.icon} fontSize={20} />
              </ListItemIcon>
            )}
            <ListItemText
              primary={<Typography variant='body1'>{option.label}</Typography>}
              secondary={
                option.description ? (
                  <Typography variant='caption' color='text.secondary'>{option.description}</Typography>
                ) : option.type === 'paciente' ? (
                  <Typography variant='caption' color='text.secondary'>Paciente</Typography>
                ) : null
              }
            />
          </ListItem>
        )}
      />
    </Box>

    <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
      <UserDropdown settings={settings} />
    </Box>
  </Box>
  )
}

export default AppBarContent
