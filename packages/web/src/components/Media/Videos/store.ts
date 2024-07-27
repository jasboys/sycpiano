import youTube from 'src/services/YouTube';

import type { VideoPlayerStateShape } from 'src/components/Media/Videos/types';
import { zustandMiddlewareOptions } from 'src/utils';
import { createStore } from 'zustand-x';

const videoPlayerInitialState: VideoPlayerStateShape = {
    isPlayerReady: false,
    videoId: '',
    isPreviewOverlay: false,
    isPlaying: false,
    playlistVisible: true,
};

export const videoStore = createStore('videoPlayer')(
    videoPlayerInitialState,
    zustandMiddlewareOptions,
)
    .extendActions((set, _get, _api) => ({
        playerIsReady: () => {
            set.state((state) => {
                state.isPlayerReady = true;
                state.isPreviewOverlay = true;
            });
        },
        resetPlayer: () => {
            set.state((state) => {
                state.isPlayerReady = false;
                state.videoId = '';
                state.isPlaying = false;
                state.isPreviewOverlay = false;
            });
        },
        togglePlaylist: (show?: boolean) => {
            set.state((state) => {
                state.playlistVisible =
                    show === undefined ? !state.playlistVisible : show;
            });
        },
    }))
    .extendActions((set, get, _api) => ({
        playVideo: async (videoId?: string, isMobile?: boolean) => {
            if (!isMobile) {
                setTimeout(() => set.togglePlaylist(false), 500);
            }
            if (get.isPlaying() && videoId === get.videoId()) {
                return;
            }
            const vid = videoId ? videoId : get.videoId();
            await youTube.loadVideoById(vid, true);
            set.state((state) => {
                state.videoId = vid;
                state.isPlayerReady = true;
                state.isPreviewOverlay = false;
            });
        },
    }));
