import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Theme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { setShowReceipt } from 'src/store/apps/odontogram'
import { AppDispatch, RootState } from 'src/store'
import { forwardRef, Ref, ReactElement } from 'react'
import Fade, { FadeProps } from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'

const Transition = forwardRef(function Transition(
    props: FadeProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
  ) {
    return <Fade ref={ref} {...props} />
  })

type Props = {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
}

function DialogReceipt({children} : Props){
    const dispatch = useDispatch<AppDispatch>()
    const store = useSelector((state: RootState) => state.odontogram)

    return(
        <Dialog
        fullWidth
        open={store.showReceipt}
        maxWidth='md'
        scroll='body'
        onClose={() => dispatch(setShowReceipt(false))}
        TransitionComponent={Transition}
        onBackdropClick={() => dispatch(setShowReceipt(false))}
      >
        <DialogContent
          sx={{
            position: 'relative',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <>
            <IconButton
              size='small'
              onClick={() => dispatch(setShowReceipt(false))}
              sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
            >
              <Icon icon='mdi:close' />
            </IconButton>
          {children}       
          </>
        </DialogContent>
      </Dialog>
    )
}

export default DialogReceipt;