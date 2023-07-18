import Bio from 'src/components/About/Bio/Bio';
import * as bio from 'src/components/About/Bio/reducers';

export const Component = Bio;
export const reducers = {
    bio: bio.bioReducer,
};
