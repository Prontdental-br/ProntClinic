'use client'

// ** React Imports
import { useEffect, useState, useRef } from 'react'
import crypto from 'crypto'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import CloseIcon from '@mui/icons-material/Close'
import CachedIcon from '@mui/icons-material/Cached'
import Alert, { AlertColor } from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'

// ** Third Party Components
import api from 'src/@core/components/api-client'
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import {
  Button,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import { History } from '@mui/icons-material'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

import { usePDF } from 'react-to-pdf'
import { QRCodeCanvas } from 'qrcode.react'

type PrescriptionPrintLayoutProps = {
  id: string | undefined
  autoPrint?: boolean
}

const Print = ({ id, autoPrint }: PrescriptionPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null)
  const [prescription, setPrescription] = useState<any>({})
  const [patient, setPatient] = useState<any>()
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false)
  const [certificateData, setCertificateData] = useState<any>(null)

  const [signature, setSignature] = useState<string | undefined>()
  const [alertState, setAlertState] = useState<{ message: string; severity: AlertColor } | null>(null)

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional

  const fetchPrescription = () => {
    api
      .get(`/prescription/${id}`)
      .then(res => {
        console.log(res.data)
        const data = res.data
        setPrescription(data)
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

  const fetchCertificateA1 = () => {
    if (professionalData?.id) {
      api
        .get(`/digital-certificate/${professionalData.id}`)
        .then(res => {
          console.log(res.data)
          setCertificateData(res.data)
        })
        .catch(error => {
          console.log('Error', error)
        })
    }
  }

  useEffect(() => {
    fetchPrescription()
    fetchCertificateA1()
  }, [id])

  const [inputValue, setInputValue] = useState<string>('')
  const [signatureWrite, setSignatureWrite] = useState<string>('')
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
    const name = professionalData.name || ''
    const specialty = professionalData.specialty || ''
    const cro = professionalData?.cro || ''
    const typeCR = professionalData.typeCr?.toUpperCase() || ''

    let concat: string = name + specialty + cro + typeCR + dayjs().format('DD/MM/YYYY HH:mm:ss')

    concat = concat.replace(/\s+/g, '')

    const hashSignature = createHashSignature(concat)

    return hashSignature
  }

  const pdfRef = useRef<HTMLDivElement | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [signedPdfUrl, setSignedPdfUrl] = useState('')

  const generatePDF = async () => {
    if (!pdfRef.current) {
      console.error('Elemento HTML para PDF não encontrado!')

      return
    }

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true
      })

      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20)

      const pdfBlob = pdf.output('blob')

      const file = new File([pdfBlob], 'receita.pdf', { type: 'application/pdf' })

      setPdfFile(file)

      return file
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error)
    }
  }
  const handleCertChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCertFile(event.target.files[0])
    }
  }

  const handleSignPDFA1 = async (pdfFile: File | undefined) => {
    const formData = new FormData()
    formData.append('pdf', pdfFile ? pdfFile : '')
    formData.append('professionalId', professionalData.id)
    formData.append('prescriptionId', prescription.id)

    try {
      const response = await api.post('/prescription/sign-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      })

      console.log(response)

      // if (response.status === 201) {
      //   const blob = new Blob([response.data], { type: "application/pdf" });
      //   const url = URL.createObjectURL(blob);
      //   setSignedPdfUrl(url);

      //   const a = document.createElement("a");
      //   a.href = url;
      //   a.download = "pdf_assinado.pdf";
      //   document.body.appendChild(a);
      //   a.click();
      //   document.body.removeChild(a);
      // }

      fetchPrescription()
    } catch (error) {
      console.error('Erro ao assinar PDF:', error)
      setAlertState({ message: 'Erro ao assinar o documento.', severity: 'error' })
    } finally {
      setTimeout(() => {
        setAlertState(null)
      }, 5000)
    }
  }

  const handleSignerA1 = async () => {
    if (!prescription.isSigned) {
      await createSigner(true)
    }

    setTimeout(async () => {
      const pdf = await generatePDF()
      await handleSignPDFA1(pdf)
    }, 1000)
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

    fetchPrescription()
  }

  if (data) {
    const isSignedWithCertificate = prescription.isSigned && certificateData
    const prescriptionTitle = isSignedWithCertificate ? 'RECEITUÁRIO CONTROLE ESPECIAL' : 'RECEITUÁRIO'

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
          <Box
            sx={{
              p: 3,
              minWidth: '600px',
              '@media (max-width: 650px)': {
                minWidth: '95%',
                margin: '0 auto'
              }
            }}
          >
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
        <Card ref={pdfRef} className='print-container'>
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
                  {prescription.clinic.street} {prescription.clinic.addressNumber}
                  {prescription.clinic.addressComplement ? `, ${prescription.clinic.addressComplement}` : ''},{' '}
                  {prescription.clinic.neighborhood}, {prescription.clinic.city} - {prescription.clinic.state},{' '}
                  {prescription.clinic.cep}.
                </Typography>
                <Typography variant='body2'>Telefone: {prescription.clinic.account.cellPhone}</Typography>
              </Box>
            </Box>

            <Typography variant='h6' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              {prescriptionTitle}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant='body1' sx={{ fontWeight: 'bold', mb: 1 }}>
                Paciente:{' '}
                <Box component='span' sx={{ fontWeight: 'normal' }}>
                  {patient?.name}
                </Box>
              </Typography>
              <Typography variant='body2'>Data: {dayjs(data.startDate)?.format?.('DD/MM/YYYY')}</Typography>
            </Box>

            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px', bgcolor: '#f9f9f9' }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
                Prescrição:
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                  {prescription.medicine} - {prescription.quantity} {prescription.measure}(s)
                </Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  **Posologia:** {prescription.dosage}
                </Typography>
                <Typography variant='body2'>**Duração:** {prescription.duration}</Typography>
                <Typography variant='body2' sx={{ mt: 0.5 }}>
                  **Observação:** {prescription.observation}
                </Typography>
              </Box>
              {(prescription.secondaryPrescData && prescription.secondaryPrescData.length) > 0 && (
                <>
                  {/* <Divider sx={{ my: 2 }} /> */}
                  {prescription.secondaryPrescData.map((p: any, i: number) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                        {p.medicine} - {p.quantity} {p.measure}(s)
                      </Typography>
                      <Typography variant='body2' sx={{ mt: 0.5 }}>
                        **Posologia:** {p.dosage}
                      </Typography>
                      <Typography variant='body2'>**Duração:** {p.duration}</Typography>
                      <Typography variant='body2' sx={{ mt: 0.5 }}>
                        **Observação:** {p.observation}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
            </Box>

            <Box sx={{ mt: 10, mb: 2, pt: 2, textAlign: 'center' }}>
              <Typography variant='body2' sx={{ mb: 2, fontStyle: 'italic', textAlign: 'center' }}>
                Assino este declarando verdadeiras as informações escritas acima
              </Typography>

              <Box
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '50px', width: '100%' }}
              >
                {prescription?.pdfUrl && (
                  <Box>
                    <QRCodeCanvas value={prescription.pdfUrl} size={100} level='H' />
                  </Box>
                )}

                <Box sx={{ textAlign: 'center' }}>
                  {prescription.isSigned && prescription.imgSignature && (
                    <img
                      src={prescription.imgSignature}
                      width={200}
                      alt='Assinatura Digital'
                      style={{ display: 'block', margin: 'auto' }}
                    />
                  )}
                  {prescription.name && (
                    <Typography
                      sx={{
                        fontFamily: prescription.fontFamily ? prescription.fontFamily : 'Arial',
                        fontSize: '20px',
                        fontWeight: 400,
                        borderBottom: '1px solid black',
                        display: 'inline-block',
                        minWidth: '250px',
                        lineHeight: 1.2
                      }}
                    >
                      {prescription.isSigned && prescription.name}
                    </Typography>
                  )}
                  <Typography variant='body2' sx={{ mt: 0.5, fontWeight: 'bold' }}>
                    {prescription.professional} - {prescription.typeCr?.toUpperCase()} {prescription.cro}
                  </Typography>
                </Box>

                {prescription.isSigned && certificateData && (
                  <Box>
                    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src='/images/signature/ipcBrasil.png' width={85} alt='ICP-Brasil Logo' />
                      <Typography variant='caption' sx={{ mt: 0.5 }}>
                        Certificado ICP-Brasil
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {isSignedWithCertificate && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  mt: 4,
                  '@media print': {
                    flexDirection: 'row',
                    gap: '10px',
                    fontSize: '10px'
                  }
                }}
              >
                <Box
                  sx={{
                    border: '1px solid black',
                    p: '5px',
                    flex: 1,
                    maxWidth: '350px',
                    '@media print': {
                      p: '2px',
                      fontSize: '8px'
                    }
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      borderBottom: '1px solid black',
                      pb: '2px',
                      mb: '5px',
                      color: 'black'
                    }}
                  >
                    IDENTIFICAÇÃO DO COMPRADOR
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <Typography sx={{ color: 'black' }} variant='body2'>
                      Nome: ____________________________________
                    </Typography>
                    <Typography sx={{ color: 'black' }} variant='body2'>
                      Ident.: _______________ Org. Emissor _______
                    </Typography>
                    <Typography sx={{ color: 'black' }} variant='body2'>
                      Endereço: ________________________________
                    </Typography>
                    <Typography sx={{ color: 'black' }} variant='body2'>
                      Cidade: ___________________ UF: ___________
                    </Typography>
                    <Typography sx={{ color: 'black' }} variant='body2'>
                      Telefone: _________________________________
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    border: '1px solid black',
                    p: '5px',
                    flex: 1,
                    maxWidth: '350px',
                    '@media print': {
                      p: '2px',
                      fontSize: '8px'
                    }
                  }}
                >
                  <Typography
                    variant='body2'
                    sx={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      borderBottom: '1px solid black',
                      pb: '2px',
                      mb: '5px',
                      color: 'black'
                    }}
                  >
                    IDENTIFICAÇÃO DO FORNECEDOR
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', mt: 4 }}>
                    <Typography
                      variant='body2'
                      sx={{ borderTop: '1px solid black', width: '90%', textAlign: 'center', mt: 7, color: 'black' }}
                    >
                      Assinatura do farmacêutico
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ borderTop: '1px solid black', width: '90%', textAlign: 'center', color: 'black' }}
                    >
                      Data
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            <Box sx={{ textAlign: 'left' }} className='page-break-avoid'>
              <Typography variant='caption' sx={{ display: 'block' }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  Documento Assinado em:
                </Box>{' '}
                {prescription.date ? dayjs(prescription.date)?.format?.('DD/MM/YYYY') : 'Não Assinado'}
              </Typography>

              {prescription.hash && (
                <Typography variant='caption' sx={{ display: 'block' }}>
                  <Box component='span' sx={{ fontWeight: 'bold' }}>
                    Hash:
                  </Box>{' '}
                  {prescription.hash}
                </Typography>
              )}

              <Typography variant='caption' sx={{ display: 'block' }}>
                <Box component='span' sx={{ fontWeight: 'bold' }}>
                  Email:
                </Box>{' '}
                {professionalData?.email}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10, flexWrap: 'wrap' }} className='hide-print'>
          {signedPdfUrl && (
            <a href={signedPdfUrl} download='pdf_assinado.pdf'>
              Baixar PDF Assinado
            </a>
          )}
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
          {!prescription.isSigned && userData?.planType !== 'S' && (
            <Button color='info' variant='contained' onClick={() => createSigner(false)}>
              Gerar assinatura
            </Button>
          )}
          {userData?.planType !== 'S' && certificateData && (
            <Button color='secondary' variant='contained' onClick={handleSignerA1}>
              {prescription.isSigned && certificateData ? 'Gerar PDF certificado A1' : 'Assinar certificado e-cpf a1'}
            </Button>
          )}
        </Grid>
        {alertState && (
          <Alert severity={alertState.severity} onClose={() => setAlertState(null)} sx={{ mb: 4 }}>
            {alertState.message}
          </Alert>
        )}
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
