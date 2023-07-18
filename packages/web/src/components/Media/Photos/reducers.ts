import { PhotoItem, PhotoListReducerShape, PhotoViewerReducerShape } from 'src/components/Media/Photos/types';
import { createSlice, createAsyncThunk, createAction, ThunkAction, AnyAction } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import axios from 'axios';
import { GlobalStateShape } from 'src/store';

const initialListState: PhotoListReducerShape = {
    items: [],
    isFetching: false,
}

export const fetchPhotos = createAsyncThunk<PhotoItem[], void, ThunkAPIType>(
    'photos/fetch',
    async (_, thunkAPI) => {
        const { data: photo } = await axios.get<void, { data: PhotoItem[] }>('/api/photos');
        thunkAPI.dispatch(selectPhoto(photo[0]));
        return photo;
    },
    {
        condition: (_, { getState }) => {
            return !getState().photoList.isFetching && !getState().photoList.items.length;
        }
    }
);

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
            .addDefaultCase(state => state);
    }
});

const initialViewerState: PhotoViewerReducerShape = {
    currentItem: undefined,
};

export const selectPhoto = createAction<PhotoItem>('photoViewer/selectPhoto');
export const selectFirstPhoto = (): ThunkAction<void, GlobalStateShape, void, AnyAction> =>
    (dispatch, getState) => {
        dispatch(selectPhoto(getState().photoList.items[0]));
    }


const photoViewerSlice = createSlice({
    name: 'photoViewer',
    initialState: initialViewerState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(selectPhoto, (state, action) => {
                state.currentItem = action.payload;
            })
            .addDefaultCase(state => state);
    }
})

export const photoListReducer = photoListSlice.reducer;
export const photoViewerReducer = photoViewerSlice.reducer;
