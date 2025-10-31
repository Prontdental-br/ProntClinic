import { Box, Typography, Chip, Button, useTheme } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { DataGrid, GridColDef, GridRenderCellParams, ptBR } from '@mui/x-data-grid'
import { useOpportunity } from 'src/context/OpportunityContext'
import { TaskType } from 'src/types/apps/kanbanTypes'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'
import { setSelectChatId } from 'src/store/apps/chat-v2'
import { useRouter } from 'next/router'
import { ChipProps } from '@material-ui/core'
import Tooltip from '@mui/material/Tooltip'

type OpportunityRow = TaskType & { id: string }

const getLabelsMap = (labels: any[]) => {
  const map: { [key: string]: ChipProps['color'] } = {}
  labels.forEach((label: any) => {
    if (['primary', 'secondary', 'error', 'warning', 'info', 'success', 'orange'].includes(label.color)) {
      map[label.name] = label.color as ChipProps['color']
    }
  })

  return map
}

export const ChatOpportunityList = () => {
  const { state, setCurrentTaskId, setDrawerOpen } = useOpportunity()
  const dispatch = useDispatch()
  const router = useRouter()
  const theme = useTheme()

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  const tasks: OpportunityRow[] = state.filteredTasks || []
  const labelsMap = useMemo(() => getLabelsMap(state.labels), [state.labels])

  const handleOpenChat = (chatId: string | undefined, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!chatId) return

    dispatch(setSelectChatId(chatId))
    router.push('/chat/conversation')
  }

  const handleRowClick = (params: any) => {
    setDrawerOpen(true)
    setCurrentTaskId(params.row.id)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.35,
      minWidth: 300,
      field: 'oportunidade_contato',
      headerName: 'OPORTUNIDADE & CONTATO',
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, OpportunityRow>) => {
        const { row } = params

        return (
          <Box onClick={() => handleRowClick(params)} sx={{ cursor: 'pointer', py: 1 }}>
            <Typography variant='subtitle2' color='text.primary' sx={{ lineHeight: 1.3, mb: 0.5 }}>
              {row.title}
            </Typography>

            {row.number && (
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.85rem' }}>
                {row.number}
              </Typography>
            )}

            {row.comments && (
              <Tooltip title={row.comments} placement='bottom-start' arrow>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mt: 0.5, lineHeight: 1.2 }}
                >
                  {row.comments.length > 120 ? `${row.comments.slice(0, 120)}...` : row.comments}
                </Typography>
              </Tooltip>
            )}
          </Box>
        )
      }
    },
    {
      flex: 0.3,
      minWidth: 200,
      field: 'etiquetas',
      headerName: 'ETIQUETAS',
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, OpportunityRow>) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} onClick={() => handleRowClick(params)}>
          {params.row.badgeText && params.row.badgeText.length > 0 ? (
            params.row.badgeText.map((badge: any, index: any) => (
              <Chip
                key={index}
                label={badge}
                size='small'
                color={labelsMap[badge] || 'default'}
                sx={{ height: '24px' }}
              />
            ))
          ) : (
            <Typography variant='caption' color='text.disabled'>
              Sem etiquetas
            </Typography>
          )}
        </Box>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'created_at',
      headerName: '1º CONTATO',
      type: 'date',
      valueGetter: params => (params.row.created_at ? new Date(params.row.created_at) : null),
      renderCell: (params: GridRenderCellParams<any, OpportunityRow>) => (
        <Box onClick={() => handleRowClick(params)}>
          {params.row.created_at ? (
            <Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
              {dayjs(params.row.created_at).format('DD/MM/YYYY')} às {dayjs(params.row.created_at).format('HH:mm')}
            </Typography>
          ) : (
            <Typography variant='body2' color='text.disabled'>
              N/A
            </Typography>
          )}
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'acoes',
      headerName: 'AÇÕES',
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, OpportunityRow>) => (
        <Button
          color='info'
          variant='outlined'
          size='small'
          onClick={e => handleOpenChat(params.row.chatId, e)}
          sx={{ minWidth: '80px' }}
        >
          Abrir Chat
        </Button>
      )
    }
  ]

  if (tasks.length === 0 && state.filteredTasks.length === 0) {
    return (
      <Typography variant='subtitle1' color='textSecondary' sx={{ p: 3, textAlign: 'center' }}>
        Nenhuma oportunidade encontrada com os filtros atuais.
      </Typography>
    )
  }

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={tasks}
        columns={columns}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowClick={handleRowClick}
        getRowHeight={() => 'auto'}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.action.hover,
            fontWeight: 'bold'
          },
          '& .MuiDataGrid-row': { cursor: 'pointer' },
          '& .MuiDataGrid-cell': { py: 1.5 }
        }}
      />
    </Box>
  )
}
