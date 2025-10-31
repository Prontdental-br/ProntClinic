// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Third-Party Imports
import classnames from 'classnames'

// Type Imports


// Slice Imports


// Component Imports
// import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import styles from './styles.module.css'

import { ThemeColor } from 'src/@core/layouts/types'

import { ColumnType, TaskType } from 'src/types/apps/kanbanTypes'
import { useKanban } from 'src/context/KanbanContext'
import { ChipProps } from '@material-ui/core'
import { Delete } from '@mui/icons-material'

type chipColorType = {
  color: ThemeColor
}

type TaskCardProps = {
  task: TaskType
  column: ColumnType
  setColumns: (value: ColumnType[]) => void
  columns: ColumnType[]
  setDrawerOpen: (value: boolean) => void
  tasksList: (TaskType | undefined)[]
  setTasksList: (value: (TaskType | undefined)[]) => void
}


const TaskCard = (props: TaskCardProps) => {
  // Props
  const { task, column, setColumns, columns, setDrawerOpen, tasksList, setTasksList } = props

  const { state, setCurrentTaskId, deleteTask } = useKanban();

  // States
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Handle menu click
  const handleClick = (e: any) => {
    setMenuOpen(true)
    setAnchorEl(e.currentTarget)
  }

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null)
    setMenuOpen(false)
  }

  // Handle Task Click
  const handleTaskClick = () => {
    setDrawerOpen(true)
    setCurrentTaskId(task.id)
  }

  // Delete Task
  const handleDeleteTask = () => {
    deleteTask(task.id)
    setTasksList(tasksList.filter(taskItem => taskItem?.id !== task.id))

    const newTaskIds = column.taskIds.filter(taskId => taskId !== task.id)
    const newColumn = { ...column, taskIds: newTaskIds }
    const newColumns = columns.map(col => (col.id === column.id ? newColumn : col))

    setColumns(newColumns)
  }

  // Handle Delete
  const handleDelete = () => {
    handleClose()
    handleDeleteTask()
  }

  const labelsMap = useMemo(() => {

    const map: { [key: string]: ChipProps['color'] } = {};
    state.labels.forEach((label: any) => {
      if (
        ['primary', 'secondary', 'error', 'warning', 'info', 'success', 'orange'].includes(label.color)
      ) {
        map[label.name] = label.color as ChipProps['color'];
      }
    });
    
return map;
  }, [state.labels]);
  

  return (
    <>
      <Card
      sx={{
        inlineSize: '16.5rem',
        cursor: 'grab',
        overflow: 'visible',
        marginBottom: '1rem',
      }}
        className={classnames(
          'item-draggable',

          styles.card
        )}
        onClick={() => handleTaskClick()}
      >
        <CardContent   
            sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "flex-start",
            position: "relative",
            overflow: "hidden",
            }}
        >
            {task.badgeText && task.badgeText.length > 0 && (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "5px", 
                  inlineSize: "100%", 
                  maxInlineSize: "85%", 
                }}>
                  {task.badgeText.map((badge, index) => (
                    <Chip 
                      key={index} 
                      label={badge} 
                      size='small' 
                      color={labelsMap[badge]}
                    />
                  ))}
                </div>
              )}
          <div 
            style={{
              position: 'absolute',
              insetBlockStart: '1rem',
              insetInlineEnd: '0.75rem',
            }} 
            onClick={e => e.stopPropagation()}>
            <IconButton
              aria-label='more'
              size='small'
              className={classnames(styles.menu, {
                [styles.menuOpen]: menuOpen
              })}
              aria-controls='long-menu'
              aria-haspopup='true'
              onClick={handleClick}
            >
              <Delete />
            </IconButton>
            <Menu
              id='long-menu'
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  handleDelete()
                }}
              >
                Deletar
              </MenuItem>
            </Menu>
          </div>

          {/* {task.image && <img src={task.image} alt='task Image' className='is-full rounded' />} */}
          <Typography color='text.primary' style={{ maxWidth: '90%', wordBreak: 'break-word'}}>
            {task.title}
          </Typography>

          <Typography 
            color='text.secondary' 
            style={{ fontSize: '0.85rem', maxWidth: '90%', wordBreak: 'break-word' }}
          >
            {task.comments ? task.comments.length > 90 ? `${task.comments.slice(0, 90)}...` : task.comments : ''}
          </Typography>
          {/* {(task.attachments !== undefined && task.attachments > 0) ||
          (task.comments !== undefined && task.comments > 0) ||
          (task.assigned !== undefined && task.assigned.length > 0) ? (
            <div className='flex justify-between items-center gap-4 is-full'>
              {(task.attachments !== undefined && task.attachments > 0) ||
              (task.comments !== undefined && task.comments > 0) ? (
                <div className='flex gap-4'>
                  {task.attachments !== undefined && task.attachments > 0 && (
                    <div className='flex items-center gap-1'>
                      <i className='ri-attachment-2 text-xl text-textSecondary' />
                      <Typography color='text.secondary'>{task.attachments}</Typography>
                    </div>
                  )}
                  {task.comments !== undefined && task.comments > 0 && (
                    <div className='flex items-center gap-1'>
                      <i className='ri-wechat-line text-xl text-textSecondary' />
                      <Typography color='text.secondary'>{task.comments}</Typography>
                    </div>
                  )}
                </div>
              ) : null} */}
              {/* {task.assigned !== undefined && task.assigned.length > 0 && (
                <AvatarGroup max={4} className='pull-up'>
                  {task.assigned?.map((avatar, index) => (
                    <Tooltip title={avatar.name} key={index}>

                      <CustomAvatar
                        key={index}
                        src={avatar.src}
                        alt={avatar.name}
                        size={26}
                        className='cursor-pointer'
                      /> 
                      
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )} */}
            {/* </div> */}
          {/* ) : null} */}
        </CardContent>
      </Card>
    </>
  )
}

export default TaskCard