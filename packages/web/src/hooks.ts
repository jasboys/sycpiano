import {
    useDispatch,
    useSelector,
    type TypedUseSelectorHook,
} from 'react-redux';
import type { AppDispatch, GlobalStateShape } from 'src/store.js';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<GlobalStateShape> =
    useSelector;
