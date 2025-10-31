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
import BiotechIcon from '@mui/icons-material/Biotech'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

// ** Types
import { PricingPlanType } from 'src/@core/components/plan-details/types'

// ** Demo Tabs Imports
import TabAccount from 'src/views/pages/account-settings/TabAccount'
import TabBilling from 'src/views/pages/account-settings/TabBilling'
import TabSecurity from 'src/views/pages/account-settings/TabSecurity'
import TabConnections from 'src/views/pages/account-settings/TabConnections'
import TabNotifications from 'src/views/pages/account-settings/TabNotifications'
import TabImportPatients from 'src/views/pages/account-settings/TabImportPatients'
import TabTreatment from './tabTreatment/TabTreatment'
import TabConnectWhatsapp from './tabConnectWhatsapp'
import {
  AccountBalanceWalletOutlined,
  Assignment,
  AssignmentOutlined,
  AttachMoneyOutlined,
  Biotech,
  Business,
  Description,
  DescriptionOutlined,
  FileCopySharp,
  HealingOutlined,
  MedicationOutlined,
  WhatsApp
} from '@mui/icons-material'
import TabAnamnese from './TabAnamnese'
import TabContracts from './TabContracts'
import TabMedicines from 'src/views/pages/account-settings/TabMedicines'
import TabExams from './TabExams'

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

const AccountSettings = ({ tab, apiPricingPlanData }: { tab: string; apiPricingPlanData: PricingPlanType[] }) => {
  // ** State
  const [activeTab, setActiveTab] = useState<string>(tab)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ** Hooks
  const router = useRouter()
  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}')

  const isAdminUser = userData?.isAdmin
  const isAdminProfessional = userData?.professional?.isAdmin

  const shouldShowProfessionalTab = isAdminUser || isAdminProfessional || userData?.professional == null

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    router.push(`/pages/account-settings/${value.toLowerCase()}`).then(() => setIsLoading(false))
  }

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const tabContentList: { [key: string]: ReactElement } = {
    account: <TabAccount />,
    security: <TabSecurity />,
    connections: <TabConnections />,
    notifications: <TabNotifications />,
    billing: <TabBilling />,
    treatment: <TabTreatment />,
    anamnese: <TabAnamnese />,
    contracts: <TabContracts />,
    medicines: <TabMedicines />,

    // exams: <TabExams />,
    'connect-whatsapp': <TabConnectWhatsapp />

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
                {shouldShowProfessionalTab && (
                  <Tab
                    value='account'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Business />
                        {!hideText && 'CLÍNICA'}
                      </Box>
                    }
                  />
                )}

                {shouldShowProfessionalTab && (
                  <Tab
                    value='security'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Icon icon='mdi:account-outline' />
                        {!hideText && 'PROFISSIONAL'}
                      </Box>
                    }
                  />
                )}
                <Tab
                  value='billing'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='mdi:bookmark-outline' />
                      {!hideText && 'PLANOS'}
                    </Box>
                  }
                />
                {shouldShowProfessionalTab && (
                  <Tab
                    value='notifications'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <AccountBalanceWalletOutlined />
                        {!hideText && 'BANCOS'}
                      </Box>
                    }
                  />
                )}
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

                <Tab
                  value='treatment'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <HealingOutlined />
                      {!hideText && 'TRATAMENTOS'}
                    </Box>
                  }
                />
                {/* <Tab
                  value='import-patients'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                      <Icon icon='material-symbols:upload' />
                      {!hideText && 'Importar pacientes'}
                    </Box>
                  }
                /> */}

                {shouldShowProfessionalTab && (
                  <Tab
                    value='anamnese'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <AssignmentOutlined />
                        {!hideText && 'Anamneses'}
                      </Box>
                    }
                  />
                )}

                {shouldShowProfessionalTab && (
                  <Tab
                    value='contracts'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <DescriptionOutlined />
                        {!hideText && 'Contratos'}
                      </Box>
                    }
                  />
                )}

                {shouldShowProfessionalTab && (
                  <Tab
                    value='medicines'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <MedicationOutlined />
                        {!hideText && 'MEDICAMENTOS'}
                      </Box>
                    }
                  />
                )}

                {shouldShowProfessionalTab && (
                  <Tab
                    value='connect-whatsapp'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <WhatsApp />
                        {!hideText && 'Conectar Whatsapp'}
                      </Box>
                    }
                  />
                )}

                {/* {shouldShowProfessionalTab && (
                  <Tab
                    value='exams'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Biotech />
                        {!hideText && 'Exames'}
                      </Box>
                    }
                  />
                )} */}
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

export default AccountSettings
