// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import api from 'src/@core/components/api-client'
import { ProfessionalDataType } from 'src/types/apps/userTypes'
import { set } from 'nprogress'
import axios from 'axios'

interface DataParams {
  q: string
  role: string
  status: string
  currentPlan: string
}

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch professionals
export const fetchData = createAsyncThunk(
  'appProfessionals/fetchData',
  async (_, { dispatch }: Redux) => {
  dispatch(appprofessionalsSlice.actions.setGetingData(true))
  try {
    const accessToken = window?.localStorage.getItem('accessToken');
  
    const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/professionals`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }

    })
    
    dispatch(appprofessionalsSlice.actions.setGetingData(false))
    
    return { patient: {}, professionals: response.data, total: response.data.length, params: '', allData: response.data }

  } catch (error: any) {
    if (error.response && error.response.status === 401) { 
      window.localStorage.removeItem('userData');
      window.localStorage.removeItem('accessToken');
      window.location.reload();
    }
  }
  

  // const data = response.data.map((item: ProfessionalDataType) => {
  //   return {
  //     id: item.id,
  //     name: item.name
  //   }
  // })

  
})

// ** Add Professional
export const addProfessional = createAsyncThunk(
  "appProfessionals/addProfessional",
  async (data: any, { getState, dispatch }: Redux) => {
    try {
      const response = await api.post("/professionals", data);
      dispatch(fetchData());

      return response.data; 
    } catch (error: any) {

      alert(error.response?.data?.message || "Erro ao adicionar profissional");
      console.error(error);
      throw error; 
    }
  }
);

export const addProfessionalDentist = createAsyncThunk(
  'appProfessionals/addProfessionalDentist',
  async (data: any, { getState, dispatch }: Redux) => {
    console.log(data);
    const response = await api
      .post('/professionals/admin-professional', data)
      .then(() => {
        dispatch(fetchData())
      })
      .catch(error => {
        alert(error.response.data.message)
        console.error(error)
      })

    return response
  }
)

// ** Update Professional
export const updateProfessional = createAsyncThunk(
  'appProfessionals/updateProfessional',
  async (data: any, { getState, dispatch }: Redux) => {
    const response = await api.patch('/professionals/' + data.id, data)
    dispatch(fetchData())

    return response.data
  }
)

// ** Delete professional
export const deleteProfessional = createAsyncThunk(
  'appProfessional/deleteProfessional',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await api.delete('/professionals/' + id)
    dispatch(fetchData())

    return response.data
  }
)

export const appprofessionalsSlice = createSlice({
  name: 'appprofessionals',
  initialState: {
    patient: {},
    data: [] as ProfessionalDataType[],
    total: 1,
    params: {},
    allData: [],
    getingData: false,
  },
  reducers: {
    setGetingData: (state, action) => {
      state.getingData = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      if(action.payload) {
        state.patient = action.payload.patient
        state.data = action.payload.professionals
        state.total = action.payload.total
        state.params = action.payload.params
        state.allData = action.payload.allData
      }
    })
  }
})

export default appprofessionalsSlice.reducer
