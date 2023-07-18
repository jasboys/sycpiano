import Discs from 'src/components/About/Discs/Discs';
import * as discs from 'src/components/About/Discs/reducers';

export const Component = Discs;
export const reducers = {
    discs: discs.discsReducer,
};
