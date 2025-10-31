import { TextField, Box, Typography, Button } from '@mui/material';
import { StringChain } from 'lodash';
import { TreatmentType } from 'src/types/apps/budgetTypes';

type InjectableControlsProps = {
    setSelectedInjactables: (key: any) => void;
    selectedInjectable: 'toxina' | 'acido' | 'fio' | null;
    setTool: (tool: string | null) => void;
    unitSums: {
        toxina: number;
        acido: number;
        fio: number;
      };
    onSelectInjectable: (key: 'toxina' | 'acido' | 'fio') => void;
    selectedProcedimento: TreatmentType | undefined;
    totalValue: number;
    setShowShapesUnits: (prev: any) => void;
    showShapesUnits: boolean;
    onUpdateValue: (value: number) => void;
    tool: any;
}

export const InjectableControls = ({ 
    setSelectedInjactables,
    selectedInjectable, 
    setTool,
    tool,
    unitSums, 
    onSelectInjectable, 
    selectedProcedimento,
    totalValue,
    setShowShapesUnits,
    showShapesUnits,
    onUpdateValue
  }: InjectableControlsProps) => {
  const injectables = [
    { label: 'Toxina botulínica', color: '#2196f3', key: 'toxina' },
    { label: 'Ácido hialurônico', color: 'limegreen', key: 'acido' },
    { label: 'Fios de PDO', color: '#2196f3', key: 'fio', isLine: true },
  ];

  const getToolType = (key: 'toxina' | 'acido' | 'fio') => {
    return key === 'toxina' || key === 'acido' ? 'point' : 'line';
  };

  const handleClick = (itemKey: 'toxina' | 'acido' | 'fio') => {
    const toolType = getToolType(itemKey);
    const isSameTool = tool.current === toolType;
    const isSameInjectable = selectedInjectable === itemKey;

    if (isSameTool && isSameInjectable) {
      // Desmarcar se clicou no mesmo injetável com a mesma ferramenta
      setTool(null);
      setSelectedInjactables(null);
    } else {
      // Ativar ou trocar ferramenta/injetável
      setTool(toolType);
      setSelectedInjactables(itemKey);
      onSelectInjectable(itemKey);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Injetáveis / HOF</Typography>
      {injectables.map((item, idx) => (
        <Box key={idx} className="injectable-item">
          <Box className="injectable-label" >
            {item.isLine ? (
              <div className="color-icon pdo"  onClick={() => handleClick(item.key as 'toxina' | 'acido' | 'fio')} />
            ) : (
              <div className="color-icon" style={{ backgroundColor: item.color }}  onClick={() => handleClick(item.key as  'toxina' | 'acido' | 'fio')} />
            )}
            <Typography sx={{ cursor: 'pointer' }} onClick={() => handleClick(item.key as 'toxina' | 'acido' | 'fio')}>{item.label}</Typography>
          </Box>
          <TextField
              label="R$"
              size="small"
              variant="outlined"
              className="injectable-input"
              inputProps={{ step: 0.01 }}
              value={
                selectedProcedimento?.name.toLowerCase().includes(item.label.toLowerCase())
                  ? totalValue
                  : ''
              }
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                  onUpdateValue(newValue);
                }
              }}
            />
          <TextField
            label="0.0 un"
            size="small"
            variant="outlined"
            className="injectable-input"
            type="number"
            value={unitSums[item.key as 'toxina' | 'acido' | 'fio'].toFixed(1)}
            InputProps={{ readOnly: true }}
            inputProps={{ step: 0.1 }}
          />
        </Box>
      ))}
          <Button
            variant="outlined" 
            size="small"
            color='secondary'
            onClick={() => setShowShapesUnits((prev: any) => !prev)}
          >
            {showShapesUnits ? 'Ocultar unidades' : 'Mostrar unidades'}
          </Button>
    </Box>
  );
};