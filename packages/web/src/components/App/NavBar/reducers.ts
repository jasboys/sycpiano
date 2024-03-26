import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import debounce from 'lodash-es/debounce';
import type { NavBarStateShape } from 'src/components/App/NavBar/types';

import { findParent } from 'src/components/App/NavBar/links';
import type { AppDispatch } from 'src/store';
import type { ThunkAPIType } from 'src/types';

const SCROLL_THRESHOLD = 10;

const initialState: NavBarStateShape = {
    isVisible: true,
    isExpanded: false,
    showSubs: [],
    lastScrollTop: 0,
    visiblePending: false,
    specificRouteName: '',
};

const toggleNavAction = createAction<boolean | undefined>('navbar/toggleNav');
const toggleExpandAction = createAction<boolean>('navbar/toggleExpanded');
const showSubnavsAction = createAction<string[]>('navbar/showSubnavs');
const updateLastScroll = createAction<number>('navbar/updateLastScroll');
export const setSpecificRouteNameAction = createAction<string>(
    'navbar/setSpecificRouteName',
);

const debouncedToggle = debounce(
    (dispatch: AppDispatch, correctedShow: boolean) =>
        dispatch(toggleNavAction(correctedShow)),
    50,
    { leading: true },
);

export const toggleNavBar = createAsyncThunk<void, boolean, ThunkAPIType>(
    'navbar/callDebouncedToggle',
    (show, thunkAPI) => {
        const correctedShow =
            show !== undefined ? show : !thunkAPI.getState().navbar.isVisible;
        if (thunkAPI.getState().navbar.isVisible !== correctedShow) {
            debouncedToggle(thunkAPI.dispatch, correctedShow);
        }
    },
);

export const toggleExpanded = createAsyncThunk<
    void,
    boolean | undefined,
    ThunkAPIType
>('navbar/callExpand', (show, thunkAPI) => {
    const correctedShow =
        typeof show === 'boolean'
            ? show
            : !thunkAPI.getState().navbar.isExpanded;
    const parentToExpand = findParent(
        thunkAPI.getState().navbar.specificRouteName,
    )?.name;
    // Expand the parent menu of current sub link
    if (correctedShow && parentToExpand !== undefined) {
        thunkAPI.dispatch(showSubnavsAction([parentToExpand]));
    }
    thunkAPI.dispatch(toggleExpandAction(correctedShow));
});

export const showSubNav = createAsyncThunk<
    void,
    { sub?: string; isHamburger?: boolean } | undefined,
    ThunkAPIType
>(
    'navbar/callSub',
    (args, thunkAPI) => {
        const { sub = '', isHamburger = false } =
            typeof args === 'object' ? args : {};
        let showSubs = thunkAPI.getState().navbar.showSubs;
        if (isHamburger) {
            if (sub === '') {
                showSubs = [];
            } else if (showSubs.includes(sub)) {
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
        thunkAPI.dispatch(showSubnavsAction(showSubs));
    },
    {
        condition: (_, { getState }) => {
            if (getState().navbar.visiblePending) {
                return false;
            }
        },
    },
);

export const scrollFn =
    (triggerHeight: number, action: (tHeight: number, top: number) => void) =>
    (event: React.UIEvent<HTMLElement> | UIEvent): void => {
        const scrollTop = (event.target as HTMLElement).scrollTop;
        action(triggerHeight, scrollTop);
    };

export const onScroll = createAsyncThunk<
    void,
    { triggerHeight: number; scrollTop: number },
    ThunkAPIType
>(
    'navbar/onScroll',
    ({ triggerHeight, scrollTop }, thunkAPI) => {
        const lastScrollTop = thunkAPI.getState().navbar.lastScrollTop;
        const showNavBar = !(
            scrollTop > lastScrollTop && scrollTop > triggerHeight
        );
        if (showNavBar !== thunkAPI.getState().navbar.isVisible) {
            thunkAPI.dispatch(toggleNavAction());
        }
        thunkAPI.dispatch(updateLastScroll(scrollTop));
    },
    {
        condition: ({ triggerHeight, scrollTop }, { getState }) => {
            const lastScrollTop = getState().navbar.lastScrollTop;
            return (
                typeof triggerHeight === 'number' &&
                Math.abs(scrollTop - lastScrollTop) > SCROLL_THRESHOLD
            );
        },
    },
);

export const navBarSlice = createSlice({
    name: 'navbar',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(setSpecificRouteNameAction, (state, action) => {
                state.specificRouteName = action.payload;
            })
            .addCase(showSubNav.pending, (state, _) => {
                state.visiblePending = true;
            })
            .addCase(showSubNav.fulfilled, (state, _) => {
                state.visiblePending = false;
            })
            .addCase(showSubNav.rejected, (state, _) => {
                state.visiblePending = false;
            })
            .addCase(toggleNavAction, (state, action) => {
                state.isVisible = action.payload ?? !state.isVisible;
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
            .addDefaultCase((state) => state);
    },
});

export const navBarReducer = navBarSlice.reducer;
