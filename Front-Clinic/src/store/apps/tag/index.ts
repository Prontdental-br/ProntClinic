// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { TagDataType } from 'src/types/apps/tagTypes'

// ** Axios Imports
import api from 'src/@core/components/api-client'

interface DataParams {
  q: string
}

interface Option {
  id: number
  name: string
  color: string
}

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

// ** Fetch tags
export const fetchData = createAsyncThunk('appTags/fetchData', async () => {
  const response = await api.get('/tags')
  const data = response.data.map((item: TagDataType) => {
    return {
      id: item.id,
      name: item.name,
      color: item.color
    }
  })

  return { tag: null, data: data, total: 1, params: null, allData: data }
})

// ** Fetch tag
export const fetchOne = createAsyncThunk('appTags/fetchOne', async (q: string) => {
  const response = await api.get('/tags/' + q)

  return { tag: response.data as TagDataType, data: [], total: 1, params: q, allData: response.data }
})

// ** Add Tag
export const addTag = createAsyncThunk('appTags/addTag', async (data: any, { getState, dispatch }: Redux) => {
  const response = await api
    .post('/tags', data)
    .then(resp => {
      getState().selectedTag = resp.data
      dispatch(fetchData())
    })
    .catch(error => {
      console.error(error)
    })

  return response
})

// ** Update Tag
export const updateTag = createAsyncThunk('appTags/updateTag', async (data: any, { getState, dispatch }: Redux) => {
  const response = await api.patch('/tags/' + data.id, data)
  dispatch(fetchData())

  return response.data
})

// ** Delete tag
export const deleteTag = createAsyncThunk(
  'appTag/deleteTag',
  async (id: number | string, { getState, dispatch }: Redux) => {
    const response = await api.delete('/tags/' + id)
    dispatch(fetchData())

    return response.data
  }
)

export const appTagsSlice = createSlice({
  name: 'appTags',
  initialState: {
    tag: {} as TagDataType,
    selectedTag: null,
    data: [],
    total: 1,
    params: {},
    allData: []
  },
  reducers: {
    handleSelectedTag: (state, action) => {
      state.selectedTag = action.payload
    },
     handleAllTags: (state, action) => {
      state.data = action.payload
      state.allData = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload.data
      state.total = action.payload.total
      state.allData = action.payload.allData
    })
  }
})
export const { handleSelectedTag, handleAllTags } = appTagsSlice.actions
export default appTagsSlice.reducer
