import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import Playlist from 'src/components/Media/Playlist';
import VideoPlaylistItem from 'src/components/Media/Videos/VideoPlaylistItem';
import { videoStore } from 'src/components/Media/Videos/store.js';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts.js';
import type { VideoItemShape } from './types.js';
import { rootStore } from 'src/store.js';

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
    const { screenLandscape, screenPortrait } =
        rootStore.mediaQueries.useTrackedStore();
    const playlistVisible = videoStore.use.playlistVisible();
    const videoId = videoStore.use.videoId();

    const toggleAction = React.useCallback((show?: boolean) => {
        videoStore.set.togglePlaylist(show);
    }, []);

    const playAction = React.useCallback(
        (videoId: string) => {
            videoStore.set.playVideo(videoId, screenPortrait);
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
