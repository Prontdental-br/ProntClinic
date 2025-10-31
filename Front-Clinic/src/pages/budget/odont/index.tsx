/* eslint-disable prefer-const */
import React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'

//import CurrencyInput from 'react-currency-masked-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'

import PermanentesSvgComponent from './Permanentes'
import DeciduosSvgComponent from './Deciduos'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import CloseIcon from '@mui/icons-material/Close'
import FooterOdontogram from '../footer'
import {
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Typography,
  Select,
  Grid,
  MenuItem
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

//import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DatePicker } from '@mui/x-date-pickers'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Box, Stack } from '@mui/system'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import ButtonGroup from '@mui/material/ButtonGroup'

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
  setDownPaymentMethod,
  setInstallmentsMethod,
  setDownPaymentInstallments,
  setTotalOdonto,
  setBudgetPaid
} from 'src/store/apps/odontogram'
import { AppDispatch, RootState } from 'src/store'
import { patientType } from 'src/types/apps/patientTypes'
import { BudgetStatusEnum } from 'src/types/apps/budgetTypes'
import DialogReceipt from 'src/views/pages/odontogram/DialogReceipt'
import OdontogramCardReceipt from 'src/views/pages/odontogram/OdontogramCardReceipt'
import {
  BudgetItemType,
  PlanType,
  PatientType,
  TreatmentType,
  ProfessionalType,
  BudgetType
} from 'src/types/apps/budgetTypes'
import DialogContentText from '@mui/material/DialogContentText'
import ModalAddPacient from 'src/views/components/ModalAddPacient'
import { regioes } from 'src/@core/utils/budget-functions'
import api from 'src/@core/components/api-client'
import CurrencyFormat from 'react-currency-format'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

type StatusTreatmentType = 'done' | 'in_progress' | 'canceled' | null

type Obs = {
  dente: number
  observacao: string
  status_treatment: StatusTreatmentType
}

type Pessoa = {
  id: string
  name: string
}

type tratItem = {
  description: string
  treatment?: TreatmentType
  status?: number
  faces: Array<string>
  selected?: boolean
  value?: number
}

function Odontograma() {
  const paramsSearch = new URLSearchParams(document.location.search)
  const [procedimento, setProcedimento] = useState<TreatmentType>()
  const updateDente = useRef<number>()
  const [updateDenteFlag, setUpdateDenteFlag] = useState<boolean>(false)

  // const [paciente, setPaciente] = useState<patientType>({} as patientType)
  const observacoes = useRef<Array<Obs>>([])
  const denteObsField = useRef<HTMLInputElement>()
  const [denteObs, setDenteObs] = useState<string>()
  const patientInput = useRef<HTMLDivElement>(null)

  const odontoPDFRef = useRef<HTMLIFrameElement>(null)

  const [, updateState] = useState({})
  const forceUpdate = useCallback(() => updateState({}), [])
  const cItems = useRef(Array<tratItem>())
  const [selectedItem, setSelectedItem] = useState('')
  const [telefone, setTelefone] = useState('')
  const [showDiscount, setShowDiscount] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [typeDiscount, setTypeDiscount] = useState('%')
  const [parcelamento, setParcelamento] = useState(false)
  const [tab, setTab] = useState('permanentes')
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.odontogram)
  const [openAlertOnAddTreatments, setOpenAlertOnAddTreatments] = useState(false)
  const [patientInpuValue, setPatientInputValue] = useState<string>()
  const [openCadPatient, setOpenCadPatient] = useState<boolean>(false)
  const [budgetUpdate, setBudgetUpdate] = useState<any>()
  const [openAlertOnAddPlans, setOpenAlertOnAddPlans] = useState(false)
  const [hideOdontograma, setHideOdontograma] = useState(false)
  const router = useRouter()

  const getDOMGraph = () => {
    if (document.querySelector('.dental-panel .tab-content.show'))
      return document.querySelector('.dental-panel .tab-content.show')!.cloneNode(true)

    return null
  }

  let params = new URLSearchParams(document.location.search)

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
    if (params.has('id')) {
      //setLoading(true);
      setShowDiscount(true)
      setTypeDiscount('R$')
      api
        .get(`/budgets/${params.get('id')}`)
        .then(res => {
          if (res.status == 200) {
            console.log('res.data', res.data)
            setBudgetUpdate(res.data)
            setDiscount(res.data.discount)
            dispatch(setObservation(res.data.observation))

            if (res.data.installments && res.data.installments > 0) {
              setParcelamento(true)
            }

            forceUpdate()
          }
        })
        .catch(error => {
          //setShowSnackError(true);
        })
        .finally(() => {
          //setLoading(false);
        })
    }

    document.querySelectorAll('.clickable').forEach((p: any) => {
      p.addEventListener('mouseover', (e: MouseEvent) => {
        let tooltip = document.querySelector('.path-tooltip') as HTMLElement
        if (tooltip != null) {
          tooltip.style.display = 'block'
          tooltip.style.top = e.pageY - window.scrollY + 25 + 'px'
          tooltip.style.left = e.pageX + 'px'

          if ((e.currentTarget as HTMLElement).dataset.face) {
            tooltip.innerHTML = (e.currentTarget as HTMLElement).dataset.face!
          } else {
            tooltip.innerHTML = 'Dente ' + (e.currentTarget as HTMLElement).dataset.dente
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
  }, [])

  useEffect(() => {
    dispatch(reset())
    dispatch(getPatients())
    dispatch(getPlans())
    dispatch(getTreatments())
    dispatch(getProfessionals())
    dispatch(setTotal(procedimento?.value))

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
    if (budgetUpdate) {
      console.log(budgetUpdate)
      dispatch(setPatient(budgetUpdate.patient))
      dispatch(setDescription(budgetUpdate.description))
      dispatch(
        setBudgetTreatments(
          budgetUpdate.budgetItems.map((b: any) =>
            Object.assign({ ...b, selected: true, faces: b?.faces ? b.faces.split(',') : [] })
          )
        )
      )
      dispatch(setProfessional(budgetUpdate.professional))
      dispatch(setPlan(budgetUpdate.plan))

      document.querySelectorAll('.clickable').forEach(item => {
        console.log('click dente')
        try {
          item.addEventListener('click', e => {
            e.stopImmediatePropagation()
            if (!e.target) {
              return
            }

            let target = e.target as HTMLElement

            target.classList?.toggle('active')

            if (target.classList?.contains('active')) {
              let denteIndex = cItems.current?.findIndex(cItem => cItem.description == target.dataset?.dente)
              if (typeof target.dataset?.dente == 'undefined') return
              if (denteIndex == -1) {
                let item: tratItem = {
                  description: target.dataset.dente as string,
                  faces: []
                }

                if (typeof target.dataset?.face != 'undefined') {
                  item.faces.push(target.dataset?.face)
                  document.querySelectorAll('path[data-dente="' + target.dataset?.dente + '"].is-dente').forEach(el => {
                    el.classList.add('active')
                  })
                }

                cItems.current.push(item)
                setSelectedItem(item.description)
              } else {
                let item = cItems.current[denteIndex]
                if (typeof target.dataset?.face != 'undefined') {
                  item.faces.push(target.dataset?.face)
                }

                cItems.current.splice(denteIndex, 1, item)
              }
            } else {
              if (typeof target.dataset?.face != 'undefined' && target.dataset?.face.length > 0) {
                let denteIndex = cItems.current?.findIndex(cItem => cItem.description == target.dataset?.dente)
                let item = cItems.current[denteIndex]
                let faceIndex = item.faces?.findIndex(face => face == target.dataset?.face)
                item.faces.splice(faceIndex, 1)
                cItems.current.splice(denteIndex, 1, item)
              } else {
                let denteIndex = cItems.current?.findIndex(cItem => cItem.description == target.dataset.dente)
                cItems.current.splice(denteIndex, 1)
                document
                  .querySelectorAll(`path[data-dente="${target.dataset.dente}"]`)
                  .forEach(item => item.classList?.remove('active'))
              }
            }
          })
        } catch (e) {
          console.log(e)
        }
      })

      forceUpdate()
    }
  }, [budgetUpdate])

  useEffect(() => {
    if (store.budgetTreatments) {
      store.budgetTreatments.forEach((t: any) =>
        document.querySelectorAll(`path[data-dente="${t.description}"]`).forEach(item => {
          console.log(item.getAttribute('data-face'))
          if (item.getAttribute('data-face') === t.faces) item.classList.add('active')
        })
      )

      store.budgetTreatments.forEach((treatment: any) => {
        document
          .querySelectorAll(
            `.clickable[data-reg*='${treatment.description}'], .clickable.is-dente[data-dente*='${treatment.description}']`
          )
          .forEach((el: any) => el.classList.add('active'))
        if (treatment.faces) {
          treatment.faces?.forEach((face: string) => {
            document
              .querySelectorAll(`.clickable[data-face*='${face}'][data-dente*='${treatment.description}']`)
              .forEach((el: any) => el.classList.add('active'))
          })
        }
      })
    }
  }, [store.budgetTreatments, hideOdontograma])

  useEffect(() => {
    console.log(budgetUpdate)
    if (store.patients.length > 0) {
      let params = new URLSearchParams(document.location.search)
      let patient = params.get('patient')

      if (patient) {
        handlePatient(patient || budgetUpdate.patientId)
      }

      // else {
      //   dispatch(setPatient(null));
      //   setTelefone('');
      // }
    }
  }, [store.patients])

  useEffect(() => {
    document.querySelectorAll('.clickable.is-dente').forEach(p => {
      p.addEventListener('click', e => {
        let dente = parseInt((e.currentTarget as HTMLElement).dataset.dente!)
        updateDente.current = dente
        let obs = observacoes.current.find(obs => obs.dente == dente)
        setDenteObs(obs?.observacao ?? '')
        setUpdateDenteFlag(true)
      })
    })
  }, [denteObs, observacoes, updateDente, hideOdontograma])

  useEffect(() => {
    console.log(cItems.current)
    cItems.current.forEach(item => {
      console.log(item)
    })

    document.querySelectorAll('.clickable').forEach(item => {
      item.addEventListener('click', e => {
        e.stopImmediatePropagation()
        if (!e.target) {
          return
        }

        let target = e.target as HTMLElement

        target.classList.toggle('active')

        if (target.classList.contains('active')) {
          let denteIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.dente)
          if (typeof target.dataset.dente == 'undefined') return
          if (denteIndex == -1) {
            let item: tratItem = {
              description: target.dataset.dente as string,
              faces: []
            }

            if (typeof target.dataset.face != 'undefined') {
              item.faces.push(target.dataset.face)
              document.querySelectorAll('path[data-dente="' + target.dataset.dente + '"].is-dente').forEach(el => {
                el.classList.add('active')
              })
            }

            cItems.current.push(item)
            setSelectedItem(item.description)
          } else {
            let item = cItems.current[denteIndex]
            if (typeof target.dataset.face != 'undefined') {
              item.faces.push(target.dataset.face)
            }

            cItems.current.splice(denteIndex, 1, item)
          }
        } else {
          if (typeof target.dataset.face != 'undefined' && target.dataset.face.length > 0) {
            let denteIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.dente)
            let item = cItems.current[denteIndex]
            let faceIndex = item.faces.findIndex(face => face == target.dataset.face)
            item.faces.splice(faceIndex, 1)
            cItems.current.splice(denteIndex, 1, item)
          } else {
            let denteIndex = cItems.current.findIndex(cItem => cItem.description == target.dataset.dente)
            cItems.current.splice(denteIndex, 1)
            document
              .querySelectorAll(`path[data-dente="${target.dataset.dente}"]`)
              .forEach(item => item.classList.remove('active'))
          }
        }

        forceUpdate()
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cItems, hideOdontograma])

  const calcSubtotal = React.useCallback(() => {
    let subtotal = store.budgetTreatments.reduce((acc: number, item: any) => {
      return item.selected ? acc + parseFloat(item?.value) : acc
    }, 0)

    return subtotal
  }, [store.budgetTreatments])

  useEffect(() => {
    let subtotal = calcSubtotal()

    let totalDiscount = typeDiscount == '%' ? subtotal * (discount / 100) : discount
    dispatch(setTotalDiscount(totalDiscount))

    document.querySelectorAll('.clickable').forEach(item => {
      console.log('click dente')
      try {
        item.addEventListener('click', e => {
          e.stopImmediatePropagation()
          if (!e.target) {
            return
          }

          let target = e.target as HTMLElement

          target.classList?.toggle('active')

          if (target.classList?.contains('active')) {
            let denteIndex = cItems.current?.findIndex(cItem => cItem.description == target.dataset?.dente)
            if (typeof target.dataset?.dente == 'undefined') return
            if (denteIndex == -1) {
              let item: tratItem = {
                description: target.dataset.dente as string,
                faces: []
              }

              if (typeof target.dataset?.face != 'undefined') {
                item.faces.push(target.dataset?.face)
                document.querySelectorAll('path[data-dente="' + target.dataset?.dente + '"].is-dente').forEach(el => {
                  el.classList.add('active')
                })
              }

              cItems.current.push(item)
              setSelectedItem(item.description)
            } else {
              let item = cItems.current[denteIndex]
              if (typeof target.dataset?.face != 'undefined') {
                item.faces.push(target.dataset?.face)
              }

              cItems.current.splice(denteIndex, 1, item)
            }
          } else {
            if (typeof target.dataset?.face != 'undefined' && target.dataset?.face.length > 0) {
              let denteIndex = cItems.current?.findIndex(cItem => cItem.description == target.dataset?.dente)
              let item = cItems.current[denteIndex]
              let faceIndex = item.faces?.findIndex(face => face == target.dataset?.face)
              item.faces.splice(faceIndex, 1)
              cItems.current.splice(denteIndex, 1, item)
            } else {
              let denteIndex = cItems.current?.findIndex(cItem => cItem.description == target.dataset.dente)
              cItems.current.splice(denteIndex, 1)
              document
                .querySelectorAll(`path[data-dente="${target.dataset.dente}"]`)
                .forEach(item => item.classList?.remove('active'))
            }
          }
        })
      } catch (e) {
        console.log(e)
      }
    })
  }, [store.budgetTreatments, discount, typeDiscount, dispatch, calcSubtotal, hideOdontograma])

  function handleProcedimento(id: string) {
    if (store.treatments.length == 0 || id === '') return
    let procedimento = store.treatments.find((procedimento: TreatmentType) => procedimento.id == id)
    if (!procedimento) return
    setProcedimento(procedimento)
    dispatch(setTotalOdonto(procedimento?.value))
    document.getElementById('popup-select-procedimento')?.classList.remove('show')
  }

  function removeItem(item: string) {
    cItems.current = cItems.current.filter(cItem => cItem.description != item)
    document.querySelectorAll(`path[data-dente="${item}"]`).forEach(item => item.classList.remove('active'))
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

    if (hideOdontograma) {
      // Adiciona apenas 1 tratamento genérico
      const tratamento: tratItem = {
        description: '',
        faces: [''],
        treatment: proc,
        value: store.total,
        selected: true,
        status: 1
      }
      auxTratamentos.push(tratamento)
    } else {
      // Adiciona para cada item selecionado
      cItems.current.forEach(i => {
        let item = { ...i }
        const tratamento: tratItem = {
          description: item.description,
          faces: item.faces,
          treatment: proc,
          value: store.total,
          selected: true,
          status: 1
        }
        auxTratamentos.push(tratamento)
      })
    }

    dispatch(setBudgetTreatments(auxTratamentos))
    setSelectedItem('')
    cItems.current = []

    document.querySelectorAll(`path`).forEach(item => {
      if (item.classList.contains('active')) {
        item.classList.remove('active')
        item.classList.add('in-order')
      }
    })
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

  function hasFace(_item: string, face: string) {
    let item = cItems.current.find(cItem => cItem.description == _item)

    return typeof item != 'undefined' && item.faces.findIndex(f => f == face) != -1
  }

  function toggleFace(face: string) {
    let item = cItems.current.find(cItem => cItem.description == selectedItem)
    if (!item) return
    let faceIndex = item.faces.findIndex(f => f == face)
    if (faceIndex == -1) {
      item.faces.push(face)
    } else {
      item.faces.splice(faceIndex, 1)
    }

    //refresh dente faces
    document
      .querySelectorAll(`path[data-dente="${selectedItem}"][data-face]`)
      .forEach(path => path.classList.remove('active'))
    document.querySelectorAll(`path[data-dente="${selectedItem}"][data-face]`).forEach(path => {
      let denteFace = (path as HTMLElement).dataset.face
      if (item && item.faces.findIndex(f => f == denteFace) != -1) {
        ;(path as HTMLElement).classList.add('active')
      }
    })

    forceUpdate()
  }

  function currencyFormat(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  function calcTotal() {
    //const subtotal = calcSubtotal();
    //console.log('discount', store.totalDiscount)
    let total = budgetUpdate
      ? budgetUpdate.budgetItems.reduce((acc: any, item: any) => acc + parseFloat(item.value), 0)
      : calcSubtotal()

    return total
  }

  function toggleRegiao(regiao: string) {
    let item = {
      description: regiao,
      faces: []
    }

    if (cItems.current.filter(cItem => cItem.description == regiao).length > 0) {
      cItems.current = cItems.current.filter(cItem => cItem.description != regiao)
      document.querySelectorAll(`path[data-dente="${regiao}"]`).forEach(item => item.classList.remove('active'))
      forceUpdate()
    } else {
      cItems.current.push(item)
      setSelectedItem(item.description)
    }
    forceUpdate()
  }

  function getButtonClasses(item: string) {
    let classes = 'btn-region'
    if (cItems.current.filter(cItem => cItem.description == item).length > 0) {
      classes += ' selected'
    }

    return classes
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

  function setDenteStatus(status: StatusTreatmentType, dente: number | undefined) {
    if (typeof dente == 'undefined') return
    if (status != 'in_progress') {
      document.querySelectorAll(`.is-dente[data-dente="${dente}"]`)?.forEach(el => {
        el.classList.remove('in_progress')
      })
    }
    if (status != 'done') {
      document.querySelectorAll(`.is-dente[data-dente="${dente}"]`)?.forEach(el => {
        el.classList.remove('done')
      })
    }
    if (status != 'canceled') {
      document.querySelectorAll(`.is-dente[data-dente="${dente}"]`)?.forEach(el => {
        el.classList.remove('canceled')
      })
    }
    document.querySelectorAll(`.is-dente[data-dente="${dente}"]`)?.forEach(el => {
      if (status != null) {
        el.classList.toggle(status)
      }
    })

    let old_obs = observacoes.current.find(obs => obs.dente == dente)

    let new_obs: Obs = {
      dente: dente,
      observacao: denteObsField.current?.value ?? '',
      status_treatment: status
    }

    let lObs = observacoes.current

    if (typeof old_obs != 'undefined') {
      let index = lObs.findIndex(obs => obs.dente == dente)
      if (index != -1) {
        lObs.splice(index, 1, new_obs)
      }
    } else {
      lObs.push(new_obs)
    }

    observacoes.current = lObs
    setUpdateDenteFlag(false)
  }

  function handleRegisterPatient() {
    setOpenCadPatient(true)
  }

  function handleSavePatient(data: patientType) {
    dispatch(registerPatient(data))
  }

  function handlePlan(e: React.SyntheticEvent, p: { id: string; label: string } | string | null) {
    if (typeof p == 'string' || p === null) {
      return
    }
    let plan = store.plans.find((plan: PlanType) => plan.id == p.id)
    dispatch(setPlan(plan))
  }

  // function saveBudgetOdontogram(){
  //   //prepare store
  //   let dataBudget = Object.assign({}, store)

  //   let budgetTreatments = dataBudget.budgetTreatments.filter(item => item.status == 1);
  //   dataBudget.budgetTreatments = budgetTreatments.map(function(item){
  //     let nItem = {}

  //     nItem.description = item.down_payment
  //     nItem.faces = item.faces.join(',');
  //     nItem.description = item.description;

  //     // nItem.planId = item.plano.id;

  //     nItem.treatmentId = item.procedimento.id;
  //     nItem.professionalId = item.dentista.id;
  //     nItem.value = item.procedimento.value;

  //     let itemObs = observacoes.current.find( obs => obs.dente == item.description );
  //     if( typeof itemObs != 'undefined' ){
  //       nItem.status = itemObs.status_treatment;
  //       nItem.observation = itemObs.observacao;
  //     }

  //     return nItem;
  //   });

  //   dataBudget.subtotal = calcSubtotal();
  //   dataBudget.total = calcTotal();
  //   dataBudget.discount = store.totalDiscount;
  //   dataBudget.down_payment = store.downPayment;
  //   dataBudget.installments = store.installments

  //   dispatch(saveBudget(dataBudget))
  // }

  function saveBudgetOdontogram(status?: BudgetStatusEnum) {
    //prepare store
    let dataBudget = {} as BudgetType

    let budgetTreatments = store.budgetTreatments
      .filter((item: BudgetItemType) => item.selected)
      .map((item: BudgetItemType) => {
        let itemObs = observacoes.current.find(obs => obs.dente == parseInt(item.description))
        const nItem = { ...item }
        if (typeof itemObs != 'undefined') {
          nItem.statusTreatment = itemObs.status_treatment || ''
          nItem.observation = itemObs.observacao
        }

        return nItem
      })

    dataBudget.budgetTreatments = budgetTreatments
    dataBudget.subtotal = calcSubtotal()
    dataBudget.total = calcLiquid()
    dataBudget.discount = store.totalDiscount
    dataBudget.downPayment = store.downPayment
    dataBudget.installments = parcelamento ? store.installments : 0
    dataBudget.installmentsMethods = store.installmentsMethods
    ;(dataBudget.downPaymentInstallments = store.downPaymentInstallments),
      (dataBudget.downPaymentMethods = store.downPaymentMethods),
      (dataBudget.observation = store.observation)
    dataBudget.description = store.description ?? ''
    dataBudget.plan = store.plan ? store.plan : null
    dataBudget.hideOdontogram = hideOdontograma
    dataBudget.professional = store.professional
    dataBudget.patient = store.patient
    dataBudget.date = store.date?.format('YYYY-MM-DD')
    dataBudget.patient = store.patient
    dataBudget.status = status || store.budgetStatus
    dataBudget.budgetPaid = store.budgetPaid

    if (budgetUpdate?.id) {
      dataBudget.id = budgetUpdate.id
    }

    console.log(dataBudget)

    dispatch(saveBudget(dataBudget))
  }

  function _setBudgetStatus(status: string) {
    dispatch(setBudgetStatus(status))
  }

  const paymentMethods = ['Dinheiro', 'Crédito', 'Débito', 'Boleto', 'Pix', 'Cheque']

  function calcLiquid() {
    return params.has('id')
      ? store.budgetTreatments.reduce((acc, item: any) => (item.selected ? acc + parseFloat(item.value) : acc), 0)
      : calcTotal()
  }

  const [openDialog, setOpenDialog] = useState(false)

  const handleHideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked

    if (newValue === true && cItems.current.length > 0) {
      setOpenDialog(true)

      return
    }

    setHideOdontograma(newValue)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <>
      <div id='main-orcamento' className='container'>
        <h1>Odontograma</h1>
        <form id='formOrcamento'>
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
                renderInput={params => <TextField {...params} label='Plano' />}
              />
              {/* <Autocomplete
                id='plano'
                options={store.plans.map(p => ({ label: p.name, id: p.id }))}
                sx={{ width: 300 }}
                onChange={(e, p) => (dispatch(setPlan(p)))}
                value={store.plans.find(p => p.id === store.plan.id)}
                getOptionLabel={(option) => option.label}
                renderInput={params => <TextField {...params} label='Plano' />}
              /> */}
              {/* <Autocomplete
                id='plano'
                options={store.plans.map(p => ({ label: p.name, id: p.id }))}
                sx={{ width: 300 }}
                onChange={(e, p) => (dispatch(setPlan(p)))}
                value={store.plans.find(p => p.id === store.plan.id)}
                getOptionLabel={(option) => option.label}
                renderInput={params => <TextField {...params} label='Plano' />}
              /> */}
            </div>

            <div className='form-group tratamento-wrapper'>
              <Autocomplete
                id='tratamento'
                fullWidth
                options={store.treatments
                  .map(t => ({ active: t.active, label: t.name, id: t.id }))
                  .filter((t: any) => t.active)}
                sx={{ width: 300 }}
                onChange={(e, t) => {
                  return t ? handleProcedimento(t.id) : handleProcedimento('')
                }}
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

                  // renderInput={params => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className='form-group price-wrapper'>
              <CurrencyFormat
                customInput={TextField}
                decimalSeparator='.'
                id='valor'
                label='Valor *'
                variant='outlined'
                onChange={e => {
                  dispatch(setTotalOdonto(e.target.value))
                }}
                value={store.total}
              />
            </div>

            <div className='form-group dentista-wrapper'>
              <Autocomplete
                id='dentista'
                options={store.professionals
                  .filter((d: { name: string; id: string; specialty: string }) => d.specialty !== 'recepcionista')
                  .map((d: { name: string; id: string }) => ({ label: d.name, id: d.id }))}
                sx={{ width: 300 }}
                onChange={(e, v) => handleDentista(e, v)}
                renderInput={params => <TextField {...params} label='Dentista *' />}
              />
            </div>

            <div className='form-group items-wrapper'>
              <span>Dente/Região Selecionado</span>
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

            {selectedItem && (
              <div className='form-group faces-group'>
                <div className='faces-wrapper'>
                  <div className='face'>
                    <input
                      id='vestibular'
                      onChange={() => toggleFace('F. Vestibular')}
                      name='vestibular'
                      type='checkbox'
                      checked={hasFace(selectedItem, 'F. Vestibular')}
                    />
                    <label htmlFor='vestibular'>F. Vestibular</label>
                  </div>
                  <div className='face'>
                    <input
                      id='distal'
                      onChange={() => toggleFace('F. Distal')}
                      name='distal'
                      type='checkbox'
                      checked={hasFace(selectedItem, 'F. Distal')}
                    />
                    <label htmlFor='distal'>F. Distal</label>
                  </div>
                  <div className='face'>
                    <input
                      id='mesial'
                      onChange={() => toggleFace('F. mesial')}
                      name='mesial'
                      type='checkbox'
                      checked={hasFace(selectedItem, 'F. mesial')}
                    />
                    <label htmlFor='mesial'>F. mesial</label>
                  </div>
                  <div className='face'>
                    <input
                      id='palatina'
                      onChange={() => toggleFace('F. Palatina')}
                      name='palatina'
                      type='checkbox'
                      checked={hasFace(selectedItem, 'F. Palatina')}
                    />
                    <label htmlFor='palatina'>F. Palatina</label>
                  </div>
                  <div className='face'>
                    <input
                      id='oclusal'
                      onChange={() => toggleFace('F. Oclusal')}
                      name='oclusal'
                      type='checkbox'
                      checked={hasFace(selectedItem, 'F. Oclusal')}
                    />
                    <label htmlFor='oclusal'>F. Oclusal</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Box display='flex' alignItems='center' justifyContent='flex-end'>
            <Checkbox checked={hideOdontograma} onChange={handleHideChange} />
            <Typography>Ocultar Odontograma</Typography>
          </Box>

          {!hideOdontograma &&
            ((Array.isArray(store.budgetTreatments) &&
              store.budgetTreatments.length > 0 &&
              !isNaN(parseInt(store.budgetTreatments[0]['description']))) ||
              paramsSearch.has('patient')) && (
              <div className='dental-panel'>
                <div className='panel-header'>
                  <h3 onClick={() => setTab('permanentes')} className={tab == 'permanentes' ? 'active' : ''}>
                    Permanentes
                  </h3>
                  <h3 onClick={() => setTab('deciduos')} className={tab == 'deciduos' ? 'active' : ''}>
                    Decíduos
                  </h3>
                </div>
                <div className='panel-body'>
                  <div className={'tab-content ' + (tab == 'permanentes' ? 'show' : '')}>
                    <div className='permanentes-wrapper'>
                      <PermanentesSvgComponent />
                    </div>
                    <div className='regioes-wrapper'>
                      {regioes.map((regiao, index) => (
                        <button
                          key={index}
                          className={getButtonClasses(regiao)}
                          type='button'
                          onClick={() => toggleRegiao(regiao)}
                        >
                          {regiao}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={'tab-content ' + (tab == 'deciduos' ? 'show' : '')}>
                    <div className='deciduos-wrapper'>
                      <DeciduosSvgComponent />
                    </div>
                    <div className='regioes-wrapper'>
                      {regioes.map((regiao, index) => (
                        <button
                          key={index}
                          className={getButtonClasses(regiao)}
                          type='button'
                          onClick={() => toggleRegiao(regiao)}
                        >
                          {regiao}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div className='add-tratamento-wrapper'>
            {Object.keys(store.budget).length === 0 && (
              <button
                type='button'
                className={'btn-add ' + (!hideOdontograma && cItems.current.length == 0 ? 'transparent' : '')}
                onClick={addTratamentos}
              >
                Adicionar {cItems.current.length > 0 && cItems.current.length} Tratamentos
              </button>
            )}
          </div>
          {Array.isArray(store.budgetTreatments) && store.budgetTreatments.length > 0 && (
            <div className='tratamentos-wrapper'>
              <h2>Lista de tratamentos ({store.budgetTreatments.length})</h2>
              <ul className='treatmentsList'>
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
                            <b>
                              {!isNaN(parseInt(tratamento?.description)) && 'Dente '}
                              {tratamento.description}
                            </b>{' '}
                            - {tratamento.treatment && tratamento.treatment.name}{' '}
                            <span className='faces'>
                              {typeof tratamento.faces != 'undefined' &&
                                Array.isArray(tratamento.faces) &&
                                tratamento.faces?.length > 0 &&
                                tratamento.faces.join(' - ')}
                            </span>
                          </span>
                          <span className='dentista'>
                            {store.professional && store.professional.name} -{' '}
                            {store.plan?.name ? store.plan.name : 'Sem plano'}{' '}
                          </span>
                        </div>
                      </div>

                      <div className='item-price-wrapper'>
                        <span>
                          {tratamento.treatment &&
                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                              tratamento.value
                            )}
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
                      <td>{currencyFormat(calcLiquid())}</td>
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
                                  type='number'
                                  inputProps={{ min: 0 }}
                                  onChange={e => {
                                    let value = e.target.value

                                    if (value === '') {
                                      setDiscount(0)

                                      return
                                    }

                                    let numericValue = parseFloat(value)
                                    if (isNaN(numericValue)) {
                                      setDiscount(0)

                                      return
                                    }

                                    if (typeDiscount === '%') {
                                      if (numericValue > 100) numericValue = 100
                                    } else if (typeDiscount === 'R$') {
                                      const subtotal = calcSubtotal()
                                      if (numericValue > subtotal) numericValue = subtotal
                                    }

                                    setDiscount(numericValue)
                                  }}
                                  value={discount}
                                />
                              </div>
                              <div className='form-group'>
                                <ToggleButtonGroup
                                  color='primary'
                                  value={typeDiscount}
                                  exclusive
                                  onChange={(_, newType) => {
                                    if (!newType) return

                                    const subtotal = calcSubtotal()
                                    let adjustedDiscount = discount

                                    if (newType === '%') {
                                      // Converter valor em reais para percentual
                                      adjustedDiscount = subtotal > 0 ? (discount / subtotal) * 100 : 0
                                      if (adjustedDiscount > 100) adjustedDiscount = 100
                                    } else if (newType === 'R$') {
                                      // Converter percentual para valor em reais
                                      adjustedDiscount = (discount / 100) * subtotal
                                      if (adjustedDiscount > subtotal) adjustedDiscount = subtotal
                                    }

                                    setTypeDiscount(newType)
                                    setDiscount(parseFloat(adjustedDiscount.toFixed(2)))
                                  }}
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
                                // Se entrada for 0, mantém parcelas em 0
                                installments = 0
                              } else if (installments < 1) {
                                // Se entrada > 0, não pode ser menor que 1
                                installments = 1
                              }

                              dispatch(setDownPaymentInstallments(installments))
                            }}
                            disabled={store.downPayment === 0} // Opcional: desativa input quando entrada = 0
                          />
                        </Grid>
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
        </form>

        {/* <div className='footer-buttons-wrapper'>
          <div>
            <FormControlLabel control={<Checkbox onChange={ () => dispatch(togglePrintBudget()) } checked={ store.printBudget } />} label=' Imprimir Odontograma ' />
            <FormControlLabel control={<Checkbox onChange={() => dispatch(toggleIssueContract(null))} checked={store.issueContract} />} label=' Emitir contrato ao aprovar orçamento ' />
          </div>
        </div> */}

        <span className='path-tooltip'>Tooltip dente</span>
      </div>

      <DialogReceipt>
        <OdontogramCardReceipt />
      </DialogReceipt>

      <BootstrapDialog
        onClose={() => setUpdateDenteFlag(false)}
        aria-labelledby='customized-dialog-title'
        open={updateDenteFlag}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          Dente {updateDente.current}
        </DialogTitle>
        <IconButton
          aria-label='close'
          onClick={() => setUpdateDenteFlag(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ width: '500px', mb: 2 }} dividers>
          <TextField
            sx={{ mb: 4 }}
            inputProps={{ id: 'dente_obs' }}
            inputRef={denteObsField}
            value={denteObs}
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
              setDenteObs((e.currentTarget as HTMLInputElement).value)
            }
            fullWidth
            multiline
            rows={3}
            label='Observação'
          />
          <ButtonGroup variant='contained'>
            <Button onClick={() => setDenteStatus('done', updateDente.current)} color='success'>
              Concluído
            </Button>
            <Button onClick={() => setDenteStatus('in_progress', updateDente.current)} color='warning'>
              Em andamento
            </Button>
            <Button onClick={() => setDenteStatus('canceled', updateDente.current)} color='error'>
              Cancelado
            </Button>
          </ButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setUpdateDenteFlag(false)}>
            Ok
          </Button>
        </DialogActions>
      </BootstrapDialog>

      <Dialog
        open={openAlertOnAddTreatments}
        onClose={() => setOpenAlertOnAddTreatments(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Verifique as informações'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Verifique se os campos <strong>tratamento</strong> e <strong>dentista</strong> estão devidamente
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
            variant='contained'
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          Existem tratamentos pendentes para adicionar. Por favor, adicione-os antes de ocultar o odontograma.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant='contained' color='primary'>
            Ok
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

export default Odontograma
