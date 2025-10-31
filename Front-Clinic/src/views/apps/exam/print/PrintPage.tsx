/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

// ** React Imports
import { useEffect, useState, useRef } from 'react'
import crypto from 'crypto'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CloseIcon from '@mui/icons-material/Close'
import CachedIcon from '@mui/icons-material/Cached'

// ** Third Party Components
import api from 'src/@core/components/api-client'
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import { Button, Dialog, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { questionsObjectList } from 'src/views/components/ExamForm/questions'
import { aC } from '@fullcalendar/core/internal-common'

type ExamPrintLayoutProps = {
  id: string | undefined
  autoPrint?: boolean
}

function getObjectDimension(obj: any) {
  let count = 0

  function countKeys(object: any) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        count++
        if (typeof object[key] === 'object' && object[key] !== null) {
          countKeys(object[key])
        }
      }
    }
  }

  countKeys(obj)

  return count
}

const ExamPrint = ({ id, autoPrint }: ExamPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [allData, setAllData] = useState<any>(null)
  const [lab, setLab] = useState<any>(null)
  const [clinicData, setClinicData] = useState<any>(null)
  const [Exam, setExam] = useState<string>('')
  const [professional, setProfessional] = useState<any>()
  const [patient, setPatient] = useState<any>()
  const [signature, setSignature] = useState<string | undefined>()

  const [inputValue, setInputValue] = useState<string>('')
  const [signatureWrite, setSignatureWrite] = useState<string>('')
  const [fontFamily, setFontFamily] = useState<string>('Arial')
  const [isSigned, setIsSigned] = useState<boolean>(false)
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false)

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional

  const fetchExam = () =>
    api
      .get(`/exams/${id}`)
      .then(res => {
        console.log('data', res.data)
        const { professional, data, lab, examType } = res.data
        setLab(lab)
        setExam(examType)
        setProfessional(professional)
        setPatient(res.data.patient)
        console.log('DATA AQ: ', data)
        setClinicData(res.data.clinic)
        setData(data)
        setAllData(res.data)
        setError(false)
      })
      .catch(error => {
        console.log('Error', error)
        setData(null)
        setError(true)
      })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const toggleFont = () => {
    setFontFamily(prevFont => (prevFont === 'Arial' ? "'Dancing Script', cursive" : 'Arial'))
  }

  const createHashSignature = (data: string) => {
    const hash = crypto.createHash('sha256')
    hash.update(data)
    const hashResult = hash.digest('hex')
    setSignature(hashResult)

    return hashResult
  }

  const concatDataPescription = () => {
    const name = professionalData.name || ''
    const specialty = professionalData.specialty || ''
    const cro = professionalData?.cro || ''
    const typeCR = professionalData.typeCr?.toUpperCase() || ''

    let concat: string = name + specialty + cro + typeCR + dayjs().format('DD/MM/YYYY HH:mm:ss')

    concat = concat.replace(/\s+/g, '')

    const hashSignature = createHashSignature(concat)

    return hashSignature
  }

  useEffect(() => {
    if (isSigned) {
      createSigner(false)
    }
  }, [isSigned])

  const handleInsertSignature = () => {
    setIsSigned(true)
  }
  async function createSigner(defaultValueName: boolean) {
    if (!professionalData?.signaturePic && !isSigned && defaultValueName === false) {
      setOpenModalSignature(true)

      return
    }

    const hash = concatDataPescription()

    const data = {
      clinicId: userData.clinicId,
      accountId: userData.accountId,
      signerId: professionalData.id,
      name: inputValue ? inputValue : professionalData.name,
      email: professionalData.email,
      council: professionalData.typeCr,
      numberCouncil: professionalData.cro,
      cpf: professionalData.cpf,
      imgSignature: professionalData.signaturePic ? professionalData.signaturePic : null,
      fontFamily: defaultValueName ? "'Dancing Script', cursive" : fontFamily,
      isProfessional: true,
      hash
    }

    await api.post(`/signers/${id}`, data)

    setOpenModalSignature(false)

    fetchExam()
  }

  async function phoneNumberClinic() {
    try {
      const accountResponse = await api.get('/accounts/me')

      return accountResponse.data.cellPhone
    } catch (error) {
      console.error('Erro ao buscar número de telefone:', error)

      return null
    }
  }

  // async function getClinic() {
  //   const clinic = await api.get(`/clinics`)
  //   const phoneNumber = await phoneNumberClinic();

  //   console.log(phoneNumber);

  //   const clinicWithPhone = {
  //     ...clinic.data,
  //     cellPhone: phoneNumber
  //   };

  //   setClinicData(clinicWithPhone);
  // }

  useEffect(() => {
    // getClinic();

    fetchExam()
  }, [id])

  if (data) {
    return (
      <Box sx={{ p: 12, pb: 6 }}>
        <style>
          {`
            @media screen {
              .print-container {
                width: 210mm;
                height: auto;
                min-height: 297mm;
                margin: 20px auto;
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
              }
            }

          @media (max-width: 768px) {
            .print-container {
              width: 100%;
              min-height: auto;
              margin: 0;
              border: none;
              box-shadow: none;
              padding: 15px;
              box-sizing: border-box;
            }
          }
        }

            @media print {
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
            .print-container {
                position: static;
                height: auto;
                width: 100%;
                
                padding: 0 !important;
                margin: 0 !important;

                border: none;
                box-shadow: none;
                
                page-break-after: always;
              }

              .page-break-avoid {
                page-break-inside: avoid;
              }
            }
          `}
        </style>
        <Dialog open={openModalSignature} onClose={() => setOpenModalSignature(false)}>
          <Box sx={{ p: 3, minWidth: '600px' }}>
            <Typography sx={{ fontSize: '26px' }}>Adicione sua assinatura</Typography>
            <Box sx={{ border: '1px solid #CCC', mt: 3, p: 3, borderRadius: '5px' }}>
              <Box
                sx={{
                  pt: 10,
                  mb: 2,
                  borderBottom: '1px solid black',
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center'
                }}
                className='page-break-avoid'
              >
                <CloseIcon />
                <input
                  type='text'
                  style={{
                    border: 'none',
                    fontSize: '26px',
                    outline: 'none',
                    fontFamily: fontFamily
                  }}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder='Seu nome'
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '.5rem',
                  cursor: 'pointer',
                  gap: '.2rem'
                }}
                onClick={toggleFont}
              >
                <CachedIcon />
                Alterar Fonte
              </button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 5, justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '12px' }}>
                Compreendo que essa é uma representação legal da minha assinatura.
              </Typography>
              <Button onClick={handleInsertSignature}>Inserir</Button>
            </Box>
          </Box>
        </Dialog>
        <Card className='print-container'>
          <CardContent>
            <Grid container>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '@media (max-width: 600px)': {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1
                  }
                }}
              >
                {clinicData?.profilePic && (
                  <img
                    src={clinicData.profilePic}
                    alt='Logo da Clínica'
                    style={{ width: 'auto', maxWidth: '150px', height: 'auto' }}
                  />
                )}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    {clinicData && clinicData.name}
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 0.5 }}>
                    {clinicData.street} {clinicData.addressNumber}
                    {clinicData.addressComplement ? `, ${clinicData.addressComplement}` : ''}, {clinicData.neighborhood}
                    , {clinicData.city} - {clinicData.state}, {clinicData.cep}.
                  </Typography>
                </Box>
              </Box>
              <Grid item sm={12} sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }} align='center'>
                    FICHA DE EXAME ({Exam})
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align='center'>
                    {patient?.name}
                    {patient?.cellPhone && ' - ' + patient?.cellPhone}
                    {patient?.cpf && ' - ' + patient?.cpf}
                  </Typography>
                </Box>
              </Grid>

              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column' }}>
                    <TableContainer style={{ overflow: 'hidden' }}>
                      <Table>
                        <TableBody>
                          {data['Assinale a arcaria'] && (
                            <TableRow hover sx={{ '&:last-of-type td': { border: 0 } }}>
                              <TableCell>
                                <b>Assinale a arcaria</b>
                              </TableCell>
                              <TableCell>{data['Assinale a arcaria']}</TableCell>
                            </TableRow>
                          )}
                          {Object.keys(questionsObjectList[Exam] || {})?.map(
                            (key: string, index: number) =>
                              data[key] && (
                                <>
                                  <TableRow hover key={index} sx={{ '&:last-of-type td': { border: 0 } }}>
                                    <TableCell>
                                      <b>{key}</b>
                                    </TableCell>
                                    {data[key]?.split(',').length <= 1 && <TableCell>{data[key]}</TableCell>}
                                  </TableRow>

                                  {data[key]?.split(',').length > 1 &&
                                    data[key]?.split(',').map((v: any) => (
                                      <TableRow hover key={index} sx={{ '&:last-of-type td': { border: 0 } }}>
                                        <TableCell>{v}</TableCell>
                                      </TableRow>
                                    ))}
                                </>
                              )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'left' }} className='page-break-avoid'>
                  <Typography variant='caption' sx={{ display: 'block' }}>
                    <Box component='span' sx={{ fontWeight: 'bold' }}>
                      Documento Assinado em:
                    </Box>{' '}
                    {allData.date ? dayjs(allData.date)?.format?.('DD/MM/YYYY') : 'Não Assinado'}
                  </Typography>

                  {allData.hash && (
                    <Typography variant='caption' sx={{ display: 'block' }}>
                      <Box component='span' sx={{ fontWeight: 'bold' }}>
                        Hash:
                      </Box>{' '}
                      {allData.hash}
                    </Typography>
                  )}

                  <Typography variant='caption' sx={{ display: 'block' }}>
                    <Box component='span' sx={{ fontWeight: 'bold' }}>
                      Email:
                    </Box>{' '}
                    {professionalData?.email}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          <Button onClick={() => window.print()} variant='contained' name='emmit' color='success'>
            Imprimir
          </Button>
          <Button
            onClick={() => {
              window.open('', '_self', '')
              window.close()
            }}
            name='close'
            variant='contained'
            color='error'
          >
            Fechar
          </Button>
          {!allData.isSigned && userData?.planType !== 'S' && (
            <Button color='info' variant='contained' onClick={() => createSigner(false)}>
              Gerar assinatura
            </Button>
          )}
        </Grid>
      </Box>
    )
  } else if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Alert severity='error'>Exame não encontrado</Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default ExamPrint
