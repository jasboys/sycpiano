import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import { mqSelectors } from 'src/components/App/reducers';
import Playlist from 'src/components/Media/Playlist';
import VideoPlaylistItem from 'src/components/Media/Videos/VideoPlaylistItem';
import {
    playVideo,
    togglePlaylist,
} from 'src/components/Media/Videos/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts.js';

const StyledPlaylistContainer = styled.div`
    width: fit-content;
    height: 100%;
    right: 0;
    position: absolute;

    ${toMedia([screenXS, screenPortrait])} {
        width: 100%;
        height: calc(100% - 56.25vw);
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

const VideoPlaylist: React.FC<Record<never, unknown>> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const isShow = useAppSelector(({ videoPlaylist }) => videoPlaylist.isShow);
    const videos = useAppSelector(({ videoPlaylist }) => videoPlaylist.items);
    const videoId = useAppSelector(({ videoPlayer }) => videoPlayer.videoId);
    const dispatch = useAppDispatch();

    const toggleDispatch = React.useCallback((show?: boolean) => {
        dispatch(togglePlaylist(show));
    }, []);

    const playDispatch = React.useCallback(
        (isMobile: boolean, videoId: string) => {
            dispatch(playVideo(isMobile, videoId));
        },
        [],
    );

    return (
        <StyledPlaylistContainer>
            <Playlist
                extraStyles={{
                    div: videoPlaylistStyle,
                    ul: videoULStyle,
                    toggler: videoULStyle,
                }}
                isShow={isShow}
                hasToggler={!isHamburger}
                togglePlaylist={toggleDispatch}
                shouldAppear={false}
            >
                {videos.map((video) => (
                    <VideoPlaylistItem
                        key={video.id}
                        item={video}
                        currentItemId={videoId}
                        onClick={playDispatch}
                        isMobile={isHamburger}
                    />
                ))}
            </Playlist>
        </StyledPlaylistContainer>
    );
};

export default VideoPlaylist;
