// ** MUI Imports

import Grid from '@mui/material/Grid'

import UsersAboutEvolutions from './UsersAboutEvolutions'

interface UserViewOverviewProps {
  patientId: string
  patientCPF: string
  patientPhone: string
  patientName: string
}


const UserViewOverview = ({ patientId, patientCPF, patientPhone, patientName }: UserViewOverviewProps) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UsersAboutEvolutions patientId={patientId} patientCPF={patientCPF} patientPhone={patientPhone} patientName={patientName} />
      </Grid>
    </Grid>
  )
}

export default UserViewOverview
