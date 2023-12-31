import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {
    AcclaimItemShape,
    AcclaimsListStateShape,
} from 'src/components/About/Press/types';
import { ThunkAPIType } from 'src/types';

const initialState: AcclaimsListStateShape = {
    isFetching: false,
    items: [],
};

export const fetchAcclaims = createAsyncThunk<
    AcclaimItemShape[],
    undefined,
    ThunkAPIType
>(
    'acclaims/fetch',
    async () => {
        const { data: acclaims } =
            await axios.get<AcclaimItemShape[]>('/api/acclaims');
        return acclaims;
    },
    {
        condition: (_, { getState }) => {
            return (
                !getState().pressAcclaimsList.isFetching &&
                !getState().pressAcclaimsList.items.length
            );
        },
    },
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
            .addDefaultCase((state) => state);
    },
});

export const acclaimsListReducer = acclaimsSlice.reducer;
