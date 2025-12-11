import youTube from 'src/services/YouTube';

import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import type { VideoPlayerStateShape } from 'src/components/Media/Videos/types';
import { partialAtomGetter, toAtoms } from 'src/store';

const videoPlayerInitialState: VideoPlayerStateShape = {
    isPlayerReady: false,
    videoId: '',
    isPreviewOverlay: false,
    isPlaying: false,
    playlistVisible: true,
};

const videoPlayerStore = atomWithImmer(videoPlayerInitialState);

const { toToggleAtom, toWriteAtom } = partialAtomGetter(videoPlayerStore);

export const videoPlayerAtoms = {
    ...toAtoms(videoPlayerStore),
    videoId: toWriteAtom('videoId'),
    playlistVisible: toToggleAtom('playlistVisible'),
};

export const videoPlayerActions = {
    playerIsReady: atom(null, (_get, set) => {
        set(videoPlayerStore, (draft) => {
            draft.isPlayerReady = true;
            draft.isPreviewOverlay = true;
        });
    }),
    resetPlayer: atom(null, (_get, set) => {
        set(videoPlayerStore, (draft) => {
            draft.isPlayerReady = false;
            draft.isPreviewOverlay = false;
            draft.videoId = '';
            draft.isPlayerReady = false;
        });
    }),
    playVideo: atom(
        null,
        async (get, set, videoId?: string, isMobile?: boolean) => {
            if (!isMobile) {
                setTimeout(
                    () => set(videoPlayerAtoms.playlistVisible, false),
                    500,
                );
            }
            if (
                get(videoPlayerAtoms.isPlaying) &&
                videoId === get(videoPlayerAtoms.videoId)
            ) {
                return;
            }
            const vid = videoId ?? get(videoPlayerAtoms.videoId);
            await youTube.loadVideoById(vid, true);
            set(videoPlayerStore, (draft) => {
                draft.videoId = vid;
                draft.isPlayerReady = true;
                draft.isPreviewOverlay = false;
            });
        },
    ),
};

// export const videoStore = createStore('videoPlayer')(
//     videoPlayerInitialState,
//     zustandMiddlewareOptions,
// )
//     .extendActions((set, _get, _api) => ({
//         playerIsReady: () => {
//             set.state((state) => {
//                 state.isPlayerReady = true;
//                 state.isPreviewOverlay = true;
//             });
//         },
//         resetPlayer: () => {
//             set.state((state) => {
//                 state.isPlayerReady = false;
//                 state.videoId = '';
//                 state.isPlaying = false;
//                 state.isPreviewOverlay = false;
//             });
//         },
//         togglePlaylist: (show?: boolean) => {
//             set.state((state) => {
//                 state.playlistVisible =
//                     show === undefined ? !state.playlistVisible : show;
//             });
//         },
//     }))
//     .extendActions((set, get, _api) => ({
//         playVideo: async (videoId?: string, isMobile?: boolean) => {
//             if (!isMobile) {
//                 setTimeout(() => set.togglePlaylist(false), 500);
//             }
//             if (get.isPlaying() && videoId === get.videoId()) {
//                 return;
//             }
//             const vid = videoId ? videoId : get.videoId();
//             await youTube.loadVideoById(vid, true);
//             set.state((state) => {
//                 state.videoId = vid;
//                 state.isPlayerReady = true;
//                 state.isPreviewOverlay = false;
//             });
//         },
//     }));
