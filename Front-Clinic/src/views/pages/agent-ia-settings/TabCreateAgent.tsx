/* eslint-disable prefer-const */

import { DialogTitle } from "@material-ui/core";
import { Button, Card, Dialog, DialogActions, DialogContent, Grid, Radio, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import Icon from 'src/@core/components/icon';

function TabCreateAgent() {
   const [openModalConfirmAgent, setOpenModalConfirmAgent] = useState(false);
   const [isRadioSelected, setIsRadioSelected] = useState(false);
   
   const handleToogleOpenModalConfirmAgent = () => {
        setOpenModalConfirmAgent(prev => !prev);
        setIsRadioSelected(false);
   };

   const handleRadioChange = () => {
        setIsRadioSelected(prev => !prev);
   };

   const goToProntChat = () => {
        window.open('https://app.prontchat.com.br/login', '_blank')?.focus();
   };

  return (
    <Card sx={{ padding: '24px', height: '100%' }}>
      <Grid width={'fit-content'} display={'flex'} flexDirection={'column'} position={'relative'}>
        <Grid position={'absolute'} right={'0'} color={'white'} sx={{ backgroundColor: '#787EFF' }}  border={'1px solid transparent'} borderRadius={'12px'} padding={'6px 12px'}>
          <span>Free</span>
        </Grid>
        <img src="/images/logos/pront-agent-ia.png" width={240} height={200} style={{ objectFit: "contain" }}  alt="Logo Pront Chat" />
        <Button variant='outlined' onClick={handleToogleOpenModalConfirmAgent}>Testar</Button>
        <Box sx={{ mb: 2}} />
        <Button variant='outlined' onClick={goToProntChat}>Contratar</Button>
      </Grid>

        <Dialog open={openModalConfirmAgent} onClose={handleToogleOpenModalConfirmAgent}>
          <DialogTitle style={{ textAlign: "center" }}>Como você deseja prosseguir ?</DialogTitle>
          <DialogContent sx={{ textAlign: "center", background: "#dbe1f9", margin: "auto", width: "95%", p: 3, borderRadius: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Icon icon='mdi:text-box-edit' color="#787EFF" />
            <Typography sx={{ ml: 1 }}>
                Personalize Agente ProntChat IA
            </Typography>
            <Radio checked={isRadioSelected} onChange={handleRadioChange} /> 
          </Box>
            
            <p style={{ fontSize: "13px" }}>Preencher formulário de personalização da sua assistente</p>
          </DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}> 
            <Button variant="contained" disabled={!isRadioSelected} onClick={() => setIsRadioSelected(false)}>Continuar</Button>
          </Box>
        </Dialog>
    </Card>
  );
}

export default TabCreateAgent;