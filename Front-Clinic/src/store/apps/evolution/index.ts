// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import api from 'src/@core/components/api-client'
import { EvolutionCreateDataType, EvolutionResponseDataType } from 'src/types/apps/evolutionType'

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch Evolutions
export const fetchData = createAsyncThunk('appEvolutions/fetchData', async (patientId: string) => {
  const response = await api.get('/evolutions', { headers: { patientId: patientId } })
  const data = response.data.map((item: EvolutionResponseDataType) => {
    return {
      id: item.id,
      professionalId: item.professionalId,
      professional: item.professional,
      patientId: item.patientId,
      patient: item.patient,
      dateEvolution: item.dateEvolution,
      description: item.description,
      isSigned: item.isSigned,
    }
  })

  return { evolution: {}, evolutions: data, total: data.length, params: patientId, allData: data }
})

export const fetchOne = createAsyncThunk('appEvolutions/fetchOne', async (id: string) => {
  const response = await api.get('/evolutions/' + id)
  const data = {
    id: response.data.id,
    professionalId: response.data.professionalId,
    professionalName: response.data.professionalName,
    patientId: response.data.patientId,
    patientName: response.data.patientName,
    date: response.data.date,
    description: response.data.description
  }

  return { evolution: data, params: id }
})

// ** Add Evolution
export const addEvolution = createAsyncThunk(
  'appEvolutions/addEvolution',
  async (data: EvolutionCreateDataType, { getState, dispatch }: Redux) => {
    const response = await api
      .post('/evolutions', data)
      .then(() => {
        dispatch(fetchData(getState().evolution.params))
      })
      .catch(error => {
        console.error(error)
      })

    return response
  }
)

// ** Update Evolution
export const updateEvolution = createAsyncThunk(
  'appEvolutions/updateEvolution',
  async (data: any, { getState, dispatch }: Redux) => {
    const response = await api.patch('/evolutions/' + data.id, data)
    dispatch(fetchData(getState().evolution.params))

    return response.data
  }
)

// ** Delete Evolution
export const deleteEvolution = createAsyncThunk(
  'appEvolution/deleteEvolution',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await api.delete('/evolutions/' + id)
    dispatch(fetchData(getState().evolution.params))

    return response.data
  }
)

export const appEvolutionsSlice = createSlice({
  name: 'appEvolutions',
  initialState: {
    evolution: {},
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        state.evolution = action.payload.evolution
        state.data = action.payload.evolutions
        state.total = action.payload.total
        state.params = action.payload.params
        state.allData = action.payload.allData
      })
      .addCase(fetchOne.fulfilled, (state, action) => {
        state.evolution = action.payload.evolution
      })
  }
})

export default appEvolutionsSlice.reducer
