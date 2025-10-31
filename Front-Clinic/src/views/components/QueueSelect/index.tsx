import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Chip from '@material-ui/core/Chip'
import prontChatApi from 'src/views/pages/account-settings/tabConnectWhatsapp/ProntChatApi'
import toast from 'react-hot-toast'
import translateBackendError from 'src/common/translateBackendError'

const useStyles = makeStyles(theme => ({
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: 2
  }
}))

interface Props {
  title?: string
  onChange: (value: string) => void
  multiple?: boolean
  selectedQueueIds: any
}

interface Queue {
  id: string
  name: string
	color: string
}

const QueueSelect = ({ selectedQueueIds, onChange, multiple = true, title = 'Filas' }: Props) => {
  const classes = useStyles()
  const [queues, setQueues] = useState<Queue[]>([])

  useEffect(() => {
    fetchQueues()
  }, [])

  const fetchQueues = async () => {
    try {
      const { data } = await prontChatApi.get('/queue')
      setQueues(data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.error
      if (errorMsg) {
        toast.error(translateBackendError(errorMsg))
      }
    }
  }

  const handleChange = (e: any) => {
    onChange(e.target.value)
  }

  return (
    <div>
      <FormControl fullWidth margin='dense' variant='outlined'>
        <InputLabel shrink={selectedQueueIds ? true : false}>{title}</InputLabel>
        <Select
          label={title}
          multiple={multiple}
          labelWidth={60}
          value={selectedQueueIds}
          onChange={handleChange}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left'
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left'
            },
            getContentAnchorEl: null
          }}
          renderValue={(selected: any) => {
            return (
              <div className={classes.chips}>
                {selected?.length > 0 && multiple ? (
                  selected.map((id: string) => {
                    const queue = queues.find(q => q.id === id)

                    return queue ? (
                      <Chip
                        key={id}
                        style={{ backgroundColor: queue.color }}
                        variant='outlined'
                        label={queue.name}
                        className={classes.chip}
                      />
                    ) : null
                  })
                ) : (
                  <Chip
                    key={selected}
                    variant='outlined'
                    style={{ backgroundColor: queues.find(q => q.id === selected)?.color }}
                    label={queues.find(q => q.id === selected)?.name}
                    className={classes.chip}
                  />
                )}
              </div>
            )
          }}
        >
          {!multiple && <MenuItem>Nenhum</MenuItem>}
          {queues.map(queue => (
            <MenuItem key={queue.id} value={queue.id}>
              {queue.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export default QueueSelect
