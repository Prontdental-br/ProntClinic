'use client'

// ** React Imports
import { useEffect, useState, useRef, ReactNode } from 'react'

import crypto from 'crypto';

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CloseIcon from '@mui/icons-material/Close';
import CachedIcon from '@mui/icons-material/Cached';

import { History } from '@mui/icons-material';

import { styled, useTheme } from '@mui/material/styles'
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import dayjs from 'dayjs';
import {getGraphType} from 'src/@core/utils/budget-functions';

// ** Types
import { BudgetType, BudgetItemType } from 'src/types/apps/budgetTypes'
import { ClinicType } from 'src/types/apps/clinicsTypes'

// ** Third Party Components
import api from 'src/@core/components/api-client';

//graphs
import PermanentesSvgComponent from 'src/pages/budget/odont/Permanentes'
import DeciduosSvgComponent from 'src/pages/budget/odont/Deciduos'
import RostoSvgComponent from 'src/pages/budget/face/style/Rosto'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { Button, Checkbox, Dialog, FormControlLabel } from '@mui/material'

type BudgetPrintLayoutProps = {
  id: string | undefined;
  autoPrint?: boolean;
}

const EvolutionPrintPage = ({ id, autoPrint }: BudgetPrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<null | any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contractHashDoc, setContractHashDoc] = useState<any>({});
  const [openModalSignature, setOpenModalSignature] = useState<boolean>(false);

  const [signature, setSignature] = useState<string | undefined>();

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional;


  const contractHash = async () => {
   const { data } = await api.get('/contracts-signature/docId/' + id);

   console.log('HASH DO CONTRATO ', data);

   setContractHashDoc(data);
  }

  const fetchBudget = () => {
    api
    .get(`/evolutions/${id}`)
    .then(res => {

      console.log('data', res.data);

      // const budgetData = {
      //   ...res.data,
      //   budgetTreatments: res.data.budgetItems.map((item: any) => ({
      //     ...item,
      //     faces: item?.faces ? item.faces.split(',') : [],
      //   })),
      // }
      setClinicData(res.data.clinic)
      setData(res.data);

      // setError(false)        
    })
    .catch((error) => {
      console.log('Error', error)

      //setData(null)
      //setError(true)
    })
  }

  /*
  useEffect(() => {
    if (clinicId === null) {
      const userDataString = window.localStorage.getItem('userData')
      const userData = userDataString ? JSON.parse(userDataString) : null
      const _clinicId = userData ? userData.clinicId : ''

      setClinicId(_clinicId)
    }else{
      async function getClinic(){
        const clinic = await api.get(`/clinics/${clinicId}`)
        setClinicData(clinic.data);
      }

      getClinic()
    }
  }, [clinicId, setClinicId])
  */

  useEffect(() => {
    console.log('===AUTOPRINT===', autoPrint)
    if (data !== null && clinicData !== null) {
      
      if(autoPrint !== false){
        setTimeout(() => {
          window.print()
        }, 1000)
      }
    }
  }, [data, clinicData]);

  console.log(id)

  useEffect(() => {
      fetchBudget();
      contractHash();
  }, [id])


  const [inputValue, setInputValue] = useState<string>(''); 
  const [signatureWrite, setSignatureWrite] = useState<string>(''); 
  const [fontFamily, setFontFamily] = useState<string>('Arial'); // Gerenciar a fonte
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false); // Estado para capturar o valor do checkbox

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(event.target.checked); // Atualiza o estado quando o checkbox é marcado ou desmarcado
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); 
  };

  const toggleFont = () => {
    setFontFamily((prevFont) =>
      prevFont === 'Arial' ? "'Dancing Script', cursive" : 'Arial' // Alterna entre Arial e a fonte de assinatura
    );
  };

  const createHashSignature = (data: string) => {
    const hash = crypto.createHash('sha256');
    hash.update(data); 
    const hashResult = hash.digest('hex');
    setSignature(hashResult); 

    return hashResult;
}
  
  const concatDataPescription = (...args: (string | undefined)[]) => {

  const concat: string = args
    .filter(Boolean) 
    .join('') + dayjs().format('DD/MM/YYYY HH:mm:ss'); 

  const cleanedConcat = concat.replace(/\s+/g, ''); 

  const hashSignature = createHashSignature(cleanedConcat);

  return hashSignature;
};

  useEffect(() => {
    if (isSigned) {
      createSigner();
    }
  }, [isSigned]);

  const handleInsertSignature = () => {
    setIsSigned(true);
  }

  async function createSignerPatient() {

    const hashPatient = concatDataPescription(
      data?.patient.name,
      data?.patient.cpf,
      data?.patient.cellPhone,
    );

    const dataSigner = {
      clinicId: data?.clinic.id,
      accountId: data?.clinic.accountId,
      signerId: data?.patient.id,
      name: data?.patient.name,
      cpf: data?.patient.cpf,
      email: data?.patient.email ? data.patient.email : null,
      fontFamily: "'Dancing Script', cursive",
      hash: hashPatient,
  }

  await api.post(`/signers/${id}`, dataSigner);

  fetchBudget();
  contractHash();

  }

  async function createSigner() {

  if (!professionalData?.signaturePic && !isSigned) {
    
    setOpenModalSignature(true);

    return;
  }

  const hash = concatDataPescription(
    professionalData?.name,
    professionalData?.specialty,
    professionalData?.cro,
    professionalData.typeCr?.toUpperCase() ? professionalData.typeCr?.toUpperCase() : ''
  );

    const data = {
        clinicId: userData.clinicId,
        accountId: userData.accountId,
        signerId: professionalData.id,
        name: inputValue ? inputValue : '',
        email: professionalData.email,
        council: professionalData.typeCr,
        numberCouncil: professionalData.cro,
        cpf: professionalData.cpf,
        imgSignature: professionalData.signaturePic ? professionalData.signaturePic : null,
        fontFamily: fontFamily,
        isProfessional: true,
        hash,
    }

    await api.post(`/signers/${id}`, data);

    setOpenModalSignature(false);
   
    fetchBudget();
}
  
  if (data) {
    return (
      <Box sx={{ p: 12, pb: 6 }}>
        <Dialog open={openModalSignature} onClose={() => setOpenModalSignature(false)}>
          <Box sx={{ p: 3, minWidth: '600px' }}>
           <Typography sx={{ fontSize: '26px' }}>Adicione sua assinatura</Typography>

            <Box sx={{ border: '1px solid #CCC', mt: 3, p: 3, borderRadius: '5px' }}>
                <Box sx={{ pt: 10, mb: 2, borderBottom: '1px solid black', display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <CloseIcon />
                  <input 
                    type='text' 
                    style={{ 
                      border: 'none', 
                      fontSize: '26px', 
                      outline: 'none', 
                      fontFamily: fontFamily 
                    }} 
                    value={inputValue}
                    onChange={handleInputChange} 
                    placeholder='Seu nome' />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', marginTop: '.5rem', cursor: 'pointer', gap: '.2rem' }}
                  onClick={toggleFont}
                  >
                  <CachedIcon />
                  Alterar Fonte
                </button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 5, justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '12px' }}>Compreendo que essa é uma representação legal da minha assinatura.</Typography>
              <Button onClick={handleInsertSignature}>
                Inserir
              </Button>
            </Box>
          </Box>
        </Dialog>
        <Card>
            <CardContent>
                <Grid container>
                    <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ mb: 6, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>                    
                                {clinicData?.profilePic && (
                                  <img src={clinicData.profilePic} style={{width:'auto', maxWidth: '80px', height: 'auto', marginBottom: '10px'}} />
                                )}
                                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                  {clinicData && clinicData.name}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Typography sx={{ ml: 2, fontWeight: 400, lineHeight: 1.2 }}>
                                {dayjs(data.dateEvolution)?.format?.('DD/MM/YYYY')}
                            </Typography>
                        </Box>
                    </Grid>        
                    <Grid item sm={12} sx={{ mt: 6 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography  sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }} align="center">
                                EVOLUÇÃO PACIENTE
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item sm={12} sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography  sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                                {data.patient.name} 
                                { data.patient.cellPhone && 
                                    ' - ' + data.patient.cellPhone
                                }
                                { data.patient.cpf && 
                                    ' - ' + data.patient.cpf
                                }
                            </Typography>                            
                        </Box>                        
                    </Grid>   
                    <Grid item sm={12} sx={{ mt: 7 }}>
                        <Typography  sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                            Plano de tratamento
                        </Typography>
                    </Grid>         
                   
                    
                    { data.description &&
                    <Grid item sm={12} sx={{ mt: 4, mb: 7 }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.2, mb: 2 }}>
                            Descrição
                        </Typography>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                            {data.description}
                        </Typography>                        
                    </Grid>
                    }
                    <Grid item sm={12} sx={{ mt: 8, pt:8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                                Assino este declarando verdadeiras as informações escritas acima
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item sm={12} sx={{ mt:8, mb:10, display: 'flex' }}>
                        <Grid item sm={12}>
                            <Box>
                            <Typography
                                sx={{
                                  fontFamily: 'Dancing Script, cursive',
                                  fontSize: '24px',
                                  fontWeight: 400,
                                 
                                }}
                                align='center'
                              > 
                                {contractHashDoc.status === "completed" && data.patient.name}
                          </Typography>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                                    _____________________________________
                                </Typography>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>                                    
                                    {data.patient.name}
                                </Typography>
                            </Box>
                        </Grid>
                        {/* <Grid item sm={6}>
                            <Box>
                            {data.isSigned && data.imgSignature && (
                              <img src={data.imgSignature} width={200} alt='' />
                        )}
                        {data.name && (
                            <Typography
                                sx={{
                                  fontFamily: data.fontFamily ? data.fontFamily : fontFamily,
                                  fontSize: '24px',
                                  fontWeight: 400,
                                }}
                                align='center'
                              > 
                                {data.isSigned && data.name && (
                                  data.name ? data.name : signatureWrite
                                )}
                          </Typography>
                           )}
                    
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                                    _____________________________________
                                </Typography>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                                  {clinicData && clinicData.name}
                                </Typography>
                            </Box>
                        </Grid> */}
                    </Grid>

                    {data.hash && (
                    <Grid item sm={12} sx={{  mt: 0, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '12px', mb: 2 }}>Histórico do Documento: </Typography>
                        <Box sx={{ display: 'flex',  justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <History />
                            <span style={{ fontSize: '10px' }}>Assinado</span>
                          </div>
                            <span style={{ fontWeight: '600', fontSize: '10px' }}>{data.date ? dayjs(data.date)?.format?.('DD/MM/YYYY') : ""}</span>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                              <Typography sx={{ fontWeight: 400, lineHeight: 1.2, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong>Hash:</strong> {data.hash}
                              </Typography>
                          </div>
                          
                          <div>
                            <Typography sx={{ fontWeight: 400, lineHeight: 1.2, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}><strong>Email: </strong> {data?.email} </Typography>
                          </div>

                          <div>
                              <Typography sx={{ fontWeight: 400, lineHeight: 1.2, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}><strong>Nome: </strong> {data?.name} </Typography>
                          </div>
                      </Box>
                  </Grid>
                  )}
                </Grid>  
                
                <Grid item sm={12} sx={{  mt: 5, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <Typography sx={{ fontSize: '10px', display: 'flex', flexDirection: 'column' }}>
                    <strong>Hash do Documento:</strong> {contractHashDoc?.hashDoc}
                  </Typography>
              </Grid>    
            </CardContent>
        </Card>

        {contractHashDoc.status !== "completed" && !professionalData && (
          <FormControlLabel
          control={<Checkbox checked={isTermsAccepted} onChange={handleCheckboxChange} />}
          sx={{ mb: 4, mt: 1.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
          label={
            <>
              <Typography variant="body2" component="span">
                Eu li e concordo com os termos dessa evolução{' '}
              </Typography>
            </>
          }
        />
          )}

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          <Button onClick={() => window.print()} variant='contained' name='emmit' color='success' className='hide-print'>
            Imprimir
          </Button>
          <Button onClick={() => {
            window.open('', '_self', '');
            window.close();
          }} name='close' variant='contained' color='error' className='hide-print'>
            Fechar
          </Button>

          {/* {!data.isSigned && professionalData && (
          <Button color="info" variant='contained'
            onClick={createSigner}
          >
              Gerar assinatura
          </Button>
          )} */}

          {contractHashDoc.status !== "completed" && !professionalData && (
          <Button 
            color="info" variant='contained'
            onClick={createSignerPatient}
            disabled={!isTermsAccepted} 
          >
              Assinar Paciente
          </Button>
          )}  
        </Grid>
      </Box>
    )
  } else if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Alert severity='error'>
              Evolução não encontrada
            </Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default EvolutionPrintPage
