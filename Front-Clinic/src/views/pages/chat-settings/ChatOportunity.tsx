import { Box, Card, FormLabel, Grid, MenuItem, Select, TextField, IconButton, Button } from '@mui/material'
import React from 'react'
import ChatKanbanBoard from './ChatKanbanBoard'
import { ChatOpportunityList } from './ChatOpportunityList' 
import { useOpportunity } from 'src/context/OpportunityContext'
import ViewKanbanIcon from '@mui/icons-material/ViewKanbanOutlined';
import ViewListIcon from '@mui/icons-material/ViewListOutlined';

export const ChatOportunity = () => {
    const { 
        filterTasksByPeriod, 
        filterTasksBySearch, 
        filterTasksByDateRange,
        resetAllFilters,
        state
    } = useOpportunity();
    
    const [period, setPeriod] = React.useState<'all' | 'week' | 'month' | 'day'>(state.filterPeriod || 'all');
    const [searchText, setSearchText] = React.useState(state.filterSearchText || ''); 
    const [startDate, setStartDate] = React.useState<string | null>(state.filterStartDate || null);
    const [endDate, setEndDate] = React.useState<string | null>(state.filterEndDate || null);
    const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
    
    React.useEffect(() => {
        filterTasksByPeriod(period);
    }, [period]);

    React.useEffect(() => {
        if (searchText === '') {
            if (resetAllFilters) {
                resetAllFilters();
                setPeriod('all');
                setStartDate(null);
                setEndDate(null);
            }
        } else {
            filterTasksBySearch(searchText);
        }
    }, [searchText]);

    React.useEffect(() => {
        const isCustomDateRange = !!startDate || !!endDate;

        if (isCustomDateRange && period !== 'all') {
            setPeriod('all');
        }

        filterTasksByDateRange(startDate, endDate);
        
    }, [startDate, endDate]);
    
    const handlePeriodChange = (newPeriod: 'all' | 'week' | 'month' | 'day') => {
        setPeriod(newPeriod);
        
        if (newPeriod !== 'all') {
            setStartDate(null);
            setEndDate(null);
        }
    }

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value || null;
        setStartDate(dateValue);
    }
    
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value || null;
        setEndDate(dateValue);
    }
    
    const handleResetFilters = () => {
        setPeriod('all');
        setSearchText('');
        setStartDate(null);
        setEndDate(null);
        
        if (searchText === '' && resetAllFilters) { 
            resetAllFilters();
        }
    }


    return (
        <Grid container spacing={6}>
            <Card style={{ width: '100%', padding: '20px', paddingBottom: '10px', marginTop: '10px' }}>
                <Card sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    flexWrap: 'wrap', 
                    gap: '20px', 
                    padding: '20px', 
                    alignItems: { xs: 'flex-start', md: 'flex-end' } 
                }}>
                    
                    <Box sx={{ minWidth: '200px', flexGrow: 1 }}>
                        <FormLabel sx={{ fontWeight: 600 }}>Buscar</FormLabel>
                        <TextField
                            fullWidth
                            size='small'
                            placeholder="Buscar por nome, contato..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Box>
                    
                    <Box sx={{ minWidth: '200px' }}>
                        <FormLabel sx={{ fontWeight: 600 }}>Período</FormLabel>
                        <Select 
                            fullWidth
                            size='small'
                            value={period} 
                            onChange={(e) => handlePeriodChange(e.target.value as 'all' | 'week' | 'month' | 'day')}
                        >
                            <MenuItem value='all'>Todo período</MenuItem>
                            <MenuItem value='week'>Dessa semana</MenuItem>
                            <MenuItem value='month'>Desse mês</MenuItem>
                            <MenuItem value='day'>Diário</MenuItem>
                        </Select>
                    </Box>

                    <Box sx={{ minWidth: '150px' }}>
                        <FormLabel sx={{ fontWeight: 600 }}>De (Data Inicial)</FormLabel>
                        <TextField
                            fullWidth
                            size='small'
                            type='date'
                            value={startDate || ''} 
                            onChange={handleStartDateChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <Box sx={{ minWidth: '150px' }}>
                        <FormLabel sx={{ fontWeight: 600 }}>Até (Data Final)</FormLabel>
                        <TextField
                            fullWidth
                            size='small'
                            type='date'
                            value={endDate || ''} 
                            onChange={handleEndDateChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                    
                    <Box sx={{ minWidth: '150px' }}>
                        <FormLabel sx={{ fontWeight: 600, visibility: 'hidden' }}>Ações</FormLabel>
                        <Button 
                            fullWidth
                            variant="outlined" 
                            size="small" 
                            onClick={handleResetFilters}
                            sx={{ height: '40px' }}
                        >
                            Limpar Filtros
                        </Button>
                    </Box>


                    <Box>
                        <FormLabel sx={{ fontWeight: 600, display: 'block' }}>Visualização</FormLabel>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                                onClick={() => setViewMode('kanban')}
                                color={viewMode === 'kanban' ? 'primary' : 'default'}
                                title="Visualização Kanban"
                                size='small'
                            >
                                <ViewKanbanIcon />
                            </IconButton>
                            <IconButton 
                                onClick={() => setViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                                title="Visualização em Lista"
                                size='small'
                            >
                                <ViewListIcon />
                            </IconButton>
                        </Box>
                    </Box>

                </Card>
            </Card>

            <Box sx={{ mt: 6, width: '100%' }}>
                {viewMode === 'kanban' ? (
                    <ChatKanbanBoard />
                ) : (
                    <ChatOpportunityList />
                )}
            </Box>
        </Grid>
    );
};