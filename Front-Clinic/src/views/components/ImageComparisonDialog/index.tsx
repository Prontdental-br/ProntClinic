import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogTitle, Grid, IconButton } from '@mui/material'
import Button from '@mui/material/Button';
import { StyledEngineProvider } from '@mui/material/styles';
import { clearNumber } from 'src/@core/utils/format';

interface ImageComparisonDialogProps {
  open: boolean
  images: string[]
  onClose: () => void
  cellPhone: string
  patientId: string
}

export const ImageComparisonDialog: React.FC<ImageComparisonDialogProps> = ({ open, images, patientId, cellPhone, onClose }) => {
  const img1 = images[0];
  const img2 = images[1];

  const imageCount = images.length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
      <DialogTitle>Comparação de Imagens</DialogTitle>
      <DialogContent>
          <Grid
          container
          spacing={2}
          justifyContent={imageCount === 1 ? 'center' : 'flex-start'}
          alignItems="center"
        >
          {images.slice(0, 8).map((img, index) => {
            let gridSize = { xs: 12, sm: 6, md: 6 };
            if (imageCount === 1) {
              gridSize = { xs: 12, sm: 8, md: 6 }; 
            } else if (imageCount >= 3) {
              gridSize = { xs: 12, sm: 6, md: 3 }; 
            }

            const imageStyle = {
              width: '100%',
              maxWidth: (imageCount === 1 || imageCount === 2) ? 800 : '100%',
              height: imageCount <= 2 ? 800 : 300,
              objectFit: 'cover',
              borderRadius: 12
            } as const;

            return (
              <Grid
                item
                key={index}
                {...gridSize}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <img src={img} alt={`Imagem ${index + 1}`} style={imageStyle} />
              </Grid>
            );
          })}
        </Grid>

        

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }}>
          <Button style={{backgroundColor: '#72E128', color: 'white'}} name='emmit'  onClick={()=>window.open(`/images/print/${patientId}?images=${encodeURIComponent(JSON.stringify([img1, img2]))}`)}>
            Imprimir
          </Button>
          <Button onClick={onClose} name='close' style={{backgroundColor: '#FF4D49', color: 'white'}}>
            Fechar
          </Button>
          <Button>
            <IconButton
              size='small'
              href={`https://wa.me/55${clearNumber(cellPhone ? cellPhone : '')}?text=${`Acesse seu comparativo: ${process.env.NEXT_PUBLIC_URL_FRONT}/images/print/${patientId}?images=${encodeURIComponent(JSON.stringify([img1, img2]))}`}`}
              target="_blank">
              <Icon icon='mdi:whatsapp' fontSize={20} />
            </IconButton>
          </Button>

        </Grid>
      </DialogContent>
      
    </Dialog>
  )
}
