'use client'
import { RefObject, useEffect, useState } from 'react'

// Third-party imports
import classnames from 'classnames'
import styles from '../../components/kanban/styles.module.css'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import NewColumn from 'src/views/components/kanban/NewColumn'
import KanbanDrawer from 'src/views/components/kanban/KanbanDrawer'
import KanbanList from 'src/views/components/kanban/KanbanList'
import { ColumnType } from 'src/types/apps/kanbanTypes'
import { useOpportunity } from 'src/context/OpportunityContext'
import ChatKanbanList from './ChatKanbanList'
import ChatNewColumn from './ChatNewColumn'
import ChatKanbanDrawer from './ChatKanbanDrawer'

// Slice Imports


// Component Imports


const ChatKanbanBoard = () => {
  const { state, addColumn, fetchColumns, fetchLabels, updateColumnOrder, moveTask } = useOpportunity();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [columns, setColumns] = useState<ColumnType[]>(state.columns); 


  useEffect(() => {
    setColumns(state.columns);
  }, [state.columns]);

  

  useEffect(() => {
    fetchColumns(); 
    fetchLabels();
  }, []);

  // Hook de Drag and Drop
  const [boardRef, columnsDrag, setColumnsDrag] = useDragAndDrop(columns, {
    plugins: [animations()],
    dragHandle: '.list-handle'
  });

  useEffect(() => {
    if (columnsDrag.length && columnsDrag !== columns) {
      setColumns(columnsDrag); 

      updateColumnOrder(
        columnsDrag.map((col, index) => ({
          id: col.id,
          order: index
        }))
      );
    }
  }, [columnsDrag]);

  useEffect(() => {
    if (columnsDrag !== state.columns) {
      
      columnsDrag.forEach((column) => {
        const originalColumn = state.columns.find((c: any) => c.id === column.id);
        if (!originalColumn) return;
  
        const movedTasks = column.taskIds.map((taskId, index) => ({
          id: taskId,
          order: index,
        }));
  
        if (JSON.stringify(originalColumn.taskIds) !== JSON.stringify(column.taskIds)) {
          moveTask(column.id, movedTasks);
        }
      });
    }
  }, [columnsDrag]);

  const currentTask = state.filteredTasks.find((task: any) => task.id === state.currentTaskId);
  
  const commonLayoutClasses = {
    contentHeightFixed: 'ts-layout-content-height-fixed'
  }

  return (
    <div
      className={classnames(
        commonLayoutClasses.contentHeightFixed,
        styles.scroll,
      )}
    >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
      <div ref={boardRef as RefObject<HTMLDivElement>} style={{ display: 'flex', gap: '1.2rem' }}>
        {columns.map((column: any) => (
          <ChatKanbanList
          key={column.id}
          column={column}
          setDrawerOpen={setDrawerOpen}
          columns={columns}
          setColumns={setColumnsDrag} 
          currentTask={currentTask}
          tasks={column.taskIds ? column?.taskIds.map((taskId: any) => state.filteredTasks.find((task: any) => task.id === taskId)) : []}
          />
        ))}
      </div>
      <ChatNewColumn addNewColumn={addColumn}  />
      {currentTask && (
        <ChatKanbanDrawer
        task={currentTask}
        drawerOpen={drawerOpen}
        setColumns={setColumnsDrag}
          setDrawerOpen={setDrawerOpen}
          columns={columns}
          />
        )}
    </div>
  </div>
  )
}

export default ChatKanbanBoard
