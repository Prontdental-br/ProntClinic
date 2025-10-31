/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Component Import
import CardStatisticsVertical from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// import AnalyticsTotalRevenue from 'src/views/dashboards/analytics/AnalyticsTotalRevenue'
import AnalyticsCongratulations from 'src/views/dashboards/AnalyticsCongratulations'
import AnalyticsProjectStatistics from 'src/views/dashboards/AnalyticsProjectStatistics'
import CardBudgetVertical from 'src/@core/components/card-statistics/card-budget-vertical'
import AnalyticsScheduledPatients from 'src/views/dashboards/AnalyticsScheduledPatients'
import AnalyticsTotalPatients from 'src/views/dashboards/AnalyticsTotalPatients'
import AnalyticsReceiptReport from 'src/views/dashboards/AnalyticsReceiptReport'
import AnalyticsBudgetReport from 'src/views/dashboards/AnalyticsBudgetReport'
import AnalyticsBugetOpen from 'src/views/dashboards/AnalyticsBugetOpen'

import { AuthContext } from 'src/context/AuthContext'
import api from 'src/@core/components/api-client'
import moment from 'moment'
import { ModalConfirmRegistration } from 'src/views/components/ModalConfirmRegistration'

interface ScheduleReport {
  appointmentConfirmed: number
  appointmentCanceled: number
  appointmentScheduled: number
  appointmentMissed: number
  appointmentAttended: number
}

interface TransactionsReport {
  totalEntries: number
  totalExpenses: number
  parcialBalance: number
  expectedBalance: number
  pix: number
  creditCard: number
  debitCard: number
  boleto: number
  money: number
}

interface BudgetReport {
  approved: number
  approvedValue: number
  approvedMediumValue: number
  rejected: number
  rejectedValue: number
  rejectedMediumValue: number
  open: number
  openValue: number
  openMediumValue: number
}

export interface DailyReport {
  schedule: ScheduleReport
  transaction: TransactionsReport
  budgets: BudgetReport
}

const AnalyticsDashboard = () => {
  const [budget, setBudget] = useState(0)
  const [services, setServices] = useState(0)
  const [filterDaysPanelService, setFilterDaysPanelService] = useState(0)
  const [filterDaysPanelBudget, setFilterDaysPanelBudget] = useState(0)
  const [reportData, setReportData] = useState<null | DailyReport>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ]
  const [reportsTypes, setReportsTypes] = useState(['Resumo Diário', 'Resumo Mês', 'Resumo Total', ...monthNames])
  const [selectedReportType, setSelectedReportType] = useState(reportsTypes[0])
  const [userData, setUserData] = useState<any>()
  const [openModalConfirmRegistration, setOpenModalConfirmRegistration] = useState<boolean>(false)
  const { user } = useContext(AuthContext)

  const handleReportTypeChange = (value: string) => {
    setSelectedReportType(value)
  }

  const handleDownloadReportFile = async (blobData: any, title: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]))

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${title}.xlsx`)
    document.body.appendChild(link)
    link.click()
    if (link.parentNode) {
      link.parentNode.removeChild(link)
    }
  }

  const handleDownloadReport = async () => {
    let params = {}
    let name = 'resumo-diario'
    if (selectedReportType === 'Resumo Mês') {
      const startDate = moment().startOf('month').startOf('day').toISOString()
      const endDate = moment().endOf('month').endOf('day').toISOString()
      name = 'resumo-mensal'
      params = { startDate, endDate }
    }
    if (selectedReportType === 'Resumo Total') {
      const startDate = moment('2010-03-13').startOf('day').toISOString()
      const endDate = moment().endOf('day').toISOString()
      name = 'resumo-total'
      params = { startDate, endDate }
    }

    if (monthNames.includes(selectedReportType)) {
      const monthIndex = monthNames.indexOf(selectedReportType) // 0 = Janeiro
      const startDate = moment().month(monthIndex).startOf('month').startOf('day').toISOString()
      const endDate = moment().month(monthIndex).endOf('month').endOf('day').toISOString()
      name = `resumo-${selectedReportType.toLowerCase()}`
      params = { startDate, endDate }
    }

    const { data } = await api.get('/reports/generate/download', {
      responseType: 'blob',
      params
    })
    handleDownloadReportFile(data, name)
  }

  const fetchDataServices = async () => {
    const { data } = await api.get(`schedules/services/${filterDaysPanelService}`)
    setServices(data.countServices)
  }

  const fetchData = async () => {
    const { data } = await api.get(`budgets/totalall/${filterDaysPanelBudget}`)

    setBudget(data.total || 0)
  }

  useEffect(() => {
    fetchDataServices()
    fetchData()
  }, [filterDaysPanelService, filterDaysPanelBudget])

  const handleDaysPanelClickService = (days: number) => {
    console.log('days' + days)
    setFilterDaysPanelService(days)
  }

  const generateDailyReport = async () => {
    setGeneratingReport(true)
    let params = {}
    if (selectedReportType === 'Resumo Mês') {
      const startDate = moment().startOf('month').startOf('day').toISOString()
      const endDate = moment().endOf('month').endOf('day').toISOString()
      params = { startDate, endDate }
    }
    if (selectedReportType === 'Resumo Total') {
      const startDate = moment('2010-03-13').startOf('day').toISOString()
      const endDate = moment().endOf('day').toISOString()
      params = { startDate, endDate }
    }

    if (monthNames.includes(selectedReportType)) {
      const monthIndex = monthNames.indexOf(selectedReportType)
      const startDate = moment().month(monthIndex).startOf('month').startOf('day').toISOString()
      const endDate = moment().month(monthIndex).endOf('month').endOf('day').toISOString()
      params = { startDate, endDate }
    }

    const { data } = await api.get(`reports/generate`, { params })
    setReportData(data)
    setTimeout(() => {
      setGeneratingReport(false)
    }, 4000)
  }

  const handleDaysPanelClickBudget = (days: number) => {
    console.log(days)
    setFilterDaysPanelBudget(days)
  }

  useEffect(() => {
    const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
    setUserData(userData)
  }, [])

  const isAdminOrProfessional =
    (userData?.professional && userData?.professional?.isAdmin) ||
    (userData?.professional === null && userData.role === 'admin')
  const isReceptionist = userData?.professional?.specialty === 'recepcionista' // Ajuste o valor de `role` conforme necessário

  return (
    <ApexChartWrapper>
      <Grid container spacing={2} className='match-height'>
        {isAdminOrProfessional ? (
          <>
            <Grid item xs={12} md={9}>
              <AnalyticsCongratulations
                generateReport={generateDailyReport}
                reportsTypes={reportsTypes}
                changeSelectedReportType={handleReportTypeChange}
                selectedReportType={selectedReportType}
              />
            </Grid>
            {(userData?.type === 'O' || userData?.type === 'D') && (
              <Grid item xs={6} md={1.5}>
                <CardBudgetVertical
                  title='ODONTOLOGIA'
                  imgSrc='/images/logos/c_logo.png'
                  src='/budget/odont?patient=new'
                />
              </Grid>
            )}

            {(userData?.type === 'E' || userData?.type === 'D' || userData?.type === 'O') && (
              <Grid item xs={6} md={1.5}>
                <CardBudgetVertical title='ESTÉTICA' imgSrc='/images/logos/c_logo.png' src='/budget/face' />
              </Grid>
            )}
            <Grid item xs={12} md={9}>
              <AnalyticsScheduledPatients />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsTotalPatients
                selectedReportType={selectedReportType}
                generatingReport={generatingReport}
                reportData={reportData}
                generateReport={handleDownloadReport}
              />
            </Grid>

            {userData?.planType !== 'E' && (
              <>
                <Grid container spacing={4} mt={1}>
                  <Grid item xs={12} sm={12} md={7}>
                    <AnalyticsReceiptReport />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <CardStatisticsVertical
                          color='info'
                          stats={services.toString()}
                          trendNumber='+32%'
                          chipText=''
                          title='Total Atendimento'
                          handleDaysPanelClick={handleDaysPanelClickService}
                          icon={<Icon icon='mdi:trending-up' />}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CardStatisticsVertical
                          stats={'R$ ' + budget?.toFixed(2).replace('.', ',')}
                          color='success'
                          trendNumber='+38%'
                          title='Total Recebido'
                          handleDaysPanelClick={handleDaysPanelClickBudget}
                          chipText=''
                          icon={<Icon icon='mdi:currency-usd' />}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <AnalyticsProjectStatistics />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={7}>
                  <AnalyticsBudgetReport />
                </Grid>
                <Grid item xs={12} sm={12} md={5}>
                  <AnalyticsBugetOpen />
                </Grid>
              </>
            )}
          </>
        ) : isReceptionist ? (
          <>
            <Grid item xs={12} md={8}>
              <AnalyticsScheduledPatients />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <AnalyticsTotalPatients
                selectedReportType={selectedReportType}
                generatingReport={generatingReport}
                reportData={reportData}
                generateReport={handleDownloadReport}
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={9}>
              <AnalyticsScheduledPatients />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsTotalPatients
                selectedReportType={selectedReportType}
                generatingReport={generatingReport}
                reportData={reportData}
                generateReport={handleDownloadReport}
              />
            </Grid>
          </>
        )}
      </Grid>
    </ApexChartWrapper>
  )
}

export default AnalyticsDashboard
