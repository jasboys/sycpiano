import * as videos from 'src/components/Media/Videos/reducers';
import Videos from 'src/components/Media/Videos/Videos';

export const Component = Videos;
export const reducers = {
    videoPlayer: videos.videoPlayerReducer,
    videoPlaylist: videos.videoPlaylistReducer,
};
