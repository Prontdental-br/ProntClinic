import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import api from 'src/@core/components/api-client'
import { useRouter } from 'next/navigation'
import { Chip, Grid, Modal, Box } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import FallbackSpinner from 'src/@core/components/spinner'
import { DailyReport } from 'src/pages/home'
import moment from 'moment'
import Typewriter from 'src/components/Typewriter'

interface Props {
  generatingReport: boolean
  reportData: DailyReport | null
  generateReport: () => void
  selectedReportType: string
}

interface ListItem {
  key: number
  text: string
  amount: number
  onClick?: () => void
}

interface ListProps {
  data: ListItem[]
}

const List: React.FC<ListProps> = ({ data }) => {
  return (
    <div>
      {data.map(item => (
        <React.Fragment key={item.key}>
          <Typography sx={{ color: 'green' }}>{item.amount}</Typography>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingRight: 2
            }}
          >
            <Typography
              sx={{
                marginTop: 2
              }}
            >
              {item.text}
            </Typography>
            <div>
              <Button size='medium' variant='contained' color='primary' onClick={item.onClick}>
                VER
              </Button>
            </div>
          </div>

          <hr />
        </React.Fragment>
      ))}
    </div>
  )
}

const handleClick = (phoneNumber: string) => {
  window.open(`https://wa.me/${phoneNumber}`, '_blank')
}

const ModalBirhday = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [rows, setRows] = useState([])

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'data', headerName: 'Data', width: 120 },
    { field: 'paciente', headerName: 'Paciente', width: 150 },
    {
      field: 'fone',
      headerName: 'Contato',
      width: 150,
      flex: 0.25,
      minWidth: 100,
      renderCell: ({ row }) => {
        return (
          <Chip
            variant='filled'
            size='small'
            sx={{
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
              cursor: 'pointer'
            }}
            icon={
              <Icon
                icon='mdi:whatsapp'
                style={{
                  color: '#FFFFFF',
                  marginRight: '0.25rem',
                  width: '1.5rem',
                  height: '1.5rem'
                }}
              />
            }
            label={row.fone}
            onClick={() => handleClick(row.fone)}
          />
        )
      }
    }
  ]

  const fetchData = async () => {
    const { data } = await api.get('/patients/count')
    console.log(data.birthdayPeople)
    setRows(
      data.birthdayPeople.map((d: any, i: number) =>
        Object.assign({
          id: i,
          data: dayjs(d.created_at).format('YYYY-MM-DD'),
          paciente: d.name,
          valor: d.total,
          fone: '55' + d.cellPhone.replaceAll(' ', '')
        })
      )
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4
        }}
      >
        <Typography variant='h6' component='div' gutterBottom>
          Aniversariantes
        </Typography>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnMenu
            localeText={{
              ...ptBR.components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: 'Nenhum registro encontrado',
              columnMenuManageColumns: 'Gerenciar colunas'
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant='contained' onClick={onClose}>
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

const AnalyticsTotalPatients = ({ generatingReport, reportData, generateReport, selectedReportType }: Props) => {
  const router = useRouter()
  const [jsonData, setJsonData] = useState<any>([])
  const [openModal, setOpenModal] = useState(false)
  const [typingIndex, setTypingIndex] = useState(0)

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const increaseTypingIndex = () => {
    setTypingIndex(prevState => prevState + 1)
  }

  const fetchData = async () => {
    const { data } = await api.get('/patients/count')
    const d = [
      {
        key: 1,
        text: 'Total de pacientes cadastrados',
        amount: data.countPatient,
        onClick: () => router.push('/patient/list/')
      },
      { key: 2, text: 'Aniversariantes', amount: data.birthday, onClick: () => setOpenModal(true) }
    ]
    setJsonData(d)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <ModalBirhday open={openModal} onClose={handleCloseModal} />

      {/* Card configurado para ser o container do scroll e do botão fixo */}
      <Card
        sx={{
          height: 400, // Altura fixa do Card
          display: 'flex',
          flexDirection: 'column',
          position: 'relative' // Necessário para o posicionamento sticky/absolute funcionar
        }}
      >
        <CardHeader
          title='Pacientes'
          subheader='Total de pacientes por status'
          subheaderTypographyProps={{ sx: { lineHeight: 1.429 } }}
          titleTypographyProps={{ sx: { letterSpacing: '0.15px' } }}
        />

        {/* Container para o conteúdo do relatório, que deve rolar */}
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1, // Ocupa todo o espaço vertical disponível
            p: 2,
            pt: 0
          }}
        >
          <List data={jsonData} />
          <Grid>
            {generatingReport && reportData !== null && (
              <>
                <FallbackSpinner sx={{ height: '20em' }} />
                <Typography sx={{ textAlign: 'center' }}>Gerando resumo...</Typography>
              </>
            )}
            {generatingReport === false && reportData !== null && (
              <Grid>
                {typingIndex >= 0 && (
                  <Typography variant='h5'>
                    <Typewriter callback={increaseTypingIndex} delay={20} text={`${selectedReportType}`} />
                  </Typography>
                )}
                <Grid>
                  {typingIndex >= 1 && (
                    <Typography variant='h6'>
                      <Typewriter text='Fluxo de Caixa' delay={20} callback={increaseTypingIndex} />
                    </Typography>
                  )}
                  <ul>
                    {typingIndex >= 2 && (
                      <li>
                        <Typewriter
                          text={`Total de Entradas: ${reportData.transaction.totalEntries.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                          delay={20}
                          callback={increaseTypingIndex}
                        />
                      </li>
                    )}
                    {typingIndex >= 3 && (
                      <li>
                        <Typewriter
                          text={`Total de Saídas: ${reportData.transaction.totalExpenses.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                          delay={20}
                          callback={increaseTypingIndex}
                        />
                      </li>
                    )}
                    {typingIndex >= 4 && (
                      <li>
                        <Typewriter
                          text={`Saldo Parcial: ${reportData.transaction.expectedBalance.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                          delay={20}
                          callback={increaseTypingIndex}
                        />
                      </li>
                    )}
                    {typingIndex >= 5 && (
                      <li>
                        <Typewriter
                          text={`Saldo Previsto: ${reportData.transaction.expectedBalance.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                          delay={20}
                          callback={increaseTypingIndex}
                        />
                      </li>
                    )}
                  </ul>
                </Grid>
                <Grid>
                  {typingIndex >= 6 && (
                    <Typography variant='h6'>
                      <Typewriter callback={increaseTypingIndex} delay={20} text={`Resumo das Entradas`} />
                    </Typography>
                  )}
                  <ul>
                    {typingIndex >= 7 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Pix: ${reportData.transaction.pix.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 8 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Cartão de Crédito: ${reportData.transaction.creditCard.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 9 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Cartão de Débito: ${reportData.transaction.debitCard.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 10 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Boleto: ${reportData.transaction.boleto.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 11 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Dinheiro: ${reportData.transaction.money.toLocaleString('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                          })}`}
                        />
                      </li>
                    )}
                  </ul>
                </Grid>
                <Grid>
                  {typingIndex >= 12 && (
                    <Typography variant='h6'>
                      <Typewriter callback={increaseTypingIndex} delay={20} text={`Agenda`} />
                    </Typography>
                  )}
                  <ul>
                    {typingIndex >= 13 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Total de Faltas: ${reportData.schedule.appointmentMissed}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 14 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Total de Agendados: ${reportData.schedule.appointmentScheduled}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 15 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Total de Atendidos: ${reportData.schedule.appointmentAttended}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 16 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Total de Confirmados: ${reportData.schedule.appointmentConfirmed}`}
                        />
                      </li>
                    )}
                    {typingIndex >= 17 && (
                      <li>
                        <Typewriter
                          callback={increaseTypingIndex}
                          delay={20}
                          text={`Total de Desmarcados: ${reportData.schedule.appointmentCanceled}`}
                        />
                      </li>
                    )}
                  </ul>
                </Grid>
                <Grid>
                  {typingIndex >= 18 && (
                    <Typography variant='h6'>
                      <Typewriter callback={increaseTypingIndex} delay={20} text={`Orçamentos`} />
                    </Typography>
                  )}
                  <ul>
                    {typingIndex >= 19 && (
                      <li>
                        <Typewriter callback={increaseTypingIndex} delay={20} text={`Aprovados`} />
                        <ul>
                          {typingIndex >= 20 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Total: ${reportData.budgets.approved}`}
                              />
                            </li>
                          )}
                          {typingIndex >= 21 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Total: ${reportData.budgets.approvedValue.toLocaleString('pt-br', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}`}
                              />
                            </li>
                          )}
                          {typingIndex >= 22 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Ticket Médio: ${reportData.budgets.approvedMediumValue.toLocaleString('pt-br', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}`}
                              />
                            </li>
                          )}
                        </ul>
                      </li>
                    )}
                    {typingIndex >= 23 && (
                      <li>
                        <Typewriter callback={increaseTypingIndex} delay={20} text={`Em Aberto`} />
                        <ul>
                          {typingIndex >= 24 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Total: ${reportData.budgets.open}`}
                              />
                            </li>
                          )}
                          {typingIndex >= 25 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Total: ${reportData.budgets.openValue.toLocaleString('pt-br', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}`}
                              />
                            </li>
                          )}
                          {typingIndex >= 26 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Ticket Médio: ${reportData.budgets.openMediumValue.toLocaleString('pt-br', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}`}
                              />
                            </li>
                          )}
                        </ul>
                      </li>
                    )}
                    {typingIndex >= 27 && (
                      <li>
                        <Typewriter callback={increaseTypingIndex} delay={20} text={`Rejeitados`} />
                        <ul>
                          {typingIndex >= 28 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Total: ${reportData.budgets.rejected}`}
                              />
                            </li>
                          )}
                          {typingIndex >= 29 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Total: ${reportData.budgets.rejectedValue.toLocaleString('pt-br', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}`}
                              />
                            </li>
                          )}
                          {typingIndex >= 30 && (
                            <li>
                              <Typewriter
                                callback={increaseTypingIndex}
                                delay={20}
                                text={`Ticket Médio: ${reportData.budgets.rejectedMediumValue.toLocaleString('pt-br', {
                                  style: 'currency',
                                  currency: 'BRL'
                                })}`}
                              />
                            </li>
                          )}
                        </ul>
                      </li>
                    )}
                  </ul>
                  {typingIndex >= 31 && <Button onClick={generateReport}>Baixar relatório</Button>}
                </Grid>
              </Grid>
            )}
          </Grid>
        </Box>
        {typingIndex >= 31 && (
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              width: '100%',
              p: 2,
              borderTop: '1px solid #eee',
              bgcolor: 'background.paper',
              zIndex: 10,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button
              onClick={generateReport}
              variant='contained'
              sx={{
                width: 200,
                backgroundColor: '#911BC4',
                '&:hover': {
                  backgroundColor: '#7a14a7'
                },
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 1
              }}
            >
              Gerar Relatório
            </Button>
          </Box>
        )}
      </Card>
    </>
  )
}

export default AnalyticsTotalPatients
