import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type DialogProps = {
    title: string;
    text?: string;
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
}

export default function ConfirmDialog (props: DialogProps) {
        
    return(
        <Dialog
            open={props.open}
            onClose={props.handleClose}            
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
            <DialogContent id="alert-dialog-description">
            {props.text &&
                <DialogContentText>{props.text}</DialogContentText>
            }       
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color='secondary'>Cancelar</Button>
                <Button onClick={props.handleConfirm}>Confirmar</Button>
            </DialogActions>     
        </Dialog>
    )
}