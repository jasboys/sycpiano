import { AcclaimItemShape, AcclaimsListStateShape } from 'src/components/About/Press/types';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import axios from 'axios';

const initialState: AcclaimsListStateShape = {
    isFetching: false,
    items: [],
};

export const fetchAcclaims = createAsyncThunk<AcclaimItemShape[], void, ThunkAPIType>(
    'acclaims/fetch',
    async () => {
        const { data: acclaims }: { data: AcclaimItemShape[] } = await axios.get('/api/acclaims');
        return acclaims;
    },
    {
        condition: (_, { getState }) => {
            return !getState().pressAcclaimsList.isFetching && !getState().pressAcclaimsList.items.length;
        }
    }
);

const acclaimsSlice = createSlice({
    name: 'pressAcclaimsList',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAcclaims.pending, (state, _) => {
                state.isFetching = true;
            })
            .addCase(fetchAcclaims.rejected, (state, _) => {
                state.isFetching = false;
            })
            .addCase(fetchAcclaims.fulfilled, (state, action) => {
                state.isFetching = false;
                state.items = action.payload;
            })
            .addDefaultCase(state => state);
    }
});

export const acclaimsListReducer = acclaimsSlice.reducer;