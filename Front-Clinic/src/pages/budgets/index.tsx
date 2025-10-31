import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useState } from "react"

const budgetOptions = [
  // {
  //   label: 'Simples',
  //   route: '/budget-flash',
  // },
  {
    label: 'Odontologia',
    route: '/budget/odont/?patient=new',
  },
  {
    label: 'HOF / Estética',
    route: '/budget/face',
  },
]

export default function Budgets() {
  const router = useRouter()

  return (
    <Box p={4}  display="flex"
      alignItems="flex-start"
      justifyContent="center"
      height={"100%"}
      >
      <Grid container spacing={4} justifyContent="center">
        {budgetOptions.map((option, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={3}
              sx={{
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.04)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" align="center">
                  Orçamento
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" mt={1}>
                  {option.label}
                </Typography>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    onClick={() => router.push(option.route)}
                  >
                    Entrar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}