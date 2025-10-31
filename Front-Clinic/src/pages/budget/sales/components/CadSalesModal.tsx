import { useEffect, useState } from 'react'
import {
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
  Dialog
} from '@mui/material'
import Image from 'next/image'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import styles from '../style/sales.module.css'
import { Chance } from 'src/context/types'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { getPatients } from 'src/store/apps/odontogram'
import { useDispatch } from 'react-redux'
import api from 'src/@core/components/api-client'

export default function CadSalesModal(props: any) {
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.odontogram)

  const patients = [
    { name: 'João', label: 'João' },
    { name: 'Maria', label: 'Maria' },
    { name: 'Elias', label: 'Elias' },
    { name: 'Ana', label: 'Ana' }
  ]

  useEffect(() => {
    dispatch(getPatients());
  }, [dispatch])

  const [hasPatient, setHasPatient] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [patient, setPatient] = useState('')
  const [patientId, setPatientId] = useState('')
  const [amount, setAmount] = useState<string>()

  function handleClose() {
    setTitle('')
    setDescription('')
    setHasPatient(false)
    props.closeDialog()
  }

  async function saveChance() {
    const newChance = new Chance(title, description, 'opportunity', 'opened')
    newChance.author = 'Nome do autor'
    newChance.amount = convertTextToNumber(amount)

    if (hasPatient && patient != '') {
      newChance.patient = patient
    }

    await api.post('sales', { patientId: hasPatient ? patientId : undefined, title, description, value: convertTextToNumber(amount), status: 'opened' })
    props.saveChance(newChance)
    if (props.fetchData())
      props.fetchData()
    handleClose()
  }

  function convertTextToNumber(amount = ''): number {
    const newAmount = amount.replaceAll('.', '').replaceAll(',', '.')

    return parseFloat(newAmount)
  }

  return (
    <Dialog {...props} onClose={handleClose}>
      <DialogTitle>Cadastro de oportunidade</DialogTitle>
      <DialogContent>
        <article className={styles.user_infos}>
          <Box mr={2} className={styles.profile_pic}>
            <Image src='/images/avatars/user_profile.webp' alt='user picture' width={50} height={50} />
          </Box>
          <Box pl={2}>
            <p>Responsável</p>
            <p style={{ fontWeight: 'bold' }}>Nome do usuário</p>
          </Box>
        </article>
        <Box component='form'>
          <Box mb={3}>
            <TextField
              id='nome'
              label='Título'
              variant='outlined'
              value={title}
              onChange={e => setTitle(e.currentTarget.value)}
              required
              fullWidth
            />
          </Box>
          <Box mb={3}>
            <TextField
              id='nome'
              label='Descrição'
              required
              multiline
              fullWidth
              minRows={2}
              maxRows={4}
              variant='outlined'
              value={description}
              onChange={e => setDescription(e.currentTarget.value)}
            />
          </Box>
          <Box mb={3}>
            <TextField
              id='nome'
              label='Valor da oportunidade'
              fullWidth
              variant='outlined'
              value={amount}
              onChange={e => setAmount(e.currentTarget.value)}
            />
          </Box>
          <Box mb={3}>
            <FormControlLabel
              control={<Switch checked={hasPatient} onChange={() => setHasPatient(!hasPatient)} />}
              label='Oportunidade vinculada a um paciente'
            />
            {hasPatient && (
              <Autocomplete
                disablePortal
                id='paciente'
                onChange={(event, newValue: any) => {
                  if (newValue != null) {
                    setPatient(newValue['name'])
                    setPatientId(newValue.id);
                  }
                }}
                options={store.patients.map(p => ({ label: p.name, id: p.id }))}
                renderInput={params => <TextField {...params} label='Paciente' />}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={saveChance}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}
