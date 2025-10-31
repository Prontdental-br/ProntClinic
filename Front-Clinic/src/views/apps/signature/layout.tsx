import { Alert, Card, CardContent, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import api from 'src/@core/components/api-client';
import { ClinicType } from 'src/types/apps/clinicsTypes';

export const LayoutSignature = ({ id }: { id: string }) => {

  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null);
  const [certificate, setContract] = useState<any>({});
  const [patient, setPatient] = useState<any>();

    useEffect(() => {
        api
          .get(`/contract/${id}`)
          .then(res => {
            console.log(res.data)
            const data = res.data;
            setContract(data);
            setClinicData(res.data.clinic)
            setPatient(res.data.patient);
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
                <div dangerouslySetInnerHTML={{ __html: data.text }}></div>
                {data.professional && <Grid item sm={12} sx={{ mt: 8, mb: 10, display: 'flex', justifyContent: 'center'}}>
                    <Grid item sm={6}>
                      <Box>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                          _____________________________________
                        </Typography>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                          {data.professional}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>}
                <Grid item sm={12} sx={{ mt: 8, mb: 10, display: 'flex', justifyContent: 'center'}}>
                    <Grid item sm={6}>
                      <Box>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                          _____________________________________
                        </Typography>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                          {patient.name}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
              </CardContent>
            </Card>
    
            {/* {autoPrint && <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
              <Button onClick={() => window.print()} variant='contained' name='emmit' color='success' className='hide-print'>
                Imprimir
              </Button>
              <Button onClick={() => {
                window.open('', '_self', '');
                window.close();
              }} name='close' variant='contained' color='error' className='hide-print'>
                Fechar
              </Button>
            </Grid>} */}
          </Box>
        )
      } else if (error) {
        return (
          <Box sx={{ p: 5 }}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Alert severity='error'>
                  Contrato não encontrada
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )
      } else {
        return null
      }
}
