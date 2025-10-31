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
import CircularProgress from '@mui/material/CircularProgress'

import { History } from '@mui/icons-material'

// ** Third Party Components
import api from 'src/@core/components/api-client'
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import {
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormGroup
} from '@mui/material'
import Link from 'next/link'

type contractPrintLayoutProps = {
  id: string | undefined
  autoPrint?: boolean
}

const Print = ({ id, autoPrint }: contractPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null)
  const [certificate, setContract] = useState<any>({})
  const [patient, setPatient] = useState<any>()
  const [contractHashDoc, setContractHashDoc] = useState<any>({})
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false)

  const [signature, setSignature] = useState<string | undefined>()

  const [selectionTextList, setSelectionTextList] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional

  const contractHash = async () => {
    try {
      const { data } = await api.get('/contracts-signature/docId/' + id)
      console.log('HASH DO CONTRATO ', data)
      setContractHashDoc(data)
    
      if (data?.signers) {
        const patientSigner = data.signers.find((signer: any) => !signer.isProfessional)
        if (patientSigner?.selectedOptions) {
          setSelectedOptions(patientSigner.selectedOptions)
        }
      }

    } catch (err) {
      console.error('Erro ao buscar hash do contrato', err)
    }
  }

  const fetchContract = () => {
    api
      .get(`/contract/${id}`)
      .then(res => {
        console.log(res.data)
        const data = res.data
        setContract(data)
        setClinicData(res.data.clinic)
        setPatient(res.data.patient)
        setData(data)
        setError(false)

        const selections = extractSelectionTexts(data.text || data.content || '')
        setSelectionTextList(selections)

      })
      .catch(error => {
        console.log('Error', error)
        setData(null)
        setError(true)
      })
  }

  useEffect(() => {
    fetchContract()
    contractHash()
  }, [id])

  const [inputValue, setInputValue] = useState<string>('')
  const [signatureWrite, setSignatureWrite] = useState<string>('')
  const [fontFamily, setFontFamily] = useState<string>('Arial') // Gerenciar a fonte
  const [isSigned, setIsSigned] = useState<boolean>(false)
  const [isTermsAccepted, setIsTermsAccepted] = useState(false) // Estado para capturar o valor do checkbox

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(event.target.checked) // Atualiza o estado quando o checkbox é marcado ou desmarcado
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const toggleFont = () => {
    setFontFamily(
      prevFont => (prevFont === 'Arial' ? "'Dancing Script', cursive" : 'Arial') // Alterna entre Arial e a fonte de assinatura
    )
  }

  const createHashSignature = (data: string) => {
    try {
      const hash = crypto.createHash('sha256')
      hash.update(data)
      const hashResult = hash.digest('hex')
      setSignature(hashResult)
      
return hashResult
    } catch (err) {
      try {
        console.error('Erro ao criar hash com crypto:', err)
        
return ''
      } catch (e) {
        return ''
      }
    }
  }

  const concatDataPescription = (...args: (string | undefined)[]) => {
    const selectionsString = selectedOptions.join('|')
    const concat: string = args.filter(Boolean).join('') + selectionsString + dayjs().format('DD/MM/YYYY HH:mm:ss')

    const cleanedConcat = concat.replace(/\s+/g, '')

    const hashSignature = createHashSignature(cleanedConcat)

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

  async function createSignerPatient() {
    const hashPatient = concatDataPescription(
      certificate.patient?.name,
      certificate.patient?.cpf,
      certificate.patient?.cellPhone
    )

    const dataToSend = {
      clinicId: certificate.clinic.id,
      accountId: certificate.accountId,
      signerId: certificate.patient.id,
      name: certificate.patient.name,
      cpf: certificate.patient.cpf,
      fontFamily: "'Dancing Script', cursive",
      hash: hashPatient,
      selectedOptions //back?
    }

    try {
      await api.post(`/signers/${id}`, dataToSend)
      fetchContract()
      contractHash()
    } catch (err) {
      console.error('Erro ao criar signer patient', err)
    }
  }

  async function createSigner() {
    if (!professionalData?.signaturePic && !isSigned) {
      setOpenModalSignature(true)
      
return
    }

    const hash = concatDataPescription(
      professionalData?.name,
      professionalData?.specialty,
      professionalData?.cro,
      professionalData.typeCr?.toUpperCase() ? professionalData.typeCr?.toUpperCase() : ''
    )

    const dataToSend = {
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

    try {
      await api.post(`/signers/${id}`, dataToSend)
      setOpenModalSignature(false)
      fetchContract()
    } catch (err) {
      console.error('Erro ao criar signer professional', err)
    }
  }

  function extractSelectionTexts(html: string): string[] {
    if (!html) return []
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const spans = Array.from(doc.querySelectorAll('.selection-text')).map(s => s.textContent?.trim() || '')
      if (spans.length > 0) return spans.filter(Boolean)

      const text = doc.body.innerText || ''
      const regex = /\[\s*\]\s*(.+)/g
      const result: string[] = []
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        const t = match[1].trim()
        if (t) result.push(t)
      }

      return Array.from(new Set(result))
    } catch (err) {
      console.error('Erro ao extrair seleções do HTML', err)
      
return []
    }
  }

  const toggleOption = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    )
  }

  const renderContractContent = (htmlContent: string, selections: string[]): string => {
    let modifiedContent = htmlContent

    const optionsToMark = contractHashDoc?.signers?.find((s: any) => !s.isProfessional)?.selectedOptions || selections

    optionsToMark.forEach((optionText: string) => {
      const escapedOptionText = optionText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(\\[\\s*\\]\\s*)(${escapedOptionText})`, 'gi');
      
      modifiedContent = modifiedContent.replace(regex, `[X] $2`);
    });

    return modifiedContent;
  };


  if (!data && !error) {
    return (
      <Box sx={{ p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Alert severity='error'>Contrato não encontrado</Alert>
          </Grid>
        </Grid>
      </Box>
    )
  }

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
                {certificate.clinic?.street} {certificate.clinic?.addressNumber}
                {certificate.clinic?.addressComplement ? `, ${certificate.clinic.addressComplement}` : ''}, {certificate.clinic?.neighborhood},{' '}
                {certificate.clinic?.city} - {certificate.clinic?.state}, {certificate.clinic?.cep}.
              </Typography>
            </Box>
          </Box>

          <div dangerouslySetInnerHTML={{ __html: renderContractContent(data.text, selectedOptions) }}></div>

          {data.professional && (
            <Grid item sm={12} sx={{ mt: 8, mb: 10, display: 'flex', justifyContent: 'center' }}>
              <Grid
                item
                sm={12}
                sx={{
                  mt: 8,
                  mb: 10,
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Grid item sm={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    {certificate.isSigned && certificate.imgSignature && <img src={certificate.imgSignature} width={200} alt='' />}
                    {certificate.name && (
                      <Typography
                        sx={{
                          fontFamily: certificate.fontFamily ? certificate.fontFamily : fontFamily,
                          fontSize: '24px',
                          fontWeight: 400
                        }}
                        align='center'
                      >
                        {certificate.isSigned && certificate.name && (certificate.name ? certificate.name : signatureWrite)}
                      </Typography>
                    )}

                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                      _____________________________________
                    </Typography>
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2, mb: 1.5 }}>
                      {certificate.professional}
                    </Typography>
                    {certificate.cid && (
                      <>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                          autorizo que meu diagnóstico(CID) esteja presente nesse atestado.
                        </Typography>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                          CID: {certificate.cid}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid item sm={12} sx={{ mt: 8, mb: 10, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <Grid item sm={6}>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Dancing Script, cursive',
                    fontSize: '24px',
                    fontWeight: 400
                  }}
                  align='center'
                >
                  {contractHashDoc.status === 'completed' && patient?.name}
                </Typography>
                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                  _____________________________________
                </Typography>
                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                  {patient?.name}
                </Typography>
              </Box>
            </Grid>

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
          </Grid>

          <Grid item sm={12} sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Typography sx={{ fontSize: '10px', display: 'flex', flexDirection: 'column' }}>
              <strong>Hash do Documento:</strong> {contractHashDoc?.hashDoc}
            </Typography>
          </Grid>
        </CardContent>
      </Card>

      {selectionTextList.length > 0 && certificate?.isSigned && contractHashDoc.status !== 'completed' && !professionalData && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant='subtitle1' sx={{ mb: 1 }}>
            Escolha as opções:
          </Typography>
          <FormGroup>
            {selectionTextList.map((text, idx) => (
              <FormControlLabel
                key={idx}
                control={<Checkbox checked={selectedOptions.includes(text)} onChange={() => toggleOption(text)} />}
                label={text}
              />
            ))}
          </FormGroup>
        </Box>
      )}

      {certificate?.isSigned && contractHashDoc.status !== 'completed' && !professionalData && (
        <FormControlLabel
          control={<Checkbox checked={isTermsAccepted} onChange={handleCheckboxChange} />}
          sx={{ mb: 4, mt: 1.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
          label={
            <>
              <Typography variant='body2' component='span'>
                Eu li e concordo com os termos desse contrato{' '}
              </Typography>
            </>
          }
        />
      )}

      {autoPrint && (
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

          {!certificate.isSigned && professionalData && (
            <Button color='info' variant='contained' onClick={createSigner}>
              Gerar assinatura
            </Button>
          )}

          {certificate?.isSigned && contractHashDoc.status !== 'completed' && !professionalData && (
            <Button
              color='info'
              variant='contained'
              onClick={createSignerPatient}
              disabled={!isTermsAccepted || (selectionTextList.length > 0 && selectedOptions.length === 0)} 
            >
              Assinar Paciente
            </Button>
          )}
        </Grid>
      )}
    </Box>
  )
}

export default Print
