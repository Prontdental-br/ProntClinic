import { useRef, useEffect, createRef, useState, useContext } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box, { BoxProps } from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import Link from 'next/link'
import { BudgetItemType, BudgetType, PatientType, PlanType, ProfessionalType } from 'src/types/apps/budgetTypes'
import { jsPDF,HTMLOptionImage } from "jspdf";
import * as htmlToImage from 'html-to-image';
import { toPng,toCanvas } from "html-to-image";
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/store'
import { AuthContext } from 'src/context/AuthContext';
import { loadClinic } from 'src/store/apps/clinics';

type propsType = {
    showPrintButton?: boolean
}

function OdontogramCardReceipt({ showPrintButton = true }: propsType){
    const dispatch = useDispatch<AppDispatch>();
    const store = useSelector((state: RootState) => state.odontogram)
    const clinicStore = useSelector((state: RootState) => state.clinic)
    const divGraph = createRef<HTMLDivElement>()
    const previewRef = createRef<HTMLDivElement>();
    const authContext = useContext(AuthContext);

    console.log('divGraph', divGraph);
        
    useEffect(function(){
        if(divGraph.current && store.receiptGraph){
            divGraph.current.appendChild(store.receiptGraph);
            if ((Array.isArray(store?.budget?.shapesTabAi) && store.budget.shapesTabAi.length > 0) || (Array.isArray(store?.budget?.shapesTabRegiao) && store.budget.shapesTabRegiao.length > 0)) {
                drawCanvas();                
            }    
        }        
    }, [store.receiptGraph, divGraph])

    console.log('store---', );

    function drawCanvas(){
        if(divGraph.current === null){
            return;
        }
        const shapes = store.budget.shapesTabAi.length > 0 ? store.budget.shapesTabAi : store.budget.shapesTabRegiao;        
        const canvas = divGraph.current.querySelector('.tab-content.show canvas');

        console.log('shapes', shapes);
        if (!canvas) {
        console.warn('Canvas não encontrado');
        
        return;
        }   
        const ctx = (canvas as HTMLCanvasElement)?.getContext('2d');
        if(ctx === null){
            console.log('nao existe ctx');
            
            return;
        }
        ctx.lineWidth = 5
        ctx.strokeStyle = '#2196f3'
        shapes.forEach(shape => {
            if (ctx == null) return;
        
            if (shape.units && store.budget.showUnits) {
              const text = `${Number(shape.units)} un`;
              const paddingX = 6;
              const paddingY = 4;
              const arrowHeight = 6;
            
              ctx.font = '12px Inter';
              ctx.textBaseline = 'top';
            
              const textMetrics = ctx.measureText(text);
              const boxWidth = textMetrics.width + paddingX * 2;
              const boxHeight = 20;
            
              const boxX = shape.sX - boxWidth / 2;
              const boxY = shape.sY - boxHeight - arrowHeight - 5;
            
              ctx.fillStyle = '#222';
              ctx.beginPath();
              ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6); 
              ctx.fill();
              ctx.closePath();
            
              ctx.fillStyle = '#fff';
              ctx.fillText(text, boxX + paddingX, boxY + paddingY);
            
              ctx.beginPath();
              ctx.moveTo(shape.sX - 5, boxY + boxHeight);
              ctx.lineTo(shape.sX + 5, boxY + boxHeight);
              ctx.lineTo(shape.sX, boxY + boxHeight + arrowHeight);
              ctx.closePath();
              ctx.fillStyle = '#222';
              ctx.fill();
            }
      
            switch (shape.type) {
              case 'point':
                ctx.lineCap = 'round';
                  ctx.fillStyle = shape.color ?? '#2196f3';
                ctx.beginPath();
                ctx.arc(shape.sX, shape.sY!, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
                break;
        
              case 'line':
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#2196f3';
                ctx.fillStyle = 'transparent';
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(shape.sX, shape.sY);
                ctx.lineTo(shape.fX!, shape.fY!);
                ctx.stroke();
                break;
        
              case 'arrow':
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#2196f3';
                ctx.fillStyle = '#2196f3';
                ctx.lineCap = 'round';
        
                const dx = shape.fX! - shape.sX;
                const dy = shape.fY! - shape.sY;
                const angle = Math.atan2(dy, dx);
                const headlen = 12;
        
                ctx.beginPath();
                ctx.moveTo(shape.sX, shape.sY);
                ctx.lineTo(shape.fX!, shape.fY!);
                ctx.moveTo(shape.fX!, shape.fY!);
                ctx.lineTo(
                  shape.fX! - headlen * Math.cos(angle - Math.PI / 6),
                  shape.fY! - headlen * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(shape.fX!, shape.fY!);
                ctx.lineTo(
                  shape.fX! - headlen * Math.cos(angle + Math.PI / 6),
                  shape.fY! - headlen * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
                break;
            }
          });
    }

    useEffect(() => {
        //carregar dados da clinica
        const clinicId = authContext.user?.clinicId;
        if(clinicId) {
            dispatch(loadClinic(clinicId));
        }
    }, [authContext, dispatch]);

    function getSubtotal(){
        const soma = store.budgetTreatments.reduce((acc, currentItem: any)=>{
            return currentItem.selected ? acc + parseFloat(currentItem?.value) : acc;
        },0);

        return soma;
    }

    function getTotal(){        
        const subtotal = getSubtotal();
        const total = subtotal - store.totalDiscount;

        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( total );
    }

    function getInstallmentValue(){
        const subtotal = getSubtotal();
        const total = subtotal - store.totalDiscount;        
        const installmentValue = (total - store.downPayment) / store.installments;
        
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( installmentValue );
    }

    function handlePrint(){
        if(typeof previewRef.current != 'undefined' && previewRef.current != null){
            htmlToImage.toPng(previewRef.current, { quality: 1 })
            .then(function (dataUrl) {
                const nTab = window.open();
                if(nTab === null) return;
                
                const dom = `
                    <html>
                        <head>
                            <title>Orçamento</title>
                            <style>
                            @media print {
                                html, body {
                                   border: 1px solid white;
                                   height: 99%;
                                   page-break-after: avoid;
                                   page-break-before: avoid;
                                }
                           }
                            </style>
                        </head>
                        <body>
                            <img src="${dataUrl}" alt="Minha Imagem">
                        </body>
                    </html>
                `;

                nTab.document.write(dom);
                setTimeout(function(){
                    nTab?.print();
                }, 500);
                    
                  
            });
            
            
        }
    }

    return(
        <>
        <Card ref={previewRef}>
            <CardContent>
                <Grid container>
                    <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>                            
                            <Box sx={{ mb: 6, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>                    
                                {clinicStore?.clinic?.profilePic && (
                                  <img src={clinicStore.clinic.profilePic} style={{width:'auto', maxWidth: '80px', height: 'auto', marginBottom: '10px'}} />
                                )}
                                <Typography sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                    {clinicStore.clinic.name}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item sm={6} xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Typography sx={{ ml: 2, fontWeight: 400, lineHeight: 1.2 }}>
                                {store.date?.format?.('DD/MM/YYYY')}
                            </Typography>
                        </Box>
                    </Grid>        
                    <Grid item sm={12} sx={{ mt: 6 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography  sx={{ fontWeight: 600, lineHeight: 1.2, display: 'block' }} align="center">
                                PLANO DE TRATAMENTO
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item sm={12} sx={{ mt: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography  sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                                {store.patient.name} 
                                { store.patient.cellPhone && 
                                    ' - ' + store.patient.cellPhone
                                }
                                { store.patient.cpf && 
                                    ' - ' + store.patient.cpf
                                }
                            </Typography>                            
                        </Box>                        
                    </Grid>   
                    <Grid item sm={12} sx={{ mt: 7 }}>
                        <Typography  sx={{ fontWeight: 400, lineHeight: 1.2, display: 'block' }} align="center">
                            Plano de tratamento
                        </Typography>
                    </Grid>         
                    <Grid item sm={12} sx={{ mt: 7, border: '1px solid #00000066', padding: '10px', borderRadius:'10px' }}>
                        <div ref={divGraph}></div>
                    </Grid>
                    <Grid item sm={12} sx={{ mt: 8 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px' }}>
                            <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                Procedimentos
                            </Typography>
                            <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                Dente/Região
                            </Typography>
                        </Box>
                        <Box>
                            { store.budgetTreatments.map((item:BudgetItemType, idx) => (
                                <Box key={idx} sx={{ paddingBottom:'10px', paddingTop:'10px', borderBottom: '1px solid #00000066', display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 400, lineHeight: 1.6 }}>
                                            {item?.treatment?.name || ''}
                                            {typeof item.faces?.length != 'undefined' &&  item.faces?.length > 0 && (' - ' + item.faces.join(', '))}                                        
                                        </Typography>
                                        <Typography sx={{ fontWeight: 400, lineHeight: 1.6 }}>
                                            {store.professional.name} - {store.plan?.name ? store.plan.name : 'Sem plano'}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 600, lineHeight: 3.2 }}>
                                        {item.description}
                                    </Typography>
                                </Box>
                            )) }
                        </Box>
                        <Box sx={{ mt:6, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            { store.totalDiscount > 0 &&
                                <>
                                <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                                    Subtotal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( getSubtotal() )}
                                </Typography>

                                <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                                    Desconto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( store.totalDiscount )}
                                </Typography>
                                </>
                            }
                            <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                                Valor total: {getTotal()}
                            </Typography>                  
                            { store.installments > 0 &&
                                <>
                                    <Typography sx={{ fontWeight: 900, lineHeight: 2 }}>
                                            Parcelamento
                                    </Typography>
                                    { store.downPayment > 0 &&
                                        <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                                            Entrada: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(store.downPayment)}
                                        </Typography>
                                    }
                                    { store.installments > 0 &&
                                        <Typography sx={{ fontWeight: 400, lineHeight: 2 }}>
                                            {store.installments}x de {getInstallmentValue()}
                                        </Typography>
                                    } 
                                </>        
                            }                                           
                        </Box>
                    </Grid>
                    { store.observation &&
                    <Grid item sm={12} sx={{ mt: 4, mb: 7 }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.2, mb: 2 }}>
                            Observação
                        </Typography>
                        <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }}>
                            {store.observation}
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
                        <Grid item sm={6}>
                            <Box>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                                    _____________________________________
                                </Typography>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>                                    
                                    {store.patient.name}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item sm={6}>
                            <Box>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                                    _____________________________________
                                </Typography>
                                <Typography sx={{ fontWeight: 400, lineHeight: 1.2 }} align='center'>
                                    {clinicStore.clinic.name}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>                    
            </CardContent>
        </Card>
        <Box sx={{ display:'flex', justifyContent: 'center', pt:6 }}>
            { showPrintButton &&            
            <Button 
                href={`/budget/print/${store.budget.id}`}
                component={Link}
                variant='contained' 
                target='_blank'
                color='success'>Imprimir</Button>
            }
        </Box>
        </>
    )
}

export default OdontogramCardReceipt;