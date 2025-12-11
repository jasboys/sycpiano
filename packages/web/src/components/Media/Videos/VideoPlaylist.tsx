import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import Playlist from 'src/components/Media/Playlist';
import VideoPlaylistItem from 'src/components/Media/Videos/VideoPlaylistItem';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts.js';
import type { VideoItemShape } from './types.js';
import { mediaQueriesAtoms } from 'src/components/App/store.js';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { videoPlayerActions, videoPlayerAtoms } from './store.js';

const StyledPlaylistContainer = styled.div`
    width: fit-content;
    height: 100%;
    right: 0;
    position: absolute;

    ${toMedia(screenPortrait)} {
        width: 100%;
        height: 100%;
        top: 56.25vw;
        position: relative;
        right: unset;
        z-index: 0;
    }
`;

const videoPlaylistStyle = css(latoFont(300), {
    [toMedia([screenXS, screenPortrait])]: {
        position: 'relative',
        overflow: 'visible',
    },
});

const videoULStyle = css({
    backgroundColor: 'rgba(255 255 255 / 0.9)',
    backdropFilter: 'blur(5px)',
    [toMedia([screenXS, screenPortrait])]: {
        backgroundColor: 'rgba(255 255 255 / 0.95)',
        backdropFilter: 'none',
    },
});

const VideoPlaylist: React.FC<{ videos?: VideoItemShape[] }> = ({ videos }) => {
    const screenLandscape = useAtomValue(mediaQueriesAtoms.screenLandscape);
    const screenPortrait = useAtomValue(mediaQueriesAtoms.screenPortrait);
    const [playlistVisible, togglePlaylist] = useAtom(
        videoPlayerAtoms.playlistVisible,
    );
    const playVideo = useSetAtom(videoPlayerActions.playVideo);
    const videoId = useAtomValue(videoPlayerAtoms.videoId);

    const toggleAction = React.useCallback((show?: boolean) => {
        togglePlaylist(show);
    }, []);

    const playAction = React.useCallback(
        (videoId: string) => {
            playVideo(videoId, screenPortrait);
        },
        [screenPortrait],
    );

    return (
        <StyledPlaylistContainer>
            <Playlist
                extraStyles={{
                    div: videoPlaylistStyle,
                    ul: videoULStyle,
                    toggler: videoULStyle,
                }}
                isShow={playlistVisible}
                hasToggler={screenLandscape}
                togglePlaylist={toggleAction}
                shouldAppear={false}
            >
                {videos?.map((video) => (
                    <VideoPlaylistItem
                        key={video.id}
                        item={video}
                        currentItemId={videoId}
                        onClick={playAction}
                    />
                ))}
            </Playlist>
        </StyledPlaylistContainer>
    );
};

export default VideoPlaylist;
