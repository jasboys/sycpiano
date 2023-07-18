import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import Playlist from 'src/components/Media/Playlist';
import { playVideo, togglePlaylist } from 'src/components/Media/Videos/reducers';
import VideoPlaylistItem from 'src/components/Media/Videos/VideoPlaylistItem';

import { screenXS, screenPortrait } from 'src/screens';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { mqSelectors } from 'src/components/App/reducers';

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

const videoPlaylistStyle = css`
    ${toMedia([screenXS, screenPortrait])} {
        position: relative;
        overflow: visible;
    }
`;

const VideoPlaylist: React.FC<Record<never, unknown>> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const isShow = useAppSelector(({ videoPlaylist }) => videoPlaylist.isShow);
    const videos = useAppSelector(({ videoPlaylist }) => videoPlaylist.items);
    const videoId = useAppSelector(({ videoPlayer }) => videoPlayer.videoId);
    const dispatch = useAppDispatch();

    const toggleDispatch = React.useCallback((show?: boolean) => {
        dispatch(togglePlaylist(show));
    }, []);

    const playDispatch = React.useCallback((isMobile: boolean, videoId: string) => {
        dispatch(playVideo(isMobile, videoId));
    }, []);

    return (
        <StyledPlaylistContainer>
            <Playlist
                extraStyles={{ div: videoPlaylistStyle }}
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
