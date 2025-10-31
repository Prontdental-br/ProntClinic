import { createContext, useContext, useState, useEffect } from 'react';
import api from "src/@core/components/api-client";
import { ColumnType, KanbanType, Label, TaskType } from "src/types/apps/kanbanTypes";

const initialState: KanbanType = {
    columns: [],
    currentTaskId: '',
    allTasks: [],
    filteredTasks: [],
    filterPeriod: 'all',
    tasks: [],
    labels: [  { id: '1', name: 'Urgente', color: 'error', notEditable: true },
      { id: '2', name: 'Importante', color: 'warning', notEditable: true },
      { id: '3', name: 'Informativo', color: 'info', notEditable: true },
      { id: '4', name: 'Pessoal', color: 'success', notEditable: true },
      { id: '5', name: 'Outros', color: 'secondary', notEditable: true }],
      filterSearchText: '', 
      filterStartDate: null,
      filterEndDate: null, 
  };

interface KanbanContextType {
    state: KanbanType;
    addColumn: (title: string) => Promise<void>;
    editColumn: ({ id, title }: { id: string; title: string }) => Promise<void>;
    deleteColumn: (id: string) => Promise<void>;
    updateColumns: (columns: ColumnType[]) => Promise<void>;
    updateColumnOrder: (columns: { id: string; order: number }[]) => Promise<void>;
    fetchColumns: () => Promise<void>;
    fetchLabels: () => Promise<void>;

    // fetchTasks: () => Promise<void>;
    setCurrentTaskId: (taskId: string) => void;
    addTask: (taskData: any) => Promise<TaskType | undefined>;
    editTask: (taskData: any) => Promise<void>;
    updateTaskOrder: (columnId: string, tasks: { id: string; order: number }[]) => Promise<void>;
    moveTask: (columnId: string, tasks: { id: string; order: number }[]) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    addLabel: (label: { name: string; color: Label['color'] }) => Promise<Label | undefined>;
    editLabel: ({ id, name, color }: { id: string; name: string; color: Label['color'] }) => void;
    deleteLabel: (id: string) => void;
  }

  const KanbanContext = createContext<KanbanContextType | undefined>(undefined);
  export const KanbanProvider = ({ children }: { children: any }) => {
    const fixedLabels = [
      { id: '1', name: 'Urgente', color: 'error', notEditable: true },
      { id: '2', name: 'Importante', color: 'warning', notEditable: true },
      { id: '3', name: 'Informativo', color: 'info', notEditable: true },
      { id: '4', name: 'Pessoal', color: 'success', notEditable: true },
      { id: '5', name: 'Outros', color: 'secondary', notEditable: true }
    ];
    
    const [state, setState] = useState(initialState);

  const setCurrentTaskId = (taskId: string) => {
    setState(prev => ({ 
        ...prev,
        currentTaskId: taskId
        }));   
}

  const fetchColumns = async () => {
    try {
      const response = await api.get('/kanban/columns');
      setState(prev => ({
        ...prev,
        columns: response.data.map((col: any) => ({
          ...col,
          taskIds: col.tasks.map((task: any) => task.id)
        })),
        tasks: response.data.flatMap((col: any) => col.tasks)
      }));
    } catch (error) {
      console.error("Erro ao buscar colunas", error);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await api.get('/kanban/labels');
  
      const fetchedLabels = response.data;
      const filteredFetched = fetchedLabels.filter(
        (label: any) => !fixedLabels.some(fixed => fixed.name === label.name)
      );
  
      const allLabels = [...fixedLabels, ...filteredFetched];
  
      setState(prev => ({
        ...prev,
        labels: allLabels,
      }));
    } catch (error) {
      console.error('Erro ao buscar labels:', error);
    }
  };

  const updateColumns = async (columns: ColumnType[]) => {
        setState(prev => ({
            ...prev,   
            columns: columns.map((col: any) => ({
                id: col.id,
                title: col.title,
                taskIds: col.tasks.map((task: any) => task.id)
            }))
        }));
  }

  const addColumn = async (title: string) => {
    try {
       await api.post('/kanban/columns', { title });
     
      fetchColumns();
    } catch (error) {
      console.error("Erro ao adicionar coluna", error);
    }
  };

  const editColumn = async ({ id, title }: { id: string; title: string }) => {
    try {
      await api.patch(`/kanban/columns/${id}`, { title });
     
      fetchColumns();
    } catch (error) {
      console.error("Erro ao editar coluna", error);
    }
  };

  const updateColumnOrder = async (columns: { id: string; order: number }[]) => {
    try {
      await api.put('/kanban/columns/order', { columns });
    } catch (error) {
      console.error('Erro ao atualizar a ordem das colunas:', error);
    }
  };

  const updateTaskOrder = async (columnId: string, tasks: { id: string; order: number }[]) => {
      try {
        const payload = {
            tasks: tasks.map(task => ({
                id: task.id,
                order: task.order,
                columnId, 
            })),
        };
      await api.put(`/kanban/tasks/order`, payload);

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => {
          const updatedTask = tasks.find((t) => t.id === task.id);

          return updatedTask ? { ...task, order: updatedTask.order } : task;
        })
        }));

    } catch (error) {
      console.error('Erro ao atualizar a ordem das tarefas:', error);
    }  
  }

  const moveTask = async (columnId: string, tasks: { id: string; order: number }[]) => {
    try {
        const payload = { columnId, tasks };

        await api.put(`kanban/tasks/move`, payload);

        setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(task => {
                const updatedTask = tasks.find(t => t.id === task.id);

                return updatedTask ? { ...task, columnId, order: updatedTask.order } : task;
            })
        }));
    } catch (error: any) {
        console.error('Erro ao mover a tarefa:', error.response?.data || error);
    }
};

  const deleteColumn = async (id: any) => {
    try {
      await api.delete(`/kanban/columns/${id}`);
      setState(prev => ({
        ...prev,
        columns: prev.columns.filter(col => col.id !== id),
        tasks: prev.tasks.filter(task => !prev.columns.find(col => col.id === id)?.taskIds.includes(task.id))
      }));

      fetchColumns();
    } catch (error) {
      console.error("Erro ao excluir coluna", error);
    }
  };

  const addTask = async (taskData: any) => {
    try {
       const newTask = await api.post('/kanban/tasks', taskData);
      
       setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask.data],
      }));

      
      return newTask.data;

    } catch (error) {
      console.error("Erro ao adicionar tarefa", error);
    }
  };

  const editTask = async (taskData: any) => {
    try {
      const { id, ...updateData } = taskData;

      await api.patch(`/kanban/tasks/${id}`, updateData);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => task.id === id ? { ...task, ...updateData } : task)
      }));

    } catch (error) {
      console.error("Erro ao editar tarefa", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/kanban/tasks/${taskId}`);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId),
      }));
    } catch (error) {
      console.error("Erro ao excluir tarefa", error);
    }
  };

  const addLabel = async ({ name, color }: { name: string; color?: string }) => {
    try {
      const response = await api.post('/kanban/labels', { name, color });
      const newLabel: Label = response.data;
  
      setState(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel],
      }));
  
      return newLabel;
    } catch (error) {
      console.error('Erro ao adicionar rótulo:', error);
    }
  };

  const editLabel = ({id, name, color}: { id: string, name: string, color: any }) => {
    try {
      api.patch(`/kanban/labels/${id}`, { name, color });

      setState(prev => ({
        ...prev,
        labels: prev.labels.map(label => label.id === id ? { id, name, color } : label),
      }));

    } catch(error) { 
      console.error('Erro ao editar rótulo:', error);
    }
    
  };

  const deleteLabel = async (id: string) => {
    try {
      await api.delete(`/kanban/labels/${id}`);
  
      setState(prev => ({
        ...prev,
        labels: prev.labels.filter(label => label.id !== id),
      }));
    } catch (err) {
      console.error('Erro ao deletar rótulo:', err);
    }
  };

  return (
    <KanbanContext.Provider value={{ 
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
    }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider");
  }
  
return context;
};

