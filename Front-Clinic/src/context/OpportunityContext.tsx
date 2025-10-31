import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { createContext, useContext, useState, useEffect } from 'react'
import api from 'src/@core/components/api-client'
import { ColumnType, KanbanType, Label, TaskType } from 'src/types/apps/kanbanTypes'


dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)


type FilterPeriod = 'all' | 'day' | 'week' | 'month'


const initialState: KanbanType = {
  columns: [],
  currentTaskId: '',
  allTasks: [],
  filteredTasks: [],
  filterPeriod: 'all',
  filterSearchText: '',
  filterStartDate: null,
  filterEndDate: null,
  tasks: [],
  labels: [
    { id: '1', name: 'Urgente', color: 'error', notEditable: true },
    { id: '2', name: 'Importante', color: 'warning', notEditable: true },
    { id: '3', name: 'Informativo', color: 'info', notEditable: true },
    { id: '4', name: 'Pessoal', color: 'success', notEditable: true },
    { id: '5', name: 'Outros', color: 'secondary', notEditable: true }
  ]
}


interface OpportunityContextType {
  state: KanbanType
  addColumn: (title: string, color?: string) => Promise<void>
  editColumn: ({ id, title }: { id: string; title: string }) => Promise<void>
  deleteColumn: (id: string) => Promise<void>
  updateColumns: (columns: ColumnType[]) => Promise<void>
  updateColumnOrder: (columns: { id: string; order: number }[]) => Promise<void>
  fetchColumns: () => Promise<void>
  fetchLabels: () => Promise<void>


  setCurrentTaskId: (taskId: string) => void
  addTask: (taskData: any) => Promise<TaskType | undefined>
  editTask: (taskData: any) => Promise<void>
  updateTaskOrder: (columnId: string, tasks: { id: string; order: number }[]) => Promise<void>
  moveTask: (columnId: string, tasks: { id: string; order: number }[]) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  addLabel: (label: { name: string; color: Label['color'] }) => Promise<Label | undefined>
  editLabel: ({ id, name, color }: { id: string; name: string; color: Label['color'] }) => void
  deleteLabel: (id: string) => void
  filterTasksByPeriod: (period: FilterPeriod) => void
  filterTasksBySearch: (searchText: string) => void
  filterTasksByDateRange: (startDate: string | null, endDate: string | null) => void
  resetAllFilters: () => void // <-- Adicionado


  drawerOpen: boolean
  setDrawerOpen: (value: boolean) => void
}


const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined)


export const OpportunityProvider = ({ children }: { children: any }) => {
  const fixedLabels = [
    { id: '1', name: 'Urgente', color: 'error', notEditable: true },
    { id: '2', name: 'Importante', color: 'warning', notEditable: true },
    { id: '3', name: 'Informativo', color: 'info', notEditable: true },
    { id: '4', name: 'Novas Oportunidades', color: 'success', notEditable: true },
    { id: '5', name: 'Outros', color: 'secondary', notEditable: true }
  ]


  const [state, setState] = useState(initialState)
  const [drawerOpen, setDrawerOpen] = useState(false)


  const setCurrentTaskId = (taskId: string) => {
    setState(prev => ({
      ...prev,
      currentTaskId: taskId
    }))
  }


  const applyFilters = (
    tasksToFilter: TaskType[],
    period: FilterPeriod,
    searchText: string,
    startDate: string | null,
    endDate: string | null,
    currentColumns: ColumnType[]
  ) => {
    /* console.log('--- [APPLY FILTERS START] ---')
    console.log(`Total de Tarefas de Origem: ${tasksToFilter.length}`)
    console.log(`Filtro Ativo: Período: ${period}, Busca: "${searchText}", Data De: ${startDate}, Data Até: ${endDate}`) */
    const now = dayjs()
    let tasksFiltered = tasksToFilter


    let startFilter: dayjs.Dayjs | null = null
    let endFilter: dayjs.Dayjs | null = null




    if (period !== 'all') {
      if (period === 'day') {
        startFilter = now.startOf('day')
        endFilter = now.endOf('day')
      } else if (period === 'week') {
        startFilter = now.startOf('week')
        endFilter = now.endOf('week')
      } else if (period === 'month') {
        startFilter = now.startOf('month')
        endFilter = now.endOf('month')
      }
    } else if (startDate || endDate) {
      if (startDate) {
        startFilter = dayjs(startDate).startOf('day')
      }
      if (endDate) {
        endFilter = dayjs(endDate).endOf('day')
      }
    }


    if (startFilter || endFilter) {
      tasksFiltered = tasksFiltered.filter(task => {
        if (!task.created_at) return false


        const createdAt = dayjs(task.created_at)
        let meetsStart = true
        let meetsEnd = true


        if (startFilter) {
          meetsStart = createdAt.isSameOrAfter(startFilter, 'day')
        }
        if (endFilter) {
          meetsEnd = createdAt.isSameOrBefore(endFilter, 'day')
        }


        return meetsStart && meetsEnd
      })
    }


    const normalizedSearchText = searchText.toLowerCase().trim()
    const tasksFilteredBySearch = tasksFiltered.filter(task => {
      if (!normalizedSearchText) return true


      const titleMatch = task.title.toLowerCase().includes(normalizedSearchText)
      const contactMatch = task.number?.includes(normalizedSearchText)


      return titleMatch || contactMatch
    })


    const updatedColumns = currentColumns.map(column => ({
      ...column,
      taskIds: column.taskIds.filter(taskId => tasksFilteredBySearch.some(task => task.id === taskId))
    }))


    return { tasksFilteredBySearch, updatedColumns }
  }


  const filterTasksByDateRange = (startDate: string | null, endDate: string | null) => {
    setState(prev => {
      const newPeriod: FilterPeriod = startDate || endDate ? 'all' : (prev.filterPeriod as FilterPeriod)


      const { tasksFilteredBySearch, updatedColumns } = applyFilters(
        prev.allTasks,
        newPeriod,
        prev.filterSearchText || '',
        startDate,
        endDate,
        prev.columns
      )


      return {
        ...prev,
        filteredTasks: tasksFilteredBySearch,
        columns: updatedColumns,
        filterPeriod: newPeriod,
        filterStartDate: startDate,
        filterEndDate: endDate
      }
    })
  }


  const filterTasksByPeriod = (period: FilterPeriod) => {
    setState(prev => {
      const startDate = period === 'all' ? prev.filterStartDate : null
      const endDate = period === 'all' ? prev.filterEndDate : null


      const { tasksFilteredBySearch, updatedColumns } = applyFilters(
        prev.allTasks,
        period,
        prev.filterSearchText || '',
        startDate,
        endDate,
        prev.columns
      )


      return {
        ...prev,
        filteredTasks: tasksFilteredBySearch,
        columns: updatedColumns,
        filterPeriod: period,
        filterStartDate: startDate,
        filterEndDate: endDate
      }
    })
  }


  const filterTasksBySearch = (searchText: string) => {
    setState(prev => {
      const { tasksFilteredBySearch, updatedColumns } = applyFilters(
        prev.allTasks,
        prev.filterPeriod as FilterPeriod,
        searchText,
        prev.filterStartDate || null,
        prev.filterEndDate || null,
        prev.columns
      )


      return {
        ...prev,
        filteredTasks: tasksFilteredBySearch,
        columns: updatedColumns,
        filterSearchText: searchText
      }
    })
  }



  const resetAllFilters = () => {
    setState(prev => {
      const resetState = {
        ...prev,
        filterPeriod: 'all' as FilterPeriod,
        filterSearchText: '',
        filterStartDate: null,
        filterEndDate: null,
        filteredTasks: prev.allTasks
      };

      const restoredColumns = prev.columns.map(col => {
        const originalTasksInColumn = prev.allTasks.filter(task => task.columnId === col.id);
       
        return {
          ...col,
          taskIds: originalTasksInColumn.map(task => task.id)
        };
      });


      return {
        ...resetState,
        columns: restoredColumns
      };
    });
  };


  const fetchColumns = async () => {
    try {
      const response = await api.get('/opportunity/columns')


      const allTasks = response.data.flatMap((col: any) => col.tasks)
      const columns = response.data.map((col: any) => ({
        ...col,
        taskIds: col.tasks.map((task: any) => task.id)
      }))


      setState(prev => {
        const { tasksFilteredBySearch, updatedColumns } = applyFilters(
          allTasks,
          prev.filterPeriod as FilterPeriod,
          prev.filterSearchText || '',
          prev.filterStartDate || null,
          prev.filterEndDate || null,
          columns
        )


        return {
          ...prev,
          columns: updatedColumns,
          allTasks,
          filteredTasks: tasksFilteredBySearch
        }
      })
    } catch (error) {
      console.error('Erro ao buscar colunas', error)
    }
  }


  const fetchLabels = async () => {
    try {
      const response = await api.get('/opportunity/labels')


      const fetchedLabels = response.data
      const filteredFetched = fetchedLabels.filter(
        (label: any) => !fixedLabels.some(fixed => fixed.name === label.name)
      )


      const allLabels = [...fixedLabels, ...filteredFetched]


      setState(prev => ({
        ...prev,
        labels: allLabels
      }))
    } catch (error) {
      console.error('Erro ao buscar labels:', error)
    }
  }


  const updateColumns = async (columns: ColumnType[]) => {
    setState(prev => ({
      ...prev,
      columns: columns.map((col: any) => ({
        id: col.id,
        title: col.title,
        taskIds: col.tasks.map((task: any) => task.id)
      }))
    }))
  }


  const addColumn = async (title: string, color?: string) => {
    try {
      await api.post('/opportunity/columns', { title, color })


      fetchColumns()
    } catch (error) {
      console.error('Erro ao adicionar coluna', error)
    }
  }


  const editColumn = async ({ id, title }: { id: string; title: string }) => {
    try {
      await api.patch(`/opportunity/columns/${id}`, { title })


      fetchColumns()
    } catch (error) {
      console.error('Erro ao editar coluna', error)
    }
  }


  const updateColumnOrder = async (columns: { id: string; order: number }[]) => {
    try {
      await api.put('/opportunity/columns/order', { columns })
    } catch (error) {
      console.error('Erro ao atualizar a ordem das colunas:', error)
    }
  }


  const updateTaskOrder = async (columnId: string, tasks: { id: string; order: number }[]) => {
    try {
      const payload = {
        tasks: tasks.map(task => ({
          id: task.id,
          order: task.order,
          columnId
        }))
      }
      await api.put(`/opportunity/tasks/order`, payload)


      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => {
          const updatedTask = tasks.find(t => t.id === task.id)


          return updatedTask ? { ...task, order: updatedTask.order } : task
        })
      }))
    } catch (error) {
      console.error('Erro ao atualizar a ordem das tarefas:', error)
    }
  }


  const moveTask = async (columnId: string, tasks: { id: string; order: number }[]) => {
    try {
      const payload = { columnId, tasks }


      await api.put(`/opportunity/tasks/move`, payload)


      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => {
          const updatedTask = tasks.find(t => t.id === task.id)


          return updatedTask ? { ...task, columnId, order: updatedTask.order } : task
        })
      }))
    } catch (error: any) {
      console.error('Erro ao mover a tarefa:', error.response?.data || error)
    }
  }


  const deleteColumn = async (id: any) => {
    try {
      await api.delete(`/opportunity/columns/${id}`)
      setState(prev => ({
        ...prev,
        columns: prev.columns.filter(col => col.id !== id),
        tasks: prev.tasks.filter(task => !prev.columns.find(col => col.id === id)?.taskIds.includes(task.id))
      }))


      fetchColumns()
    } catch (error) {
      console.error('Erro ao excluir coluna', error)
    }
  }


  const addTask = async (taskData: any) => {
    try {
      const newTask = await api.post('/opportunity/tasks', taskData)


      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask.data]
      }))


      return newTask.data
    } catch (error) {
      console.error('Erro ao adicionar tarefa', error)
    }
  }


  const editTask = async (taskData: any) => {
    try {
      const { id, ...updateData } = taskData


      await api.patch(`/opportunity/tasks/${id}`, updateData)
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => (task.id === id ? { ...task, ...updateData } : task))
      }))


      fetchColumns()
    } catch (error) {
      console.error('Erro ao editar tarefa', error)
    }
  }


  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/opportunity/tasks/${taskId}`)
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      }))
    } catch (error) {
      console.error('Erro ao excluir tarefa', error)
    }
  }


  const addLabel = async ({ name, color }: { name: string; color?: string }) => {
    try {
      const response = await api.post('/opportunity/labels', { name, color })
      const newLabel: Label = response.data


      setState(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel]
      }))


      return newLabel
    } catch (error) {
      console.error('Erro ao adicionar rótulo:', error)
    }
  }


  const editLabel = ({ id, name, color }: { id: string; name: string; color: any }) => {
    try {
      api.patch(`/opportunity/labels/${id}`, { name, color })


      setState(prev => ({
        ...prev,
        labels: prev.labels.map(label => (label.id === id ? { id, name, color } : label))
      }))
    } catch (error) {
      console.error('Erro ao editar rótulo:', error)
    }
  }


  const deleteLabel = async (id: string) => {
    try {
      await api.delete(`/opportunity/labels/${id}`)


      setState(prev => ({
        ...prev,
        labels: prev.labels.filter(label => label.id !== id)
      }))
    } catch (err) {
      console.error('Erro ao deletar rótulo:', err)
    }
  }


  return (
    <OpportunityContext.Provider
      value={{
        state,
        updateColumnOrder,
        addColumn,
        editColumn,
        deleteColumn,
        addTask,
        editTask,
        deleteTask,
        moveTask,
        setCurrentTaskId,
        addLabel,
        editLabel,
        fetchLabels,
        deleteLabel,
        fetchColumns,
        updateColumns,
        updateTaskOrder,
        filterTasksByPeriod,
        filterTasksBySearch,
        filterTasksByDateRange,
        resetAllFilters,
        drawerOpen,
        setDrawerOpen
      }}
    >
      {children}
    </OpportunityContext.Provider>
  )
}


export const useOpportunity = () => {
  const context = useContext(OpportunityContext)
  if (!context) {
    throw new Error('useOpportunity must be used within a OpportunityProvider')
  }


  return context;
};

