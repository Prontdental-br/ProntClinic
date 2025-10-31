'use client'

// ** React Imports
import { useEffect, useState, useRef } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// ** Third Party Components
import api from 'src/@core/components/api-client';
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import { Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { clearNumber } from 'src/@core/utils/format'
import { Icon } from '@iconify/react'


type ImagePrintLayoutProps = {
  id: string | undefined;
  autoPrint?: boolean;
  img1: string
  img2: string
}

const ImagePrint = ({ id, img1, img2, autoPrint }: ImagePrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null);
  const [patient, setPatient] = useState<any>();

  useEffect(() => {
    api
      .get(`/file?patientId=${id}`)
      .then(res => {
        console.log('data', res.data)
        const { data } = res.data;
        setPatient(res.data.patient);
        setClinicData(res.data.clinic);
        console.log(data)
        setData(data)
        setError(false)
      })
      .catch((error) => {
        console.log('Error', error)
        setData(null)
        setError(true)
      })
  }, [id])


  if (data) {
    return (
      <Box sx={{ p: 12, pb: 6 }}>
        <Card>
          <CardContent>
            <Grid container>
              <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 6, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    {clinicData?.profilePic && (
                      <img src={clinicData.profilePic} style={{ width: 'auto', maxWidth: '80px', height: 'auto', marginBottom: '10px' }} />
                    )}
                    <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {clinicData && clinicData.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                  <Typography sx={{ ml: 2, fontWeight: 400, lineHeight: 1.2 }}>
                    {dayjs(data.date)?.format?.('DD/MM/YYYY')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                <img src={img1} style={{ width: 600, height: 600, objectFit: 'cover' }} alt='Imagem de comparação' />
                <img src={img2} style={{ width: 600, height: 600, objectFit: 'cover' }} alt='Imagem de comparação' />
            </Grid>
          </CardContent>
        </Card>

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          <Button onClick={() => window.print()} variant='contained' name='emmit' color='success'>
            Imprimir
          </Button>
          <Button onClick={() => {
            window.open('', '_self', '');
            window.close();
          }} name='close' variant='contained' color='error'>
            Fechar
          </Button>
        </Grid>
      </Box>
    )
  } else if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Alert severity='error'>
              Imagens não encontrados
            </Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default ImagePrint;
