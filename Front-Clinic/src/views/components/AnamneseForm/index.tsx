import React, { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Typography,
  TextField,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardContent,
  InputLabel,
  OutlinedInput,
  Chip
} from '@mui/material'
import { questionsObjectList } from './questions'
import api from 'src/@core/components/api-client'
import crypto from 'crypto'
import { Add, Delete, PlusOne, WhatsApp } from '@mui/icons-material'
import toast from 'react-hot-toast'
import { A } from '@fullcalendar/resource/internal-common'

interface Props {
  patientId: string
}

type Pergunta = {
  pergunta: string
  tipo: string
  obrigatoria: boolean
}

const AnamneseForm = ({ patientId }: Props) => {
  const [tipoAnamnese, setTipoAnamnese] = useState<string>()
  const [openNewAnamnese, setOpenNewAnamnese] = useState<boolean>(false)

  const [configs, setConfigs] = useState<any[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<string>('')
  const [questions, setQuestions] = useState<any[]>([])
  const [preenchidoPor, setPreenchidoPor] = useState<'profissional' | 'paciente' | null>(null)
  const [modalEscolhaAberto, setModalEscolhaAberto] = useState(false)
  const [isSendWhatsApp, setIsSendWhatsApp] = useState(false)
  const [anamneseName, setAnamneseName] = useState('')

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const planType = userData?.planType // P ou E

  const createQuestionSchema = (q: any, index: number, preenchidoPor: 'profissional' | 'paciente' | null) => {
    const base: { [key: string]: any } = {}
    const questionKey = `question_${index}`
    const extraKey = `question_${index}_extra`
    const isPaciente = preenchidoPor === 'paciente'

    switch (q.questionType) {
      case 'TEXT':
      case 'YES_NO':
      case 'RADIO':
        base[questionKey] =
          !isPaciente && q.required ? yup.string().required('Campo obrigatório') : yup.string().nullable()
        break

      case 'YES_NO_TEXT':
        base[questionKey] =
          !isPaciente && q.required ? yup.string().required('Campo obrigatório') : yup.string().nullable()
        base[extraKey] = yup.string().nullable() // sempre opcional
        break

      case 'CHECKBOX':
        base[questionKey] =
          !isPaciente && q.required
            ? yup.array().of(yup.string()).min(1, 'Selecione ao menos uma opção')
            : yup.array().of(yup.string())
        break

      default:
        base[questionKey] = yup.string().nullable()
    }

    return yup.object().shape(base)
  }

  const mapTipoToQuestionType = (tipo: string): string => {
    switch (tipo) {
      case 'Sim/Não/Não sei':
        return 'YES_NO'
      case 'Sim/Não/Não sei e Texto':
        return 'YES_NO_TEXT'
      case 'Somente Texto':
        return 'TEXT'
      default:
        return 'DESC'
    }
  }

  const generateOptions = (tipo: string): any[] | null => {
    if (tipo === 'Sim/Não/Não sei' || tipo === 'Sim/Não/Não sei e Texto') {
      return [
        { Option: 'Sim', value: 'Sim' },
        { Option: 'Não', value: 'Não' },
        { Option: 'Não sei', value: 'Não sei' }
      ]
    }

    return [] // Somente texto não tem opções
  }

  const validationSchema = useMemo(() => {
    return yup.object().shape(
      questions.reduce((acc, q, index) => {
        return {
          ...acc,
          ...createQuestionSchema(q, index, preenchidoPor).fields
        }
      }, {})
    )
  }, [questions, preenchidoPor])

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema)
  })

  const fetchConfigs = async () => {
    try {
      const { data } = await api.get('/anamnese/config')

      const filteredData =
        planType === 'E' ? data.filter((c: any) => c.userCreated !== null || c.userUpdated !== null) : data

      setConfigs(filteredData)
    } catch (error) {
      console.error('Erro ao buscar configurações de anamnese:', error)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  useEffect(() => {
    const config = configs.find(c => c.id === selectedConfigId)
    setQuestions(config?.items || [])
    setAnamneseName(config?.desc || '')
  }, [selectedConfigId, configs])

  const renderInput = (q: any, index: number, preenchidoPor: 'profissional' | 'paciente' | null) => {
    const name = `question_${index}`
    const label = q.question
    const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
    const isPaciente = preenchidoPor === 'paciente'

    const validationRules = !isPaciente && q.required ? { required: 'Campo obrigatório' } : {}

    switch (q.questionType) {
      case 'TEXT':
        return (
          <TextField
            {...register(name, validationRules)}
            label={label}
            fullWidth
            multiline
            minRows={3}
            margin='normal'
            disabled={isPaciente}
            error={!!errors[name]}
            helperText={errors[name]?.message?.toString()}
          />
        )

      case 'YES_NO':
      case 'RADIO':
        return (
          <>
            <FormLabel>{label}</FormLabel>
            <RadioGroup>
              {options.map((opt: any, i: number) => (
                <FormControlLabel
                  key={i}
                  value={opt.value}
                  control={<Radio {...register(name, validationRules)} disabled={isPaciente} />}
                  label={opt.Option}
                />
              ))}
            </RadioGroup>
            {errors[name] && (
              <Typography color='error' variant='caption'>
                {errors[name]?.message?.toString()}
              </Typography>
            )}
          </>
        )

      case 'YES_NO_TEXT':
        return (
          <>
            <FormLabel>{label}</FormLabel>
            <RadioGroup>
              {options.map((opt: any, i: number) => (
                <FormControlLabel
                  key={i}
                  value={opt.value}
                  control={<Radio {...register(name, validationRules)} disabled={isPaciente} />}
                  label={opt.Option}
                />
              ))}
            </RadioGroup>
            {errors[name] && (
              <Typography color='error' variant='caption'>
                {errors[name]?.message?.toString()}
              </Typography>
            )}

            <TextField
              {...register(`${name}_extra`)}
              placeholder={anamneseName === 'Protocolo HOF' ? 'Quais?' : 'Informações adicionais'}
              fullWidth
              margin='normal'
              disabled={isPaciente}
              error={!!errors[`${name}_extra`]}
              helperText={errors[`${name}_extra`]?.message?.toString()}
            />
          </>
        )

      case 'CHECKBOX':
        return (
          <>
            <FormLabel>{label}</FormLabel>
            {options.map((opt: any, i: number) => (
              <FormControlLabel
                key={i}
                control={<Checkbox {...register(`${name}.${i}`)} disabled={isPaciente} />}
                label={opt.Option}
              />
            ))}
          </>
        )

      default:
        return <TextField {...register(name)} label={label} fullWidth margin='normal' disabled={isPaciente} />
    }
  }

  const createHashDoc = (data: string) => {
    const hash = crypto.createHash('sha256')
    hash.update(data)
    const hashResult = hash.digest('hex')

    return hashResult
  }

  const handleSendWhatsApp = async (
    patientName: string,
    patientPhone: string,
    professional: string,
    idAnamnese: string
  ) => {
    try {
      const message = `👋 Olá ${patientName}! 

Você está recebendo a sua ficha de anamnese para preencher e assinar digital da %nome da clinica ou profissinal%  através do sistema Cláiris IA Software.

Para preencher e assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar o preenchimento e assinatura online.


📄 Link para assinatura: ${process.env.NEXT_PUBLIC_URL_FRONT}/anamnese/print/${idAnamnese}

Caso tenha qualquer dúvida, nossa equipe está à disposição para ajudar.

Cláiris IA Software – Clareza e agilidade para sua rotina!`
      const phone = patientPhone

      if (!message || !phone) {
        toast.error('Mensagem ou telefone não encontrados')

        return
      }

      await api.post('/whatsapp/send-message', {
        message,
        phone,
        delay: 0
      })

      toast.success('Mensagem enviada com sucesso!')
    } catch (err) {
      console.error(err)

      toast.error('Erro ao enviar mensagem via WhatsApp')
    }
  }

  const onSubmit = async (data: any) => {
    try {
      const anamnesePayload = {
        anamneseConfigId: selectedConfigId,
        patientId,
        status: 'pending',
        currentAnamnese: true,
        items: questions.map((q, index) => {
          const name = `question_${index}`
          const extra = data[`${name}_extra`]

          let answerOption = ''
          let answerDesc = ''

          if (q.questionType === 'TEXT') {
            answerDesc = data[name]
          } else if (q.questionType === 'YES_NO_TEXT') {
            answerOption = data[name]
            answerDesc = extra || ''
          } else if (q.questionType === 'CHECKBOX') {
            const selected = Object.entries(data[name] || {})
              .filter(([_, val]) => val)
              .map(([i, _]) => q.options?.[+i]?.Option)
              .filter(Boolean)
            answerOption = selected.join(', ')
          } else {
            answerOption = data[name]
          }

          return {
            question: q.question,
            questionType: q.questionType,
            answerOption,
            answerDesc,
            options: q.options || [],
            required: q.required,
            seq: q.seq
          }
        }),
        observation: data.observation
      }

      const { data: anamneseData } = await api.post('/anamnese', anamnesePayload)

      const hashDoc = createHashDoc(JSON.stringify(anamneseData))

      await api.post('/contracts-signature', {
        documentType: 'anamnese',
        hashDoc,
        documentId: anamneseData.id
      })

      if (isSendWhatsApp) {
        const patientName = anamneseData?.patient?.name
        const patientPhone = anamneseData?.patient?.cell_phone

        if (patientName && patientPhone) {
          const message = `👋 Olá ${patientName}! 

Você está recebendo a sua ficha de anamnese para preencher e assinar digital através do sistema Cláiris IA Software.

Para preencher e assinar, basta clicar no link abaixo. Você será direcionado para uma página segura onde poderá revisar e confirmar o preenchimento e assinatura online.

📄 Link para assinatura: ${process.env.NEXT_PUBLIC_URL_FRONT}/anamnese/print/${anamneseData.id}

Caso tenha qualquer dúvida, nossa equipe está à disposição para ajudar.

Cláiris IA Software – Clareza e agilidade para sua rotina!`

          await api.post('/whatsapp/send-message', {
            message,
            phone: patientPhone,
            delay: 0
          })

          toast.success('Mensagem enviada com sucesso!')
        } else {
          toast.error('Não foi possível enviar WhatsApp: nome ou telefone não encontrados')
        }
      }

      toast.success('Anamnese salva com sucesso!')
      setSelectedConfigId('')

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Erro ao salvar anamnese:', error)
      toast.error('Erro ao salvar anamnese')
    }
  }

  const handleSelectChange = (event: any) => {
    if (event.target.value === 'new') {
      setOpenNewAnamnese(true)

      return
    }
    setTipoAnamnese(event.target.value)
  }

  const renderQuestionInput = (question: string, options: any[], index: number) => {
    const fieldName = `question${index}`
    const infoName = `infoAdicional${index}`

    if (options[0].type === 'radio') {
      return (
        <>
          <RadioGroup {...register(fieldName, { required: 'Obrigatório' })}>
            {options.map((option: any, optIndex: number) => (
              <FormControlLabel key={optIndex} value={option.label} control={<Radio />} label={option.label} />
            ))}
          </RadioGroup>

          <TextField
            {...register(infoName)}
            placeholder='Informações adicionais'
            fullWidth
            margin='normal'
            error={!!errors[infoName]}
            helperText={errors[infoName]?.message?.toString()}
          />
        </>
      )
    }

    // Se for tipo check
    if (options[0].type === 'check') {
      return (
        <>
          {options.map((option: any, optIndex: number) => (
            <FormControlLabel
              key={optIndex}
              control={<Checkbox {...register(`check${index}_${optIndex}`)} value={option.label} />}
              label={option.label}
            />
          ))}

          <TextField
            {...register(infoName)}
            placeholder='Informações adicionais'
            fullWidth
            margin='normal'
            error={!!errors[infoName]}
            helperText={errors[infoName]?.message?.toString()}
          />
        </>
      )
    }

    // Se for apenas campo de texto direto
    if (options[0].type === 'text') {
      return (
        <TextField
          {...register(infoName)}
          placeholder={options[0].label || 'Informações adicionais'}
          fullWidth
          margin='normal'
          error={!!errors[infoName]}
          helperText={errors[infoName]?.message?.toString()}
        />
      )
    }

    return null
  }

  const tipoOptions = ['Sim/Não/Não sei', 'Sim/Não/Não sei e Texto', 'Somente Texto']

  const [titulo, setTitulo] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [perguntas, setPerguntas] = useState([{ pergunta: '', tipo: '', obrigatoria: false }])

  const handlePerguntaChange = (index: number, field: keyof Pergunta, value: any) => {
    const novas = [...perguntas]
    novas[index][field] = value as never
    setPerguntas(novas)
  }

  const adicionarPergunta = () => {
    setPerguntas([...perguntas, { pergunta: '', tipo: '', obrigatoria: false }])
  }

  const removerPergunta = (index: number) => {
    const novas = perguntas.filter((_, i) => i !== index)
    setPerguntas(novas)
  }

  const handleSalvar = async () => {
    const newConfigId = String(configs.length + 1)

    const newConfig = {
      id: newConfigId,
      specialty: null,
      desc: titulo || 'Anamnese sem título',
      createdAt: new Date().toISOString().split('T')[0]
    }

    const novasQuestoes = perguntas.map((p, i) => ({
      question: p.pergunta,
      questionType: mapTipoToQuestionType(p.tipo),
      seq: i + 1,
      required: p.obrigatoria,
      options: generateOptions(p.tipo),
      alert: false
    }))

    try {
      await api.post('/anamnese/config', {
        desc: newConfig.desc,
        active: ativo,

        // templateId,
        items: novasQuestoes
      })

      // await fetchConfigs();
      window.location.reload()
    } catch (error) {
      console.error('Erro ao salvar modelo:', error)

      // Adicione um toast ou alerta aqui se quiser
    }

    // Resetar formulário
    setOpenNewAnamnese(false)
    setTitulo('')
    setAtivo(true)
    setPerguntas([{ pergunta: '', tipo: '', obrigatoria: false }])
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin='normal'>
              <FormLabel>Tipo de Anamnese</FormLabel>
              <Select
                value={selectedConfigId}
                onChange={e => {
                  const value = e.target.value
                  setSelectedConfigId(value)

                  if (value !== '' && value !== ' ') {
                    setModalEscolhaAberto(true)
                  }
                }}
                displayEmpty
              >
                <MenuItem value=''>
                  <em>[ Selecione um Modelo ]</em>
                </MenuItem>
                {configs.map(config => (
                  <MenuItem key={config.id} value={config.id}>
                    {config.desc}
                  </MenuItem>
                ))}
                <MenuItem value=' ' sx={{ color: '#8B18BB', fontWeight: 500 }} onClick={() => setOpenNewAnamnese(true)}>
                  <em>
                    Nova Anamnese <Add />
                  </em>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {questions.map((q, index) => {
            const isTextOnly = q.questionType === 'TEXT'

            return (
              <Grid
                item
                xs={12}
                sm={isTextOnly ? 12 : 6}
                key={index}
                sx={{
                  boxShadow: 'none',
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  padding: 2
                }}
              >
                {renderInput(q, index, preenchidoPor)}
              </Grid>
            )
          })}

          {selectedConfigId && (
            <Grid item xs={12}>
              <TextField
                {...register('observation')}
                label='Observações'
                multiline
                fullWidth
                minRows={3}
                margin='normal'
              />
            </Grid>
          )}

          {selectedConfigId && (
            <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
              <Button variant='contained' type='submit' onClick={() => setIsSendWhatsApp(false)}>
                Salvar
              </Button>

              <Button variant='outlined' color='error' onClick={() => setSelectedConfigId('')}>
                Fechar
              </Button>

              <Button variant='outlined' type='submit' onClick={() => setIsSendWhatsApp(true)}>
                Enviar <WhatsApp />
              </Button>
            </Grid>
          )}
        </Grid>
      </form>

      <Dialog open={openNewAnamnese} onClose={() => setOpenNewAnamnese(false)} fullWidth maxWidth='md'>
        <DialogTitle>Nova Anamnese</DialogTitle>
        <DialogContent dividers>
          <TextField
            label='Título'
            fullWidth
            required
            margin='normal'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox checked={ativo} onChange={e => setAtivo(e.target.checked)} />}
            label='Ativo'
          />

          {perguntas.map((p, index) => (
            <Card key={index} variant='outlined' sx={{ mt: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label='Pergunta'
                      fullWidth
                      required
                      value={p.pergunta}
                      onChange={e => handlePerguntaChange(index, 'pergunta', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={p.tipo}
                        onChange={e => handlePerguntaChange(index, 'tipo', e.target.value)}
                        input={<OutlinedInput label='Tipo' />}
                      >
                        {tipoOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={p.obrigatoria}
                          onChange={e => handlePerguntaChange(index, 'obrigatoria', e.target.checked)}
                        />
                      }
                      label='Preenchimento Obrigatório'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button color='error' onClick={() => removerPergunta(index)}>
                      <Delete />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button onClick={adicionarPergunta} sx={{ mt: 2 }}>
            Adicionar Pergunta
          </Button>
        </DialogContent>
        <DialogActions sx={{ mt: 2 }}>
          <Button onClick={() => setOpenNewAnamnese(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} variant='contained' color='primary'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEscolhaAberto} onClose={() => setModalEscolhaAberto(false)}>
        <DialogTitle>Quem irá preencher esta anamnese?</DialogTitle>
        <DialogContent>
          <FormControl component='fieldset'>
            <RadioGroup
              value={preenchidoPor}
              onChange={e => setPreenchidoPor(e.target.value as 'profissional' | 'paciente')}
            >
              <FormControlLabel value='profissional' control={<Radio />} label='Profissional' />
              <FormControlLabel value='paciente' control={<Radio />} label='Paciente' />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalEscolhaAberto(false)} color='error'>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setModalEscolhaAberto(false)

              // Modal fecha e exibe os campos abaixo
              // Se quiser resetar estado, faça aqui também
            }}
            disabled={!preenchidoPor}
            variant='contained'
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AnamneseForm
