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
import CloseIcon from '@mui/icons-material/Close'
import CachedIcon from '@mui/icons-material/Cached'
import CardContent from '@mui/material/CardContent'
import { History } from '@mui/icons-material'

// ** Third Party Components
import api from 'src/@core/components/api-client'
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import {
  Button,
  Dialog,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'

type CertificatePrintLayoutProps = {
  id: string | undefined
  autoPrint?: boolean
}

const Print = ({ id, autoPrint }: CertificatePrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null)
  const [certificate, setCertificate] = useState<any>({})
  const [patient, setPatient] = useState<any>()
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false)

  const [signature, setSignature] = useState<string | undefined>()

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional

  const fetchCertificate = () => {
    api
      .get(`/certificate/${id}`)
      .then(res => {
        console.log(res.data)
        const data = res.data
        setCertificate(data)
        setClinicData(res.data.clinic)
        setPatient(res.data.patient)
        console.log(data)
        setData(data)
        setError(false)
      })
      .catch(error => {
        console.log('Error', error)
        setData(null)
        setError(true)
      })
  }

  useEffect(() => {
    fetchCertificate()
  }, [id])

  const [inputValue, setInputValue] = useState<string>('') // Estado para armazenar o valor do input
  const [signatureWrite, setSignatureWrite] = useState<string>('') // Estado para armazenar a assinatura final
  const [fontFamily, setFontFamily] = useState<string>('Arial') // Gerenciar a fonte
  const [isSigned, setIsSigned] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const toggleFont = () => {
    setFontFamily(
      prevFont => (prevFont === 'Arial' ? "'Dancing Script', cursive" : 'Arial') // Alterna entre Arial e a fonte de assinatura
    )
  }

  const createHashSignature = (data: string) => {
    const hash = crypto.createHash('sha256')
    hash.update(data)
    const hashResult = hash.digest('hex')
    setSignature(hashResult)

    return hashResult
  }

  const concatDataPescription = () => {
    const name = certificate?.professional
    const specialty = certificate?.specialty
    const cro = certificate?.cro
    const typeCR = certificate.typeCr?.toUpperCase() ? certificate.typeCr?.toUpperCase() : ''

    let concat: string = name + specialty + cro + typeCR + dayjs().format('DD/MM/YYYY HH:mm:ss')

    concat = concat.replace(/\s+/g, '')

    const hashSignature = createHashSignature(concat)

    return hashSignature
  }

  useEffect(() => {
    if (isSigned) {
      createSigner()
    }
  }, [isSigned])

  const handleInsertSignature = () => {
    setIsSigned(true)
  }
  async function createSigner() {
    if (!professionalData?.signaturePic && !isSigned) {
      setOpenModalSignature(true)

      return
    }

    const hash = concatDataPescription()

    const data = {
      clinicId: userData.clinicId,
      accountId: userData.accountId,
      signerId: professionalData.id,
      name: inputValue ? inputValue : '',
      email: professionalData.email,
      council: professionalData.typeCr,
      numberCouncil: professionalData.cro,
      cpf: professionalData.cpf,
      imgSignature: professionalData.signaturePic ? professionalData.signaturePic : null,
      fontFamily: fontFamily,
      isProfessional: true,
      hash
    }

    await api.post(`/signers/${id}`, data)

    setOpenModalSignature(false)

    fetchCertificate()
  }

  if (data) {
    return (
      <Box sx={{ p: 6 }}>
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
                  {certificate.clinic.street} {certificate.clinic.addressNumber}
                  {certificate.clinic.addressComplement ? `, ${certificate.clinic.addressComplement}` : ''}, {certificate.clinic.neighborhood},{' '}
                  {certificate.clinic.city} - {certificate.clinic.state}, {certificate.clinic.cep}.
                </Typography>
                <Typography variant='body2'>Telefone: {certificate.clinic.account.cellPhone}</Typography>
              </Box>
            </Box>

            <Typography variant='h6' sx={{ fontWeight: 'bold', textAlign: 'center', mt: 4 }}>
              {data.isDeclared ? 'DECLARAÇÃO' : 'ATESTADO'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                {certificate.speciality} {certificate.professional} {certificate.typeCr?.toUpperCase()}{' '}
                {certificate.cro}
              </Typography>
              <Typography variant='body2' sx={{ mt: 0.5 }}>
                {dayjs(data.startDate)?.format?.('DD/MM/YYYY')}
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: '4px', bgcolor: '#f9f9f9' }}>
              {data.isDeclared ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block', mb: 1 }}
                    align='center'
                  >
                    Declaro para fins {data.schoolStatement ? 'escolar' : 'de trabalho'} que o(a) paciente{' '}
                    {patient?.name}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }}
                    align='center'
                  >
                    esteve sob tratamento {certificate.speciality + ' '}
                    no período de{' '}
                    {certificate.days
                      ? `${certificate.days} dias`
                      : `${certificate.startTime} até ${certificate.endTime}`}
                    , {certificate.clinic.city}; {dayjs(certificate.startDate)?.format?.('DD/MM/YYYY')}.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block', mb: 1 }}
                    align='center'
                  >
                    Atesto, com o fim específico de dispensa de atividades trabalhistas, que o(a) paciente{' '}
                    {patient?.name}
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }}
                    align='center'
                  >
                    esteve sob meus cuidados profissionais na data de{' '}
                    {certificate.startDate
                      ? dayjs(certificate.startDate)?.format?.('DD/MM/YYYY')
                      : dayjs(certificate.created_at)?.format?.('DD/MM/YYYY')}{' '}
                    sendo recomendado(a) o repouso absoluto por um período de{' '}
                    {certificate.days
                      ? `${certificate.days} dias`
                      : `${certificate.startTime} até ${certificate.endTime}`}
                  </Typography>
                </Box>
              )}
            </Box>

            {certificate.cid && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                  Autorizo que meu diagnóstico (CID) esteja presente neste atestado.
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                  CID: {certificate.cid}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mt: 8,
                pt: 8,
                mb: 10,
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Grid item sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                  {certificate.isSigned && certificate.imgSignature && (
                    <img src={certificate.imgSignature} width={200} alt='Assinatura' />
                  )}
                  {certificate.name && (
                    <Typography
                      sx={{
                        fontFamily: certificate.fontFamily ? certificate.fontFamily : fontFamily,
                        fontSize: '24px',
                        fontWeight: 400
                      }}
                      align='center'
                    >
                      {certificate.isSigned && certificate.name && (certificate.name ? certificate.name : inputValue)}
                    </Typography>
                  )}
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                    _____________________________________
                  </Typography>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, mb: 1.5 }}>{certificate.professional}</Typography>
                </Box>
              </Grid>
            </Box>

            {certificate.hash && (
              <Grid item sm={12} sx={{ mt: 0, display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant='caption' sx={{ display: 'block' }}>
                    <Box component='span' sx={{ fontWeight: 'bold' }}>
                      Documento Assinado em:
                    </Box>{' '}
                    {dayjs(certificate.date)?.format?.('DD/MM/YYYY')}
                  </Typography>
                  {certificate.hash && (
                    <Typography variant='caption' sx={{ display: 'block' }}>
                      <Box component='span' sx={{ fontWeight: 'bold' }}>
                        Hash:
                      </Box>{' '}
                      {certificate.hash}
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
            )}
          </CardContent>
        </Card>

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          <Button
            onClick={() => window.print()}
            variant='contained'
            name='emmit'
            color='success'
            className='hide-print'
          >
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
            className='hide-print'
          >
            Fechar
          </Button>
          {!certificate.isSigned && userData?.planType !== 'S' && (
            <Button color='info' variant='contained' onClick={createSigner}>
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
            <Alert severity='error'>Receita não encontrada</Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default Print
