// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import api from 'src/@core/components/api-client'
import { PatientDataType } from 'src/types/apps/userTypes'
import { ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import { BudgetType } from 'src/types/apps/budgetTypes'
import axios from 'axios'

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

export const PlanMap = new Map()
PlanMap.set('C', 'Convênio')
PlanMap.set('P', 'Privado')
PlanMap.set('O', 'Outros')

// ** Fetch Patients
export const fetchData = createAsyncThunk('appPatients/fetchData', async (q: string) => {
  try {
    const accessToken = window?.localStorage.getItem('accessToken');

    if(q !== 'undefined') {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/patients/search`, 
        {
          params: {
            query: q
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      const data = response.data.map((item: PatientDataType) => {
        return {
          id: item.id,
          avatar: '',
          name: item.name,
          cellPhone: item.cellPhone,
          planType: item.planType,
          role: 'author',
          email: item.email,
          avatarColor: 'primary'
        }
      })
      
      return { patient: {}, patients: data, total: data.length, params: q, allData: data }
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) { 
      window.localStorage.removeItem('userData');
      window.localStorage.removeItem('accessToken');
      window.location.reload();

    }
  }
})

export const fetchOne = createAsyncThunk('appPatients/fetchOne', async (id: string) => {
  const response = await api.get('/patients/' + id)
  const data = {
    id: response.data.id,
    avatar: '',
    name: response.data.name,
    cellPhone: response.data.cellPhone,
    planType: PlanMap.get(response.data.planType),
    role: 'author',
    email: response.data.email,
    avatarColor: 'primary'
  }

  return { patient: data, params: id }
})

// ** Add Patient
export const addPatient = createAsyncThunk(
  'appPatients/addPatient',
  async (data: any, { getState, dispatch }: Redux) => {
    try {
      const response = await api.post('/patients', data);
      dispatch(fetchData(getState().patient.params));
      
return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
);

// ** Update Patient
export const updatePatient = createAsyncThunk(
  'appPatients/updatePatient',
  async (data: any, { getState, dispatch }: Redux) => {
    const response = await api.patch('/patients/' + data.id, data)
    dispatch(fetchData(getState().patient.params))

    return response.data
  }
)

// ** Delete Patient
export const deletePatient = createAsyncThunk(
  'appPatient/deletePatient',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await api.delete('/patients/' + id)
    dispatch(fetchData(getState().patient.params))

    return response.data
  }
)

export const getPatientBudgets = createAsyncThunk(
  'appPatient/getBudgets',
  async (id: string, { getState, dispatch }: Redux) => {
    const res = await api.get(`budgets/patient/${id}`)
    
    const budgetData = res.data.map((item: any) => {
      return {
        ...item,
        budgetTreatments: item.budgetItems.map((_item: any) => ({
          ..._item,
          faces: _item?.faces ? _item.faces.split(',') : [],
        })),
      }
    });

    console.log(res.data)
    
    return budgetData;
  }
)

export const appPatientsSlice = createSlice({
  name: 'appPatients',
  initialState: {
    patient: {},
    data: [],
    total: 1,
    params: {},
    allData: [],    
    budgets: [] as BudgetType[],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        if(action.payload) {
          state.patient = action.payload.patient
          state.data = action.payload.patients
          state.total = action.payload.total
          state.params = action.payload.params
          state.allData = action.payload.allData
        }
      })
      .addCase(fetchOne.fulfilled, (state, action) => {
        state.patient = action.payload.patient
      })
      .addCase(getPatientBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload;
      })
  }
})

export default appPatientsSlice.reducer
