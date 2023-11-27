import Music from 'src/components/Media/Music/Music';
import * as music from 'src/components/Media/Music/reducers';

export const Component = Music;
export const reducers = {
    musicPlayer: music.musicPlayerReducer,
};
