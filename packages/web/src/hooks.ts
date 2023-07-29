import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, GlobalStateShape } from 'src/store.js';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<GlobalStateShape> =
    useSelector;
