import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Input,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CameraDialog from '../CameraDialog'
import {
  ChonkyActions,
  FileActionHandler,
  FileBrowser,
  FullFileBrowser,
  defineFileAction,
  setChonkyDefaults,
  FileList,
  FileToolbar,
  FileNavbar,
  ChonkyIconName
} from 'chonky'
import { ChonkyIconFA } from 'chonky-icon-fontawesome'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { ImageComparisonDialog } from '../ImageComparisonDialog'
import api from 'src/@core/components/api-client'
import patient from 'src/store/apps/patient'
import { EnlargeImageDialog } from '../EnlargeImage'
import CustomNavbar from './CustomNavbar'

const iconsCh: any = { iconComponent: ChonkyIconFA }
setChonkyDefaults(iconsCh)

interface AddImagesProps {
  onUpload: (images: string[]) => void
  onCompare: () => void
  patientId?: string
}

export default function AddImages({ onUpload, onCompare, patientId }: AddImagesProps) {
  const IMAGE = useRef<HTMLImageElement>(null)
  const [open, setOpen] = useState(false)
  const [openFolderModal, setOpenFolderModal] = useState(false)
  const [imageIds, setImageIds] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [imageSel, setImageSel] = useState<string[]>([])
  const [imageNames, setImageNames] = useState<string[]>([])
  const [newFolderName, setNewFolderName] = useState<string>('')
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)
  const [currentFolder, setCurrentFolder] = useState('0')
  const [files, setFiles] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectFile, setSelectFile] = useState(null)
  const [selectFileUrl, setSelectFileUrl] = useState(null)
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false)
  const [enlargeImageDialogOpen, setEnlargeImageDialogOpen] = useState(false)
  const [patient, setPatient] = useState()
  const [data, setData] = useState([
    {
      id: '0',
      name: 'Root',
      isDir: true,
      files: []
    }
  ])

  const userData = JSON.parse(localStorage?.getItem('userData') || '{}')

  /*const [data, setData] = useState([
    {
      id: "0",
      name: "Root",
      isDir: true,
      files: [
        {
          id: "1",
          name: "Administration",
          isDir: true,
          files: [
            {
              id: "11",
              name: "Performance",
              isDir: true,
              files: [
                {
                  id: 'mcdf',
                  name: 'chonky-sphere-v2.png',
                  thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
                },
                {
                  id: "111",
                  name: "Quaterly Reports",
                  isDir: true,
                  files: [
                    {
                      id: "1111",
                      name: "2020-qty-report1.pdf"
                    },
                    {
                      id: "1112",
                      name: "2020-qty-report2.pdf"
                    }
                  ]
                }
              ]
            }
          ]
        },
        { id: "2", name: "Closure", isDir: true },
        { id: "3", name: "Formation", isDir: true },
        {
          id: 'mcd',
          name: 'chonky-sphere-v2.png',
          thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
        },
        {
          id: 'mcddddf',
          name: 'chonky-sphere-v2.png',
          thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
        },
      ]
    },
  ]);
  */

  const [folderChain, setFolderChain] = useState(null)

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/file?patientId=${patientId}`)

      if (data) {
        setData(data.data)
        setPatient(data.patient)
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // eslint-disable-next-line @typescript-eslint/ban-types
  const folderSearch: Function = (data1: any, folderChainTemp: any, currentFolder: any) => {
    console.log('search', data1, folderChainTemp, currentFolder)

    let filesTemp: any = []
    for (let i = 0; i < data1.length; i++) {
      const folder = data1[i]
      if (!folder) continue
      folderChainTemp = [...folderChainTemp, { id: folder.id, name: folder.name }]
      if (folder.id === currentFolder) {
        console.log('inside')
        if (folder?.files) {
          folder.files.forEach((file: any) => {
            if (file)
              filesTemp = [
                ...filesTemp,
                { id: file.id, name: file.name, isDir: file.isDir ? true : false, thumbnailUrl: file.thumbnailUrl }
              ]
          })
        }
        console.log([true, filesTemp, folderChainTemp])

        return [true, filesTemp, folderChainTemp]
      } else if (folder?.files) {
        const returnValues = folderSearch(folder.files, folderChainTemp, currentFolder)
        console.log('found', returnValues)
        if (returnValues[0]) {
          return returnValues
        }
      }
      folderChainTemp = folderChainTemp.slice(0, folderChainTemp.length - 1)
    }

    return [0, null, null]
  }

  const saveData = async (newData: any) => {
    try {
      await api.post('/file', { data: newData, patientId })
    } catch (e) {
      console.error('Erro ao salvar arquivos:', e)
    }
  }

  // Atualizamos apenas o controle de pasta e lista de arquivos
  useEffect(() => {
    let folderChainTemp: any = []
    let filesTemp: any = []

    const [found, filesTemp1, folderChainTemp1] = folderSearch(data, folderChainTemp, currentFolder)
    if (found) {
      filesTemp = filesTemp1
      folderChainTemp = folderChainTemp1
    }

    setFolderChain(folderChainTemp)
    setFiles(filesTemp)
  }, [currentFolder, data])
  // eslint-disable-next-line @typescript-eslint/ban-types
  const findFile: Function = (data: any, fileId: any) => {
    console.log('filesearch', data)
    for (let i = 0; i < data.length; i++) {
      const folder = data[i]
      if (folder?.id === fileId) {
        return folder
      } else if (folder?.files) {
        const returnValues = findFile(folder.files, fileId)
        if (returnValues) {
          return returnValues
        }
      }
    }

    return null
  }

  const findFileAddress = (dat: any, fileId: string) => {
    let currFileAddress = ''

    for (let i = 0; i < dat.length; i++) {
      const folder = dat[i]
      if (folder?.id === fileId) {
        return `[${i}]`
      } else if (folder?.files) {
        const returnValues = `[${i}].files` + findFileAddress(folder.files, fileId)
        if (returnValues) {
          currFileAddress = returnValues
        }
      }
    }

    return currFileAddress
  }

  const moveFile = (dat: any, destFolder: any, fileId: string) => {
    console.log('filesearch', data)

    const destAddress = findFileAddress(data, destFolder)
    const newData = [...data]
    const currFileAddress = findFileAddress(data, fileId)
    const filesDest = _.get(newData, destAddress + '.files') || []
    const fileToMove = _.get(newData, currFileAddress)
    _.set(newData, destAddress + '.files', [...filesDest, fileToMove])
    _.unset(newData, currFileAddress)
    setData(newData)
    saveData(newData)
    console.log(filesDest, fileToMove)

    return destAddress
  }

  const deleteFile = () => {
    if (selectFile && selectFile !== null) {
      const newData = [...data]
      const currFileAddress = findFileAddress(data, selectFile)
      _.unset(newData, currFileAddress)
      setData(newData)
      setSelectFile(null)
      setSelectFileUrl(null)
      saveData(newData)
    }
  }

  const downloadFile = () => {
    console.log(selectFileUrl)
    if (selectFile) {
      window.open(selectFileUrl || '#', '_blank')!.focus()
    }
  }

  const newFolder = () => {
    const newFol = { id: uuidv4(), name: newFolderName, isDir: true }
    const newData = [...data]
    const currFileAddress = findFileAddress(data, currentFolder)
    const filesCurr = _.get(newData, currFileAddress + '.files') || []
    _.set(newData, currFileAddress + '.files', [...filesCurr, newFol])
    setNewFolderName('')
    setOpenFolderModal(false)
    setData(newData)
  }

  const handleAction = (dat: any, setCurrentFolder: any) => {
    console.log('handle', dat)

    const { payload, state } = dat
    if (dat.id === ChonkyActions.OpenFiles.id) {
      const file = findFile(data, dat.payload.files[0].id)
      if (file?.isDir) {
        console.log('fileid', file.id)
        setCurrentFolder(file.id)
      }
    }

    if (dat.id === ChonkyActions.MoveFiles.id) {
      const { destination } = payload
      moveFile(data, destination.id, payload.files[0].id)
    }

    if (dat.id === ChonkyActions.MouseClickFile.id) {
      const { file } = payload
      console.log(payload)
      setSelectFile(file?.id)
      setSelectFileUrl(file?.thumbnailUrl)
    }

    if (dat.id === ChonkyActions.ChangeSelection.id) {
      const { selectedFiles } = state
      console.log(selectedFiles)
      if (selectedFiles) setImageIds(selectedFiles.filter((s: any) => !s.isDir).map((s: any) => s.id))
      setImageSel(selectedFiles.filter((s: any) => !s.isDir).map((s: any) => s.thumbnailUrl))
    }
  }

  const handleActionWrapper = (data: any) => {
    handleAction(data, setCurrentFolder)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleUpload = async () => {
    //onUpload(images)
    const newData = [...data]

    for (let i = 0; i < imageNames.length; i++) {
      console.log('IMAGENS---', images[i])
      const formData = new FormData()
      formData.append('file', images[i])

      const resUploadImage = await api.post(`/upload/${userData?.accountId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const { url } = resUploadImage.data
      console.log(url)
      setOpen(false)
      console.log(imageNames)

      const newFile = { id: uuidv4(), name: imageNames[i], thumbnailUrl: url }
      const currFileAddress = findFileAddress(data, currentFolder)
      const filesCurr = _.get(newData, currFileAddress + '.files') || []
      _.set(newData, currFileAddress + '.files', [...filesCurr, newFile])
    }

    setImageNames([])
    setImages([])
    setData(newData)
    saveData(newData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList) {
      let newFiles = Array.from(fileList)

      if (images.length + newFiles.length > 10) {
        newFiles = newFiles.slice(0, 10 - images.length)
      }

      setImageNames((prev: any) => [...prev, ...newFiles.map((f: any) => f.name)])
      setImages((prev: any) => [...prev, ...newFiles])
    }
  }

  const handleDeleteImage = (i: string) => {
    setImages(prev => prev.filter(img => img !== i))
  }

  const handleCapture = (imgSrc: string) => {
    setImages(prev => [...prev, imgSrc])
    setImageNames([imgSrc])
    setCameraDialogOpen(false)
  }

  const renameFiles = defineFileAction({
    id: 'rename_files',
    button: {
      name: 'Download',
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.download
    }
  })

  const fileActions = useMemo(() => [ChonkyActions.CreateFolder, ChonkyActions.DeleteFiles], [])

  const myFileActions = [fileActions, ChonkyActions.UploadFiles, ChonkyActions.DownloadFiles]

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', flexDirection: 'column' }}>
        <Card sx={{ boxShadow: 'none', border: theme => `2px solid ${theme.palette.primary.main}` }}>
          <CardContent sx={{ display: 'flex', flexWrap: 'wrap', pb: '0 !important', justifyContent: 'space-between' }}>
            <Button onClick={handleOpen} sx={{ color: theme => `${theme.palette.primary.main} !important` }}>
              Adicionar Imagem
            </Button>
            <Button
              onClick={() => setEnlargeImageDialogOpen(true)}
              disabled={imageSel.length > 8}
              sx={{
                color: theme =>
                  `${
                    imageSel.length > 8 || imageSel.length < 1
                      ? theme.palette.action.disabled
                      : theme.palette.primary.main
                  } !important`
              }}
            >
              Ampliar
            </Button>
            <Button
              onClick={downloadFile}
              disabled={imageSel.length !== 1}
              sx={{
                color: theme =>
                  `${imageSel.length !== 1 ? theme.palette.action.disabled : theme.palette.primary.main} !important`
              }}
            >
              Baixar Imagem
            </Button>
            <Button onClick={() => setComparisonDialogOpen(true)} disabled={imageSel.length < 2 || imageSel.length > 8}>
              Comparar
            </Button>
            <Button
              onClick={() => setOpenConfirm(true)}
              sx={{ color: theme => `${theme.palette.primary.main} !important` }}
            >
              Excluir
            </Button>
            <Button
              onClick={() => setOpenFolderModal(true)}
              sx={{ color: theme => `${theme.palette.primary.main} !important` }}
            >
              Nova pasta
            </Button>
          </CardContent>
        </Card>

        <ImageComparisonDialog
          cellPhone={patient?.['cellPhone'] || ''}
          patientId={patientId || ''}
          open={comparisonDialogOpen}
          images={imageSel}
          onClose={() => setComparisonDialogOpen(false)}
        />

        <EnlargeImageDialog
          cellPhone={patient?.['cellPhone'] || ''}
          patientId={patientId || ''}
          open={enlargeImageDialogOpen}
          images={imageSel}
          onClose={() => setEnlargeImageDialogOpen(false)}
        />

        <Dialog open={openFolderModal} onClose={handleClose} fullWidth maxWidth='md'>
          <DialogTitle>Nova pasta</DialogTitle>

          <DialogContent>
            <Input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder='Nome da pasta'
            ></Input>
            <Button onClick={newFolder} sx={{ color: theme => `${theme.palette.primary.main} !important` }}>
              Adicionar pasta
            </Button>
            <Button
              onClick={() => setOpenFolderModal(false)}
              sx={{ color: theme => `${theme.palette.primary.main} !important` }}
            >
              Cancelar
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={open} onClose={handleClose} aria-labelledby='dialog-upload' fullWidth maxWidth='md'>
          <DialogTitle id='dialog-upload-title'>Upload de Documentos</DialogTitle>
          <DialogContent>
            <Button component='label' fullWidth sx={{ color: theme => `${theme.palette.primary.main} !important` }}>
              Carregar do computador
              <input type='file' hidden multiple onChange={handleFileChange} />
            </Button>
            <Button
              onClick={() => setCameraDialogOpen(true)}
              fullWidth
              sx={{ color: theme => `${theme.palette.primary.main} !important` }}
            >
              Câmera
            </Button>

            {/* Renderização das imagens carregadas */}
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
              {images.map((img: any, index) => (
                <Grid item key={index} xs={4}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(img) || img}
                      alt={`Uploaded ${index}`}
                      style={{ width: 290, height: 230 }}
                    />
                    <IconButton
                      style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(252, 2, 2, 0.7)' }}
                      onClick={() => handleDeleteImage(img)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              color='primary'
              sx={{ color: theme => `${theme.palette.primary.main} !important` }}
            >
              Fechar
            </Button>
            <Button
              onClick={handleUpload}
              color='primary'
              sx={{ color: theme => `${theme.palette.primary.main} !important` }}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        <CameraDialog open={cameraDialogOpen} onClose={() => setCameraDialogOpen(false)} onCapture={handleCapture} />

        <div style={{ height: 900 }}>
          <FileBrowser
            files={files || []}
            folderChain={folderChain}
            defaultFileViewActionId={ChonkyActions.EnableListView.id}
            onFileAction={handleActionWrapper}
            disableDefaultFileActions={true}
          >
            <CustomNavbar folderChain={folderChain} onNavigate={(id: any) => setCurrentFolder(id)} />
            {/* <FileNavbar /> */}
            <FileToolbar />
            <FileList />
          </FileBrowser>
        </div>
      </div>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              deleteFile()
              setOpenConfirm(false)
            }}
            color='error'
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
