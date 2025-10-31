'use client'
import { RefObject, useEffect, useRef, useState } from 'react'

// Third-party imports
import classnames from 'classnames'
import styles from '../../views/components/kanban/styles.module.css'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import NewColumn from 'src/views/components/kanban/NewColumn'
import KanbanDrawer from 'src/views/components/kanban/KanbanDrawer'
import KanbanList from 'src/views/components/kanban/KanbanList'
import { ColumnType } from 'src/types/apps/kanbanTypes'
import { useKanban } from 'src/context/KanbanContext'

// Slice Imports


// Component Imports


const KanbanBoard = () => {
  const { state, addColumn, fetchColumns, fetchLabels, updateColumnOrder, moveTask } = useKanban();

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

  const prevColumnsRef = useRef<ColumnType[]>([]);

useEffect(() => {
  if (!columnsDrag.length) return;

  const prevMap = new Map(prevColumnsRef.current.map(col => [col.id, col.taskIds]));
  const newMap = new Map(columnsDrag.map(col => [col.id, col.taskIds]));

  const taskMovement: {
    taskId: string;
    fromColumnId: string;
    toColumnId: string;
    newOrder: number;
  }[] = [];

  for (const [toColumnId, newTaskIds] of newMap.entries()) {
    for (let i = 0; i < newTaskIds.length; i++) {
      const taskId = newTaskIds[i];
      const fromColumnId = [...prevMap.entries()].find(
        ([colId, taskIds]) => taskIds.includes(taskId) && colId !== toColumnId
      )?.[0];

      if (fromColumnId && fromColumnId !== toColumnId) {
        taskMovement.push({
          taskId,
          fromColumnId,
          toColumnId,
          newOrder: i,
        });
      }
    }
  }

  if (taskMovement.length > 0) {
    for (const move of taskMovement) {
      console.log('[DEBUG] Movendo tarefa:', move);
      moveTask(move.toColumnId, [{ id: move.taskId, order: move.newOrder }]);
    }
  }

  // ✅ Adiar a atualização da referência para o próximo ciclo de render
  setTimeout(() => {
    prevColumnsRef.current = columnsDrag;
  }, 0);

  setColumns(columnsDrag);
  updateColumnOrder(
    columnsDrag.map((col, index) => ({
      id: col.id,
      order: index,
    }))
  );
}, [columnsDrag]);





// const prevColumnsRef = useRef<ColumnType[]>([]);

// useEffect(() => {
//   if (!columnsDrag.length) return;

//   const prevMap = new Map(prevColumnsRef.current.map(col => [col.id, col.taskIds]));
//   const newMap = new Map(columnsDrag.map(col => [col.id, col.taskIds]));

//   const taskMovement: {
//     taskId: string;
//     fromColumnId: string;
//     toColumnId: string;
//     newOrder: number;
//   }[] = [];

//   for (const [toColumnId, newTaskIds] of newMap.entries()) {
//     for (let i = 0; i < newTaskIds.length; i++) {
//       const taskId = newTaskIds[i];

//       const fromColumnId = [...prevMap.entries()].find(([colId, taskIds]) =>
//         taskIds.includes(taskId) && colId !== toColumnId
//       )?.[0];

//       if (fromColumnId && fromColumnId !== toColumnId) {
//         taskMovement.push({
//           taskId,
//           fromColumnId,
//           toColumnId,
//           newOrder: i,
//         });
//       }
//     }
//   }

//   if (taskMovement.length > 0) {
//     for (const move of taskMovement) {
//       moveTask(move.toColumnId, [{ id: move.taskId, order: move.newOrder }]);
//     }
//   }

//   // Atualiza a referência após processar
//   prevColumnsRef.current = columnsDrag;
// }, [columnsDrag]);



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
          <KanbanList
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
      <NewColumn addNewColumn={addColumn}  />
      {currentTask && (
        <KanbanDrawer
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

export default KanbanBoard
