import React from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'
import { green, red } from '@material-ui/core/colors'
import Icon from 'src/@core/components/icon'
import moment from 'moment'
import { Rating, Skeleton } from '@mui/material'
import { Attendant } from 'src/views/pages/account-settings/tabConnectWhatsapp/ProntChatDashboard'

const useStyles = makeStyles(theme => ({
  pointer: {
    cursor: 'pointer'
  }
}))

interface Props {
    loading: boolean,
    attendants: Attendant[]
}

interface RatingProps {
    rating: number
}

export function RatingBox({ rating }: RatingProps) {
  const ratingTrunc = rating === null ? 0 : Math.trunc(rating)

  return <Rating defaultValue={ratingTrunc} max={3} readOnly />
}

export default function TableAttendantsStatus(props: Props) {
  const { loading, attendants } = props
  const classes = useStyles()

  function renderList() {
    return attendants.map((a, k) => (
      <TableRow key={k}>
        <TableCell>{a.name}</TableCell>
        <TableCell
          align='center'
          title='1 - Insatisfeito, 2 - Satisfeito, 3 - Muito Satisfeito'
          className={classes.pointer}
        >
          <RatingBox rating={a.rating} />
        </TableCell>
        <TableCell align='center'>{formatTime(a.avgSupportTime)}</TableCell>
        <TableCell align='center'>
          {a.online ? <Icon icon='material-symbols:check-circle' fontSize="20px" color={ green[600] } /> : <Icon icon="material-symbols:error" fontSize="20px" color={ red[600] } />}
        </TableCell>
      </TableRow>
    ))
  }

  function formatTime(minutes: number) {
    return moment().startOf('day').add(minutes, 'minutes').format('HH[h] mm[m]')
  }

  return !loading ? (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell align='center'>Avaliações</TableCell>
            <TableCell align='center'>T.M. de Atendimento</TableCell>
            <TableCell align='center'>Status (Atual)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderList()}
          {/* <TableRow>
                        <TableCell>Nome 4</TableCell>
                        <TableCell align="center">10</TableCell>
                        <TableCell align="center">10 minutos</TableCell>
                        <TableCell align="center">
                            <CheckCircleIcon className={classes.off} />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Nome 5</TableCell>
                        <TableCell align="center">10</TableCell>
                        <TableCell align="center">10 minutos</TableCell>
                        <TableCell align="center">
                            <CheckCircleIcon className={classes.on} />
                        </TableCell>
                    </TableRow> */}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Skeleton variant='rectangular' height={150} />
  )
}
