import React from 'react'
import { Grid, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

interface ImageGridProps {
  images: string[]
  onDelete: (img: string) => void
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onDelete }) => (
  <Grid container spacing={2} style={{ marginTop: '20px' }}>
    {images.map((img, index) => (
      <Grid item key={index} xs={4}>
        <div style={{ position: 'relative' }}>
          <img src={img} alt={`Uploaded ${index}`} style={{ width: 290, height: 230 }} />
          <IconButton
            style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(252, 2, 2, 0.7)' }}
            onClick={() => onDelete(img)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </Grid>
    ))}
  </Grid>
)

export default ImageGrid
