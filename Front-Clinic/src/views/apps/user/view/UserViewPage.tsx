'use client'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Types
import { InvoiceType } from 'src/types/apps/invoiceTypes'
import { UsersType } from 'src/types/apps/userTypes'

// ** Demo Components Imports
import UserViewLeft from 'src/views/apps/user/view/UserViewLeft'
import UserViewRight from 'src/views/apps/user/view/UserViewRight'

// * api
import api from 'src/@core/components/api-client'
import { useEffect, useState } from 'react'
import { PlanType } from 'src/types/apps/budgetTypes'

type Props = {
  id: string
  tab: string
  exam_type?: string
}

const fetchData = async (id: string): Promise<any> => {
  try {
    const response = await api.get('/patients/' + id)

    if (!response || !response.data) {
      console.error('Invalid response from API:', response)
      throw new Error('Invalid response from API')
    }

    

    return response.data
  } catch (error) {
    console.error('Erro ao buscar dados do paciente:', error)
    throw error
  }
}

const UserView = ({ id, tab, exam_type }: Props) => {
  const [patient, setPatient] = useState<any>(null)
  const [plans, setPlans] = useState<any>(null);

  const fetchDataAsync = async (id: string) => {
    console.log(id);
    try {
    
      const patientData = await fetchData(id);
  

      const planResponse = await api.get('/plan');
      const plans = planResponse.data; 
  

      const selectedPlan = plans.find((plan: any) => plan.id === patientData.planType);
  

      const updatedPatientData = {
        ...patientData,
        planType: selectedPlan ? selectedPlan.name : '', 
      };
  
      setPatient(updatedPatientData);
   
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };
  
  useEffect(() => {
    if(id)
    fetchDataAsync(id)
  }, [id])

  function refreshPatient() {
    fetchDataAsync(id);
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={5} lg={4}>
        <UserViewLeft id={id} tab={tab} dataPatient={patient} refreshPatient={refreshPatient} />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <UserViewRight id={id} tab={tab} dataPatient={patient} exam_type={exam_type} refreshPatient={refreshPatient} />
      </Grid>
    </Grid>
  )
}

export default UserView
