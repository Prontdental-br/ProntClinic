// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { AccountDataType } from 'src/types/apps/accountTypes'

// ** Axios Imports
import api from 'src/@core/components/api-client'

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

// ** Fetch account
export const fetchOne = createAsyncThunk('appAccounts/fetchOne', async (q: string) => {
  const response = await api.get('/accounts/' + q)
  
  return { account: response.data as AccountDataType, accounts: [], total: 1, params: q, allData: response.data }
})

// ** Fetch accounts
export const fetchData = createAsyncThunk('appAccounts/fetchData', async (params: DataParams) => {
  const response = await api.get('/accounts')
  const data = response.data.map((item: AccountDataType) => {
    return {
      id: item.id,
      name: item.name
    }
  })

  return { account: data, accounts: data, total: data.length, params: params.q, allData: data }
})

// ** Add Account
export const addAccount = createAsyncThunk(
  'appAccounts/addAccount',
  async (data: any, { getState, dispatch }: Redux) => {
    const response = await api
      .post('/accounts', data)
      .then(() => {
        dispatch(fetchData(getState().patient.params))
      })
      .catch(error => {
        console.error(error)
      })

    return response
  }
)

// ** Update Account
export const updateAccount = createAsyncThunk(
  'appAccounts/updateAccount',
  async (data: any, { getState, dispatch }: Redux) => {
    const response = await api.patch('/accounts/' + data.id, data)
    dispatch(fetchData(getState().patient.params))

    return response.data
  }
)

// ** Delete account
export const deleteAccount = createAsyncThunk(
  'appAccount/deleteAccount',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await api.delete('/accounts/' + id)
    dispatch(fetchData(getState().patient.params))

    return response.data
  }
)

export const appAccountsSlice = createSlice({
  name: 'appAccounts',
  initialState: {
    account: {} as AccountDataType,
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchOne.fulfilled, (state, action) => {
      state.account = action.payload.account
      state.data = action.payload.accounts
      state.total = action.payload.total
      state.params = action.payload.params
      state.allData = action.payload.allData
    })
  }
})

export default appAccountsSlice.reducer
