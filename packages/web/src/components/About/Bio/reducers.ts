import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { BioStateShape, Blurb } from 'src/components/About/Bio/types';
import type { ThunkAPIType } from 'src/types';

const initialState: BioStateShape = {
    isFetching: false,
    bio: [],
};

export const fetchBio = createAsyncThunk<Blurb[], undefined, ThunkAPIType>(
    'bio/fetch',
    async () => {
        const { data: bio } = await axios.get<Blurb[]>('/api/bio');
        return bio;
    },
    {
        condition: (_, { getState }) => {
            return !getState()?.bio?.isFetching && !getState()?.bio?.bio.length;
        },
    },
);

const bioSlice = createSlice({
    name: 'bio',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBio.pending, (state, _) => {
                state.isFetching = true;
            })
            .addCase(fetchBio.rejected, (state, _) => {
                state.isFetching = false;
            })
            .addCase(fetchBio.fulfilled, (state, action) => {
                state.isFetching = false;
                state.bio = action.payload;
            })
            .addDefaultCase((state) => (state ? state : initialState));
    },
});

export const bioReducer = bioSlice.reducer;
