'use client'

// ** React Imports
import { useEffect, useState, useRef, ReactNode } from 'react'

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

import { History } from '@mui/icons-material'

import { styled, useTheme } from '@mui/material/styles'
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import dayjs from 'dayjs'
import { getGraphType } from 'src/@core/utils/budget-functions'

// ** Types
import { BudgetType, BudgetItemType } from 'src/types/apps/budgetTypes'
import { ClinicType } from 'src/types/apps/clinicsTypes'

// ** Third Party Components
import api from 'src/@core/components/api-client'

//graphs
import PermanentesSvgComponent from 'src/pages/budget/odont/Permanentes'
import DeciduosSvgComponent from 'src/pages/budget/odont/Deciduos'
import RostoSvgComponent from 'src/pages/budget/face/style/Rosto'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { ThemeColor } from 'src/@core/layouts/types'

import CustomChip from 'src/@core/components/mui/chip'

type BudgetPrintLayoutProps = {
  id: string | undefined
  autoPrint?: boolean
}

const BudgetPrint = ({ id, autoPrint }: BudgetPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<null | BudgetType>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null)
  const [clinicId, setClinicId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [contractHashDoc, setContractHashDoc] = useState<any>({})
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)

  const [signature, setSignature] = useState<string | undefined>()

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional

  const contractHash = async () => {
    const { data } = await api.get('/contracts-signature/docId/' + id)
    setContractHashDoc(data)
  }

  const fetchBudget = () => {
    api
      .get(`/budgets/${id}`)
      .then(res => {
        console.log('data', res.data)
        const budgetData = {
          ...res.data,
          budgetTreatments: res.data.budgetItems.map((item: any) => ({
            ...item,
            faces: item?.faces ? item.faces.split(',') : []
          }))
        }
        setClinicData(res.data.clinic)
        setData(budgetData)
        setError(false)
      })
      .catch(error => {
        console.log('Error', error)

        //setData(null)
        //setError(true)
      })
  }

  /*
  useEffect(() => {
    if (clinicId === null) {
      const userDataString = window.localStorage.getItem('userData')
      const userData = userDataString ? JSON.parse(userDataString) : null
      const _clinicId = userData ? userData.clinicId : ''

      setClinicId(_clinicId)
    }else{
      async function getClinic(){
        const clinic = await api.get(`/clinics/${clinicId}`)
        setClinicData(clinic.data);
      }

      getClinic()
    }
  }, [clinicId, setClinicId])
  */

  useEffect(() => {
    console.log('===AUTOPRINT===', autoPrint)
    if (data !== null && clinicData !== null) {
      drawGraph()
      if (autoPrint !== false) {
        setTimeout(() => {
          window.print()
        }, 1000)
      }
    }
  }, [data, clinicData])

  console.log(id)

  useEffect(() => {
    fetchBudget()
    contractHash()
  }, [id])

  function drawGraph() {
    if (data === null) {
      return
    }

    data.budgetTreatments.forEach(treatment => {
      document
        .querySelectorAll(
          `.clickable[data-reg*='${treatment.description}'], .clickable.is-dente[data-dente*='${treatment.description}']`
        )
        .forEach((el: any) => el.classList.add('active'))
      if (treatment.faces) {
        treatment.faces.forEach(face => {
          document
            .querySelectorAll(`.clickable[data-face*='${face}'][data-dente*='${treatment.description}']`)
            .forEach((el: any) => el.classList.add('active'))
        })
      }
    })

    //pintar  canvas
    if (
      data &&
      ((Array.isArray(data.shapesTabAi) && data.shapesTabAi.length > 0) ||
        (Array.isArray(data.shapesTabRegiao) && data.shapesTabRegiao.length > 0))
    ) {
      const shapes = data?.shapesTabAi.length > 0 ? data.shapesTabAi : data.shapesTabRegiao
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx === null || typeof ctx === 'undefined') {
        return
      }
      ctx.lineWidth = 5
      ctx.strokeStyle = '#2196f3'
      shapes.forEach(shape => {
        if (ctx == null) return

        if (shape.units && data.showUnits) {
          const text = `${Number(shape.units)} un`
          const paddingX = 6
          const paddingY = 4
          const arrowHeight = 6

          ctx.font = '12px Inter'
          ctx.textBaseline = 'top'

          const textMetrics = ctx.measureText(text)
          const boxWidth = textMetrics.width + paddingX * 2
          const boxHeight = 20

          const boxX = shape.sX - boxWidth / 2
          const boxY = shape.sY - boxHeight - arrowHeight - 5

          ctx.fillStyle = '#222'
          ctx.beginPath()
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6)
          ctx.fill()
          ctx.closePath()

          ctx.fillStyle = '#fff'
          ctx.fillText(text, boxX + paddingX, boxY + paddingY)

          ctx.beginPath()
          ctx.moveTo(shape.sX - 5, boxY + boxHeight)
          ctx.lineTo(shape.sX + 5, boxY + boxHeight)
          ctx.lineTo(shape.sX, boxY + boxHeight + arrowHeight)
          ctx.closePath()
          ctx.fillStyle = '#222'
          ctx.fill()
        }

        switch (shape.type) {
          case 'point':
            ctx.lineCap = 'round'
            ctx.fillStyle = shape.color ?? '##2196f3'
            ctx.beginPath()
            ctx.arc(shape.sX, shape.sY!, 5, 0, 2 * Math.PI)
            ctx.fill()
            ctx.closePath()

            break
          case 'line':
            ctx.lineWidth = 5
            ctx.strokeStyle = '#2196f3'
            ctx.fillStyle = 'transparent'
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(shape.sX, shape.sY)
            ctx.lineTo(shape.fX!, shape.fY!)
            ctx.stroke()
            break
          case 'arrow':
            ctx.lineWidth = 5
            ctx.strokeStyle = '#2196f3'
            ctx.fillStyle = '#2196f3'
            ctx.lineCap = 'round'
            const dx = shape.fX! - shape.sX
            const dy = shape.fY! - shape.sY
            const angle = Math.atan2(dy, dx)
            const headlen = 12
            ctx.lineWidth = 5

            //ctx.beginPath();
            ctx.moveTo(shape.sX, shape.sY)
            ctx.lineTo(shape.fX!, shape.fY!)
            ctx.moveTo(shape.fX!, shape.fY!)
            ctx.lineTo(
              shape.fX! - headlen * Math.cos(angle - Math.PI / 6),
              shape.fY! - headlen * Math.sin(angle - Math.PI / 6)
            )
            ctx.moveTo(shape.fX!, shape.fY!)
            ctx.lineTo(
              shape.fX! - headlen * Math.cos(angle + Math.PI / 6),
              shape.fY! - headlen * Math.sin(angle + Math.PI / 6)
            )
            ctx.stroke()

            //ctx.closePath();
            break
        }
      })
    }
  }

  const [inputValue, setInputValue] = useState<string>('')
  const [signatureWrite, setSignatureWrite] = useState<string>('')
  const [fontFamily, setFontFamily] = useState<string>('Arial')
  const [isSigned, setIsSigned] = useState<boolean>(false)
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)

  interface StatusObj {
    [key: string]: {
      color: ThemeColor
      label: string
    }
  }

  const statusObj: StatusObj = {
    A: { color: 'warning', label: 'Aberto' },
    O: { color: 'warning', label: 'Aberto' },
    R: { color: 'error', label: 'Rejeitado' },
    P: { color: 'success', label: 'Pago' }
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(event.target.checked)
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
    const hash = crypto.createHash('sha256')
    hash.update(data)
    const hashResult = hash.digest('hex')
    setSignature(hashResult)

    return hashResult
  }

  const concatDataPescription = (...args: (string | undefined)[]) => {
    const concat: string = args.filter(Boolean).join('') + dayjs().format('DD/MM/YYYY HH:mm:ss')

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
    const hashPatient = concatDataPescription(data?.patient.name, data?.patient.cpf, data?.patient.cellPhone)

    const dataSigner = {
      clinicId: data?.clinic.id,
      accountId: data?.clinic.accountId,
      signerId: data?.patient.id,
      name: data?.patient.name,
      cpf: data?.patient.cpf,
      fontFamily: "'Dancing Script', cursive",
      hash: hashPatient
    }

    await api.post(`/signers/${id}`, dataSigner)

    fetchBudget()
    contractHash()
  }

  async function createSigner() {
    if (
      !professionalData?.cpf ||
      !professionalData?.name ||
      !professionalData?.specialty ||
      !professionalData?.cro ||
      !professionalData?.typeCr
    ) {
      setOpenDialog(true)

      return
    }

    if (!professionalData?.signaturePic && !isSigned) {
      setOpenModalSignature(true)

      return
    }

    try {
      setIsSubmitting(true)

      const hash = concatDataPescription(
        professionalData?.name,
        professionalData?.specialty,
        professionalData?.cro,
        professionalData.typeCr?.toUpperCase() ? professionalData.typeCr?.toUpperCase() : ''
      )

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
      fetchBudget()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false) // Reabilita o botão ao finalizar
    }
  }

  if (data) {
    return (
      <Box
        sx={{
          p: { xs: 0, sm: 12 },
          pb: { xs: 0, sm: 6 }
        }}
      >
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Dados incompletos</DialogTitle>
          <DialogContent>
            <Typography>
              Para gerar assinaturas, é necessário preencher os seguintes campos no seu cadastro:
              <br />• Nome
              <br />• CPF
              <br />• Especialidade
              <br />• Tipo de Inscrição
              <br />• Inscrição
            </Typography>
            <Typography variant='body2' mt={2}>
              Se caso já preencheu esses dados, refaça o seu login novamente.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} variant='outlined' color='primary'>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        <Card>
          <CardContent>
            <Grid container>
              <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 6, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    {clinicData?.profilePic && (
                      <img
                        src={clinicData.profilePic}
                        style={{ width: 'auto', maxWidth: '80px', height: 'auto', marginBottom: '10px' }}
                      />
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
              <Grid item sm={12} sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }} align='center'>
                    PLANO DE TRATAMENTO
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align='center'>
                    {data.patient.name}
                    {data.patient.cellPhone && ' - ' + data.patient.cellPhone}
                    {data.patient.cpf && ' - ' + data.patient.cpf}
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 7 }}>
                <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align='center'>
                  Plano de tratamento
                </Typography>
              </Grid>
              <Grid
                item
                sm={12}
                sx={{ mt: 7, border: '1px solid #00000066', padding: '10px', borderRadius: '10px' }}
                className='rosto-box'
              >
                {!data.hideOdontogram && (
                  <>
                    {getGraphType(data) === 'permanentes' && <PermanentesSvgComponent />}
                    {getGraphType(data) === 'deciduos' && <DeciduosSvgComponent />}
                    {getGraphType(data) === 'estetica' && (
                      <>
                        {data.imageCaptured ? (
                          <Box id='draw-clipboard' component='div' display='flex' justifyContent='center'>
                            <img className='rosto-template' src={data.imageCaptured} alt='' />
                            <canvas ref={canvasRef} width='500' height='500'></canvas>
                          </Box>
                        ) : (
                          <div className='rosto-wrapper'>
                            <img className='rosto-template' src='/images/odonto/rosto.webp' alt='' />
                            <RostoSvgComponent />
                            <canvas ref={canvasRef} width='500' height='500'></canvas>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </Grid>
              <Grid item sm={12} sx={{ mt: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>Procedimentos</Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.2
                    }}
                  >
                    Valor
                  </Typography>
                </Box>
                <Box>
                  {data.budgetTreatments.map((item: BudgetItemType, idx: number) => (
                    <Grid
                      container
                      key={idx}
                      sx={{ paddingBottom: '10px', paddingTop: '10px', borderBottom: '1px solid #00000066' }}
                    >
                      <Grid item sm={9}>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.6 }}>
                          <b>
                            {item?.description.length === 0 || isNaN(parseInt(item?.description)) ? '' : 'Dente'}{' '}
                            {item?.description}
                          </b>{' '}
                          - {item?.treatment?.name || ''}
                          {item.qtd && item.unit && (
                            <>
                              {' '}
                              Qtd {item.qtd} {item.unit}
                            </>
                          )}
                          {(item.session ?? 0) > 0 && <b> - Sessões: {item.session}</b>}
                          {typeof item.faces?.length != 'undefined' &&
                            item.faces?.length > 0 &&
                            ' - ' + item.faces.join(', ')}
                        </Typography>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.6 }}>
                          {data.professional.name} - {data?.plan?.name ?? 'Sem plano'}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        sm={3}
                        sx={{ fontWeight: 600, lineHeight: 1.2, display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <Typography sx={{ textAlign: 'right' }}>
                          R$ {item?.value.toString().replaceAll('.', ',')}
                        </Typography>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
                <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {data.discount > 0 && (
                    <>
                      <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                        Subtotal:{' '}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.subtotal)}
                      </Typography>

                      <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                        Desconto:{' '}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.discount)}
                      </Typography>
                    </>
                  )}
                  <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                    Valor total:{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      data.budgetTreatments.reduce((acc: number, b: any) => acc + parseFloat(b.value), 0) -
                        data.discount
                    )}
                  </Typography>
                  {data.installments > 0 && (
                    <>
                      <Typography sx={{ fontWeight: 900, lineHeight: 2 }}>Parcelamento</Typography>
                      {data.downPayment > 0 && (
                        <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                          Entrada:{' '}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            data.downPayment
                          )}
                        </Typography>
                      )}
                      {data.installments > 0 && (
                        <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                          {data.installments}x de{' '}
                          {data.installments > 0 &&
                            ((data.subtotal - data.downPayment - data.discount) / data.installments).toLocaleString(
                              'pt-BR',
                              { style: 'currency', currency: 'BRL' }
                            )}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} mt={3} sx={{ width: '50%' }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell align='right'>Valor</TableCell>
                        <TableCell align='right'>Método</TableCell>
                        <TableCell align='right'>Status</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {data.transactions?.map((transaction: any) => {
                        // --- mesma lógica que você usou no renderCell ---
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const todayYMD = today.toISOString().slice(0, 10)

                        const dueDateYMD = transaction.dueDate
                          ? new Date(transaction.dueDate).toISOString().slice(0, 10)
                          : null

                        const status = transaction.isPaid ? 'P' : 'O'

                        const isOverdue = dueDateYMD !== null && dueDateYMD < todayYMD && status !== 'P'

                        const label = isOverdue ? 'Vencida' : statusObj[status]?.label
                        const color = isOverdue ? 'error' : statusObj[status]?.color

                        return (
                          <TableRow
                            key={transaction.id}
                            sx={{
                              backgroundColor: '#fafafa',
                              '&:hover': {
                                backgroundColor: '#e0f4ee'
                              }
                            }}
                          >
                            <TableCell>{dayjs(transaction.dueDate).format('DD/MM/YYYY')}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell align='right'>
                              R$ {Number(transaction.value).toFixed(2).replace('.', ',')}
                            </TableCell>
                            <TableCell align='right'>{transaction.paymentMethod || '—'}</TableCell>

                            <TableCell align='right'>
                              <CustomChip
                                size='small'
                                label={label}
                                color={color}
                                sx={{
                                  textTransform: 'capitalize',
                                  '& .MuiChip-label': { px: 2.5, lineHeight: 1.385 }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {data.observation && (
                <Grid item sm={12} sx={{ mt: 4, mb: 7 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.2, mb: 2 }}>Observação</Typography>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>{data.observation}</Typography>
                </Grid>
              )}
              <Grid item sm={12} sx={{ mt: 8, pt: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                    Assino este declarando verdadeiras as informações escritas acima
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 8, mb: 10, display: 'flex' }}>
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
                      {contractHashDoc.status === 'completed' && data.patient.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                      _____________________________________
                    </Typography>
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                      {data.patient.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item sm={6}>
                  <Box textAlign='center'>
                    {data.isSigned && data.imgSignature && (
                      <Box mt={0}>
                        <img src={data.imgSignature} width={200} alt='' />
                      </Box>
                    )}
                    {data.isSigned && data.name && (
                      <Typography
                        sx={{
                          fontFamily: data.fontFamily ? data.fontFamily : fontFamily,
                          fontSize: '24px',
                          fontWeight: 400
                        }}
                      >
                        {data.name ? data.name : signatureWrite}
                      </Typography>
                    )}
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                      _____________________________________
                    </Typography>

                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>{clinicData && clinicData.name}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {data.hash && (
                <Grid item sm={12} sx={{ mt: 0, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '12px', mb: 2 }}>
                      Histórico do Documento:{' '}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <History />
                        <span style={{ fontSize: '10px' }}>Assinado</span>
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '10px' }}>
                        {data.date ? dayjs(data.date)?.format?.('DD/MM/YYYY') : ''}
                      </span>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          lineHeight: 1.2,
                          fontSize: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <strong>Hash:</strong> {data.hash}
                      </Typography>
                    </div>

                    <div>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          lineHeight: 1.2,
                          fontSize: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <strong>Email: </strong> {data?.email}{' '}
                      </Typography>
                    </div>

                    <div>
                      <Typography
                        sx={{
                          fontWeight: 400,
                          lineHeight: 1.2,
                          fontSize: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <strong>Nome: </strong> {data?.name}{' '}
                      </Typography>
                    </div>
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

        {data?.isSigned && contractHashDoc.status !== 'completed' && !professionalData && data.status !== 'C' && (
          <FormControlLabel
            control={<Checkbox checked={isTermsAccepted} onChange={handleCheckboxChange} />}
            sx={{ mb: 4, mt: 1.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            label={
              <>
                <Typography variant='body2' component='span'>
                  Eu li e concordo com os termos desse orçamento{' '}
                </Typography>
              </>
            }
          />
        )}

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          {data.status !== 'C' && (
            <Button
              onClick={() => window.print()}
              variant='contained'
              name='emmit'
              color='success'
              className='hide-print'
            >
              Imprimir
            </Button>
          )}

          {data.status !== 'C' && (
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
          )}

          {!data.isSigned && professionalData && data.status !== 'C' && (
            <Button color='info' variant='contained' onClick={createSigner} disabled={isSubmitting}>
              {isSubmitting ? 'Gerando...' : 'Gerar assinatura'}
            </Button>
          )}

          {data?.isSigned && contractHashDoc.status !== 'completed' && !professionalData && data.status !== 'C' && (
            <Button color='info' variant='contained' onClick={createSignerPatient} disabled={!isTermsAccepted}>
              Assinar Paciente
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
            <Alert severity='error'>Orçamento não encontrado</Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default BudgetPrint
