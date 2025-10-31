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
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { questionsObjectList } from 'src/views/components/ExamForm/questions'


type ExamPrintLayoutProps = {
  id: string | undefined;
  autoPrint?: boolean;
}

function getObjectDimension(obj: any) {
  let count = 0;

  function countKeys(object: any) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        count++;
        if (typeof object[key] === 'object' && object[key] !== null) {
          countKeys(object[key]);
        }
      }
    }
  }

  countKeys(obj);

  return count;
}

const ExamPrint = ({ id, autoPrint }: ExamPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [lab, setLab] = useState<any>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  const [Exam, setExam] = useState<string>("");
  const [professional, setProfessional] = useState<any>();
  const [patient, setPatient] = useState<any>();

  async function getClinic() {
    const clinic = await api.get(`/clinics`)
    console.log(clinic.data)
    setClinicData(clinic.data);
  }

  useEffect(() => {
    getClinic();
    api
      .get(`/exams/${id}`)
      .then(res => {
        console.log('data', res.data)
        const { professional, data, lab, examType } = res.data;
        setLab(lab);
        setExam(examType);
        setProfessional(professional);
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
            <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                    {professional?.specialty} {professional?.name} {professional?.typeCr?.toUpperCase()} {professional?.cro}
                  </Typography>
                </Box>
              </Grid>

              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                    {clinicData?.street} {clinicData?.addressNumber} {clinicData?.neighborhood} {clinicData?.city} {clinicData?.state} {clinicData?.addressComplement} {clinicData?.cep}
                  </Typography>
                </Box>
              </Grid>

              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                    Telefone: {lab?.phone}
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 6, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    {clinicData?.profilePic && (
                      <img src={clinicData?.profilePic} style={{ width: 'auto', maxWidth: '80px', height: 'auto', marginBottom: '10px' }} />
                    )}
                    <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {clinicData && clinicData?.name}
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
              <Grid item sm={12} sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }} align="center">
                    FICHA DE EXAME ({Exam})
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                    {patient?.name}
                    {patient?.cellPhone &&
                      ' - ' + patient?.cellPhone
                    }
                    {patient?.cpf &&
                      ' - ' + patient?.cpf
                    }
                  </Typography>
                </Box>
              </Grid>

              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column' }}>
                    <TableContainer style={{overflow: 'hidden', height: `${getObjectDimension(data) * 200}px`}}>
                      <Table>
                        <TableBody>
                        {data['Assinale a arcaria'] && <TableRow hover sx={{ '&:last-of-type td': { border: 0 } }}>
                              <TableCell><b>Assinale a arcaria</b></TableCell>
                              <TableCell>{data['Assinale a arcaria']}</TableCell>
                            </TableRow>}
                          {Object.keys(questionsObjectList[Exam]||{})?.map((key: string, index: number) => (
                            <>
                            <TableRow hover key={index} sx={{ '&:last-of-type td': { border: 0 } }}>
                              <TableCell><b>{key}</b></TableCell>
                              {data[key]?.split(',').length <= 1 && <TableCell>{data[key]}</TableCell>}
                            </TableRow>

                            {
                              (data[key]?.split(',').length > 1) && data[key]?.split(',').map((v:any)=><TableRow hover key={index} sx={{ '&:last-of-type td': { border: 0 } }}>
                              <TableCell>{v}</TableCell>
                            </TableRow>)
                            }
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          <Button onClick={()=>window.print()} variant='contained' name='emmit' color='success'>
            Imprimir
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
              Exame não encontrado
            </Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default ExamPrint;
