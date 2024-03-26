import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Disc, DiscsStateShape } from 'src/components/About/Discs/types';
import type { ThunkAPIType } from 'src/types';

const initialState: DiscsStateShape = {
    isFetching: false,
    discs: [],
};

export const fetchDiscs = createAsyncThunk<Disc[], void, ThunkAPIType>(
    'discs/fetch',
    async () => {
        const { data: discs }: { data: Disc[] } = await axios.get('/api/discs');
        // sort by date descending
        return discs.sort((a, b) => b.releaseDate - a.releaseDate);
    },
    {
        condition: (_, { getState }) => {
            return (
                !getState().discs.isFetching && !getState().discs.discs.length
            );
        },
    },
);

const discsSlice = createSlice({
    name: 'discs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiscs.pending, (state, _) => {
                state.isFetching = true;
            })
            .addCase(fetchDiscs.rejected, (state, _) => {
                state.isFetching = false;
            })
            .addCase(fetchDiscs.fulfilled, (state, action) => {
                state.isFetching = false;
                state.discs = action.payload;
            })
            .addDefaultCase(() => {});
    },
});

export const discsReducer = discsSlice.reducer;
