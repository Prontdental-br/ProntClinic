'use client'

// ** React Imports
import { useEffect, useState, useRef } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import CachedIcon from '@mui/icons-material/Cached'
import Box, { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import crypto from 'crypto'

// ** Third Party Components
import api from 'src/@core/components/api-client'
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import { Button, Dialog } from '@mui/material'
import { History } from '@mui/icons-material'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const numero = require('numero-por-extenso')

import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

type DebtPrintLayoutProps = {
  id: string | undefined
  autoPrint?: boolean
}

const DebtPrint = ({ id, autoPrint }: DebtPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [transactionData, setTransactionData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null)
  const [debt, setDebt] = useState<number>()
  const [debtValue, setDebtValue] = useState<number>()
  const [budgetId, setBudgetId] = useState<string | undefined>()
  const [patient, setPatient] = useState<any>()
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false)

  const [signature, setSignature] = useState<string | undefined>()

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional

  async function getDebit() {
    try {
      const debit = await api.get(`/transactions/debt/${id}`)

      setData(debit.data.budget)
      setTransactionData(debit.data.transaction)

      const { payment } = debit.data.budget
      setDebt(payment?.value)
      setDebtValue(Number(debit.data.transaction.value))
      setBudgetId(debit.data.budget.id)
      setPatient(debit.data.budget.patient)
      setClinicData(debit.data.budget.clinic)
      setError(false)

      if (autoPrint) {
        setTimeout(() => window.print(), 1000)
      }
    } catch (err) {
      console.error('Error fetching debit:', err)
      setData(null)
      setError(true)
    }
  }

  const fetchBudget = () => {
    api
      .get(`/budgets/${budgetId}`)
      .then(res => {
        setData(res.data)
        const { payment } = res.data
        setDebt(payment?.value)
        setPatient(res.data.patient)
        setError(false)
      })
      .catch(error => {
        console.log('Error', error)
        setData(null)
        setError(true)
      })
  }

  useEffect(() => {
    getDebit()
  }, [id])

  const [inputValue, setInputValue] = useState<string>('')
  const [fontFamily, setFontFamily] = useState<string>('Arial')
  const [isSigned, setIsSigned] = useState<boolean>(false)

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
    const name = professionalData.name
    const specialty = professionalData.specialty
    const cro = professionalData?.cro
    const typeCR = professionalData.typeCr?.toUpperCase()

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
      name: inputValue ? inputValue : professionalData.name,
      email: professionalData.email,
      council: professionalData.typeCr,
      numberCouncil: professionalData.cro,
      cpf: professionalData.cpf,
      imgSignature: professionalData.signaturePic ? professionalData.signaturePic : null,
      fontFamily: fontFamily,
      isProfessional: true,
      hash
    }

    await api.post(`/signers/${budgetId}`, data)

    setOpenModalSignature(false)

    fetchBudget()
  }

  const DebtReceiptContent = ({ isCopy = false }: { isCopy?: boolean }) => {
    const totalInWords = numero.porExtenso(debtValue || 0, numero.estilo.monetario)

    const paymentDate = dayjs(transactionData?.paymentDate)
    const cityState = `${data.clinic.city} - ${data.clinic.state}`

    if (!transactionData) return null

    return (
      <CardContent sx={{ pb: isCopy ? 1 : 2 }} className='receipt-page'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {clinicData?.profilePic && (
            <img
              src={clinicData.profilePic}
              alt='Logo da Clínica'
              style={{ width: 'auto', maxWidth: '80px', height: 'auto' }}
            />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
              {clinicData && clinicData.name}
            </Typography>
            <Typography variant='caption' sx={{ mt: 0.5 }}>
              {data.clinic.street} {data.clinic.addressNumber}
              {data.clinic.addressComplement ? `, ${data.clinic.addressComplement}` : ''}, {data.clinic.neighborhood},{' '}
              {data.clinic.city} - {data.clinic.state}, {data.clinic.cep}.
            </Typography>
            <Typography variant='caption'>Telefone: {data.clinic?.account?.cellPhone}</Typography>
            <Typography variant='caption'>
              Profissional: {data?.professional.speciality} {data?.professional.name}{' '}
              {data.professional.typeCr?.toUpperCase()} {data.professional.cro}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            RECIBO ({isCopy ? 'VIA PACIENTE' : 'VIA DA CLÍNICA'})
          </Typography>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'primary.main' }}>
            R$ {debtValue ? debtValue?.toFixed(2).replace('.', ',') : '0,00'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: '4px', bgcolor: '#f9f9f9' }}>
          <Typography variant='body2' sx={{ lineHeight: 1.5 }}>
            Recebemos de **{patient.name}** com o CPF **{patient.cpf}**, a quantia de{' '}
            <Box component='span' sx={{ fontWeight: 'bold' }}>
              {totalInWords} ({debtValue ? debtValue?.toFixed(2).replace('.', ',') : '0,00'})
            </Box>
            , referente a **tratamento {data.description}**. Por ser verdade, firmamos o presente recibo.
          </Typography>
        </Box>

        <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant='body2' sx={{ fontWeight: 400, lineHeight: 1.2, mb: 4 }}>
            {cityState}, {paymentDate.format('DD')} de {paymentDate.format('MMMM')} de {paymentDate.format('YYYY')}
          </Typography>

          <Grid container justifyContent='center'>
            <Grid item sm={8} className='page-break-avoid'>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {data.isSigned && data.imgSignature && (
                  <img
                    src={data.imgSignature}
                    width={180}
                    alt='Assinatura Digital'
                    style={{ display: 'block', margin: 'auto' }}
                  />
                )}
                {data.name && (
                  <Typography
                    sx={{
                      fontFamily: data.fontFamily ? data.fontFamily : fontFamily,
                      fontSize: '20px',
                      fontWeight: 400,
                      borderBottom: '1px solid black',
                      display: 'inline-block',
                      minWidth: '200px',
                      lineHeight: 1.2,
                      mt: data.imgSignature ? 0 : 3
                    }}
                    align='center'
                  >
                    {data.isSigned && data.name}
                  </Typography>
                )}

                {!data.name && (
                  <Typography
                    sx={{
                      fontWeight: 400,
                      lineHeight: 1.2,
                      borderTop: '1px solid black',
                      width: '200px',
                      pt: 0.5,
                      mt: 3
                    }}
                    align='center'
                  >
                    {data.professional.name}
                  </Typography>
                )}

                {data.name && (
                  <Typography variant='body2' sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                    {data.professional.name}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {data.hash && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              mt: 3,
              fontSize: '8px',
              p: 1,
              borderTop: '1px dashed #ccc'
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '8px', mb: 1 }}>Histórico do Documento: </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <History sx={{ fontSize: '12px' }} />
                  <span style={{ fontSize: '7px' }}>Assinado</span>
                </div>
                <span style={{ fontWeight: '600', fontSize: '7px' }}>
                  {data.date ? dayjs(data.date)?.format?.('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')}
                </span>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '8px' }}>
              <Typography variant='caption'>
                <Box component='strong'>Hash:</Box> {data.hash ? data.hash : signature}
              </Typography>
              <Typography variant='caption'>
                <Box component='strong'>Email:</Box> {data?.email}
              </Typography>
              <Typography variant='caption'>
                <Box component='strong'>Nome:</Box> {data?.name}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    )
  }

  if (data) {
    return (
      <Box sx={{ p: 12, pb: 6 }}>
        <style>
          {`
            @media screen {
              .print-container {
                width: 210mm;
                margin: 0 auto;
                border: 1px solid #ccc;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
              }
              .receipt-page {
                  min-height: 48vh; 
                  box-sizing: border-box;
                  border-bottom: 2px dashed #000;
              }
            }

            @media print {
              body {
                  margin: 0 !important;
                  padding: 0 !important;
                  height: 100%;
              }
              html {
                  margin: 0 !important;
                  padding: 0 !important;
                  height: 100%;
              }
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
              .print-container {
                position: static;
                height: 297mm;
                max-height: 297mm;
                width: 100%;
                padding: 0 !important;
                margin: 0 !important;
                border: none;
                box-shadow: none;
                page-break-after: avoid; 
                page-break-before: avoid;
                page-break-inside: avoid;
              }
              
              .MuiCardContent-root {
                  padding: 8px !important; 
              }
              
              .receipt-page {
                  max-height: 50%; 
                  page-break-inside: avoid;
                  border-bottom: 1px dashed #000;
                  box-sizing: border-box;
                  padding-top: 5px !important;
                  padding-bottom: 5px !important;
              }
              .receipt-page:last-child {
                  border-bottom: none;
              }

              .hide-print {
                display: none;
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

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '12px' }}>
                Compreendo que essa é uma representação legal da minha assinatura.
              </Typography>
              <Button onClick={handleInsertSignature}>Inserir</Button>
            </Box>
          </Box>
        </Dialog>
        <Card className='print-container' sx={{ minHeight: '290mm' }}>
          <DebtReceiptContent isCopy={false} />
          <DebtReceiptContent isCopy={true} />
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
          {!data.isSigned && userData?.planType !== 'S' && (
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
            <Alert severity='error'>Débito não encontrado</Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default DebtPrint
