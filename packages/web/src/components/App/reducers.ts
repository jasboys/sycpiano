import { createSlice, createAction } from '@reduxjs/toolkit';
import { GLOBAL_QUERIES } from 'src/screens';
import { GlobalStateShape } from 'src/store';
import { MediaQueryStateShape } from 'src/types';

const defaultMedia = Object.fromEntries(
    ((Object.keys(GLOBAL_QUERIES) as (keyof typeof GLOBAL_QUERIES)[]).map((k) => [k, false]) as Iterable<readonly [keyof MediaQueryStateShape, boolean]>)
) as MediaQueryStateShape;

export const setMatches = createAction<MediaQueryStateShape>('mediaQuery/setMatches');

export const mediaQuerySlice = createSlice({
    name: 'mediaQuery',
    initialState: defaultMedia,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(setMatches, (state, action) => {
                return {
                    ...state,
                    ...action.payload
                };
            })
            .addDefaultCase(state => state);
    },
});

export const mediaQueryReducer = mediaQuerySlice.reducer;

type SelectorMapEntriesType = Iterable<readonly [keyof MediaQueryStateShape, (state: GlobalStateShape) => boolean]>;
type SelectorMapType = Record<keyof MediaQueryStateShape, (state: GlobalStateShape) => boolean>;

export const mqSelectors = Object.fromEntries(
    (
        (Object.keys(GLOBAL_QUERIES) as (keyof MediaQueryStateShape)[])
            .map(
                (k) => [k, (state: GlobalStateShape) => state.mediaQuery[k]]
            ) as SelectorMapEntriesType
    )
) as SelectorMapType;