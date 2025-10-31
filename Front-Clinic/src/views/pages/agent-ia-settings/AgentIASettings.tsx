// ** React Imports
import { ReactElement, useState, useEffect, SyntheticEvent } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { styled, Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import CircularProgress from '@mui/material/CircularProgress'
import TabBehavior from './TabBehavior'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Demo Tabs Imports
import TabBilling from 'src/views/pages/account-settings/TabBilling'

import TabConnections from 'src/views/pages/account-settings/TabConnections'
import TabNotifications from 'src/views/pages/account-settings/TabNotifications'

import TabCreateAgent from './TabCreateAgent'
import TabYourBusiness from './TabYourBusiness'
import { TabConnectAgent } from './TabConnectAgent'
import TabTopics from './TabTopics'


const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: {
      minWidth: 130
    }
  }
}))

const AgentIASettings = ({ tab }: { tab: string;  }) => {
  // ** State
  const [activeTab, setActiveTab] = useState<string>(tab)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ** Hooks
  const router = useRouter()
  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    router.push(`/ia-agent/settings/${value.toLowerCase()}`).then(() => setIsLoading(false))
  }

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const tabContentList: { [key: string]: ReactElement } = {
    create: <TabCreateAgent />,
    business: <TabYourBusiness />,
    connections: <TabConnections />,
    notifications: <TabNotifications />,
    topics: <TabTopics />,
    behavior: <TabBehavior />,
    billing: <TabBilling />,

    // treatment: <TabTreatment />,
    // 'connect-whatsapp': <TabConnectWhatsapp />,
    'connect-whatsapp': <TabConnectAgent />,

    // 'import-patients': <TabImportPatients />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TabList
                variant='scrollable'
                scrollButtons='auto'
                onChange={handleChange}
                aria-label='customized tabs example'
              >
                <Tab
                  value='create'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:face-agent' />
                      {!hideText && 'Criar Agente'}
                    </Box>
                  }
                />
                <Tab
                  value='business'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:handshake-outline' />
                      {!hideText && 'Seu negócio'}
                    </Box>
                  }
                />
                <Tab
                  value='topics'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:clipboard-list-outline' />
                      {!hideText && 'Tópicos'}
                    </Box>
                  }
                />
                <Tab
                  value='behavior'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:account-group-outline' />
                      {!hideText && 'Comportamento'}
                    </Box>
                  }
                />
                {/* <Tab
                  hidden={true}
                  value='connections'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:link-variant' />
                      {!hideText && 'CADEIRAS'}
                    </Box>
                  }
                /> */}

                {/* <Tab
                  value='treatment'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:link-variant' />
                      {!hideText && 'TRATAMENTOS'}
                    </Box>
                  }
                /> */}
                {/* <Tab
                  value='import-patients'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='material-symbols:upload' />
                      {!hideText && 'Importar pacientes'}
                    </Box>
                  }
                /> */}
                {userData?.planType !== "S" && (
                    <Tab
                      value='connect-whatsapp'
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                          <Icon icon='mdi:whatsapp' />
                          {!hideText && 'Conectar Agente'}
                        </Box>
                       }
                    />
                )}
               
              </TabList>
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <CircularProgress sx={{ mb: 4 }} />
                  <Typography>Loading...</Typography>
                </Box>
              ) : (
                <TabPanel sx={{ p: 0 }} value={activeTab}>
                  {tabContentList[activeTab]}
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </TabContext>
      </Grid>
    </Grid>
  )
}

export default AgentIASettings