/* eslint-disable prefer-const */
import React, { RefObject, useEffect, useState, useRef, useCallback } from 'react'

//import CurrencyInput from 'react-currency-masked-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'

// import RostoSVG from '../resources/rosto.svg'
import RostoSvgComponent from './style/Rosto'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

import ToolPoint from '../resources/tool-point.svg'
import ToolArrow from '../resources/tool-arrow.svg'
import ToolLine from '../resources/tool-line.svg'
import ToolTarget from '../resources/tool-plus.svg'
import ToolUndo from '../resources/undo.svg'
import ToolClose from '../resources/close.svg'

import Webcam from 'react-webcam'
import {
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Typography,
  Modal,
  Card,
  CardContent,
  Select,
  Grid,
  MenuItem
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Stack } from '@mui/system'
import FooterOdontogram from '../footer'
import ModalAddPacient from 'src/views/components/ModalAddPacient'
import { patientType } from 'src/types/apps/patientTypes'
import DialogContentText from '@mui/material/DialogContentText'
import Vimeo from '@u-wave/react-vimeo'

import { useDispatch, useSelector } from 'react-redux'
import {
  getPatients,
  getTreatments,
  getPlans,
  registerPatient,
  setPatient,
  setProfessional,
  getProfessionals,
  setBudgetTreatments,
  setPlan,
  setObservation,
  toggleIssueContract,
  setDate,
  setDescription,
  saveBudget,
  setBudgetStatus,
  setShowReceipt,
  setReceiptGraph,
  setTotalDiscount,
  setDownPayment,
  setInstallments,
  reset,
  setTotal,
  setDownPaymentInstallments,
  setDownPaymentMethod,
  setInstallmentsMethod,
  setQtd,
  setUnit,
  setProcedimentoStore,
  setSession,
  setValorManual,
  setBudgetPaid
} from 'src/store/apps/odontogram'
import { AppDispatch, RootState } from 'src/store'
import DialogReceipt from 'src/views/pages/odontogram/DialogReceipt'
import OdontogramCardReceipt from 'src/views/pages/odontogram/OdontogramCardReceipt'
import {
  BudgetItemType,
  PlanType,
  PatientType,
  TreatmentType,
  ProfessionalType,
  BudgetType,
  Shape
} from 'src/types/apps/budgetTypes'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { BudgetStatusEnum } from 'src/types/apps/budgetTypes'
import api from 'src/@core/components/api-client'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import dayjs from 'dayjs'
import { getGraphType } from 'src/@core/utils/budget-functions'
import { dr } from '@fullcalendar/core/internal-common'
import { InjectableControls } from 'src/views/components/InjectableControls'
import { Cancel, Check, Close } from '@mui/icons-material'
import { useRouter } from 'next/router'
import YouTubeIcon from '@mui/icons-material/YouTube'

type Pessoa = {
  id: string
  name: string
}

type tratItem = {
  description: string
  treatment?: TreatmentType
  status?: number
  selected?: boolean
  value?: number
  qtd?: number
  session?: number
  unit?: string
}

type Point = {
  x: number
  y: number
}

function Rosto() {
  const canvasRef2 = useRef<HTMLCanvasElement>(null)
  const canvasRef1 = useRef<HTMLCanvasElement>(null)
  const imgFileRef = useRef<HTMLInputElement>(null)
  const myface = useRef<HTMLImageElement>(null)
  const tool = useRef<string | null>(null)
  const canDraw = useRef(false)
  const initPoint = useRef<Point | null>()
  const shapesRef2 = useRef<Array<Shape>>([])
  const shapesRef1 = useRef<Array<Shape>>([])
  const webcamRef = useRef<Webcam>(null)
  const targetRegioes = useRef<HTMLImageElement>(null)
  const targetCustom = useRef<HTMLImageElement>(null)
  const inputPaciente = useRef<HTMLInputElement | null>(null)
  const translateXTargetRegioes = useRef(-250)
  const translateYTargetRegioes = useRef(-250)
  const translateXTargetCustom = useRef(-250)
  const translateYTargetCustom = useRef(-250)
  const moveWorkerInterval = useRef<number>()
  const [procedimento, setProcedimento] = useState<TreatmentType>()
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.odontogram)
  const [patientInpuValue, setPatientInputValue] = useState<string>()
  const [openCadPatient, setOpenCadPatient] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const patientInput = useRef<HTMLDivElement>(null)
  const [openAlertOnAddTreatments, setOpenAlertOnAddTreatments] = useState(false)
  const [budgetUpdate, setBudgetUpdate] = useState<any>()
  const [loading, setLoading] = useState(false)
  const [showSnackError, setShowSnackError] = useState(false)

  const getDOMGraph = (): Node => {
    console.log('pegando DOM', document.querySelector('.dental-panel .tab-content.show')!.cloneNode(true))

    return document.querySelector('.dental-panel .tab-content.show')!.cloneNode(true)
  }

  const videoConstraints = {
    width: 500,
    height: 500,
    facingMode: 'user'
  }

  const userData = JSON.parse(localStorage?.getItem('userData') || '{}')

  const [, updateState] = useState({})
  const forceUpdate = useCallback(() => updateState({}), [])
  const cItems = useRef(Array<tratItem>())
  const [selectedItem, setSelectedItem] = useState('')
  const [telefone, setTelefone] = useState('')
  const [showDiscount, setShowDiscount] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [typeDiscount, setTypeDiscount] = useState('%')
  const [parcelamento, setParcelamento] = useState(false)
  const [tab, setTab] = useState('regiao')
  const [capturePhoto, setCapturePhoto] = useState(false)
  const [useTarget, setUseTarget] = useState(false)
  const [selectedShape, setSelectedShape] = useState<{ x: number; y: number } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<'toxina' | 'acido' | 'fio' | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPos, setModalPos] = useState({ x: 0, y: 0, units: '', refSource: '' })
  const [unitInput, setUnitInput] = useState('')
  const [showShapesUnits, setShowShapeUnits] = useState<boolean>(false)
  const [openAlertOnAddPlans, setOpenAlertOnAddPlans] = useState(false)
  const router = useRouter()
  const paymentMethods = ['Dinheiro', 'Crédito', 'Débito', 'Boleto', 'Pix', 'Cheque']

  const [, setPaciente] = useState<Pessoa | null>({} as Pessoa)

  const toBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })

  const productColorMap = {
    acido: 'limegreen',
    toxina: '#2196f3',
    fio: '#ff9800'
  }

  useEffect(() => {
    if (budgetUpdate !== undefined) {
      handlePatient(budgetUpdate.patientId)
    }
  }, [budgetUpdate, handlePatient, dispatch])

  useEffect(() => {
    if (budgetUpdate) {
      dispatch(setDescription(budgetUpdate.description ?? ''))
    }
  }, [budgetUpdate, dispatch, setDescription])

  useEffect(() => {
    if (budgetUpdate && Array.isArray(store.plans) && store.plans.length > 0) {
      let plan: PlanType | undefined = store.plans.find((plan: PlanType) => plan.id == budgetUpdate.planId)
      if (plan) {
        dispatch(setPlan({ id: (plan as PlanType).id, name: (plan as PlanType).name }))
      }
    }
  }, [budgetUpdate, store.plans, dispatch, setPlan])

  useEffect(() => {
    if (budgetUpdate && Array.isArray(store.professionals)) {
      const dentista = store.professionals.find((d: Pessoa) => d.id === budgetUpdate.professionalId)
      if (dentista) {
        dispatch(setProfessional(dentista))
      }
    }
  }, [budgetUpdate, setProfessional, dispatch, store.professionals])

  useEffect(() => {
    if (budgetUpdate) {
      dispatch(setObservation(budgetUpdate.observation ?? ''))
    }
  }, [budgetUpdate, dispatch, setObservation])

  useEffect(() => {
    if (budgetUpdate && budgetUpdate.budgetItems) {
      const items: any[] = []
      budgetUpdate.budgetItems.forEach((item: any) => {
        document
          .querySelectorAll('.clickable[data-reg="' + item.description + '"]')
          .forEach(item => item.classList.add('in-order'))
        items.push({
          ...item,
          selected: true
        })
      })

      dispatch(setBudgetTreatments(items))
    }
  }, [budgetUpdate, dispatch, setBudgetTreatments])

  useEffect(() => {
    if (budgetUpdate && budgetUpdate.installments > 0) {
      setParcelamento(true)
    }
  }, [budgetUpdate, setParcelamento])

  useEffect(() => {
    if (budgetUpdate) {
      const {
        downPayment,
        installments,
        downPaymentInstallments,
        downPaymentMethods = [],
        installmentsMethods = []
      } = budgetUpdate

      dispatch(setDownPayment(downPayment))
      dispatch(setInstallments(installments))
      dispatch(setDownPaymentInstallments(downPaymentInstallments))

      // Setar métodos da entrada
      for (let i = 0; i < downPaymentInstallments; i++) {
        dispatch(
          setDownPaymentMethod({
            index: i,
            method: downPaymentMethods[i] || 'Pix'
          })
        )
      }

      // Setar métodos do saldo
      for (let i = 0; i < installments; i++) {
        dispatch(
          setInstallmentsMethod({
            index: i,
            method: installmentsMethods[i] || 'Pix'
          })
        )
      }
    }
  }, [budgetUpdate, dispatch])

  useEffect(() => {
    if (budgetUpdate) {
      if (budgetUpdate.discount && budgetUpdate.discount > 0) {
        setShowDiscount(true)
        setDiscount(budgetUpdate.discount)
        setTypeDiscount('R$')
      }
    }
  }, [budgetUpdate, dispatch, setShowDiscount, setDiscount, setTypeDiscount])

  useEffect(() => {
    if (budgetUpdate?.imageCaptured && myface.current) {
      myface.current.src = budgetUpdate.imageCaptured
      let rostoForm = document.getElementById('rosto-form') as HTMLElement
      if (rostoForm) {
        rostoForm.style.display = 'none'
      }
      setTab('ai')
    }
  }, [budgetUpdate, myface.current, setTab])

  useEffect(() => {
    if (
      budgetUpdate?.shapesTabAi &&
      budgetUpdate?.shapesTabAi.length > 0 &&
      shapesRef2.current.length == 0 &&
      canvasRef2.current
    ) {
      console.log('bateu tab ai')
      shapesRef2.current = budgetUpdate.shapesTabAi
      paintCanvas(canvasRef2, shapesRef2)
    }
  }, [budgetUpdate, shapesRef2.current, canvasRef2.current])

  useEffect(() => {
    if (
      budgetUpdate?.shapesTabRegiao &&
      budgetUpdate?.shapesTabRegiao.length > 0 &&
      shapesRef1.current.length == 0 &&
      canvasRef1.current
    ) {
      console.log('bateu tab região')
      shapesRef1.current = budgetUpdate.shapesTabRegiao
      paintCanvas(canvasRef1, shapesRef1)
      setTool('point')
    }
  }, [budgetUpdate, shapesRef1.current])

  // useEffect(() => {
  //   if(
  //     budgetUpdate &&
  //     getGraphType({
  //       ...budgetUpdate,
  //       budgetTreatments: budgetUpdate.budgetItems,
  //     }) === 'deciduos'
  //   ){
  //     setTab('deciduos');
  //   }else{
  //     setTab('permanentes');
  //   }
  // }, [budgetUpdate, setTab, getGraphType])

  let params = new URLSearchParams(document.location.search)

  useEffect(() => {
    if (params.has('id')) {
      setLoading(true)
      api
        .get(`/budgets/${params.get('id')}`)
        .then(res => {
          if (res.status == 200) {
            setBudgetUpdate(res.data)
          }
        })
        .catch(error => {
          setShowSnackError(true)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [setBudgetUpdate])

  useEffect(() => {
    document.querySelectorAll('path').forEach(p => {
      p.addEventListener('mouseover', e => {
        const tooltip = document.querySelector('.path-tooltip') as HTMLElement
        if (!tooltip) return
        tooltip.style.display = 'block'
        tooltip.style.top = e.pageY - window.scrollY + 25 + 'px'
        tooltip.style.left = e.pageX + 'px'
        if (e.target) {
          const tooltipText = (e.target as HTMLElement).dataset.reg
          if (tooltipText) {
            tooltip.innerHTML = tooltipText
          }
        }
      })

      p.addEventListener('mouseout', () => {
        let tooltip = document.querySelector('.path-tooltip') as HTMLElement
        if (tooltip) {
          tooltip.style.display = 'none'
        }
      })
    })

    if (imgFileRef.current == null) return
    imgFileRef.current.addEventListener('change', async function () {
      if (imgFileRef.current && imgFileRef.current.files && imgFileRef.current.files.length > 0) {
        if (myface.current) {
          myface.current.src = await toBase64(imgFileRef.current.files[0])
          console.log('myface current src', myface.current.src)
        }
        let rostoForm = document.getElementById('rosto-form') as HTMLElement
        if (rostoForm) {
          rostoForm.style.display = 'none'
        }
        if (canvasRef2.current) {
          let ctx = canvasRef2.current.getContext('2d')
          if (ctx) {
            ctx.lineWidth = 5
            ctx.strokeStyle = '#2196f3'
          }
        }
      }
    })
  }, [])

  useEffect(() => {
    dispatch(reset())
    dispatch(getPatients())
    dispatch(getPlans())
    dispatch(getTreatments())
    dispatch(getProfessionals())

    return () => {
      dispatch(reset())
    }
  }, [dispatch])

  useEffect(() => {
    if (store?.patient?.cellPhone) {
      setTelefone(store.patient.cellPhone)
    }
  }, [store.patient])

  useEffect(() => {
    if (store.patients.length > 0) {
      let params = new URLSearchParams(document.location.search)
      let patient = params.get('patient')
      if (patient) {
        handlePatient(patient)
      }

      // else {
      //   dispatch(setPatient(null));
      //   setTelefone('');
      // }
    }
  }, [store.patients])

  function paintCanvas(cvRef: RefObject<HTMLCanvasElement>, shapesRef: RefObject<Array<Shape>>) {
    if (cvRef.current == null) return
    if (shapesRef.current == null) return

    const ctx = cvRef.current.getContext('2d')
    if (ctx == null) return

    ctx.clearRect(0, 0, cvRef.current.width, cvRef.current.height)
    ctx.strokeStyle = '#2196f3'
    ctx.fillStyle = '#2196f3'

    shapesRef.current.forEach(shape => {
      if (ctx == null) return

      if (shape.units && showShapesUnits) {
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
          ctx.fillStyle = shape.color ?? '#2196f3'
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

          ctx.beginPath()
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
          break
      }
    })
  }

  useEffect(() => {
    document.querySelectorAll('.clickable').forEach(item => {
      //corrigir seletor pós mapeamento de svgs
      item.addEventListener('click', e => {
        e.stopImmediatePropagation()
        const target = e.target as HTMLElement
        if (target == null) return
        target.classList.toggle('active')

        //let reg = document.getElementById('regs').value;
        if (target.classList.contains('active')) {
          const regIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.reg)
          if (regIndex == -1) {
            console.log('adicionando novo indice')
            console.log('item: ', target.dataset.reg)
            if (typeof target.dataset.reg != 'undefined') {
              console.log('reg:', target.dataset.reg)
              const item: tratItem = {
                description: target.dataset.reg!
              }

              console.log('item a ser adicionado:', item)
              cItems.current.push(item)
              setSelectedItem(item.description)
              markReg(item.description)
            }
          }
        } else {
          const regIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.reg)
          cItems.current.splice(regIndex, 1)
          unmarkReg(target.dataset.reg!)
        }

        forceUpdate()
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cItems])

  const calcSubtotal = React.useCallback(() => {
    console.log('treatments', store.budgetTreatments)

    let subtotal = store.budgetTreatments.reduce((acc: number, item: any) => {
      return item.selected && typeof item.treatment != 'undefined' ? acc + parseFloat(item?.value) : acc
    }, 0)

    return subtotal
  }, [store.budgetTreatments])

  useEffect(() => {
    let subtotal = calcSubtotal()
    let totalDiscount = typeDiscount == '%' ? subtotal * (discount / 100) : discount
    dispatch(setTotalDiscount(totalDiscount))
  }, [store.budgetTreatments, discount, typeDiscount, dispatch, calcSubtotal])

  function markReg(reg: string) {
    console.log('marcando regiao ', reg)
    document.querySelectorAll('.clickable[data-reg="' + reg + '"]').forEach(item => item.classList.add('active'))
  }

  function unmarkReg(reg: string) {
    document.querySelectorAll('.clickable[data-reg="' + reg + '"]').forEach(item => item.classList.remove('active'))
  }

  function handleProcedimento(id: string) {
    if (store.treatments.length == 0 || id === '') return
    let procedimento = store.treatments.find((p: TreatmentType) => p.id == id)

    if (!procedimento) return
    setProcedimento(procedimento)

    dispatch(setProcedimentoStore(procedimento.value))

    document.getElementById('popup-select-procedimento')?.classList.remove('show')
  }

  function removeItem(item: string) {
    cItems.current = cItems.current.filter(cItem => cItem.description != item)
    document.querySelectorAll(`.clickable[data-reg="${item}"]`).forEach(item => item.classList.remove('active'))
    forceUpdate()
  }

  function addTratamentos() {
    if (store.professionals.length === 0) {
      setOpenAlertOnAddPlans(true)

      return
    }

    if (Object.keys(store.professional).length === 0 || typeof procedimento === 'undefined') {
      setOpenAlertOnAddTreatments(true)

      return
    }

    let auxTratamentos: Array<tratItem> = [...store.budgetTreatments]
    const proc = { ...procedimento, value: store.total } as TreatmentType
    setProcedimento(proc)

    const isRegiaoTab = tab === 'regiao'
    const hasSelectedItems = cItems.current.length > 0

    if (isRegiaoTab && hasSelectedItems) {
      cItems.current.forEach(i => {
        const item = { ...i }
        const tratamento: tratItem = {
          description: item.description,
          treatment: proc,
          selected: true,
          value: store.total,
          qtd: store.qtd,
          unit: store.unit,
          session: store.session,
          status: 1
        }
        auxTratamentos.push(tratamento)
      })

      setSelectedItem('')
      cItems.current = []
      document.querySelectorAll(`.clickable`).forEach(item => {
        if (item.classList.contains('active')) {
          item.classList.remove('active')
          item.classList.add('in-order')
        }
      })
    } else {
      const tratamento: tratItem = {
        description: 'Aplicação',
        treatment: proc,
        selected: true,
        value: store.total,
        qtd: store.qtd,
        unit: store.unit,
        session: store.session
      }

      auxTratamentos.push(tratamento)
    }

    dispatch(setBudgetTreatments(auxTratamentos))
  }

  function handleDentista(_: React.SyntheticEvent, value: { id: string; label: string } | null) {
    if (value) {
      const dentista = store.professionals.find((d: Pessoa) => d.id === value.id)
      dispatch(setProfessional(dentista))
    }
  }

  function toggleItem(index: number) {
    let item: BudgetItemType = Object.assign({}, store.budgetTreatments[index])
    item.selected = !item.selected
    let t: Array<BudgetItemType> = [...store.budgetTreatments]
    t.splice(index, 1, item)
    dispatch(setBudgetTreatments(t))
    forceUpdate()
  }

  function currencyFormat(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  function calcTotal() {
    //const subtotal = calcSubtotal();
    //console.log('discount', store.totalDiscount)
    let total = budgetUpdate
      ? budgetUpdate.budgetItems.reduce((acc: any, item: any) => acc + parseFloat(item.value), 0)
      : calcSubtotal()
    console.log(total)

    return total
  }

  function setTool(t: string | null) {
    tool.current = t
    forceUpdate()
  }

  function undo(cvRef: RefObject<HTMLCanvasElement>, shapesRef: RefObject<Array<Shape>>) {
    if (shapesRef.current == null) return
    shapesRef.current.pop()
    paintCanvas(cvRef, shapesRef)
  }

  function handleCanvasClick(x: number, y: number, cvRef: RefObject<HTMLCanvasElement>, refName: string) {
    if (!cvRef) return

    const rect = cvRef?.current?.getBoundingClientRect()

    setModalPos({
      x: rect ? rect.left + x : 0,
      y: rect ? rect.top + y : 0,
      units: '',
      refSource: refName
    })

    setModalOpen(true)
  }

  function handleUndo() {
    if (tab == 'regiao') {
      undo(canvasRef1, shapesRef1)
    } else {
      undo(canvasRef2, shapesRef2)
    }
  }

  function cvMouseDown(
    refName: string,
    cvRef: RefObject<HTMLCanvasElement>,
    shapesRef: RefObject<Array<Shape>>,
    x: number,
    y: number
  ) {
    console.log(`mouse down x:${x} y:${y}`)
    console.log('tool current', tool.current)

    if (tool.current == null) return
    if (shapesRef.current == null) return
    switch (tool.current) {
      case 'point':
        shapesRef.current.push({
          type: 'point',
          sX: x,
          sY: y,
          product: selectedProduct ? selectedProduct : '',
          color: selectedProduct ? productColorMap[selectedProduct] : '#2196f3'
        })
        handleCanvasClick(x, y, cvRef, refName)
        paintCanvas(cvRef, shapesRef)
        break
      case 'line':
        initPoint.current = { x: x, y: y }
        canDraw.current = true

        break
      case 'arrow':
        initPoint.current = { x: x, y: y }
        canDraw.current = true
        break
    }
  }

  function cvMouseUp(
    refName: string,
    cvRef: RefObject<HTMLCanvasElement>,
    shapesRef: RefObject<Array<Shape>>,
    fX: number,
    fY: number
  ) {
    if (tool.current == null) return
    switch (tool.current) {
      case 'point':
        paintCanvas(cvRef, shapesRef)
        break
      case 'line':
        if (initPoint.current == null) return
        if (shapesRef.current == null) return
        shapesRef.current.push({
          type: 'line',
          sX: initPoint.current.x,
          sY: initPoint.current.y,
          fX: fX,
          fY: fY,
          product: selectedProduct ? selectedProduct : ''
        })
        initPoint.current = null
        canDraw.current = false
        handleCanvasClick(fX, fY, cvRef, refName)
        paintCanvas(cvRef, shapesRef)

        break
      case 'arrow':
        if (initPoint.current == null) return
        if (shapesRef.current == null) return
        shapesRef.current.push({
          type: 'arrow',
          sX: initPoint.current.x,
          sY: initPoint.current.y,
          fX: fX,
          fY: fY
        })
        initPoint.current = null
        canDraw.current = false

        // handleCanvasClick(fX, fY, cvRef, refName)
        paintCanvas(cvRef, shapesRef)
        break
    }
  }

  function cvMouseMove(cvRef: RefObject<HTMLCanvasElement>, shapesRef: RefObject<Array<Shape>>, x: number, y: number) {
    if (tool.current == null) return
    if (shapesRef.current == null) return
    if (cvRef.current == null) return

    const ctx = cvRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, cvRef.current.width, cvRef.current.height)
    paintCanvas(cvRef, shapesRef)

    let hoveredShape: Shape | null = null

    for (const shape of shapesRef.current) {
      if (shape.type) {
        const dist = Math.sqrt((shape.sX - x) ** 2 + (shape.sY - y) ** 2)
        if (dist < 8) {
          hoveredShape = shape
          break
        }
      }
    }

    if (hoveredShape && hoveredShape.units) {
      const text = `${Number(hoveredShape.units)} un`
      const paddingX = 6
      const paddingY = 4
      const arrowHeight = 6

      ctx.font = '12px Inter'
      ctx.textBaseline = 'top'

      const textMetrics = ctx.measureText(text)
      const boxWidth = textMetrics.width + paddingX * 2
      const boxHeight = 20

      const boxX = hoveredShape.sX - boxWidth / 2
      const boxY = hoveredShape.sY - boxHeight - arrowHeight - 5

      ctx.fillStyle = '#222'
      ctx.beginPath()
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6)
      ctx.fill()
      ctx.closePath()

      ctx.fillStyle = '#fff'
      ctx.fillText(text, boxX + paddingX, boxY + paddingY)

      ctx.beginPath()
      ctx.moveTo(hoveredShape.sX - 5, boxY + boxHeight)
      ctx.lineTo(hoveredShape.sX + 5, boxY + boxHeight)
      ctx.lineTo(hoveredShape.sX, boxY + boxHeight + arrowHeight)
      ctx.closePath()
      ctx.fillStyle = '#222'
      ctx.fill()
    }
    switch (tool.current) {
      case 'point':
        break

      case 'line':
        if (canDraw.current && initPoint.current) {
          ctx.lineWidth = 5
          ctx.strokeStyle = '#2196f3'
          ctx.fillStyle = 'transparent'
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(initPoint.current.x, initPoint.current.y)
          ctx.lineTo(x, y)
          ctx.closePath()
          ctx.stroke()
        }
        break

      case 'arrow':
        if (canDraw.current && initPoint.current) {
          ctx.lineWidth = 5
          ctx.strokeStyle = '#2196f3'
          ctx.fillStyle = '#2196f3'
          ctx.lineCap = 'round'
          const dx = x - initPoint.current.x
          const dy = y - initPoint.current.y
          const angle = Math.atan2(dy, dx)
          const headlen = 12
          ctx.beginPath()
          ctx.moveTo(initPoint.current.x, initPoint.current.y)
          ctx.lineTo(x, y)
          ctx.moveTo(x, y)
          ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6))
          ctx.moveTo(x, y)
          ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6))
          ctx.closePath()
          ctx.stroke()
        }
        break
    }
  }

  function handleCapturePhotoOn() {
    setCapturePhoto(true)
    document.getElementById('rosto-form')!.style.display = 'none'
  }

  function handleCapturePhoto() {
    if (webcamRef.current == null) return
    const imgSrc = webcamRef.current.getScreenshot()
    if (imgSrc) {
      myface.current!.src = imgSrc
      console.log('myface current src', myface.current!.src)
    }
    setCapturePhoto(false)
  }

  function targetToTop() {
    moveWorkerInterval.current = window.setInterval(() => {
      if (tab == 'regiao') {
        translateYTargetRegioes.current--
        targetRegioes.current!.style.transform = `translate(${translateXTargetRegioes.current}px, ${translateYTargetRegioes.current}px)`
      } else {
        translateYTargetCustom.current--
        targetCustom.current!.style.transform = `translate(${translateXTargetCustom.current}px, ${translateYTargetCustom.current}px)`
      }
    }, 50)
  }

  function targetToRight() {
    moveWorkerInterval.current = window.setInterval(() => {
      if (tab == 'regiao') {
        translateXTargetRegioes.current++
        targetRegioes.current!.style.transform = `translate(${translateXTargetRegioes.current}px, ${translateYTargetRegioes.current}px)`
      } else {
        translateXTargetCustom.current++
        targetCustom.current!.style.transform = `translate(${translateXTargetCustom.current}px, ${translateYTargetCustom.current}px)`
      }
    }, 50)
  }

  function targetToBottom() {
    moveWorkerInterval.current = window.setInterval(() => {
      if (tab == 'regiao') {
        translateYTargetRegioes.current++
        targetRegioes.current!.style.transform = `translate(${translateXTargetRegioes.current}px, ${translateYTargetRegioes.current}px)`
      } else {
        translateYTargetCustom.current++
        targetCustom.current!.style.transform = `translate(${translateXTargetCustom.current}px, ${translateYTargetCustom.current}px)`
      }
    }, 50)
  }

  function targetToLeft() {
    moveWorkerInterval.current = window.setInterval(() => {
      if (tab == 'regiao') {
        translateXTargetRegioes.current--
        targetRegioes.current!.style.transform = `translate(${translateXTargetRegioes.current}px, ${translateYTargetRegioes.current}px)`
      } else {
        translateXTargetCustom.current--
        targetCustom.current!.style.transform = `translate(${translateXTargetCustom.current}px, ${translateYTargetCustom.current}px)`
      }
    }, 50)
  }

  function cancelTargetMovement() {
    window.clearInterval(moveWorkerInterval.current)
  }

  function handlePlan(e: React.SyntheticEvent, p: { id: string; label: string } | string | null) {
    if (typeof p == 'string' || p === null) {
      return
    }
    let plan = store.plans.find((plan: PlanType) => plan.id == p.id)
    dispatch(setPlan(plan))
  }

  function handleRegisterPatient() {
    setOpenCadPatient(true)
  }

  function handleSavePatient(data: patientType) {
    dispatch(registerPatient(data))
  }

  function handlePatient(p: null | string | undefined) {
    if (p === null || typeof p == 'undefined') {
      dispatch(setPatient(null))
      setTelefone('')

      return
    }

    let patient: PatientType | undefined = store.patients.find((patient: PatientType) => patient.id == p)
    if (typeof patient != 'undefined') {
      let phone = patient.cellPhone
      dispatch(setPatient(patient))
      setTelefone(phone ?? '')
    }
  }

  async function saveBudgetOdontogram(status?: BudgetStatusEnum) {
    //prepare store
    let dataBudget = {} as BudgetType

    let budgetTreatments = store.budgetTreatments.filter((item: BudgetItemType) => item.selected)

    dataBudget.budgetTreatments = budgetTreatments
    dataBudget.subtotal = calcSubtotal()
    dataBudget.total = calcTotal()
    dataBudget.discount = store.totalDiscount
    dataBudget.downPayment = store.downPayment
    dataBudget.installmentsMethods = store.installmentsMethods
    ;(dataBudget.downPaymentInstallments = store.downPaymentInstallments),
      (dataBudget.downPaymentMethods = store.downPaymentMethods),
      (dataBudget.installments = parcelamento ? store.installments : 0)
    dataBudget.observation = store.observation
    dataBudget.description = store.description ?? ''
    dataBudget.plan = store.plan
    dataBudget.professional = store.professional
    dataBudget.patient = store.patient
    dataBudget.date = store.date?.format('YYYY-MM-DD')
    dataBudget.patient = store.patient
    dataBudget.shapesTabRegiao = shapesRef1.current
    dataBudget.shapesTabAi = shapesRef2.current
    dataBudget.status = status || store.budgetStatus
    dataBudget.showUnits = showShapesUnits
    dataBudget.budgetPaid = store.budgetPaid

    if (myface?.current?.src) {
      try {
        const blob = await fetch(myface.current.src).then(r => r.blob())
        const formDataUpload = new FormData()
        formDataUpload.append('file', blob, 'captured-image.png')

        const accountId = userData?.accountId

        const uploadResponse = await api.post(`/upload/${accountId}`, formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const { url } = uploadResponse.data
        dataBudget.imageCaptured = url
      } catch (error) {
        console.error('Erro ao enviar imagem:', error)
      }
    }

    if (budgetUpdate?.id) {
      dataBudget.id = budgetUpdate.id
    }

    dispatch(saveBudget(dataBudget))
  }

  function _setBudgetStatus(status: string) {
    dispatch(setBudgetStatus(status))
  }

  function calcLiquid() {
    return params.has('id')
      ? store.budgetTreatments.reduce((acc, item: any) => (item.selected ? acc + parseFloat(item.value) : acc), 0)
      : calcTotal()
  }

  const handleSaveUnits = () => {
    let targetShapesRef = modalPos.refSource === 'ref2' ? shapesRef2 : shapesRef1
    let targetCanvasRef = modalPos.refSource === 'ref2' ? canvasRef2 : canvasRef1

    if (!targetShapesRef.current || targetShapesRef.current.length === 0) return

    const lastIndex = targetShapesRef.current.length - 1
    const lastShape = targetShapesRef.current[lastIndex]

    if (lastShape.type === 'point' || lastShape.type === 'line') {
      lastShape.units = modalPos.units
    }

    setModalPos({ ...modalPos })
    paintCanvas(targetCanvasRef, targetShapesRef)
    setModalOpen(false)
  }

  const handleUndoUnits = () => {
    let targetShapesRef = modalPos.refSource === 'ref2' ? shapesRef2 : shapesRef1
    let targetCanvasRef = modalPos.refSource === 'ref2' ? canvasRef2 : canvasRef1

    if (!targetShapesRef.current || targetShapesRef.current.length === 0) return

    undo(targetCanvasRef, targetShapesRef)

    setModalOpen(false)
  }

  const [unitSums, setUnitSums] = useState({
    toxina: 0,
    acido: 0,
    fio: 0
  })

  useEffect(() => {
    let previousSums = { toxina: 0, acido: 0, fio: 0 }

    const interval = setInterval(() => {
      const sums = {
        toxina: 0,
        acido: 0,
        fio: 0
      }

      const allShapes: Shape[] = []

      if (shapesRef1.current) {
        allShapes.push(...shapesRef1.current)
      }

      if (shapesRef2?.current) {
        allShapes.push(...shapesRef2.current)
      }

      allShapes.forEach(shape => {
        if (shape.type && shape.units && shape.product) {
          const units = parseFloat(shape.units)
          if (!isNaN(units)) {
            sums[shape.product as 'toxina' | 'acido' | 'fio'] += units
          }
        }
      })

      if (sums.toxina !== previousSums.toxina || sums.acido !== previousSums.acido || sums.fio !== previousSums.fio) {
        setUnitSums(sums)
        previousSums = sums
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const injectableToTreatmentMap = {
    toxina: { name: 'Toxina botulínica', id: 'id_toxina' },
    acido: { name: 'Ácido hialurônico', id: 'id_acido' },
    fio: { name: 'Fio de PDO', id: 'id_fio' }
  }

  const getInjectableTreatmentMap = () => {
    const map: any = {}
    store.treatments.forEach(t => {
      if (!t.active) return
      if (t.name.includes('Toxina')) map.toxina = { name: t.name, id: t.id }
      else if (t.name.includes('ácido')) map.acido = { name: t.name, id: t.id }
      else if (t.name.includes('Fios de PDO')) map.fio = { name: t.name, id: t.id }
    })

    return map
  }

  const handleInjectableSelect = (key: 'toxina' | 'acido' | 'fio') => {
    const map = getInjectableTreatmentMap()
    const treatment = map[key]
    if (!treatment) return

    handleProcedimento(treatment.id)
    const found = store.treatments.find(t => t.id === treatment.id)
    if (found) {
      dispatch(setTotal(found.value))
    }
  }

  useEffect(() => {
    paintCanvas(canvasRef1, shapesRef1)
    paintCanvas(canvasRef2, shapesRef2)
  }, [showShapesUnits])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [modalOpen])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveUnits()
    }
  }

  const [openModal, setOpenModal] = useState(false)

  const toggleVideo = () => {
    setOpenModal(true)
  }

  const handleClose = () => {
    setOpenModal(false)
  }

  return (
    <>
      <div id='main' className='container'>
        <Box display={'flex'} gap={6} alignItems={'center'}>
          <h1>HOF</h1>

          <Button sx={{ mb: 2, display: 'flex', alignItems: 'center' }} onClick={() => toggleVideo()}>
            <YouTubeIcon color='error' />
            VÍDEOS
          </Button>
        </Box>
        <div id='formRosto'>
          <Typography sx={{ mt: 5, mb: 3 }}>Dados do paciente</Typography>
          <div className='patient-data-wrapper'>
            <div className='form-group plano-wrapper'>
              <Autocomplete
                ref={patientInput}
                disablePortal
                freeSolo
                id='paciente'
                value={store.patient?.name || ''}
                options={store.patients.map(p => ({ label: p.name, id: p.id }))}
                sx={{ width: 300 }}
                onChange={(e: React.SyntheticEvent, p) => typeof p !== 'string' && handlePatient(p?.id)}
                onInputChange={(e, p) => setPatientInputValue(p)}
                renderInput={params => <TextField {...params} label='Paciente' onKeyUp={forceUpdate} />}
              />
            </div>

            <div className='form-group'>
              <TextField
                id='telefone'
                label='Telefone *'
                variant='outlined'
                value={telefone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setTelefone(event.target.value)
                }}
              />
            </div>

            {!store?.patient?.id && patientInpuValue && (
              <div className='form-group'>
                <Button variant='contained' size='large' onClick={handleRegisterPatient}>
                  Cadastrar paciente
                </Button>
              </div>
            )}
          </div>

          <Typography sx={{ mt: 5, mb: 3 }}>Página de Orçamento</Typography>
          <div className='form-group'>
            <TextField
              id='descricao '
              label='Descrição *'
              variant='outlined'
              value={store.description ?? ''}
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                dispatch(setDescription(event.target.value))
              }}
            />
          </div>

          <Typography sx={{ mt: 5, mb: 3 }}>Adicionar tratamento</Typography>
          <div className='tratamento-fields-wrapper'>
            <div className='form-group plano-wrapper'>
              <Autocomplete
                id='plano'
                options={store.plans.map((p: PlanType) => ({ label: p.name, id: p.id }))}
                sx={{ width: 300 }}
                onChange={handlePlan}
                value={Object.keys(store.plan).length > 0 ? { id: store.plan.id, label: store.plan.name } : null}
                renderInput={params => <TextField {...params} label='Plano' />}
              />
            </div>

            <div className='form-group tratamento-wrapper'>
              <Autocomplete
                id='tratamento'
                fullWidth
                options={store.treatments
                  .map(t => ({ active: t.active, label: t.name, id: t.id }))
                  .filter((t: any) => t.active)}
                sx={{ width: 300 }}
                value={
                  procedimento ? { active: procedimento.active, id: procedimento.id, label: procedimento.name } : null
                }
                onChange={(e, t) => (t ? handleProcedimento(t.id) : setProcedimento(undefined))}
                renderInput={params => <TextField {...params} label='Tratamento *' />}
              />
            </div>

            <div className='form-group data-wrapper'>
              <LocalizationProvider adapterLocale='pt_BR' dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Data *'
                  format='DD/MM/YYYY'
                  value={store.date}
                  onChange={newValue => {
                    dispatch(setDate(newValue))
                  }}

                  //renderInput={params => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className='form-group price-wrapper'>
              <TextField
                id='valor'
                label='Valor *'
                variant='outlined'
                value={store.valorDigitado ?? ''}
                onChange={e => dispatch(setValorManual(e.target.value))}
              />
            </div>

            <div className='form-group dentista-wrapper'>
              <Autocomplete
                id='dentista'
                options={store.professionals
                  .filter((d: { name: string; id: string; specialty: string }) => d.specialty !== 'recepcionista')
                  .map((d: { name: string; id: string }) => ({ label: d.name, id: d.id }))}
                sx={{ width: 300 }}
                value={
                  Object.keys(store.professional).length > 0
                    ? { id: store.professional.id, label: store.professional.name }
                    : null
                }
                onChange={(_, v) => handleDentista(_, v)}
                renderInput={params => <TextField {...params} label='Profissional *' />}
              />
            </div>

            <div className='form-group items-wrapper'>
              <span>Regiões Selecionadas</span>
              <Stack
                sx={{ border: 1, p: 3, borderRadius: '8px' }}
                direction='row'
                spacing={{ xs: 1, sm: 2 }}
                flexWrap='wrap'
              >
                {...cItems.current.map(function (item, index) {
                  let itemClass = 'panel-item'
                  if (item.description == selectedItem) itemClass += ' active'

                  return (
                    <div className={itemClass} key={index}>
                      <button type='button' className='label' onClick={() => setSelectedItem(item.description)}>
                        {item.description}
                      </button>
                      <button type='button' className='btn-close' onClick={() => removeItem(item.description)}>
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  )
                })}
              </Stack>
            </div>

            <Box display='flex' alignItems='center' gap={4} flexWrap='wrap'>
              <TextField
                id='qtd'
                label='Qtd.'
                type='number'
                size='small'
                style={{ width: '100px' }}
                value={store.qtd}
                onChange={e => {
                  dispatch(setQtd(e.target.value))
                }}
              />

              <FormControlLabel
                control={<Checkbox checked={store.unit === 'ML'} onChange={() => dispatch(setUnit('ML'))} />}
                label='ML'
              />
              <FormControlLabel
                control={<Checkbox checked={store.unit === 'UN'} onChange={() => dispatch(setUnit('UN'))} />}
                label='UN'
              />
              <TextField
                id='session'
                label='Sessão'
                type='number'
                size='small'
                style={{ width: '100px' }}
                value={store.session}
                onChange={e => {
                  dispatch(setSession(e.target.value))
                }}
              />
            </Box>
          </div>

          <div className='dental-panel'>
            <div className='panel-header'>
              <h3 onClick={() => setTab('regiao')} className={tab == 'regiao' ? 'active' : ''}>
                Regiões
              </h3>
              <h3 onClick={() => setTab('ai')} className={tab == 'ai' ? 'active' : ''}>
                Corpo/Face IA
              </h3>
            </div>
            <div className='panel-body'>
              <InjectableControls
                setSelectedInjactables={setSelectedProduct}
                selectedInjectable={selectedProduct}
                setTool={setTool}
                tool={tool}
                showShapesUnits={showShapesUnits}
                setShowShapesUnits={setShowShapeUnits}
                unitSums={unitSums}
                onSelectInjectable={handleInjectableSelect}
                selectedProcedimento={procedimento}
                totalValue={store.total}
                onUpdateValue={value => dispatch(setValorManual(value))}
              />
              <div id='draw-board'>
                <ul>
                  <li title='Ponto'>
                    <button
                      type='button'
                      className={tool.current == 'point' ? 'selected' : ''}
                      onClick={() => setTool(tool.current === 'point' ? null : 'point')}
                    >
                      <ToolPoint />
                    </button>
                  </li>
                  <li title='Seta'>
                    <button
                      type='button'
                      className={tool.current == 'arrow' ? 'selected' : ''}
                      onClick={() => setTool(tool.current === 'arrow' ? null : 'arrow')}
                    >
                      <ToolArrow />
                    </button>
                  </li>
                  <li title='Linha'>
                    <button
                      type='button'
                      className={tool.current == 'line' ? 'selected' : ''}
                      onClick={() => setTool(tool.current === 'line' ? null : 'line')}
                    >
                      <ToolLine />
                    </button>
                  </li>
                  <li>
                    <div className='target-controls-wrapper'>
                      <div className='target-controls'>
                        {useTarget && (
                          <>
                            <button
                              type='button'
                              onMouseUp={cancelTargetMovement}
                              onMouseOut={cancelTargetMovement}
                              onMouseDown={targetToTop}
                              title='Para cima'
                              id='control-top'
                            >
                              <img src='/images/odonto/pos-top.png' alt='' />
                            </button>
                            <button
                              type='button'
                              onMouseUp={cancelTargetMovement}
                              onMouseOut={cancelTargetMovement}
                              onMouseDown={targetToRight}
                              title='Para a direita'
                              id='control-right'
                            >
                              <img src='/images/odonto/pos-right.png' alt='' />
                            </button>
                            <button
                              type='button'
                              onMouseUp={cancelTargetMovement}
                              onMouseOut={cancelTargetMovement}
                              onMouseDown={targetToBottom}
                              title='Para baixo'
                              id='control-bottom'
                            >
                              <img src='/images/odonto/pos-bottom.png' alt='' />
                            </button>
                            <button
                              type='button'
                              onMouseUp={cancelTargetMovement}
                              onMouseOut={cancelTargetMovement}
                              onMouseDown={targetToLeft}
                              title='Para a esquerda'
                              id='control-left'
                            >
                              <img src='/images/odonto/pos-left.png' alt='' />
                            </button>
                          </>
                        )}
                        <button
                          type='button'
                          className={'target-icon ' + (useTarget ? 'selected' : '')}
                          onClick={() => setUseTarget(!useTarget)}
                        >
                          <ToolTarget />
                        </button>
                      </div>
                    </div>
                  </li>
                  <li title='Desfazer'>
                    <button type='button' onClick={handleUndo}>
                      <ToolUndo />
                    </button>
                  </li>
                  {tool.current != null && (
                    <li title='Cancelar'>
                      <button type='button' id='board-close-button' onClick={() => setTool(null)}>
                        <ToolClose />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              <div className={'tab-content ' + (tab == 'regiao' ? 'show' : '')}>
                <div className='rosto-wrapper'>
                  <img className='rosto-template' src='/images/odonto/rosto.webp' alt='' />

                  <img
                    className={'target-image ' + (useTarget ? 'active' : '')}
                    src='/images/odonto/cruz.png'
                    ref={targetRegioes}
                    alt=''
                  />
                  {/* <div class={ tool.current != null ? 'hidden' : '' }> */}
                  <div>
                    {/* <RostoSVG /> */}
                    <RostoSvgComponent />
                  </div>
                  <canvas
                    className={tool.current == null ? 'hidden' : ''}
                    onMouseDown={e =>
                      cvMouseDown('ref1', canvasRef1, shapesRef1, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                    }
                    onMouseUp={e =>
                      cvMouseUp('ref1', canvasRef1, shapesRef1, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                    }
                    onMouseMove={e => cvMouseMove(canvasRef1, shapesRef1, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                    ref={canvasRef1}
                    width='500'
                    height='500'
                  >
                    <p>Seu browser não possui suporte para desenho</p>
                  </canvas>
                </div>
              </div>
              <div className={'tab-content ' + (tab == 'ai' ? 'show' : '')}>
                <div className='draw-tab'>
                  <button type='button' id='btn-ai'>
                    CLAIRIS IA
                  </button>
                  <div id='rosto-form'>
                    <div>
                      <label>Selecione uma foto</label>
                      <input ref={imgFileRef} type='file' name='face' id='face' accept='image/png, image/jpeg' />
                    </div>
                    <span className='or'>ou</span>
                    <button type='button' className='btn-use-webcam' onClick={handleCapturePhotoOn}>
                      Capturar foto
                    </button>
                  </div>

                  {capturePhoto && (
                    <div className='webcam-wrapper'>
                      <Webcam
                        height={500}
                        width={500}
                        ref={webcamRef}
                        screenshotFormat='image/jpeg'
                        videoConstraints={videoConstraints}
                      />
                      <button type='button' onClick={handleCapturePhoto}>
                        <img src='/images/odonto/capture.png' alt='' /> Capturar
                      </button>
                    </div>
                  )}

                  <div id='draw-clipboard'>
                    <img ref={myface} alt='' />
                    <img
                      className={'target-image ' + (useTarget ? 'active' : '')}
                      src='/images/odonto/cruz.png'
                      ref={targetCustom}
                      alt=''
                    />
                    <canvas
                      onMouseDown={e =>
                        cvMouseDown('ref2', canvasRef2, shapesRef2, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                      }
                      onMouseUp={e =>
                        cvMouseUp('ref2', canvasRef2, shapesRef2, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                      }
                      onMouseMove={e =>
                        cvMouseMove(canvasRef2, shapesRef2, e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                      }
                      ref={canvasRef2}
                      width='500'
                      height='500'
                    >
                      <p>Seu browser não possui suporte para desenho :(</p>
                    </canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='add-tratamento-wrapper'>
            <button
              type='button'
              className={
                'btn btn-add ' +
                (cItems.current.length === 0 &&
                !selectedProduct &&
                tab !== 'regiao' &&
                typeof procedimento === 'undefined'
                  ? 'transparent'
                  : '')
              }
              onClick={addTratamentos}
            >
              Adicionar {cItems.current.length > 0 && cItems.current.length} Tratamentos
            </button>
          </div>
          {Array.isArray(store.budgetTreatments) && store.budgetTreatments.length > 0 && (
            <div className='tratamentos-wrapper'>
              <h2>Lista de tratamentos ({store.budgetTreatments.length})</h2>
              <ul>
                {store.budgetTreatments.map((tratamento: BudgetItemType, index) => (
                  <li key={index}>
                    <div className='item-tratamento'>
                      <div className='content-wrap'>
                        <input
                          type='checkbox'
                          onChange={() => toggleItem(index)}
                          defaultChecked={tratamento.selected}
                        />
                        <div className='desc'>
                          <span>
                            <b>{tratamento.description}</b> - {tratamento.treatment?.name}{' '}
                            {Number(tratamento.qtd ?? 0) > 0 && tratamento.unit && (
                              <>
                                {' '}
                                Qtd {tratamento.qtd} {tratamento.unit}
                              </>
                            )}
                            {Number(tratamento.session ?? 0) > 0 && <b> Sessão: {tratamento.session}</b>}
                          </span>
                          <span className='dentista'>
                            {store.professional?.name} - {store?.plan.name ? store.plan.name : 'Sem plano'}
                          </span>
                        </div>
                      </div>

                      <div className='item-price-wrapper'>
                        <span>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(tratamento.value)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className='summary'>
                <table>
                  <tbody>
                    <tr>
                      <th>Valor total do orçamento</th>
                      <td>
                        {currencyFormat(
                          store.budgetTreatments.reduce((acc, item: any) => acc + parseFloat(item.value), 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Valor selecionado</th>
                      <td>
                        {currencyFormat(
                          store.budgetTreatments.reduce(
                            (acc, item: any) =>
                              'selected' in item && item.selected ? (acc += parseFloat(item.value)) : acc,
                            0
                          )
                        )}
                      </td>
                    </tr>
                    {showDiscount ? (
                      <>
                        <tr>
                          <th>Desconto</th>
                          <td>{currencyFormat(store.totalDiscount)}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <div className='discount-wrapper'>
                              <div className='form-group'>
                                <TextField
                                  onChange={e => setDiscount(parseFloat(e.target.value))}
                                  value={!isNaN(discount) ? discount : '0'}
                                  label='Valor'
                                />
                              </div>
                              <div className='form-group'>
                                <ToggleButtonGroup
                                  color='primary'
                                  value={typeDiscount}
                                  exclusive
                                  onChange={e => setTypeDiscount((e.target as HTMLInputElement).value)}
                                  aria-label='Percentual ou valor'
                                >
                                  <ToggleButton value='%'>%</ToggleButton>
                                  <ToggleButton value='R$'>R$</ToggleButton>
                                </ToggleButtonGroup>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={2}>
                          <button type='button' className='btn-show-discount' onClick={() => setShowDiscount(true)}>
                            <FontAwesomeIcon icon={faPlus} /> Desconto
                          </button>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th>Total</th>
                      <td>{currencyFormat(calcLiquid() - store.totalDiscount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Box className='parcelamento-wrapper' p={4} borderRadius={2} boxShadow={2}>
                {/* Ativar parcelamento */}
                <FormControlLabel
                  control={<Checkbox checked={parcelamento} onChange={() => setParcelamento(!parcelamento)} />}
                  label='Parcelar'
                />

                {parcelamento && (
                  <>
                    {/* Entrada */}
                    <Typography variant='h6' mt={2} mb={2}>
                      Entrada
                    </Typography>
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label='Valor da entrada *'
                          type='number'
                          fullWidth
                          value={!isNaN(store.downPayment) ? store.downPayment : 0}
                          onChange={e => {
                            const value = parseFloat(e.target.value)
                            const downPaymentValue = isNaN(value) ? 0 : value

                            dispatch(setDownPayment(downPaymentValue))

                            if (downPaymentValue === 0) {
                              // Se valor for 0, parcelas ficam 0
                              dispatch(setDownPaymentInstallments(0))
                            } else if (store.downPaymentInstallments < 1) {
                              // Se valor > 0 e parcelas < 1, define como 1
                              dispatch(setDownPaymentInstallments(1))
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          label='Parcelar entrada em'
                          type='number'
                          fullWidth
                          value={store.downPaymentInstallments}
                          onChange={e => {
                            const value = parseInt(e.target.value)
                            let installments = isNaN(value) ? 0 : value

                            if (store.downPayment === 0) {
                              installments = 0
                            } else if (installments < 1) {
                              installments = 1
                            }

                            dispatch(setDownPaymentInstallments(installments))
                          }}
                          disabled={store.downPayment === 0}
                        />
                      </Grid>
                    </Grid>

                    {/* Parcelas da entrada */}
                    <Box mt={2}>
                      <Typography variant='subtitle1'>Parcelas da entrada:</Typography>
                      <Grid container spacing={2}>
                        {Array.from({ length: store.downPaymentInstallments }, (_, i) => (
                          <Grid item xs={12} md={6} key={`entrada-${i}`}>
                            <Box
                              border={1}
                              borderRadius={1}
                              p={2}
                              display='flex'
                              justifyContent='space-between'
                              alignItems='center'
                            >
                              <Typography>
                                {i + 1} R$ {currencyFormat(store.downPayment / store.downPaymentInstallments)}
                              </Typography>
                              <Select
                                size='small'
                                value={store.downPaymentMethods[i] || 'Pix'}
                                onChange={e => dispatch(setDownPaymentMethod({ index: i, method: e.target.value }))}
                              >
                                {paymentMethods.map(method => (
                                  <MenuItem key={method} value={method}>
                                    {method}
                                  </MenuItem>
                                ))}
                              </Select>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Parcelamento do saldo restante */}
                    <Typography variant='h6' mt={4}>
                      Saldo Restante
                    </Typography>
                    <Typography>
                      Com saldo de{' '}
                      <strong>{currencyFormat(calcLiquid() - store.totalDiscount - store.downPayment)}</strong>,
                      parcelar em:
                    </Typography>

                    <Grid container spacing={2} alignItems='center' mt={1}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label='Qtd parcelas'
                          type='number'
                          fullWidth
                          value={
                            parcelamento
                              ? store.installments && store.installments > 0
                                ? store.installments
                                : 1
                              : store.installments
                          }
                          onChange={e => {
                            const value = parseInt(e.target.value)
                            if (parcelamento) {
                              dispatch(setInstallments(isNaN(value) || value < 1 ? 1 : value))
                            } else {
                              dispatch(setInstallments(isNaN(value) ? 0 : value))
                            }
                          }}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Typography mt={2}>
                          vezes de{' '}
                          <strong>
                            {currencyFormat(
                              store.installments > 0
                                ? (calcLiquid() - store.totalDiscount - store.downPayment) / store.installments
                                : 0
                            )}
                          </strong>
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Parcelas do saldo restante */}
                    <Box mt={2}>
                      <Typography variant='subtitle1'>Parcelas do saldo:</Typography>
                      <Grid container spacing={2}>
                        {Array.from({ length: store.installments }, (_, i) => (
                          <Grid item xs={12} md={6} key={`saldo-${i}`}>
                            <Box
                              border={1}
                              borderRadius={1}
                              p={2}
                              display='flex'
                              justifyContent='space-between'
                              alignItems='center'
                            >
                              <Typography>
                                {i + 1} R${' '}
                                {currencyFormat(
                                  (calcLiquid() - store.totalDiscount - store.downPayment) / store.installments
                                )}
                              </Typography>
                              <Select
                                size='small'
                                value={store.installmentsMethods[i] || 'Pix'}
                                onChange={e => dispatch(setInstallmentsMethod({ index: i, method: e.target.value }))}
                              >
                                {paymentMethods.map(method => (
                                  <MenuItem key={method} value={method}>
                                    {method}
                                  </MenuItem>
                                ))}
                              </Select>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </>
                )}
              </Box>

              {parcelamento && (
                <FormControlLabel
                  control={
                    <Checkbox checked={store.budgetPaid} onChange={e => dispatch(setBudgetPaid(e.target.checked))} />
                  }
                  label='Orçamento pago'
                />
              )}
            </div>
          )}

          <div className='form-group'>
            <TextField
              label='Observação'
              value={store.observation}
              onChange={e => dispatch(setObservation(e.target.value))}
              multiline
              fullWidth
              minRows={3}
            />
          </div>
        </div>

        {/* <div className='footer-buttons-wrapper'>
          <div>
            <FormControlLabel control={<Checkbox defaultChecked />} label=' Imprimir HOF ' />
            <FormControlLabel control={<Checkbox onChange={ () => dispatch(toggleIssueContract(null)) } checked={ store.issueContract } />} label=' Emitir contrato ao aprovar orçamento ' />
          </div>
        </div> */}

        <span className='path-tooltip'>Tooltip região</span>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Card sx={{ position: 'absolute', top: modalPos.y, left: modalPos.x, width: 160, outline: 'none' }}>
          <CardContent>
            <TextField
              label='0.0 un'
              size='small'
              variant='outlined'
              inputRef={inputRef}
              onKeyDown={handleKeyDown}
              className='injectable-input'
              type='number'
              value={modalPos.units ?? ''}
              onChange={e =>
                setModalPos(prev => ({
                  ...prev,
                  units: e.target.value
                }))
              }
              inputProps={{ step: 0.1 }}
            />
            <Box mt={1} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button size='small' onClick={handleSaveUnits}>
                <Check />
              </Button>
              <Button size='small' onClick={handleUndoUnits} color='error'>
                <Close />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Modal>

      <DialogReceipt>
        <OdontogramCardReceipt />
      </DialogReceipt>

      <Dialog
        open={openAlertOnAddTreatments}
        onClose={() => setOpenAlertOnAddTreatments(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Verifique as informações'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Verifique se os campos <strong>tratamento</strong> e <strong>profissional</strong> estão devidamente
            selecionados!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAlertOnAddTreatments(false)} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAlertOnAddPlans}
        onClose={() => setOpenAlertOnAddPlans(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Cadastre um plano'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Para adicionar tratamentos, é necessário que exista um plano cadastrado. Por favor, cadastre um plano antes
            de continuar.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAlertOnAddPlans(false)
              router.push('/pages/account-settings/billing/')
            }}
            autoFocus
          >
            Cadastrar plano
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openModal} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle>Assistir Vídeo</DialogTitle>
        <DialogContent>
          <Vimeo
            video='1110286056' // pode ser só o ID também
            width='100%'
            height='480'
            responsive
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <ModalAddPacient
        open={openCadPatient}
        initialData={{ name: patientInpuValue || '', cellPhone: telefone }}
        onClose={() => setOpenCadPatient(false)}
        onSave={handleSavePatient}
      />

      <FooterOdontogram
        editMode={budgetUpdate !== undefined}
        save={saveBudgetOdontogram}
        setBudgetStatus={_setBudgetStatus}
        getGraph={getDOMGraph}
      />
    </>
  )
}

export default Rosto
