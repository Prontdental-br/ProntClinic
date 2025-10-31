'use client'

import { Box, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useEffect, useState } from 'react'
import api from 'src/@core/components/api-client'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const StatusCards = () => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [showValues, setShowValues] = useState(false);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    const fetchStatuses = async () => {
      const res = await api.get(`/crc/budgets/summary?period=${period}`);
      const summary = res.data;

      const label = {
        day: 'Hoje',
        week: 'Semana',
        month: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
        january: 'Janeiro',
        february: 'Fevereiro',
        march: 'Março',
        april: 'Abril',
        may: 'Maio',
        june: 'Junho',
        july: 'Julho',
        august: 'Agosto',
        september: 'Setembro',
        october: 'Outubro',
        november: 'Novembro',
        december: 'Dezembro',
      }[period];
      const data = [
        {
          title: 'Fechado',
          quantity: summary.fechado?.count || 0,
          value: `R$ ${Number(summary.fechado?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          color: '#911BC4',
          iconColor: '#911BC4',
          month: label
        },
        {
          title: 'Em aberto',
          quantity: summary.aberto?.count || 0,
          value: `R$ ${Number(summary.aberto?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          color: '#911BC4',
          iconColor: '#911BC4',
          month: label
        },
        {
          title: 'Em andamento',
          quantity: summary.andamento?.count || 0,
          value: `R$ ${Number(summary.andamento?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          color: '#911BC4',
          iconColor: '#911BC4',
          month: label
        },
        {
          title: 'Perdido',
          quantity: summary.perdido?.count || 0,
          value: `R$ ${Number(summary.perdido?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          color: '#911BC4',
          iconColor: '#911BC4',
          month: label
        }
      ];

      setStatuses(data);
    };

    fetchStatuses();
  }, [period]);

  return (
    <>
      <Box px={3} pt={2} display="flex" alignItems="center" gap={2}>
       <FormControl size="small">
          <InputLabel>Período</InputLabel>
          <Select
            value={period}
            label="Período"
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <MenuItem value="day">Hoje</MenuItem>
            <MenuItem value="week">Semana</MenuItem>
            <MenuItem value="month">Mês atual</MenuItem>
            <MenuItem value="january">Janeiro</MenuItem>
            <MenuItem value="february">Fevereiro</MenuItem>
            <MenuItem value="march">Março</MenuItem>
            <MenuItem value="april">Abril</MenuItem>
            <MenuItem value="may">Maio</MenuItem>
            <MenuItem value="june">Junho</MenuItem>
            <MenuItem value="july">Julho</MenuItem>
            <MenuItem value="august">Agosto</MenuItem>
            <MenuItem value="september">Setembro</MenuItem>
            <MenuItem value="october">Outubro</MenuItem>
            <MenuItem value="november">Novembro</MenuItem>
            <MenuItem value="december">Dezembro</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} pt={3}>
        {statuses.map((status, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 1,
                boxShadow: 3,
                position: 'relative',
                borderTop: `15px solid ${status.color}`
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: 18 }} fontWeight={600}>
                  {status.title}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {status.quantity}
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                  {showValues ? status.value : '•••••••'}

                  {index === 0 && (
                    <IconButton
                      onClick={() => setShowValues((prev) => !prev)}
                      size="large"
                      sx={{ p: 0.5, ml: 2 }}
                    >
                      {showValues ? <Visibility fontSize="medium" /> : <VisibilityOff fontSize="medium" />}
                    </IconButton>
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Typography sx={{ textTransform: 'capitalize' }} fontWeight={500}>
                  {status.month}
                </Typography>
                <TrendingUpIcon fontSize="medium" sx={{ color: status.iconColor }} />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default StatusCards
