import { Add, ArrowBack, Delete, Description, Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from 'src/@core/components/api-client'
import { fetchData } from 'src/store/apps/professional'
import Icon from 'src/@core/components/icon'

const TabAnamnese = () => {
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

  const [configs, setConfigs] = useState([
    {
      id: '1',
      specialty: 'Geral',
      desc: 'Anamnese Geral',
      createdAt: '2025-06-28'
    }
  ])

  const [questions, setQuestions] = useState([
    { id: 1, seq: 1, question: 'Qual o motivo da consulta?', type: 'Somente texto', required: true, configId: '1' },
    {
      id: 2,
      seq: 2,
      question: 'Qual tratamento você está buscando?',
      type: 'Somente texto',
      required: true,
      configId: '1'
    },
    { id: 3, seq: 3, question: 'Tem medo de dentista?', type: 'Sim/Não/Não sei', required: false, configId: '1' },
    { id: 4, seq: 4, question: 'Como nos conheceu?', type: 'Somente texto', required: false, configId: '1' },
    {
      id: 5,
      seq: 5,
      question: 'Quando foi o seu último tratamento odontológico?',
      type: 'Sim/Não/Não sei',
      required: false,
      configId: '1'
    },
    {
      id: 6,
      seq: 6,
      question: 'Está fazendo algum tratamento médico?',
      type: 'Somente texto',
      required: false,
      configId: '1'
    },
    { id: 7, seq: 7, question: 'Está tomando algum medicamento?', type: 'Opções', required: false, configId: '1' },
    {
      id: 8,
      seq: 8,
      question: 'Tem alergia a algum medicamento? Qual?',
      type: 'Sim/Não/Não sei',
      required: false,
      configId: '1'
    },
    {
      id: 9,
      seq: 9,
      question: 'Tem alergia a algum medicamento? Qual?',
      type: 'Sim/Não/Não sei e Texto',
      required: false,
      configId: '1'
    },
    {
      id: 10,
      seq: 10,
      question: 'Tem alergia a algum medicamento? Qual?',
      type: 'Sim/Não/Não sei',
      required: false,
      configId: '1'
    },
    {
      id: 11,
      seq: 11,
      question: 'Tem alergia a algum medicamento? Qual?',
      type: 'Sim/Não/Não sei',
      required: true,
      configId: '1'
    }
  ])

  const [openModelQuestion, setOpenModelQuestion] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState({ pergunta: '', tipo: '', obrigatoria: false })

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ pergunta: '', tipo: '', obrigatoria: false })

  const [openNewAnamnese, setOpenNewAnamnese] = useState(false)
  const [especialidade, setEspecialidade] = useState('')
  const [step, setStep] = useState(2)

  const [titulo, setTitulo] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [perguntas, setPerguntas] = useState([{ pergunta: '', tipo: '', obrigatoria: false }])

  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])

  const [openDeleteAnamneseModal, setOpenDeleteAnamneseModal] = useState(false)
  const [selectedConfigIdDelete, setSelectedConfigIdDelete] = useState<number | null>(null)
  const [titleInput, setTitleInput] = useState('')
  const [openEditAnamneseName, setOpenEditAnamneseName] = useState(false)

  // const filteredQuestions = questions.filter(q => q.configId === selectedConfigId);

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const planType = userData?.planType // P or E

  const handlePerguntaChange = (index: number, field: 'pergunta' | 'tipo' | 'obrigatoria', value: any) => {
    const novas = [...perguntas]
    novas[index][field] = value as never
    setPerguntas(novas)
  }

  const mapQuestionTypeToTipo = (type: string): string => {
    switch (type) {
      case 'YES_NO':
        return 'Sim/Não/Não sei'
      case 'YES_NO_TEXT':
        return 'Sim/Não/Não sei e Texto'
      case 'TEXT':
      default:
        return 'Somente Texto'
    }
  }

  const mapTipo = (tipo: string) => {
    switch (tipo) {
      case 'Sim/Não/Não sei':
        return 'YES_NO'
      case 'Sim/Não/Não sei e Texto':
        return 'YES_NO_TEXT'
      case 'Somente Texto':
        return 'TEXT'
      case 'Opções':
        return 'OPTIONS'
      default:
        return 'TEXT'
    }
  }

  // Atualizando filteredQuestions sempre que selectedConfigId mudar
  useEffect(() => {
    if (selectedConfigId) {
      // Filtra as perguntas com base no selectedConfigId
      const filtered = questions.filter(q => q.configId === selectedConfigId)
      setFilteredQuestions(filtered) // Atualiza as perguntas filtradas
    }
  }, [selectedConfigId, questions])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/anamnese/config')

      const filteredData =
        planType === 'E' ? data.filter((c: any) => c.userCreated !== null || c.userUpdated !== null) : data

      const loadedConfigs = filteredData.map((c: any) => ({
        id: c.id,
        desc: c.desc,
        specialty: '',
        createdAt: c.createdAt
      }))

      const loadedQuestions = filteredData.flatMap((config: any) =>
        config.items.map((item: any) => ({
          id: item.id,
          configId: config.id,
          question: item.question,
          type: mapQuestionTypeToTipo(item.questionType),
          required: item.required,
          seq: item.seq
        }))
      )

      setConfigs(loadedConfigs)
      setQuestions(loadedQuestions)
    } catch (error) {
      console.error('Erro ao buscar anamneses:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const adicionarPergunta = () => {
    setPerguntas([...perguntas, { pergunta: '', tipo: '', obrigatoria: false }])
  }

  const removerPergunta = (index: number) => {
    const novas = perguntas.filter((_, i) => i !== index)
    setPerguntas(novas)
  }

  const handleSalvar = async () => {
    // const templateId = uuidv4(); // gerar um UUID para o template
    const newConfigId = String(configs.length + 1)

    const newConfig = {
      id: newConfigId,
      specialty: especialidade,
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

    // Envia para o backend
    try {
      await api.post('/anamnese/config', {
        desc: newConfig.desc,
        active: ativo,

        // templateId,
        items: novasQuestoes
      })

      await fetchData() // Recarrega os dados após salvar
      toast.success('Registro  incluído com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar modelo:', error)
      toast.error('Erro ao salvar modelo de Anamnese.')

      // Adicione um toast ou alerta aqui se quiser
    }

    // Resetar formulário
    setOpenNewAnamnese(false)
    setStep(1)
    setEspecialidade('')
    setTitulo('')
    setAtivo(true)
    setPerguntas([{ pergunta: '', tipo: '', obrigatoria: false }])
  }

  const handleEditClick = (index: number) => {
    const q = filteredQuestions[index]
    setEditData({ pergunta: q.question, tipo: q.type, obrigatoria: q.required ?? false })
    setEditIndex(index)
    setEditDialogOpen(true)
  }

  const handleNewQuestionClick = () => {
    setNewQuestion({ pergunta: '', tipo: '', obrigatoria: false })
    setCreateDialogOpen(true)
  }

  const handleCreateSave = async () => {
    const nova = {
      id: questions.length + 1, // ou use uuid
      seq: questions.length + 1,
      question: newQuestion.pergunta,
      type: newQuestion.tipo,
      required: newQuestion.obrigatoria,
      configId: selectedConfigId || '1' // Use o ID da configuração selecionada ou um padrão
    }

    try {
      await api.post(`/anamnese/config/${selectedConfigId}/items`, {
        seq: nova.seq,
        question: nova.question,
        questionType: mapTipo(nova.type),
        required: nova.required,
        alert: false,
        options: generateOptions(nova.type)
      })

      await fetchData()
      toast.success('Nova pergunta adicionada com sucesso!')
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Erro ao adicionar nova pergunta:', error)
      toast.error('Erro ao adicionar nova pergunta.')
    }
  }

  const tipoOptions = ['Sim/Não/Não sei', 'Sim/Não/Não sei e Texto', 'Somente Texto']

  const handleEditSave = async () => {
    if (editIndex !== null && selectedConfigId) {
      const question = filteredQuestions[editIndex] // Usar filteredQuestions para garantir que seja a pergunta correta

      try {
        // Atualiza a pergunta no backend
        await api.patch(`/anamnese/config/items/${question.id}`, {
          question: editData.pergunta,
          questionType: mapTipo(editData.tipo),
          required: editData.obrigatoria,
          options: generateOptions(editData.tipo)
        })

        await fetchData()
        toast.success('Pergunta alterada com sucesso!')
      } catch (err) {
        console.error('Erro ao editar pergunta:', err)
        toast.error('Erro ao editar pergunta.')
      }

      // Fecha o modal de edição
      setEditDialogOpen(false)
    }
  }

  useEffect(() => {
    const current = configs.find(c => c.id === selectedConfigId)
    setTitleInput(current?.desc || '')
  }, [selectedConfigId, configs])

  const handleSaveTitle = async () => {
    if (!selectedConfigId) return

    try {
      const { data } = await api.patch(`/anamnese/config/${selectedConfigId}`, {
        desc: titleInput
      })

      fetchData() // Recarrega os dados para refletir a mudança

      setOpenEditAnamneseName(false)

      toast.success('Título atualizado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar título.')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await api.delete(`/anamnese/config/items/${id}`)
      toast.success('Pergunta excluída com sucesso!')

      await fetchData()
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error)
      toast.error('Erro ao excluir pergunta.')
    }
  }

  const handleDeleteConfig = async (id: string) => {
    try {
      await api.delete(`/anamnese/config/${id}`)
      toast.success('Registro excluído com sucesso!')

      await fetchData()
    } catch (error) {
      console.error('Erro ao excluir configuração:', error)
      toast.error('Erro ao excluir modelo de Anamnese.')
    }
  }

  const handleCloseNewAnamneseEspeciality = () => {
    setOpenNewAnamnese(false)
    setEspecialidade('')
    setTitulo('')
    setAtivo(true)
    setPerguntas([{ pergunta: '', tipo: '', obrigatoria: false }])
  }

  const handleConfirmDeleteAnamnese = async () => {
    if (selectedConfigId) {
      await handleDeleteConfig(selectedConfigId)
      setOpenDeleteAnamneseModal(false)
      setSelectedConfigId(null)
    }
  }

  const handleOpenDeleteAnamneseModal = (id: string) => {
    setSelectedConfigId(id)
    setOpenDeleteAnamneseModal(true)
  }

  return (
    <>
      <Box p={4}>
        <Box mb={3} display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h5' fontWeight='bold'>
              Gerencie seus Modelos de Anamneses
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Gerencie seus modelos de anamneses por especialidade, edite ou exclua rapidamente as informações
              necessárias.
            </Typography>
          </Box>
          <Button variant='contained' startIcon={<Add />} color='primary' onClick={() => setOpenNewAnamnese(true)}>
            NOVA ANAMNESE
          </Button>
        </Box>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#2d2f36' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff' }}>Nome</TableCell>
                    <TableCell sx={{ color: '#fff' }}>Anamnese</TableCell>
                    <TableCell sx={{ color: '#fff' }} align='right'>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map(config => (
                    <TableRow key={config.id} hover>
                      <TableCell>{config.desc}</TableCell>
                      <TableCell>
                        <Button
                          variant='text'
                          startIcon={<Description />}
                          sx={{ textTransform: 'none' }}
                          onClick={() => {
                            setOpenModelQuestion(true)
                            setSelectedConfigId(config.id)
                          }}
                        >
                          Abrir Modelo
                        </Button>
                      </TableCell>

                      <TableCell align='right'>
                        <Tooltip title='Editar'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => {
                              setSelectedConfigId(config.id)
                              setOpenEditAnamneseName(true)
                            }}
                          >
                            <Icon icon='mdi:edit-outline' color='blue' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Excluir'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleOpenDeleteAnamneseModal(config.id)}
                          >
                            <Icon icon='mdi:delete-outline' color='red' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {configs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align='center'>
                        Nenhum modelo cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <Dialog open={openModelQuestion} onAbort={() => setOpenModelQuestion(false)} maxWidth='md' fullWidth>
        <Box p={4}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Button variant='outlined' startIcon={<ArrowBack />} onClick={() => setOpenModelQuestion(false)}>
              Voltar
            </Button>

            <Typography fontWeight='bold' variant='h6'>
              {configs.find(c => c.id === selectedConfigId)?.desc || 'Modelo'}
            </Typography>

            <Button variant='contained' startIcon={<Add />} onClick={handleNewQuestionClick}>
              Nova Pergunta
            </Button>
          </Box>

          <Card>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#2d2f36' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#fff' }}>Excluir</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Editar</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Sequência</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Pergunta</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Tipo de Resposta</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredQuestions.map((q, index) => (
                      <TableRow key={q.id}>
                        <TableCell>
                          <Tooltip title='Excluir'>
                            <IconButton color='error' size='small' onClick={() => handleDeleteQuestion(String(q.id))}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title='Editar'>
                            <IconButton color='primary' size='small' onClick={() => handleEditClick(index)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{q.seq}</TableCell>
                        <TableCell>{q.question}</TableCell>
                        <TableCell>{q.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Editar Pergunta</DialogTitle>
        <DialogContent dividers>
          <TextField
            label='Pergunta'
            fullWidth
            required
            margin='normal'
            value={editData.pergunta}
            onChange={e => setEditData({ ...editData, pergunta: e.target.value })}
          />

          <FormControl fullWidth required sx={{ mt: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={editData.tipo}
              onChange={e => setEditData({ ...editData, tipo: e.target.value })}
              input={<OutlinedInput label='Tipo' />}
            >
              {tipoOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Checkbox
                checked={editData.obrigatoria}
                onChange={e => setEditData({ ...editData, obrigatoria: e.target.checked })}
              />
            }
            label='Preenchimento Obrigatório'
          />
        </DialogContent>
        <DialogActions sx={{ mt: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleEditSave} variant='contained' color='primary'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Nova Pergunta</DialogTitle>
        <DialogContent dividers>
          <TextField
            label='Pergunta'
            fullWidth
            required
            margin='normal'
            value={newQuestion.pergunta}
            onChange={e => setNewQuestion({ ...newQuestion, pergunta: e.target.value })}
          />

          <FormControl fullWidth required sx={{ mt: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newQuestion.tipo}
              onChange={e => setNewQuestion({ ...newQuestion, tipo: e.target.value })}
              input={<OutlinedInput label='Tipo' />}
            >
              {tipoOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Checkbox
                checked={newQuestion.obrigatoria}
                onChange={e => setNewQuestion({ ...newQuestion, obrigatoria: e.target.checked })}
              />
            }
            label='Preenchimento Obrigatório'
          />
        </DialogContent>
        <DialogActions sx={{ mt: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleCreateSave} variant='contained' color='primary'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNewAnamnese} onClose={handleCloseNewAnamneseEspeciality} fullWidth maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1 }}>
          Anamnese por Especialidade
        </DialogTitle>

        <DialogContent dividers>
          {/* {step === 1 && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Escolha a especialidade para criar uma nova anamnese
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Selecione a especialidade para visualizar e escolher o modelo de anamnese mais adequado ao tratamento.
              </Typography>


              <TextField
                label="Especialidade"
                fullWidth
                required
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
              />
            </>
          )} */}

          <>
            <TextField
              label='Título da Anamnese'
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
                    <Grid item xs={6}>
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
                    <Grid item xs={2}>
                      <IconButton color='error' onClick={() => removerPergunta(index)}>
                        <Icon icon='mdi:delete-outline' color='red' />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Button onClick={adicionarPergunta} sx={{ mt: 2 }}>
              Adicionar Pergunta
            </Button>
          </>
        </DialogContent>

        <DialogActions sx={{ mt: 2 }}>
          <Button
            onClick={() => {
              handleCloseNewAnamneseEspeciality()
            }}
            color='error'
            variant='outlined'
          >
            Cancelar
          </Button>

          {/* {step === 1 && (
            <Button onClick={() => setStep(2)} variant="contained" disabled={!especialidade}>
              Confirmar
            </Button>
          )} */}

          <Button onClick={handleSalvar} variant='outlined' color='primary'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteAnamneseModal}
        onClose={() => setOpenDeleteAnamneseModal(false)}
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
        maxWidth='xs'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle
          id='confirm-dialog-title'
          sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px' }}
        >
          Atenção!
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id='confirm-dialog-description'
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px ' }}
          >
            Tem certeza que deseja excluir esta anamnese?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAnamneseModal(false)} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDeleteAnamnese} color='primary' variant='outlined'>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditAnamneseName} onClose={() => setOpenEditAnamneseName(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Editar título da anamnese</DialogTitle>
        <DialogContent>
          <TextField
            label='Título'
            fullWidth
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            margin='normal'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditAnamneseName(false)} variant='outlined' color='error'>
            Cancelar
          </Button>
          <Button onClick={handleSaveTitle} variant='outlined' color='primary'>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TabAnamnese
