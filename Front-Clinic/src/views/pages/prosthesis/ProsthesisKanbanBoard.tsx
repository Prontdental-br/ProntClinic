'use client'
import { RefObject, useEffect, useState } from 'react'

import classnames from 'classnames'
import styles from '../../components/kanban/styles.module.css'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import { ColumnType } from 'src/types/apps/kanbanTypes'



import { useProsthesis } from 'src/context/ProsthesisContext'
import ProsthesisKanbanList from './ProsthesisKanbanList'
import ProsthesisNewColumn from './ProsthesisNewColumn'
import ProsthesisKanbanDrawer from './ProsthesisKanbanDrawer'

// Slice Imports


// Component Imports


const ProsthesisKanbanBoard = () => {
  const { state, addColumn, fetchColumns, fetchLabels, updateColumnOrder, moveTask } = useProsthesis();

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

  const currentTask = state.tasks.find((task: any) => task.id === state.currentTaskId);
  
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
          <ProsthesisKanbanList
          key={column.id}
          column={column}
          setDrawerOpen={setDrawerOpen}
          columns={columns}
          setColumns={setColumnsDrag} 
          currentTask={currentTask}
          tasks={column.taskIds ? column?.taskIds.map((taskId: any) => state.tasks.find((task: any) => task.id === taskId)) : []}
          />
        ))}
      </div>
      <ProsthesisNewColumn addNewColumn={addColumn}  />
      {currentTask && (
        <ProsthesisKanbanDrawer
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

export default ProsthesisKanbanBoard
