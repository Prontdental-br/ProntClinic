import 'react-toastify/dist/ReactToastify.css';

import { Box } from '@mui/system';

type notifyArrivalType = { 
    patientName: string; 
    tag: string; 
    time: string;
    professionalName: string;
    nextConsultationForecast?: string;
}

export const notifyArrival = (notification: notifyArrivalType) => {

     const formatTime = (isoString: string) => {
        return new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        }).format(new Date(isoString));
      };
      
  return (
      <Box
      sx={{
        backgroundColor: "#ff7f00",
        color: "white",
      }}
    >
        <div style={{ fontSize: '1.2rem' }}>Paciente Chegou!</div>
        <div>{notification.patientName}</div>
        <div>
        • {notification.tag} - {formatTime(notification.time)}
        </div>

        <div>Profissional: {notification.professionalName}</div>

            <div>
          Á executar:{' '}
          {(notification.nextConsultationForecast ?? '').length > 40
            ? (notification.nextConsultationForecast ?? '').slice(0, 40) + '...'
            : notification.nextConsultationForecast ?? ''}
        </div>
      </Box>
    )
};
