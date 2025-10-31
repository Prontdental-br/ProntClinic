/* eslint-disable prefer-const */

import { DialogTitle } from "@material-ui/core";
import { Button, Card, Dialog, DialogActions, DialogContent, Grid, Radio, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { useState } from "react";
import Icon from 'src/@core/components/icon';
import { useClinic } from "src/context/AgentIAContext";

function TabYourBusiness() {

const { setSelectedClinic, selectedClinic } = useClinic();

    const clinics = [
  { id: "dentist", label: "Dentista", image: "/images/ia-agent/dentista.png" },
  { id: "clinic-odontologic", label: "Clínica Odontológica", image: "/images/ia-agent/odontologica.png" },
  { id: "esthetic", label: "Estética", image: "/images/ia-agent/estetica.png" },
  { id: "medical-clinic", label: "Clínica Médica", image: "/images/ia-agent/clinic-medica.png" },
];

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

    const handleSelect = (id: string) => {
    setSelectedClinic(id);
  };

  const router = useRouter(); 

    const handleNext = () => {
     if (selectedClinic) {
       router.push(`/ia-agent/settings/topics/`);
     }
   };

  return (
    <Card sx={{ padding: "24px", height: "100%" }}>
      <h2>1. Qual o ramo da sua empresa?</h2>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Temos algumas sugestões, se sua empresa não atua em nenhuma dessas áreas, selecione
        outros e personalize seus tópicos e conversas.
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {clinics.map((clinic) => (
          <Grid item key={clinic.id} xs={12} sm={6} md={3}>
            <Card
              onClick={() => handleSelect(clinic.id)}
              sx={{
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
                border: selectedClinic === clinic.id ? "2px solid #087a64FF" : "2px solid transparent",
                transition: "border 0.3s ease, transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
             
              <Typography variant="h6" sx={{ mt: 1, color: "#087a64FF" }}>
                {clinic.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button
          variant="contained"
          disabled={!selectedClinic}
          onClick={handleNext}
        >
          Próximo
        </Button>
      </Box>
    </Card>
  );
}

export default TabYourBusiness;