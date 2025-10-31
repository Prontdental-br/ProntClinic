

export type TaskType = {
    id: string
    title: string
    badgeText?: string[]
    chatId?: string
    created_at?: Date
    returnDate?: Date
    statusDate?: Date
    number?: string
    columnId: string;

    // attachments?: number
    comments?: string
    order?: number;

    // assigned?: { src: string; name: string }[]
    // image?: string
    // dueDate?: Date
  }
  
  export type ColumnType = {
    id: string
    title: string
    editable?: boolean
    color?: string
    default?: boolean
    taskIds: string[]
  }

  export interface KanbanState {
    columns: ColumnType[]
    tasks: TaskType[]
    loading: boolean
    error: string | null
  }
  
  export type KanbanType = {
    columns: ColumnType[]
    tasks: TaskType[]
    currentTaskId?: string
    labels: Label[]
    filterPeriod?: 'all' | 'day' | 'week' | 'month', 
    filterSearchText: string
    filterStartDate: string | null,
    filterEndDate: string | null,
    allTasks: TaskType[]
    filteredTasks: TaskType[]
  }

  export type Label = {
    id: string
    name: string
    notEditable?: boolean
    color: 'success' | 'error' | 'info' | 'warning' | 'secondary'
  }
  