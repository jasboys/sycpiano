import {
    createAction,
    createAsyncThunk,
    createSlice,
    type AnyAction,
    type ThunkAction,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type {
    PhotoItem,
    PhotoListReducerShape,
    PhotoViewerReducerShape,
} from 'src/components/Media/Photos/types';

import type { GlobalStateShape } from 'src/store';
import type { ThunkAPIType } from 'src/types';

const initialListState: PhotoListReducerShape = {
    items: [],
    isFetching: false,
    background: 'rgb(248 248 248)',
};

export const fetchPhotos = createAsyncThunk<
    PhotoItem[],
    undefined,
    ThunkAPIType
>(
    'photos/fetch',
    async (_, thunkAPI) => {
        const { data: photo } = await axios.get<PhotoItem[]>('/api/photos');
        thunkAPI.dispatch(selectPhoto(photo[0]));
        return photo;
    },
    {
        condition: (_, { getState }) => {
            return (
                !getState().photoList.isFetching &&
                !getState().photoList.items.length
            );
        },
    },
);

export const setBackground = createAction<string>('photos/setBackground');

const photoListSlice = createSlice({
    name: 'photoList',
    initialState: initialListState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPhotos.pending, (state, _) => {
                state.isFetching = true;
            })
            .addCase(fetchPhotos.rejected, (state, _) => {
                state.isFetching = false;
            })
            .addCase(fetchPhotos.fulfilled, (state, action) => {
                state.isFetching = false;
                state.items = action.payload;
            })
            .addCase(setBackground, (state, action) => {
                state.background = action.payload;
            })
            .addDefaultCase((state) => state);
    },
});

const initialViewerState: PhotoViewerReducerShape = {
    currentItem: undefined,
};

export const selectPhoto = createAction<PhotoItem>('photoViewer/selectPhoto');
export const selectFirstPhoto =
    (): ThunkAction<void, GlobalStateShape, void, AnyAction> =>
    (dispatch, getState) => {
        dispatch(selectPhoto(getState().photoList.items[0]));
    };

const photoViewerSlice = createSlice({
    name: 'photoViewer',
    initialState: initialViewerState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(selectPhoto, (state, action) => {
                state.currentItem = action.payload;
            })
            .addDefaultCase((state) => state);
    },
});

export const photoListReducer = photoListSlice.reducer;
export const photoViewerReducer = photoViewerSlice.reducer;
