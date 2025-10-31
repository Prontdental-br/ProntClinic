import React from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core'
import { Skeleton } from '@mui/material'

const useStyles = makeStyles(theme => ({
  customTableCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

const TableRowSkeleton = ({ avatar, columns }: any) => {
  const classes = useStyles()

  return (
    <>
      <TableRow>
        {avatar && (
          <>
            <TableCell style={{ paddingRight: 0 }}>
              <Skeleton animation='wave' variant='circular' width={40} height={40} />
            </TableCell>
            <TableCell>
              <Skeleton animation='wave' height={30} width={80} />
            </TableCell>
          </>
        )}
        {Array.from({ length: columns }, (_, index) => (
          <TableCell align='center' key={index}>
            <div className={classes.customTableCell}>
              <Skeleton animation='wave' height={30} width={80} />
            </div>
          </TableCell>
        ))}
      </TableRow>
    </>
  )
}

export default TableRowSkeleton
