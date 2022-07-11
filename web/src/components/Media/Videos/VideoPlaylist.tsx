import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import Playlist from 'src/components/Media/Playlist';
import { playVideo, togglePlaylist } from 'src/components/Media/Videos/reducers';
import VideoPlaylistItem from 'src/components/Media/Videos/VideoPlaylistItem';

import { screenXSorPortrait } from 'src/styles/screens';
import { useAppDispatch, useAppSelector } from 'src/hooks';

// interface VideoPlaylistStateToProps {
//     readonly videos: VideoItemShape[];
//     readonly videoId: string;
//     readonly isShow: boolean;
// }

// interface VideoPlaylistDispatchToProps {
//     readonly playVideo: typeof playVideo;
//     readonly togglePlaylistAction: typeof togglePlaylistAction;
// }

interface VideoPlaylistProps {
    readonly isMobile: boolean;
}

// type VideoPlaylistProps = VideoOwnProps & VideoPlaylistStateToProps & VideoPlaylistDispatchToProps;

const StyledPlaylistContainer = styled.div`
    width: fit-content;
    height: 100%;
    right: 0;
    position: absolute;

    ${screenXSorPortrait} {
        width: 100%;
        height: calc(100% - 56.25vw);
        top: 56.25vw;
        position: relative;
        right: unset;
        z-index: 0;
    }
`;

const videoPlaylistStyle = css`
    ${screenXSorPortrait} {
        position: relative;
        overflow: visible;
    }
`;

const VideoPlaylist: React.FC<VideoPlaylistProps> = (props) => {
    const isShow = useAppSelector(({ videoPlaylist }) => videoPlaylist.isShow);
    const videos = useAppSelector(({ videoPlaylist }) => videoPlaylist.items);
    const videoId = useAppSelector(({ videoPlayer }) => videoPlayer.videoId);
    const dispatch = useAppDispatch();

    const toggleDispatch = (show?: boolean) => {
        dispatch(togglePlaylist(show));
    };

    const playDispatch = (isMobile: boolean, videoId: string) => {
        dispatch(playVideo(isMobile, videoId));
    };

    return (
        <StyledPlaylistContainer>
            <Playlist
                extraStyles={{ div: videoPlaylistStyle }}
                isShow={isShow}
                hasToggler={!props.isMobile}
                togglePlaylist={toggleDispatch}
                shouldAppear={false}
                isMobile={props.isMobile}
            >
                {videos.map((video) => (
                    <VideoPlaylistItem
                        key={video.id}
                        item={video}
                        currentItemId={videoId}
                        onClick={playDispatch}
                        isMobile={props.isMobile}
                    />
                ))}
            </Playlist>
        </StyledPlaylistContainer>
    );
};

export default VideoPlaylist;
