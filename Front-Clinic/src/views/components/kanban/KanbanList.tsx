// React Imports
import { useEffect, useState } from 'react'
import type { FormEvent, RefObject } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'

// Third-party imports
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import classnames from 'classnames'

// Type Imports


// Slice Imports


// Component Imports

import TaskCard from './TaskCard'
import NewTask from './NewTask'

// Styles Imports
import styles from './styles.module.css'

import { Check, Close, Delete, DragIndicator, Edit } from '@mui/icons-material'
import { ColumnType, KanbanType, TaskType } from 'src/types/apps/kanbanTypes'
import { useKanban } from 'src/context/KanbanContext'
import OptionsMenu from 'src/@core/components/option-menu'

type KanbanListProps = {
  column: ColumnType
  tasks: (TaskType | undefined)[]
  
  // store: KanbanType
  setDrawerOpen: (value: boolean) => void
  columns: ColumnType[]
  setColumns: (value: ColumnType[]) => void
  currentTask: TaskType | undefined
}

const KanbanList = (props: KanbanListProps) => {
  const { addTask, editColumn, deleteColumn, state, updateTaskOrder } = useKanban();

  const { column, setDrawerOpen, columns, tasks, currentTask, setColumns } = props

  // Estados locais
  const [editDisplay, setEditDisplay] = useState(false);
  const [title, setTitle] = useState(column.title);

  // Inicializando o drag and drop
  const [tasksListRef, tasksList, setTasksList] = useDragAndDrop(column.taskIds.map(id => state.tasks.find((task: any) => task.id === id)), {
    group: 'tasksList',
    plugins: [animations()],
    draggable: el => el.classList.contains('item-draggable')
  });

  useEffect(() => {
    if (tasksList.length > 0 && tasksList.some((task, index) => task?.order !== index)) {
      const reorderedTasks = tasksList
        .filter((task): task is TaskType => task !== undefined)
        .map((task, index) => ({ id: task.id, order: index }));
      updateTaskOrder(column.id, reorderedTasks);
    }
  }, [tasksList]);

  // Adicionar nova tarefa
  const addNewTask = async (task: { title: string }) => {
    const newTask =  await addTask({ columnId: column.id, title: task.title });
  
    if (newTask) {
      setTasksList([...tasksList, newTask]);
  
      const updatedColumns = columns.map(col =>
        col.id === column.id ? { ...col, taskIds: [...col.taskIds, newTask.id] } : col
      );
  
      setColumns(updatedColumns);
    }
  }

  // Editar o título da coluna
  const handleSubmitEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditDisplay(false);
    editColumn({ id: column.id, title });

    // Atualizar colunas localmente
    const updatedColumns = columns.map(col =>
      col.id === column.id ? { ...col, title } : col
    );

    setColumns(updatedColumns);
  };

  // Cancelar edição do título
  const cancelEdit = () => {
    setEditDisplay(false);
    setTitle(column.title);
  };

  // Excluir coluna
  const handleDeleteColumn = () => {
    deleteColumn(column.id);

    // Remover a coluna da lista
    setColumns(columns.filter(col => col.id !== column.id));
  };

  // Atualizar IDs das tarefas na coluna após drag-and-drop
  const arraysAreEqual = (a: any[], b: any[]) =>
    a.length === b.length && a.every((item, i) => item?.id === b[i]);
  
  useEffect(() => {
    const currentTaskIds = tasksList.map(task => task?.id);
  
    if (!arraysAreEqual(currentTaskIds, column.taskIds)) {
      const updatedColumns = columns.map(col =>
        col.id === column.id ? { ...col, taskIds: currentTaskIds.filter(Boolean) as string[] } : col
      );
  
      setColumns(updatedColumns);
    }
  }, [tasksList]);

  // Atualizar `tasksList` quando uma tarefa for editada
  useEffect(() => {
    if (!currentTask?.id) return;
  
    const exists = tasksList.some(task => task?.id === currentTask.id);
    const alreadyUpdated = tasksList.find(task => task?.id === currentTask.id);
  
    if (exists && JSON.stringify(alreadyUpdated) !== JSON.stringify(currentTask)) {
      const updatedTasksList = tasksList.map(task =>
        task?.id === currentTask?.id ? currentTask : task
      );
  
      setTasksList(updatedTasksList);
    }
  }, [currentTask]);
  
    return (
      <div ref={tasksListRef as RefObject<HTMLDivElement>} style={{ display: 'flex', flexDirection: 'column', width: '16.5rem' }}>
        {editDisplay ? (
          <form
            style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
            onSubmit={handleSubmitEdit}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                cancelEdit()
              }
            }}
          >
            <InputBase value={title} autoFocus onChange={e => setTitle(e.target.value)} required />
            <IconButton color='success' size='small' type='submit'>
              <Check />
            
            </IconButton>
            <IconButton color='error' size='small' type='reset' onClick={cancelEdit}>
              <Close />
            
            </IconButton>
          </form>
        ) : (
          <div id="no-drag" className={styles.kanbanColumn}  style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            inlineSize: '16.5rem',
            blockSize: '2.125rem',
            marginBlockEnd: '1rem',
          }}>
          <Typography variant="h6" noWrap className={styles.title}>
            {column.title}
          </Typography>
          <div className={styles.dragContainer} style={{ display: 'flex', alignItems: 'center', }}>
            <DragIndicator  className={classnames('ri-drag-move-fill text-textSecondary list-handle', styles.drag)} />
            
            <OptionsMenu
                  options={[
                    {
                      text: 'Edit',
                      icon: <Edit style={{ fontSize: 16 }} />,
                      menuItemProps: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                        },
                        onClick: () => setEditDisplay(!editDisplay),
                      },
                    },
                    {
                      text: 'Delete',
                      icon: <Delete style={{ fontSize: 16 }} />,
                      menuItemProps: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                        },
                        onClick: handleDeleteColumn,
                      },
                    },
                  ]}
                />
          </div>
        </div>
        )}
        {tasksList?.map(
          task =>
            task && (
              <TaskCard
                key={task.id}
                task={task}
                column={column}
                setColumns={setColumns}
                columns={columns}
                setDrawerOpen={setDrawerOpen}
                tasksList={tasksList}
                setTasksList={setTasksList}
              />
            )
        )}
        <NewTask addTask={addNewTask} />
      </div>
    )
}


export default KanbanList