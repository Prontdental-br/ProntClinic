// ** MUI Imports
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'

// ** Types
import { PricingPlanProps } from './types'
import api from '../api-client'
import { useEffect, useState } from 'react'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material'
import YouTube from 'react-youtube'
import toast from 'react-hot-toast'

// ** Styled Component for the wrapper of whole component
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6),
  paddingTop: theme.spacing(14.75),
  borderRadius: theme.shape.borderRadius
}))

// ** Styled Component for the wrapper of all the features of a plan
const BoxFeature = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(5),
  '& > :not(:first-of-type)': {
    marginTop: theme.spacing(4)
  }
}))

interface ModalProps {
  open: boolean
  onClose: () => void
  imgBanner: string | undefined
  whatsAppNumber: string | undefined
  whatsAppMessage: string
  idVideo: string | undefined
}

const BannerModal: React.FC<ModalProps> = ({ open, onClose, imgBanner, whatsAppNumber, whatsAppMessage, idVideo }) => {
  const handleWhatsAppRedirect = () => {
    const encodedMessage = encodeURIComponent(whatsAppMessage)
    const url = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`

    window.open(url, '_blank')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <Typography variant='h5' sx={{ color: 'primary.main', textAlign: 'center', p: '1rem' }}>
        Assista o video
      </Typography>
      <DialogContent>
        {/* {imgBanner && ( 
          <Box textAlign="center">
            <img src={imgBanner} alt="Banner promocionais" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </Box>
        )} */}

        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <YouTube videoId={idVideo} />
        </Grid>
      </DialogContent>
      {/* <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleWhatsAppRedirect}
          fullWidth
        >
          Consulte um vendedor
        </Button>
      </DialogActions> */}
    </Dialog>
  )
}

const PlanDetails = (props: PricingPlanProps) => {
  // ** Props
  const { plan, data } = props

  const [showDetailsBanner, setShowDetailsBanner] = useState(false)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleOpenDetailsBanner = () => setShowDetailsBanner(true)
  const handleCloseDetailsBanner = () => setShowDetailsBanner(false)

  const changePlan = async () => {
    try {
      let planType = plan
      if (planType === 'annually') {
        planType = 'yearly'
      }

      console.log('Enviando para /asaas-subscription:', { type: planType, planName: data?.categoryLabelPrice })

      const res = await api.put('/asaas-subscription', {
        type: planType,
        planName: data?.categoryLabelPrice
      })

      if (res.data.paymentUrl) {
        window.localStorage.removeItem('showPaymentDialog')
        window.open(res.data.paymentUrl, '_blank')
      }

      const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')

      const updatedPlanType = data?.categoryLabelPrice?.toLowerCase().includes('prime') ? 'P' : 'E'

      const updatedUserData = {
        ...userData,
        planType: updatedPlanType
      }

      window.localStorage.setItem('userData', JSON.stringify(updatedUserData))

      toast.success('Plano alterado com sucesso!')

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      alert('Erro ao atualizar o plano')
    }
  }

  const renderFeatures = () => {
    return data?.planBenefits.map((item: string, index: number) => (
      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
        <Box component='span' sx={{ display: 'inline-flex', color: 'text.secondary', mr: 2 }}>
          <Icon icon='mdi:check-circle-outline' fontSize='1rem' color='green' />
        </Box>
        <Typography variant='body2'>{item}</Typography>
      </Box>
    ))
  }

  return (
    <BoxWrapper
      sx={{
        border: theme =>
          !data?.popularPlan
            ? `1px solid ${theme.palette.divider}`
            : `1px solid ${hexToRGBA(theme.palette.primary.main, 0.5)}`
      }}
    >
      {/* {data?.popularPlan ? (
        <CustomChip
          skin='light'
          label='Popular'
          color='primary'
          sx={{
            top: 12,
            right: 12,
            height: 24,
            position: 'absolute',
            '& .MuiChip-label': {
              px: 10.75,
              fontWeight: 600,
              fontSize: '0.75rem'
            }
          }}
        />
      ) : null} */}

      {data?.customLabel ? (
        <CustomChip
          skin='light'
          label={data.customLabelText}
          color='primary'
          sx={{
            top: 12,
            right: 12,
            height: 24,
            position: 'absolute',
            '& .MuiChip-label': {
              px: 10.75,
              fontWeight: 600,
              fontSize: '0.75rem'
            }
          }}
        />
      ) : null}

      {data?.imgSrc && (
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center' }}>
          <img
            width={data?.imgWidth}
            src={`${data?.imgSrc}`}
            height={data?.imgHeight}
            style={{ objectFit: 'contain' }}
            alt={`${data?.title.toLowerCase().replace(' ', '-')}-plan-img`}
          />
        </Box>
      )}

      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center' }}>
        <Typography variant='h5' sx={{ mb: 1.5 }}>
          {data?.categoryLabelPrice}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='h5' sx={{ mb: 1.5 }}>
          {data?.title}
        </Typography>
        <Typography variant='body2'>{data?.subtitle}</Typography>

        {data?.customView ? (
          <>
            {data?.titleInPrice ? (
              <Box sx={{ my: 7, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant='h5' sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.5 }}>
                    {data.titleInPrice}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ my: 7, position: 'relative' }} />
            )}
          </>
        ) : (
          <Box sx={{ my: 7, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography variant='h3' sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.17 }}>
                {plan === 'monthly' ? data?.monthlyPrice : data?.yearlyPlan.perMonth}
              </Typography>
              <Typography variant='body2' sx={{ mb: 1.6, fontWeight: 600, alignSelf: 'flex-end' }}>
                /mês
              </Typography>
            </Box>

            {data?.customLabelDiscount && plan === 'monthly' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant='body2'>{data?.customLabelDesountText}</Typography>
              </Box>
            ) : null}

            {plan !== 'monthly' && data?.monthlyPrice !== '0' && data?.customLabelDiscount === false ? (
              <>
                <Typography
                  variant='body2'
                  sx={{ left: '50%', position: 'absolute', fontWeight: 600, transform: 'translateX(-50%)' }}
                >{`${data?.yearlyPlan.totalAnnual}/ano`}</Typography>
              </>
            ) : null}
          </Box>
        )}
      </Box>
      <BoxFeature>{renderFeatures()}</BoxFeature>
      {data?.active ? (
        <>
          <Button
            fullWidth
            onClick={data.isModalOnClick ? handleOpenDetailsBanner : handleOpen}
            color={data?.currentPlan ? 'success' : 'primary'}
            variant={data?.popularPlan ? 'contained' : 'outlined'}
          >
            {data?.titleButton}
          </Button>
          {data.secondButton && (
            <Button fullWidth sx={{ mt: 6 }} color='primary' variant='contained'>
              {data?.titleSecondButton}
            </Button>
          )}
        </>
      ) : (
        <></>

        // <Button
        //   fullWidth
        //   disabled
        //   color={data?.currentPlan ? 'success' : 'primary'}
        //   variant={data?.popularPlan ? 'contained' : 'outlined'}
        // >
        //   {data?.titleButton}
        // </Button>
      )}

      <BannerModal
        open={showDetailsBanner}
        onClose={handleCloseDetailsBanner}
        imgBanner={data?.imgBanner}
        idVideo={data?.idVideo}
        whatsAppNumber={data?.whatsAppNumber}
        whatsAppMessage='Pacotes Clairis: aproveite e ofereça o desconto especial para este cliente.'
      />

      <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
        <DialogTitle>Confirmar troca de plano</DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Tem certeza de que deseja mudar para o plano <strong>{data?.categoryLabelPrice}</strong>?
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            Ao confirmar, as permissões e recursos do sistema serão ajustados automaticamente conforme o novo plano.
          </Typography>

          {data?.categoryLabelPrice?.toLowerCase().includes('essencial') && (
            <Typography variant='body2' color='error' sx={{ mt: 2 }}>
              ⚠️ Atenção: Ao trocar para o plano Essencial, todas funcionalidades exclusivas do plano Prime serão
              perdidas!
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} variant='outlined' color='error'>
            Cancelar
          </Button>
          <Button onClick={changePlan} variant='outlined' color='primary' disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar troca'}
          </Button>
        </DialogActions>
      </Dialog>
    </BoxWrapper>
  )
}

export default PlanDetails
