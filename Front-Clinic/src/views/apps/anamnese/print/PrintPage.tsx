'use client'

// ** React Imports
import { useEffect, useState, useRef, useMemo } from 'react'

import crypto from 'crypto';

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import { History } from '@mui/icons-material';

// ** Third Party Components
import api from 'src/@core/components/api-client';
import { ClinicType } from 'src/types/apps/clinicsTypes'
import dayjs from 'dayjs'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormLabel, Radio, RadioGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material'
import { questionsObjectList } from 'src/views/components/AnamneseForm/questions'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';


type AnamnesePrintLayoutProps = {
  id: string | undefined;
  autoPrint?: boolean;
}

const AnamnesePrint = ({ id, autoPrint }: AnamnesePrintLayoutProps) => {
  // ** State
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [clinicData, setClinicData] = useState<ClinicType | null>(null);
  const [anamnese, setAnamnese] = useState<any>(null); 
  const [anamneseAllData, setAnamneseAllData] = useState<any>({});
  const [patient, setPatient] = useState<any>();
  const [contractHashDoc, setContractHashDoc] = useState<any>({});
  const [anamneseName, setAnamneseName] = useState('');

  const [signature, setSignature] = useState<string | undefined>();

  const userData = JSON.parse(window.localStorage.getItem('userData') || '{}')
  const professionalData = userData?.professional;

  const [inputValue, setInputValue] = useState<string>(''); 
  const [signatureWrite, setSignatureWrite] = useState<string>(''); 
  const [fontFamily, setFontFamily] = useState<string>('Arial'); 
  const [isSigned, setIsSigned] = useState<boolean>(false);

  const [isTermsAccepted, setIsTermsAccepted] = useState(false); 
  const [preenchimentoPaciente, setPreenchimentoPaciente] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(event.target.checked); 
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

  async function createSignerPatient() {

    const hashPatient = concatDataPescription(
      patient.name,
      patient.cpf,
      patient.cellPhone,
    );

    const data = {
      clinicId: clinicData?.id,
      accountId: clinicData?.accountId,
      signerId: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      email: patient.email ? patient.email : null,
      fontFamily: "'Dancing Script', cursive",
      hash: hashPatient,
  }

  await api.post(`/signers/${id}`, data);

  fetchAnamnese();
  contractHash();

  }

  async function getClinic() {
    const clinic = await api.get(`/clinics`)
    setClinicData(clinic.data);
  }

  const contractHash = async () => {
    const { data } = await api.get('/contracts-signature/docId/' + id);
 
    setContractHashDoc(data);
   }


   useEffect(() => {
  if (anamneseAllData && anamneseAllData.items) {
    const isEmptyAnamnese = anamneseAllData.items.every((item: any) => !item.answerOption && !item.answerDesc);
    setPreenchimentoPaciente(isEmptyAnamnese);
  }
}, [anamneseAllData]);

  function fetchAnamnese() {
  api
    .get(`/anamnese/${id}`)
    .then(res => {
      const anamnese = res.data;

      console.log('Anamnese completa:', anamnese);

      setAnamnese(anamnese.config?.desc || '');

      setPatient(anamnese.patient);

      setData(anamnese.items || []);

      setClinicData(anamnese.clinic);

      setAnamneseAllData(anamnese);

      setError(false);
    })
    .catch((error) => {
      console.error('Erro ao buscar anamnese:', error);
      setData(null);
      setError(true);
    });
}

const createQuestionSchema = (
  q: any,
  index: number,
  preenchidoPor: 'profissional' | 'paciente' | null
) => {
  const base: { [key: string]: any } = {};
  const questionKey = `question_${index}`;
  const extraKey = `question_${index}_extra`;
  const isPaciente = preenchidoPor === 'paciente';

  switch (q.questionType) {
    case 'TEXT':
    case 'YES_NO':
    case 'RADIO':
      base[questionKey] = isPaciente && q.required
        ? yup.string().required('Campo obrigatório')
        : yup.string().nullable();
      break;

    case 'YES_NO_TEXT':
      base[questionKey] = isPaciente && q.required
        ? yup.string().required('Campo obrigatório')
        : yup.string().nullable();
      base[extraKey] = yup.string().nullable();
      break;

    case 'CHECKBOX':
      base[questionKey] = isPaciente && q.required
        ? yup
            .array()
            .of(yup.string())
            .min(1, 'Selecione ao menos uma opção')
        : yup.array().of(yup.string());
      break;

    default:
      base[questionKey] = yup.string().nullable();
  }

  return yup.object().shape(base);
};


const validationSchema = useMemo(() => {
  return yup.object().shape(
    data?.reduce((acc: any, q: any, index: any) => {
      return {
        ...acc,
        ...createQuestionSchema(q, index, 'paciente').fields,
      };
    }, {})
  );
}, [data, preenchimentoPaciente]);

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema)
  })

 const renderInput = (q: any, index: number, preenchidoPor: 'profissional' | 'paciente' | null) => {
  const name = `question_${index}`;
  const label = q.question;
  const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
  const isPaciente = preenchidoPor === 'paciente';

  const validationRules = isPaciente && q.required ? { required: 'Campo obrigatório' } : {};

  switch (q.questionType) {
    case 'TEXT':
      return (
        <TextField
          {...register(name, validationRules)}
          label={label}
          fullWidth
          multiline
          minRows={3}
          margin="normal"
          disabled={isPaciente}
          error={!!errors[name]}
          helperText={errors[name]?.message?.toString()}
        />
      );

    case 'YES_NO':
    case 'RADIO':
      return (
        <>
          <FormLabel>{label}</FormLabel>
          <RadioGroup>
            {options.map((opt: any, i: number) => (
              <FormControlLabel
                key={i}
                value={opt.value}
                control={
                  <Radio {...register(name, validationRules)} disabled={isPaciente} />
                }
                label={opt.Option}
              />
            ))}
          </RadioGroup>
          {errors[name] && (
            <Typography color="error" variant="caption">
              {errors[name]?.message?.toString()}
            </Typography>
          )}
        </>
      );

    case 'YES_NO_TEXT':
      return (
        <>
          <FormLabel>{label}</FormLabel>
          <RadioGroup>
            {options.map((opt: any, i: number) => (
              <FormControlLabel
                key={i}
                value={opt.value}
                control={
                  <Radio {...register(name, validationRules)} disabled={isPaciente} />
                }
                label={opt.Option}
              />
            ))}
          </RadioGroup>
          {errors[name] && (
            <Typography color="error" variant="caption">
              {errors[name]?.message?.toString()}
            </Typography>
          )}

          <TextField
            {...register(`${name}_extra`)}
            placeholder={anamnese === "Protocolo HOF" ? "Quais?" : "Informações adicionais"}
            fullWidth
            margin="normal"
            disabled={isPaciente}
            error={!!errors[`${name}_extra`]}
            helperText={errors[`${name}_extra`]?.message?.toString()}
          />
        </>
      );

    case 'CHECKBOX':
      return (
        <>
          <FormLabel>{label}</FormLabel>
          {options.map((opt: any, i: number) => (
            <FormControlLabel
              key={i}
              control={<Checkbox {...register(`${name}.${i}`)} disabled={isPaciente} />}
              label={opt.Option}
            />
          ))}
        </>
      );

    default:
      return (
        <TextField
          {...register(name)}
          label={label}
          fullWidth
          margin="normal"
          disabled={isPaciente}
        />
      );
  }
};

const onSubmit = async (dataForm: any) => {
  try {
    const payload = {
      items: data.map((q: any, index: number) => {
        const name = `question_${index}`;
        const extra = dataForm[`${name}_extra`]; 

        let answerOption = '';
        let answerDesc = '';

        if (q.questionType === 'TEXT') {
          answerDesc = dataForm[name] || ''; 
        } else if (q.questionType === 'YES_NO_TEXT') {
          answerOption = dataForm[name] || ''; 
          answerDesc = extra || '';
        } else if (q.questionType === 'CHECKBOX') {
          const selected = Object.entries(dataForm[name] || {})
            .filter(([_, val]) => val)
            .map(([i, _]) => q.options?.[+i]?.Option)
            .filter(Boolean);
          answerOption = selected.join(', ');
        } else {
          answerOption = dataForm[name] || ''; 
        }

        return {
          question: q.question,
          questionType: q.questionType,
          answerOption,
          answerDesc,
          options: q.options || [],
          required: q.required,
          seq: q.seq,
        };
      }),
    };

    await api.patch(`/anamnese/question/${id}`, payload);
    toast.success('Respostas enviadas com sucesso!');

    fetchAnamnese();
  } catch (error) {
    console.error('Erro ao atualizar anamnese:', error);
    toast.error('Erro ao enviar respostas');
  }
};


  useEffect(() => {
    fetchAnamnese();
    contractHash();
  }, [id])

  const [openWarningModal, setOpenWarningModal] = useState(false);

  const handleTrySubmit = () => {
    if (!isTermsAccepted && contractHashDoc.status !== "completed" && !professionalData) {
      setOpenWarningModal(true);
    } else {
      handleSubmit(onSubmit)(); // executa o submit real
    }
  };

  const handleSignAndMaybeSave = async () => {
  const formValues = getValues(); 

  // Monta as respostas igual ao onSubmit
  const respostas = data.map((q: any, index: number) => {
    const name = `question_${index}`;
    const extra = formValues[`${name}_extra`];

    let answerOption = '';
    let answerDesc = '';

    if (q.questionType === 'TEXT') {
      answerDesc = formValues[name] || '';
    } else if (q.questionType === 'YES_NO_TEXT') {
      answerOption = formValues[name] || '';
      answerDesc = extra || '';
    } else if (q.questionType === 'CHECKBOX') {
      const selected = Object.entries(formValues[name] || {})
        .filter(([_, val]) => val)
        .map(([i]) => q.options?.[+i]?.Option)
        .filter(Boolean);
      answerOption = selected.join(', ');
    } else {
      answerOption = formValues[name] || '';
    }

    return {
      question: q.question,
      questionType: q.questionType,
      answerOption,
      answerDesc,
      options: q.options || [],
      required: q.required,
      seq: q.seq,
    };
  });

  const temRespostas = respostas.some(
    (r: any) => r.answerOption?.trim() !== '' || r.answerDesc?.trim() !== ''
  );

  try {
    if (temRespostas) {
      await api.patch(`/anamnese/question/${id}`, { items: respostas });
      toast.success('Respostas enviadas junto com a assinatura!');
    }

    // Agora cria a assinatura
    await createSignerPatient();

  } catch (error) {
    console.error('Erro ao assinar/salvar:', error);
    toast.error('Erro ao processar assinatura e respostas');
  }
};


  if (data) {
    return (
      <Box sx={{ p: 12, pb: 6 }}>
        <Card>
          <CardContent>
            <Grid container>
              <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 6, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    {clinicData?.profilePic && (
                      <img src={clinicData.profilePic} style={{ width: 'auto', maxWidth: '80px', height: 'auto', marginBottom: '10px' }} />
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
                    {dayjs(data.date)?.format?.('DD/MM/YYYY')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }} align="center">
                    FICHA DE ANAMNESE
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                    {patient?.name}
                    {patient?.cellPhone &&
                      ' - ' + patient?.cellPhone
                    }
                    {patient?.cpf &&
                      ' - ' + patient?.cpf
                    }
                  </Typography>
                </Box>
              </Grid>

             {preenchimentoPaciente ? (
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mt: 6,
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: '900px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
  >
                          <Grid container spacing={3}>
                            {data?.map((q: any, index: number) => {
                              const isTextOnly = q.questionType === 'TEXT';

                              return (
                                <Grid
                                  item
                                  xs={12}
                                  sm={isTextOnly ? 12 : 6}
                                  key={index}
                                  sx={{
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                    padding: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}
                                >
                                  {renderInput(q, index, 'profissional')}
                                </Grid>
                              );
                            })}

                            <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                              <Button variant="contained" onClick={handleTrySubmit}>
                                Enviar respostas
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
              ) : (
                <Grid item xs={12} sx={{ mt: 4 }}>
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Box
      sx={{
        width: '100%',
        maxWidth: 900,
        px: 2,
        mb: 6,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TableContainer>
        <Table>
          <TableBody>
            {data
              ?.filter((item: any) => item.question !== 'Observação geral')
              .sort((a: any, b: any) => a.seq - b.seq)
              .map((item: any, index: number) => (
                <TableRow
                  hover
                  key={index}
                  sx={{
                    '&:last-of-type td': { border: 0 },
                    verticalAlign: 'top',
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {item.question}
                    {item.answerDesc && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          color: 'text.secondary',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        <strong>Obs:</strong> {item.answerDesc}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      verticalAlign: 'top',
                      pt: 2,
                    }}
                  >
                    {item.answerOption || '-'}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </Box>
</Grid>
              )}
              {anamneseAllData.observation && (
                <Grid item sm={12} sx={{ mt: 4, mb: 7 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.2, mb: 2 }}>
                    Observação Geral
                  </Typography>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                    {anamneseAllData.observation}
                  </Typography>
                </Grid>
              )}
              <Grid item sm={12} sx={{ mt: 8, pt: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                    Assino este declarando verdadeiras as informações escritas acima
                  </Typography>
                </Box>
              </Grid>
              <Grid item sm={12} sx={{ mt: 8, mb: 10, display: 'flex', justifyContent: 'center',}}>
                <Grid item sm={6}>
                  <Box>
                  <Typography
                                sx={{
                                  fontFamily: 'Dancing Script, cursive',
                                  fontSize: '24px',
                                  fontWeight: 400,
                                 
                                }}
                                align='center'
                              > 
                                {contractHashDoc.status === "completed" && patient.name}
                          </Typography>
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                      _____________________________________
                    </Typography>
                    <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                      {patient.name}
                    </Typography>
                  </Box>
                </Grid>

               
              </Grid>

              {anamneseAllData.hash && (
                    <Grid item sm={12} sx={{  mt: 0, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '12px', mb: 2 }}>Histórico do Documento: </Typography>
                        <Box sx={{ display: 'flex',  justifyContent: 'center', gap: '2.5rem', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <History />
                            <span style={{ fontSize: '10px' }}>Assinado</span>
                          </div>
                            <span style={{ fontWeight: '600', fontSize: '10px' }}>{anamneseAllData.date ? dayjs(anamneseAllData.date)?.format?.('DD/MM/YYYY') : ""}</span>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                              <Typography sx={{ fontWeight: 400, lineHeight: 1.2, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <strong>Hash:</strong> {anamneseAllData.hash}
                              </Typography>
                          </div>
                          
                          {anamneseAllData.email && (
                            <div>
                              <Typography sx={{ fontWeight: 400, lineHeight: 1.2, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}><strong>Email: </strong> {anamneseAllData?.email} </Typography>
                            </div>
                          )}

                          <div>
                              <Typography sx={{ fontWeight: 400, lineHeight: 1.2, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}><strong>Nome: </strong> {anamneseAllData?.name} </Typography>
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
                Eu li e concordo com os termos dessa anamnese{' '}
              </Typography>
            </>
          }
        />
          )}

        <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 5, mt: 10 }} className='hide-print'>
          <Button onClick={()=>window.print()} variant='contained' name='emmit' color='success'>
            Imprimir
          </Button>
          <Button onClick={()=>{
            window.open('', '_self', '');
            window.close();
          }} name='close' variant='contained' color='error'>
            Fechar
          </Button>

          {contractHashDoc.status !== "completed" && !professionalData && (
          <Button 
            color="info" variant='contained'
            onClick={handleSignAndMaybeSave}
            disabled={!isTermsAccepted} 
          >
              Assinar Paciente
          </Button>
          )}  
        </Grid>

        <Dialog open={openWarningModal} onClose={() => setOpenWarningModal(false)}>
          <DialogTitle>Aviso</DialogTitle>
          <DialogContent>
            <Typography>
              Se você é paciente e deseja enviar as respostas da anamnese, assine digitalmente primeiro.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWarningModal(false)} autoFocus>
              Entendi
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  } else if (error) {
    return (
      <Box sx={{ p: 5 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Alert severity='error'>
              Anamnese não encontrado
            </Alert>
          </Grid>
        </Grid>
      </Box>
    )
  } else {
    return null
  }
}

export default AnamnesePrint;
