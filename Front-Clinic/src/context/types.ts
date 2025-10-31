export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type ProfissionalType = {
  id: string
  accountId: string
  name: string
  specialty: string
  email: string
  gender: string
  cro: string
  typeCr: string
  userId: string
}

export type UserDataType = {
  id: number
  role: string
  email: string
  fullName: string
  username: string
  password: string
  avatar?: string | null
  type: string
  planType: string
  professional: string | ProfissionalType
  clinicId?: string | null
}

export type SignupType = {
  name: string
  email: string
  cellPhone: string
  type: string
  password: string

  // couponId: string | null
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  signup: (params: SignupType, errorCallback?: ErrCallbackType) => void
  signupReserva: (params: SignupType, successCallback: () => void, errorCallback?: ErrCallbackType) => void
}

export type ChanceType = 'sale' | 'opportunity' | 'schedule' | 'birthday' | 'transaction'

export type Comment = {
  text: string
  date: Date
  author: string
}

export type historyLog = {
  text: string
  date: Date
  author: string
}

export class Chance {
  id?: string
  title: string
  description: string
  type: ChanceType
  status: string
  comments: Array<Comment> = []
  history: Array<historyLog> = []
  createdAt: Date
  author: string
  patient?: string
  patientId?: string
  amount?: number
  quantity?: number
  phone?: string
  payment?: any
  observationCRC?: string
  defaultStatus?: string
  date?: string
  tag?: string

  constructor(title: string, description: string, type: ChanceType, chanceStatus: string) {
    this.title = title
    this.description = description
    this.type = type
    this.status = chanceStatus
    this.createdAt = new Date()
    this.author = 'nome do usuário'
    this.initHistory()
  }

  initHistory() {
    /*this.history.push({
      text: (this.type == 'sale' ? 'Venda' : 'Oportunidade') + ' criada',
      date: new Date(),
      author: 'Nome do usuário'
    })*/
  }

  getAmount() {
    return this.amount ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.amount) : ''
  }

  getUid() {
    return this.title.replace(/\s/g, '')
  }

  public setNewStatus(name: string, label: string) {
    this.status = name
    this.history.push({
      text: 'Status alterado para ' + label,
      date: new Date(),
      author: 'nome do usuário'
    })
  }
}

export type Status = {
  name: string
  label: string
  warning?: string
}
