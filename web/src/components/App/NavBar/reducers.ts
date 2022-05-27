import { NavBarStateShape } from 'src/components/App/NavBar/types';
import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import debounce from 'lodash-es/debounce';
import { ThunkAPIType } from 'src/types';
import { AppDispatch } from 'src/store';

const initialState: NavBarStateShape = {
    isVisible: true,
    isExpanded: false,
    showSubs: [],
    lastScrollTop: 0,
};

const toggleNavAction = createAction<boolean>('navbar/toggleNav');
const toggleExpandAction = createAction<boolean>('navbar/toggleExpanded');
const showSubnavsAction = createAction<string[]>('navbar/showSubnavs');
const updateLastScroll = createAction<number>('navbar/updateLastScroll');

const debouncedToggle = debounce(
    (dispatch: AppDispatch, correctedShow: boolean) => dispatch(toggleNavAction(correctedShow)
), 50, { leading: true });

export const toggleNavBar = createAsyncThunk<void, boolean, ThunkAPIType>(
    'navbar/callDebouncedToggle',
    (show, thunkAPI) => {
        const correctedShow = (show !== undefined) ? show : !thunkAPI.getState().navbar.isVisible;
        if (thunkAPI.getState().navbar.isVisible !== correctedShow) {
            debouncedToggle(thunkAPI.dispatch, correctedShow);
        }
    }
);

export const toggleExpanded = createAsyncThunk<void, boolean | void, ThunkAPIType>(
    'navbar/callExpand',
    (show, thunkAPI) => {
        const correctedShow = (typeof show === 'boolean') ? show : !thunkAPI.getState().navbar.isExpanded;
        thunkAPI.dispatch(toggleExpandAction(correctedShow));
    }
);

export const showSubNav = createAsyncThunk<void, { sub?: string; isMobile?: boolean } | void, ThunkAPIType>(
    'navbar/callSub',
    (args, thunkAPI) => {
        const { sub = '', isMobile = false } = (typeof args === 'object') ? args : {};
        let showSubs = thunkAPI.getState().navbar.showSubs;
        if (isMobile) {
            if (showSubs.includes(sub)) {
                showSubs = showSubs.filter((value) => sub !== value);
            } else {
                showSubs = [...showSubs, sub];
            }
        } else {
            if (sub === '' || sub === showSubs[0]) {
                showSubs = [];
            } else {
                showSubs = [sub];
            }
        }
        thunkAPI.dispatch(showSubnavsAction(showSubs))
    }
);

export const scrollFn = (triggerHeight: number, action: (tHeight: number, top: number) => void) =>
    (event: React.UIEvent<HTMLElement> | UIEvent): void => {
        const scrollTop = (event.target as HTMLElement).scrollTop;
        action(triggerHeight, scrollTop);
    };

export const onScroll = createAsyncThunk<void, { triggerHeight: number; scrollTop: number }, ThunkAPIType>(
    'navbar/onScroll',
    ({ triggerHeight, scrollTop }, thunkAPI) => {
        const lastScrollTop = thunkAPI.getState().navbar.lastScrollTop;
        if (typeof triggerHeight === 'number') {
            const showNavBar = !(scrollTop > lastScrollTop && scrollTop > triggerHeight)
            thunkAPI.dispatch(toggleNavAction(showNavBar));
            thunkAPI.dispatch(updateLastScroll(scrollTop));
        }
    }
);

export const navBarSlice = createSlice({
    name: 'navbar',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(toggleNavAction, (state, action) => {
                state.isVisible = action.payload;
            })
            .addCase(toggleExpandAction, (state, action) => {
                state.isExpanded = action.payload;
            })
            .addCase(showSubnavsAction, (state, action) => {
                state.showSubs = action.payload;
            })
            .addCase(updateLastScroll, (state, action) => {
                state.lastScrollTop = action.payload;
            })
            .addDefaultCase(state => state);
    }
});

export const navBarReducer = navBarSlice.reducer;