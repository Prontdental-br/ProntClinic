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
  Fade,
  FadeProps,
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
import React, { forwardRef, Ref, useEffect, useState, ReactElement } from 'react'
import api from 'src/@core/components/api-client'
import ReactDraftWysiwyg from 'src/@core/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw, convertFromHTML, Modifier } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

const TabExams = () => {
  const [configs, setConfigs] = useState<any[]>([])
  const [openNewContract, setOpenNewContract] = useState(false)
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty(undefined))
  const [contractTitle, setContractTitle] = useState('')
  const [editingContractId, setEditingContractId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<string | null>(null)

  const [selectionTextList, setSelectionTextList] = useState<string[]>([])
  const [newSelectionText, setNewSelectionText] = useState('')

  const handleEditContract = (contract: any) => {
    setContractTitle(contract.title)
    const blocksFromHTML = convertFromHTML(contract.content || '')
    const content = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap)
    setMessageValue(EditorState.createWithContent(content))
    setEditingContractId(contract.id)

    const newTextList = extractSelectionTexts(contract.content)
    setSelectionTextList(newTextList)

    setOpenNewContract(true)
  }

  const extractSelectionTexts = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const textList: string[] = []
    const checkboxSpans = doc.querySelectorAll('.selection-text')
    checkboxSpans.forEach(span => {
      textList.push(span.textContent || '')
    })

    return textList
  }

  const fetchContracts = async () => {
    try {
      const { data } = await api.get('/contract-configs')
      setConfigs(data)
    } catch (error) {
      console.error('Erro ao carregar contratos:', error)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const onClose = () => {
    setOpenNewContract(false)
  }

  const handleOpenDeleteModal = (id: string) => {
    setContractToDelete(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!contractToDelete) return

    try {
      await api.delete(`/contract-configs/${contractToDelete}`)
      toast.success('Registro excluído com sucesso!')
      fetchContracts()
    } catch (error) {
      console.error('Erro ao excluir exame:', error)
      toast.error('Erro ao excluir exame.')
    } finally {
      setDeleteModalOpen(false)
      setContractToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setContractToDelete(null)
  }

  const clearForm = () => {
    setContractTitle('')
    setMessageValue(EditorState.createEmpty(undefined))
    setSelectionTextList([])
    setNewSelectionText('')
  }

  const onSubmit = async (event: any) => {
    event.preventDefault()

    const payload = {
      title: contractTitle,
      content: draftToHtml(convertToRaw(messageValue.getCurrentContent()))
    }

    try {
      if (editingContractId) {
        await api.patch(`/contract-configs/${editingContractId}`, payload)
        toast.success('Registro alterado com sucesso!')
      } else {
        await api.post('/contract-configs', payload)
        toast.success('Registro incluído com sucesso!')
      }

      setOpenNewContract(false)
      setEditingContractId(null)
      setContractTitle('')
      setMessageValue(EditorState.createEmpty(undefined))
      setSelectionTextList([])
      setNewSelectionText('')

      fetchContracts()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCloseModal = () => {
    setOpenNewContract(false)
    setEditingContractId(null)
    setContractTitle('')
    setMessageValue(EditorState.createEmpty(undefined))
    setSelectionTextList([])
    setNewSelectionText('')
  }

  const handleAddSelectionText = () => {
    if (newSelectionText.trim() !== '') {
      const newTextWithCheckbox = `[ ] ${newSelectionText}`

      const currentContent = messageValue.getCurrentContent()
      const selection = messageValue.getSelection()
      const contentWithEntity = Modifier.insertText(currentContent, selection, newTextWithCheckbox)

      const newEditorState = EditorState.push(messageValue, contentWithEntity, 'insert-characters')
      setMessageValue(newEditorState)

      setSelectionTextList(prevList => [...prevList, newSelectionText])
      setNewSelectionText('')
    }
  }

  const handleRemoveSelectionText = (textToRemove: string) => {
    setSelectionTextList(prevList => prevList.filter(text => text !== textToRemove))

    const currentContent = messageValue.getCurrentContent()
    const blocks = currentContent.getBlockMap()
    let newContent = currentContent

    blocks.forEach(block => {
      const text = block!.getText()
      if (text.includes(`[ ] ${textToRemove}`)) {
        const start = text.indexOf(`[ ] ${textToRemove}`)
        const end = start + `[ ] ${textToRemove}`.length
        const selectionToRemove = newContent.getSelectionAfter().merge({
          anchorKey: block!.getKey(),
          anchorOffset: start,
          focusKey: block!.getKey(),
          focusOffset: end
        })
        newContent = Modifier.removeRange(newContent, selectionToRemove, 'backward')
      }
    })

    setMessageValue(EditorState.push(messageValue, newContent, 'remove-range'))
  }

  return (
    <>
      <Box p={4}>
        <Box mb={3} display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h5' fontWeight='bold'>
              Gerencie seus Modelos de Exames
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Gerencie seus modelos de exames personalizados para agilizar o processo de formalização com seus
              pacientes.
            </Typography>
          </Box>

          <Button
            variant='contained'
            startIcon={<Add />}
            color='primary'
            onClick={() => {
              setOpenNewContract(true)
              clearForm()
            }}
          >
            Novo Exame
          </Button>
        </Box>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#2d2f36' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff' }}>Título</TableCell>
                    <TableCell sx={{ color: '#fff' }} align='right'>
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map(config => (
                    <TableRow key={config.id} hover>
                      <TableCell>{config.title}</TableCell>
                      <TableCell align='right'>
                        <Tooltip title='Editar'>
                          <IconButton size='small' color='primary' onClick={() => handleEditContract(config)}>
                            <Icon icon='mdi:pencil-outline' color='blue' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Excluir'>
                          <IconButton size='small' color='error' onClick={() => handleOpenDeleteModal(config.id)}>
                            <Icon icon='mdi:delete-outline' color='red' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {configs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} align='center'>
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

      <Dialog open={openNewContract} onClose={handleCloseModal} fullWidth maxWidth='md'>
        <DialogTitle sx={{ display: 'flex', backgroundColor: '#e0e0e0ff', pl: 4, pt: 3, pb: 1, mb: 2 }}>
          {editingContractId ? 'Editar Modelo de Exame' : 'Novo Modelo de Exame'}
        </DialogTitle>
        <DialogContent sx={{ pb: 8, px: { xs: 6, sm: 12 }, pt: { xs: 8, sm: 12 }, position: 'relative' }}>
          <DialogContentText mb={2}>
            {editingContractId
              ? 'Edite o modelo de exame existente.'
              : 'Crie um novo modelo de exame para ser utilizado com seus pacientes. Você poderá editar o conteúdo posteriormente.'}
          </DialogContentText>

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Título'
                placeholder='Título do documento'
                name='title'
                value={contractTitle}
                onChange={e => setContractTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <EditorWrapper
                sx={{
                  '& .rdw-editor-wrapper': { border: '1 !important' },
                  '& .rdw-editor-toolbar': {
                    p: '0.35rem 4rem !important',
                    '& .rdw-option-wrapper': { minWidth: '1.25rem !important', borderRadius: '4px !important' },
                    '& .rdw-inline-wrapper, & .rdw-text-align-wrapper': { mb: 0 }
                  },
                  '& .rdw-editor-main': { px: '2.25rem !important' }
                }}
              >
                <ReactDraftWysiwyg
                  editorState={messageValue}
                  onEditorStateChange={setMessageValue}
                  toolbar={{
                    options: ['inline', 'textAlign', 'list', 'colorPicker', 'emoji', 'history'],
                    inline: { inDropdown: false, options: ['bold', 'italic', 'underline', 'strikethrough'] }
                  }}
                />
              </EditorWrapper>
            </Grid>

            {/* <Grid item xs={12}>
              <Box
                sx={{
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: '4px',
                  p: 2,
                  mt: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }}
              >
                <Button
                  fullWidth
                  variant='outlined'
                  onClick={handleAddSelectionText}
                  sx={{ justifyContent: 'flex-start', mb: 2 }}
                  startIcon={<Add />}
                >
                  Adicionar Texto de Seleção
                </Button>

                <TextField
                  fullWidth
                  label='Digite o texto de seleção'
                  value={newSelectionText}
                  onChange={e => setNewSelectionText(e.target.value)}
                  size='small'
                  sx={{ mb: 2 }}
                />
                <Box>
                  {selectionTextList.map((text, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FormControlLabel control={<Checkbox checked={false} disabled />} label={text} />
                      <IconButton size='small' onClick={() => handleRemoveSelectionText(text)}>
                        <Delete fontSize='small' color='error' />
                      </IconButton>
                    </Box>
                  ))}
                  {selectionTextList.length === 0 && (
                    <Typography variant='body2' color='text.secondary'>
                      Nenhum texto de seleção adicionado.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid> */}

            <Grid item xs={12} sx={{ mt: 4 }}>
              <Typography variant='body2' color='text.secondary' textAlign={'center'}>
                Insira as variáveis na seu documento para puxar automático: <br />
                %paciente%, %telefone%, %email%, %rg%, %cpf%, %clinica-cnpj%, %endereço%, %nome-clinica%, %profissional%
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={onSubmit} variant='outlined' color='primary'>
            {editingContractId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteModalOpen}
        onClose={cancelDelete}
        aria-labelledby='confirm-delete-title'
        aria-describedby='confirm-delete-description'
        maxWidth='xs'
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: '500px' } }}
      >
        <DialogTitle
          id='confirm-delete-title'
          sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0ff', padding: '12px 24px' }}
        >
          Atenção!
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id='confirm-delete-description'
            sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold', paddingTop: '18px ' }}
          >
            Tem certeza de que deseja excluir este contrato?
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 2 }}>
            Essa ação não poderá ser desfeita!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color='error' variant='outlined'>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color='primary' variant='outlined'>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TabExams
