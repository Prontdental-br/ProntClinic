import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Box, Button, Checkbox } from '@mui/material'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import AtestadoFormList from '../AtestadoForm/list'

import ReceitaFormList from '../ReceitaForm/list'

import AddDocuments from '../AddDocuments'
import { PacientDocumentsType, PatientDataType } from 'src/types/apps/userTypes'
import { ImageComparisonDialog } from '../ImageComparisonDialog'
import AddImages from '../AddImages'
import AddExam from '../AddExam'
import ScoreList from '../ScoreList/list'

export enum activeFormNames {
  'RE' = 'RECEITA',
  'AT' = 'ATESTADO',
  'AI' = 'IMAGENS',
  'AR' = 'ARQUIVOS',
  'EX' = 'EXAMES',
  'CT' = 'CONSULTA'
}

interface Props {
  documentsData: PacientDocumentsType[]
  patientId: string
  exam_type?: string
  dataPatient: PatientDataType
}

interface activeFormTypes {
  name: activeFormNames
  title: string
}

const CustomUserFiles = ({ documentsData, patientId, exam_type, dataPatient }: Props) => {
  const [activeForm, setActiveForm] = useState<activeFormTypes | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false)

  console.log(documentsData)

  const handleUploadedImages = (images: string[]) => {
    setUploadedImages(prev => [...prev, ...images])
  }

  const toggleImageSelection = (img: string) => {
    setSelectedImages(prev => (prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]))
  }

  const handleCompare = () => {
    setComparisonDialogOpen(true)
  }

  useEffect(()=>{
    if(exam_type){
      setActiveForm({
        name: activeFormNames.EX,
        title: 'Exames de usuário:'
      } as activeFormTypes)
    }
  },[])

  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}');

  const isAdminOrProfessional = !userData?.professional || userData?.professional?.isAdmin;
  const isReceptionist = userData?.professional?.specialty === 'recepcionista'; 

  const renderForm = () => {
    switch (activeForm?.name) {
      case activeFormNames.RE:
        return <ReceitaFormList onBack={() => setActiveForm(null)} data={[]} patientId={patientId} />
      case activeFormNames.AT:
        return <AtestadoFormList onBack={() => setActiveForm(null)} patientId={patientId} />
        case activeFormNames.CT:
          return  <ScoreList onBack={() => setActiveForm(null)} data={[]} patientId={patientId} />
      case activeFormNames.AI:
        return <AddImages onUpload={handleUploadedImages} onCompare={handleCompare} patientId={patientId} />
      case activeFormNames.AR:
        return <AddDocuments onUpload={handleUploadedImages} patientId={patientId} dataPatient={dataPatient} />
      case activeFormNames.EX:
        return <AddExam onUpload={handleUploadedImages} patientId={patientId} exam_type={exam_type} />
      default:
        return null
    }
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Documentos do Usuário' />
            <CardContent>
              <Box marginBottom={2}>
              {!isReceptionist && (
                <Button
                  variant='contained'
                  sx={{ backgroundColor: theme => `${theme.palette.primary.main} !important` }}
                  onClick={() =>
                    setActiveForm({ name: activeFormNames.RE, title: 'Receita(s) para o usuário:' } as activeFormTypes)
                  }
                >
                  Receita
                </Button>
              )}

              {!isReceptionist && (
                <Button
                  variant='contained'
                  sx={{ backgroundColor: theme => `${theme.palette.primary.main} !important` }}
                  onClick={() =>
                    setActiveForm({ name: activeFormNames.AT, title: 'Atestado(s) do usuário:' } as activeFormTypes)
                  }
                  style={{ marginLeft: '10px' }}
                >
                  Atestado
                </Button>
              )}
                <Button
                  variant='contained'
                  sx={{ backgroundColor: theme => `${theme.palette.primary.main} !important` }}
                  onClick={() =>
                    setActiveForm({
                      name: activeFormNames.AI,
                      title: 'Imagens do usuário:'
                    } as activeFormTypes)
                  }
                  style={{ marginLeft: '10px' }}
                >
                  Imagens
                </Button>
                <Button
                  variant='contained'
                  sx={{ backgroundColor: theme => `${theme.palette.primary.main} !important` }}
                  onClick={() =>
                    setActiveForm({
                      name: activeFormNames.AR,
                      title: 'Documentos do usuário:'
                    } as activeFormTypes)
                  }
                  style={{ marginLeft: '10px' }}
                >
                  Contratos
                </Button>

                <Button
                  variant='contained'
                  sx={{ backgroundColor: theme => `${theme.palette.primary.main} !important` }}
                  onClick={() =>
                    setActiveForm({
                      name: activeFormNames.EX,
                      title: 'Exames de usuário:'
                    } as activeFormTypes)
                  }
                  style={{ marginLeft: '10px' }}
                >
                  Exames
                </Button>

                {/* {userData?.planType !== "S" && (
                <Button
                  variant='contained'
                  onClick={() =>
                    setActiveForm({
                      name: activeFormNames.CT,
                      title: 'Consultas Score do paciente:'
                    } as activeFormTypes)
                  }
                  style={{ marginLeft: '10px' }}
                >
                 Score
                </Button>
                )} */}
              </Box>
            </CardContent>
          </Card>
          {activeForm !== null ? (
            <ApexChartWrapper>
              {renderForm()}

              {activeForm.name === activeFormNames.AI ? (
                <>
                  <Grid container spacing={2}>
                    {uploadedImages.map((img, index) => (
                      <Grid item key={index} xs={4}>
                        <div style={{ position: 'relative' }}>
                          <img src={img} alt={`Uploaded ${index}`} style={{ width: 290, height: 230 }} />
                          <Checkbox
                            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(255, 220, 20, 0.7)' }}
                            checked={selectedImages.includes(img)}
                            onChange={() => toggleImageSelection(img)}
                          />
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : null}
            </ApexChartWrapper>
          ) : null}
        </Grid>
      </Grid>
    </>
  )
}

export default CustomUserFiles
