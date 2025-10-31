import type { PayloadAction } from '@reduxjs/toolkit'
import api from 'src/@core/components/api-client'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ClinicType, PlanType, CashType, SpecialtyType, TreatmentType, MedicineType } from 'src/types/apps/clinicsTypes'
import { Dispatch } from 'redux'

interface Redux {
    getState: any
    dispatch: Dispatch<any>
}

export const createClinic = createAsyncThunk(
    'appClinics/createClinic',
    async (clinic: ClinicType, {dispatch} : Redux) => {         
        const res = await api.post('/clinics', clinic);        
        dispatch(loadClinic(res.data.id));            
        
        return res.data;
    }
)


export const loadClinic = createAsyncThunk(
    'appClinics/loadClinic',
    async (clinicId: string) => {                
        return (await api.get('/clinics/' + clinicId)).data        
    }
)

export const updateClinic = createAsyncThunk(
    'appClinics/updateClinic',
    async (clinic: ClinicType, {dispatch} : Redux) => { 
        const res = await api.patch('/clinics/' + clinic.id, clinic);
        
        if (res.status !== 200) {
            throw new Error('Erro ao atualizar a clínica');
        }   
        
        dispatch(AppClinicsSlice.actions.setUpdatedClinic(true));
        setTimeout(() => {
            dispatch(AppClinicsSlice.actions.setUpdatedClinic(false));
        }, 3000);

        return (await api.patch('/clinics/' + clinic.id, clinic)).data        
    }
)

export const loadPlans = createAsyncThunk(
    'appClinics/loadPlans',
    async (_, {dispatch} : Redux) => {                
        dispatch(AppClinicsSlice.actions.setLoadingData(true));
        const data = (await api.get('/plan')).data;
        
        dispatch(AppClinicsSlice.actions.setLoadingData(false));
        
        return data;
    }
)

export const createPlan = createAsyncThunk(
    'appClinics/createPlan',
    async (plan: PlanType, {dispatch} : Redux) => {         
        const res = await api.post('/plan', plan);        
        dispatch(loadPlans());            
        
        return res.data;
    }
)

export const updatePlan = createAsyncThunk(
    'appClinics/updatePlan',
    async (plan: PlanType, {dispatch} : Redux) => {         
        const res = await api.patch('/plan/' + plan.id, plan);        
        dispatch(loadPlans());            
        
        return res.data;
    }
)

export const deletePlan = createAsyncThunk(
    'appClinics/deletePlan',
    async (planId: string, {dispatch} : Redux) => {         
        const res = await api.delete('/plan/' + planId);        
        dispatch(loadPlans());            
        
        return res.data;
    }
)

export const createCash = createAsyncThunk(
    'appClinics/createCash',
    async (cash: CashType, {dispatch} : Redux) => {         
        const res = await api.post('/cash', cash);        
        dispatch(loadCashs());            
        
        return res.data;
    }
)

export const loadCashs = createAsyncThunk(
    'appClinics/loadCashs',
    async (_, {dispatch} : Redux) => {                
        dispatch(AppClinicsSlice.actions.setLoadingData(true));
        const data = (await api.get('/cash')).data;
        
        dispatch(AppClinicsSlice.actions.setLoadingData(false));
        
        return data;
    }
)

export const updateCash = createAsyncThunk(
    'appClinics/updateCash',
    async (cash: CashType, {dispatch} : Redux) => {         
        const res = await api.patch('/cash/' + cash.id, cash);        
        dispatch(loadCashs());            
        
        return res.data;
    }
)

export const deleteCash = createAsyncThunk(
    'appClinics/deleteCash',
    async (cashId: string, {dispatch} : Redux) => {         
        const res = await api.delete('/cash/' + cashId);        
        dispatch(loadCashs());            
        
        return res.data;
    }
)

export const loadSpecialties = createAsyncThunk(
    'appClinics/loadSpecialties',
    async (_, {dispatch} : Redux) => {                
        dispatch(AppClinicsSlice.actions.setLoadingData(true));
        const data = (await api.get('/specialty')).data;
        
        dispatch(AppClinicsSlice.actions.setLoadingData(false));
        
        return data;
    }
)

export const createSpecialty = createAsyncThunk(
    'appClinics/createSpecialty',
    async (specialty: SpecialtyType, {dispatch} : Redux) => {         
        const res = await api.post('/specialty', specialty);        
        dispatch(loadSpecialties());            
        
        return res.data;
    }
)

export const updateSpecialty = createAsyncThunk(
    'appClinics/updateSpecialty',
    async (specialty: SpecialtyType, {dispatch} : Redux) => {
        const res = await api.patch('/specialty/' + specialty.id, specialty);        
        dispatch(loadSpecialties());                            

        return res.data;
    }
)

export const deleteSpecialty = createAsyncThunk(
    'appClinics/deleteSpecialty',
    async (specialtyId: string, {dispatch} : Redux) => {         
        const res = await api.delete('/specialty/' + specialtyId);        
        dispatch(loadSpecialties());            
        
        return res.data;
    }
)

export const loadTreatments = createAsyncThunk(
    'appClinics/loadTreatments',
    async (_, {dispatch} : Redux) => {                
        dispatch(AppClinicsSlice.actions.setLoadingData(true));
        const data = (await api.get('/treatments')).data;
        
        dispatch(AppClinicsSlice.actions.setLoadingData(false));
        
        return data;
    }
)

export const createTreatment = createAsyncThunk(
    'appClinics/createTreatment',
    async (treatment: TreatmentType, {dispatch} : Redux) => {         
        console.log('creating treatment')
        await api.post('/treatments', treatment)
            .then(res => {
                dispatch(loadTreatments());                 
                dispatch(AppClinicsSlice.actions.setCloseDialog(true));           
            })
            .catch(err => {
                if(err.response.status === 422) {
                    dispatch(AppClinicsSlice.actions.setFormValidationErrors(err.response.data.message))
                }
            })           
    }
)

export const updateTreatment = createAsyncThunk(
    'appClinics/updateTreatment',
    async (treatment: TreatmentType, {dispatch} : Redux) => {         
        await api.patch('/treatments/' + treatment.id, treatment)
            .then(res => {
                dispatch(loadTreatments());                 
                dispatch(AppClinicsSlice.actions.setCloseDialog(true));           
            })
            .catch(err => {
                if(err.response.status === 422) {
                    dispatch(AppClinicsSlice.actions.setFormValidationErrors(err.response.data.message))
                }
            })        
        
    }
)

export const deleteTreatment = createAsyncThunk(
    'appClinics/deleteTreatment',
    async (treatmentId: string, {dispatch} : Redux) => {         
        const res = await api.delete('/treatments/' + treatmentId);        
        dispatch(loadTreatments());            
        
        return res.data;
    }
)

    export const loadMedicines = createAsyncThunk(
        'appClinics/loadMedicines',
        async (_, {dispatch} : Redux) => {                
            dispatch(AppClinicsSlice.actions.setLoadingData(true));
            const data = (await api.get('/register-documents')).data;
            console.log("api", data);
            dispatch(AppClinicsSlice.actions.setLoadingData(false));
            
            return data;
        }
    )

    export const createMedicine = createAsyncThunk(
    'appClinics/createMedicine',
    async (medicine: MedicineType, { dispatch }: Redux) => {
        const res = await api.post('/register-documents', medicine)
        dispatch(loadMedicines())

        return res.data
    },
    )

    export const updateMedicine = createAsyncThunk(
    'appClinics/updateMedicine',
    async (medicine: MedicineType, { dispatch }: Redux) => {
        const res = await api.patch('/register-documents/' + medicine.id, medicine)
        dispatch(loadMedicines())

        return res.data
    },
    )

    export const deleteMedicine = createAsyncThunk(
    'appClinics/deleteMedicine',
    async (medicineId: string, { dispatch }: Redux) => {
        const res = await api.delete('/register-documents/' + medicineId)
        dispatch(loadMedicines())

        return res.data
    },
    )

export const AppClinicsSlice = createSlice({
    name: 'appClinics',
    initialState: {
        clinic: {} as ClinicType,        
        updatedClinic: false,
        plans: [] as PlanType[],
        loadingData: false,
        cashs: [] as CashType[],
        specialties: [] as SpecialtyType[],
        treatments: [] as TreatmentType[],
        documents: [] as MedicineType[],
        formValidationErrors: [] as string[],
        closeDialog: false
    },
    reducers: {
        setLoadingData: (state, action: PayloadAction<boolean>) => {
            state.loadingData = action.payload;
        },
        setClinic: (state, action: PayloadAction<ClinicType>) => {
            state.clinic = action.payload;
        },
        setUpdatedClinic: (state, action: PayloadAction<boolean>) => {
            state.updatedClinic = action.payload;
        },
        setFormValidationErrors: (state, action: PayloadAction<string[]>) => {
            state.formValidationErrors = action.payload;
        },
        clearFormValidationErrors: (state) => {
            state.formValidationErrors = [];
        },
        setCloseDialog: (state, action: PayloadAction<boolean>) => {
            state.closeDialog = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadClinic.fulfilled, (state, action) => {
            state.clinic = action.payload
        })
        builder.addCase(updateClinic.fulfilled, (state, action) => {              
            state.clinic = action.payload;            
        })
        builder.addCase(loadPlans.fulfilled, (state, action) => {
            state.plans = action.payload
        }),
        builder.addCase(loadCashs.fulfilled, (state, action) => {
            state.cashs = action.payload
        })
        builder.addCase(loadSpecialties.fulfilled, (state, action) => {
            state.specialties = action.payload
        })
        builder.addCase(loadTreatments.fulfilled, (state, action) => {
            state.treatments = action.payload
        })    
        builder.addCase(loadMedicines.fulfilled, (state, action) => {
            state.documents = action.payload
        })
    }
});

export default AppClinicsSlice.reducer;
export const { setClinic, clearFormValidationErrors, setFormValidationErrors, setCloseDialog } = AppClinicsSlice.actions;