'use client'

// MODIFICAÇÃO DE TELAS PACIENTES
// ** React Imports
import { SyntheticEvent, useState, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiTab, { TabProps } from '@mui/material/Tab'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Demo Components Imports
import UserViewOverview from 'src/views/apps/user/view/UserViewOverview'

// ** Types
import { InvoiceType } from 'src/types/apps/invoiceTypes'
import UsersTreatments from './UsersTreatments'
import UserViewBudget from './UserViewBudget'
import {
  PacientBudgetDataType,
  PacientDebitDataType,
  PatientBudgetTreatmentsDataType,
  PatientDataType,
  PatientTreatmentsDataType
} from 'src/types/apps/userTypes'
import UserViewAnamnese from './UserViewAnamnese'
import UserViewDebts from './UserViewDebts'
import CustomUserFiles from 'src/views/components/CustomUserFiles'

import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { BudgetType } from 'src/types/apps/budgetTypes'
import { getPatientBudgets } from 'src/store/apps/patient'
import api from 'src/@core/components/api-client'
import dayjs from 'dayjs'
import { Assignment, AssignmentOutlined, HealingOutlined } from '@mui/icons-material'

interface Props {
  id: string
  tab: string
  dataPatient: PatientDataType
  exam_type?: string
  refreshPatient: () => void
}

const statusLabels: any = {
  'A': 'ABERTO',
  'P': 'PAGO',
}

/*
const patientDebitsData: PacientDebitDataType[] = [
  {
    id: 1,
    date: '03/07/2023',
    description: 'Plano Tratamento de Daisy Patterson',
    total: 585.0,
    status: 'ABERTO'
  },
  {
    id: 2,
    date: '03/07/2023',
    description: 'Plano Tratamento de Daisy Patterson',
    total: 260.0,
    status: 'PAGO'
  },
  {
    id: 3,
    date: '03/07/2023',
    description: 'Plano Tratamento de Daisy Patterson',
    total: 155.0,
    status: 'PAGO'
  },
  {
    id: 4,
    date: '03/07/2023',
    description: 'Plano Tratamento de Daisy Patterson',
    total: 410.0,
    status: 'CANCELADO'
  }
]
*/

// ** Styled Tab component
const Tab = styled(MuiTab)<TabProps>(({ theme }) => ({
  minHeight: 48,
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1)
  }
}))

const UserViewRight = ({ id, tab, dataPatient, exam_type, refreshPatient }: Props) => {
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.odontogram)
  const patientStore = useSelector((state: RootState) => state.patient)

  // ** State
  const [activeTab, setActiveTab] = useState<string>(`${tab}/${id}`)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [patientTreatmentsData, setPatientTreatmentsData] = useState<any[]>([])
  const [patientDebitsData, setPatientDebitsData] = useState<any[]>([])
  const [patientBudgets, setPatientBudgets] = useState<BudgetType[]>([]);

  // ** Hooks
  const router = useRouter()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true)
    setActiveTab(value)
    router
      .push({
        pathname: `/patient/view/${value}`
      })
      .then(() => setIsLoading(false))
  }

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(`${tab}/${id}`)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  useEffect(() => {
    if (dataPatient) {
      setIsLoading(false)
    }
  }, [dataPatient])

  const fetchDataAsync = async () => {
    try {
      const { data } = await api.get(`/budget-items?patientId=${id}`);
      console.log(data)
      setPatientTreatmentsData(data)
    } catch (error) {
      console.error('Error fetching patient data:', error)
    }
  }

  useEffect(() => {
    if(exam_type){
      setActiveTab(`documents/${id}`);
    }
    if(id){
      fetchDataAsync();
      fetchData();
    }
  },[id]);

    //data = data.filter((d:any) => d.status === 'A' || d.status === 'P');
    
    
    // data = data.map((d:any)=>Object.assign({
    //   id: d.id,
    //   date: dayjs(d.created_at)?.format?.('DD/MM/YYYY'),
    //   description: d.description,
    //   total: d.total,
    //   subtotal: d.subtotal,
    //   status: statusLabels[d.status],
    //   paymentType: d.payment?.paymentType,
    //   isSigned: d.isSigned,
    //   patient: d.patient?.name,
    //   discount: d.discount
    // }))

    const fetchData = async () => {
      let { data } = await api.get(`transactions/patient/${id}`);
    
      // Mapear os dados para incluir o status formatado e a data formatada
      data = data.filter((item: any) => item.status === 'A' || item.status === 'P');
      
      // Filtrar apenas transações aprovadas (A) e pagas (P)
      data = data.map((item: any) => ({
        ...item,
        date: dayjs(item.referenceDate ? item.referenceDate : item.created_at).format('DD/MM/YYYY'), // Formata a data
      }));
      
      // Ordenar as transações em ordem decrescente pela data de criação
      data.sort((a: any, b: any) => {
        const dateA = dayjs(a.created_at).valueOf(); // Converter para timestamp
        const dateB = dayjs(b.created_at).valueOf();

        return dateB - dateA; // Ordem decrescente
      });
    
      console.log('transactions', data);
    
      // Atualizar o estado com os dados filtrados
      setPatientDebitsData(data);
    };
    



  // useEffect(() => {
  //   dispatch(getBudgetsByPatient({ id: id, pageable: store.treatmentPatientPage }))
  // }, [dispatch, id, store.treatmentPatientPage])
  
  // useEffect(() => {
  //   if (store.budgetTreatments) {
  //     console.log('store.budgetTreatments', store.budgetTreatments)
  //     const treatments = store.budgetTreatments.map((item: PatientBudgetTreatmentsDataType) => {
  //       return {
  //         id: item.id,
  //         treatmentsDescription: item.description.toUpperCase(),
  //         doctor: item.professional.name,
  //         planType: item.plan.name.toUpperCase(),
  //         status: item.status
  //       }
  //     })
  //     setPatientTreatmentsData(treatments)
  //   }
  // }, [store.budgetTreatments, dispatch])

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <TabContext value={activeTab}>
      <TabList
        variant='scrollable'
        scrollButtons='auto'
        onChange={handleChange}
        aria-label='forced scroll tabs example'
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Tab value={`about/${id}`} label='SOBRE' icon={<Icon icon='mdi:account-outline' />} />
        <Tab value={`treatment/${id}`} label='TRATAMENTOS' icon={<HealingOutlined />} />
        <Tab value={`budget/${id}`} label='ORÇAMENTOS' icon={<Icon icon='mdi:bookmark-outline' />} />
        <Tab value={`anamnese/${id}`} label='ANAMNESE' icon={<AssignmentOutlined />} />
        <Tab value={`documents/${id}`} label='DOCUMENTOS' icon={<Icon icon='material-symbols-light:contract' />} />
        {(!userData.professional || userData.professional?.isAdmin) && <Tab value={`debts/${id}`} label='DÉBITOS' icon={<Icon icon='mdi:currency-usd' />} />}
      </TabList>
      <Box sx={{ mt: 6 }}>
        {isLoading ? (
          <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress sx={{ mb: 4 }} />
            <Typography>Carregando...</Typography>
          </Box>
        ) : (
          <>
            <TabPanel sx={{ p: 0 }} value={`about/${id}`}>
              <UserViewOverview patientId={id} patientCPF={dataPatient?.cpf} patientPhone={dataPatient?.cellPhone} patientName={dataPatient?.name} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value={`treatment/${id}`}>
              <UsersTreatments 
                treatmentsData={patientTreatmentsData} 
                fetchDataAsync={fetchDataAsync} 
                patientId={id} dataPatient={dataPatient} 
                refreshPatient={refreshPatient}
              />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value={`budget/${id}`}>
              <UserViewBudget patientId={id} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value={`debts/${id}`}>
              <UserViewDebts debitsData={patientDebitsData} fetchData={fetchData} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value={`documents/${id}`}>
              <CustomUserFiles documentsData={[]} patientId={id} exam_type={exam_type} dataPatient={dataPatient}  />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value={`anamnese/${id}`}>
              <UserViewAnamnese anamnesesData={[]} patientId={id} />
            </TabPanel>
          </>
        )}
      </Box>
    </TabContext>
  )
}

export default UserViewRight
