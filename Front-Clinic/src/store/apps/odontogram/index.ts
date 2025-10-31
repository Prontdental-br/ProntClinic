// ** Redux Imports
import { Dispatch } from 'redux'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// ** Axios Imports
import api from 'src/@core/components/api-client'
import {
  PatientType,
  ProfessionalType,
  TreatmentType,
  BudgetType,
  BudgetItemType,
  PlanType,
  BudgetStatusEnum
} from 'src/types/apps/budgetTypes'
import patient from '../patient'
import dayjs from 'dayjs'

interface Redux {
  getState: any
  dispatch: Dispatch<any>
}

interface PaginationModelType {
  page: number
  pageSize: number
}
interface TreatmentsByPatientType {
  id: string
  pageable: PaginationModelType
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export const getProfessionals = createAsyncThunk('odontogram/getProfessionals', async () => {
  return (await api.get('/professionals')).data
})

export const getTreatments = createAsyncThunk('odontogram/getTreatments', async () => {
  const data = (await api.get('/treatments')).data
  console.log('data', data)

  return data
})

export const getPatients = createAsyncThunk('odontogram/getPatients', async (q?: string) => {
  let url = 'patients/search'
  if (q) {
    url = url + '?query=' + q
  }
  const response = await api.get(url)

  return response.data
})

export const registerPatient = createAsyncThunk('odontogram/registerPatient', async (data: any) => {
  const response = await api.post('patients', data)

  return response.data
})

export const getPlans = createAsyncThunk('odontogram/getPlans', async () => (await api.get('/plan')).data)

export const saveBudget = createAsyncThunk(
  'odontogram/saveBudget',
  async (data: any, { getState, dispatch }: Redux) => {
    const items = data.budgetTreatments.map((item: BudgetItemType) => {
      console.log(item)

      return {
        description: item.description,
        treatmentId: item.treatment!.id,
        value: item.value,
        status: item.statusTreatment,
        qtd: item.qtd || 0,
        unit: item.unit || null,
        session: item.session || 0,
        faces: item.faces && Array.isArray(item.faces) && item.faces?.length > 0 ? item.faces.join(',') : null
      }
    })

    const dataPostBudget = {
      patientId: data.patient.id,
      observation: data.observation,
      description: data.description,
      status: data.status,
      planId: data.plan?.id || null,
      professionalId: data.professional.id,
      items: items,
      subtotal: data.subtotal,
      total: data.total,
      installments: data.installments,
      downPaymentInstallments: data.downPaymentInstallments,
      downPayment: data.downPayment,
      discount: data.discount,
      date: data.date,
      shapesTabRegiao: data.shapesTabRegiao || null,
      shapesTabAi: data.shapesTabAi || null,
      imageCaptured: data.imageCaptured || null,
      showUnits: data.showUnits || false,
      hideOdontogram: data.hideOdontogram || false,
      installmentsMethods: data.installmentsMethods || [],
      downPaymentMethods: data.downPaymentMethods || [],
      qtd: data.qtd || 0,
      unit: data.unit || '',
      budgetPaid: data.budgetPaid || false
    }

    if (data.id) {
      console.log('data.id', data.id)
      const response = await api.patch('budgets/' + data.id, dataPostBudget)

      return { ...dataPostBudget, id: response.data.id }
    }

    const response = await api.post('budgets', dataPostBudget)

    return { ...dataPostBudget, id: response.data.id }
  }
)

const initialState = {
  plans: [],
  plan: {} as PlanType,
  treatments: [] as Array<TreatmentType>,
  patient: {} as PatientType,
  patients: [] as PatientType[],
  professionals: [],
  professional: {} as ProfessionalType,
  budgetTreatments: [],
  observation: '',
  issueContract: false,
  printBudget: true,
  date: dayjs(),
  description: null,
  odontogramPDF: '',
  budget: {} as BudgetType,
  budgetStatus: BudgetStatusEnum.OPEN,
  showReceipt: false,
  receiptGraph: null,
  total: 0,
  totalDiscount: 0,
  downPayment: 0,
  installments: 1,
  downPaymentInstallments: 0,
  downPaymentMethods: [],
  installmentsMethods: [],
  qtd: 0,
  session: 0,
  unit: '',
  baseValue: 0,
  valorDigitado: '',
  manualUnitValue: 0,
  isManual: false,
  budgetPaid: false,
  treatmentPatientPage: { page: 0, pageSize: 7 }
}

export const odontogramSlice = createSlice({
  name: 'odontogram',
  initialState,
  reducers: {
    reset: () => initialState,
    setPlan: (state, action) => {
      state.plan = action.payload
    },
    setTreatments: (state, action) => {
      state.treatments = action.payload
    },
    setPatient: (state, action) => {
      state.patient = action.payload
    },
    setProfessional: (state, action) => {
      state.professional = action.payload
    },
    setBudgetTreatments: (state, action) => {
      state.budgetTreatments = action.payload
    },
    setObservation: (state, action) => {
      state.observation = action.payload
    },
    toggleIssueContract: (state, action) => {
      state.issueContract = !state.issueContract
    },
    togglePrintBudget: (state, action) => {
      state.printBudget = !state.printBudget
    },
    setDate: (state, action) => {
      state.date = action.payload
    },
    setDescription: (state, action) => {
      state.description = action.payload
    },
    setBudgetStatus: (state, action) => {
      state.budgetStatus = action.payload
    },
    setShowReceipt: (state, action) => {
      state.showReceipt = action.payload
    },
    setReceiptGraph: (state, action) => {
      state.receiptGraph = action.payload
    },
    setProcedimentoStore: (state, action) => {
      const normalized = String(action.payload).replace(',', '.')
      state.baseValue = parseFloat(normalized) || 0
      state.qtd = 1
      state.total = state.baseValue * state.qtd
      state.valorDigitado = String(state.total).replace('.', ',')
      state.isManual = false
    },

    setValorManual: (state, action) => {
      const normalized = String(action.payload).replace(',', '.')
      const manualValue = parseFloat(normalized) || 0

      state.manualUnitValue = manualValue
      state.qtd = 1
      state.total = manualValue
      state.valorDigitado = normalized
      state.isManual = true
    },

    setTotal: (state, action) => {
      const normalized = String(action.payload).replace(',', '.')
      state.baseValue = parseFloat(normalized) || 0
      state.total = state.baseValue * state.qtd
    },

    setTotalOdonto: (state, action) => {
      const normalized = String(action.payload).replace(',', '.')
      state.total = parseFloat(normalized) || 0
    },

    setQtd: (state, action) => {
      state.qtd = Number(action.payload)

      if (!state.isManual) {
        state.total = state.qtd > 0 ? state.baseValue * state.qtd : state.baseValue
        state.valorDigitado = String(state.total).replace('.', ',')
      } else {
        const unitValue = state.manualUnitValue || 0
        state.total = unitValue * (state.qtd > 0 ? state.qtd : 1)
        state.valorDigitado = String(state.total).replace('.', ',')
      }
    },

    setSession: (state, action) => {
      state.session = Number(action.payload)

      if (!state.isManual) {
        state.total = state.session > 0 ? state.baseValue * state.session : state.baseValue
        state.valorDigitado = String(state.total).replace('.', ',')
      } else {
        const unitValue = state.manualUnitValue || 0
        state.total = unitValue * (state.session > 0 ? state.session : 1)
        state.valorDigitado = String(state.total).replace('.', ',')
      }
    },
    setUnit: (state, action) => {
      state.unit = action.payload
    },
    setTotalDiscount: (state, action) => {
      state.totalDiscount = action.payload
    },
    setDownPayment: (state, action) => {
      state.downPayment = action.payload
    },

    setInstallments: (state, action: PayloadAction<number>) => {
      state.installments = action.payload
      state.installmentsMethods = Array(action.payload).fill('Pix') as never[]
    },

    setInstallmentsMethod(state, action: PayloadAction<{ index: number; method: string }>) {
      const { index, method } = action.payload

      state.installmentsMethods[index] = method as never
    },

    setDownPaymentInstallments(state, action: PayloadAction<number>) {
      state.downPaymentInstallments = action.payload

      state.downPaymentMethods = Array(action.payload).fill('Pix') as never[]
    },

    setBudgetPaid: (state, action) => {
      state.budgetPaid = action.payload
    },

    setDownPaymentMethod(state, action: PayloadAction<{ index: number; method: string }>) {
      const { index, method } = action.payload

      state.downPaymentMethods[index] = method as never
    },
    setTreatmentPatientPage: (state, action) => {
      state.treatmentPatientPage = action.payload
    },
    setBudget: (state, action) => {
      state.budget = action.payload
    }
  },
  extraReducers: {
    [getTreatments.fulfilled.type]: (state, action) => {
      state.treatments = action.payload
    },
    [getPatients.fulfilled.type]: (state, action) => {
      state.patients = action.payload
    },
    [registerPatient.fulfilled.type]: (state, action) => {
      state.patients.push(action.payload)
      state.patient = action.payload
    },
    [getPlans.fulfilled.type]: (state, action) => {
      state.plans = action.payload
    },
    [getProfessionals.fulfilled.type]: (state, action) => {
      state.professionals = action.payload
    },
    [saveBudget.fulfilled.type]: (state, action) => {
      state.budget = action.payload
    }
  }
})

export const {
  reset,
  setPlan,
  setPatient,
  setProfessional,
  setBudgetTreatments,
  setObservation,
  setProcedimentoStore,
  toggleIssueContract,
  togglePrintBudget,
  setDate,
  setDescription,
  setBudgetStatus,
  setShowReceipt,
  setReceiptGraph,
  setTotalDiscount,
  setTotal,
  setValorManual,
  setTotalOdonto,
  setQtd,
  setBudgetPaid,
  setSession,
  setUnit,
  setDownPayment,
  setInstallments,
  setDownPaymentInstallments,
  setDownPaymentMethod,
  setInstallmentsMethod,
  setTreatmentPatientPage,
  setBudget
} = odontogramSlice.actions
export default odontogramSlice.reducer
