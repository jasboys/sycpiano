import * as React from 'react';
import { useSelector } from 'react-redux';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import MusicPlaylistItem from 'src/components/Media/Music/MusicPlaylistItem';
import ShuffleButton from 'src/components/Media/Music/ShuffleButton';
import SpotifyButton from 'src/components/Media/Music/SpotifyButton';
import Playlist from 'src/components/Media/Playlist';

import { MusicFileItem } from 'src/components/Media/Music/types';
import { GlobalStateShape } from 'src/store';

import { playlistBackground } from 'src/styles/colors';
import { screenXSorPortrait } from 'src/styles/screens';
import { createSelector } from '@reduxjs/toolkit';

interface MusicPlaylistOwnProps {
    readonly currentTrackId: string;
    readonly onClick: (item: MusicFileItem) => void;
    readonly play: () => void;
    readonly isMobile: boolean;
    readonly userInteracted: boolean;
    readonly toggleShuffle: () => void;
    readonly isShuffle: boolean;
}

type MusicPlaylistProps = MusicPlaylistOwnProps;

const musicPlaylistStyle = css`
    position: initial;

    ${screenXSorPortrait} {
        top: 360px;
        position: relative;
        overflow: visible;
    }
`;

const musicULStyle = css`
    background-color: ${playlistBackground};
    padding-bottom: 80px;

    ${screenXSorPortrait} {
        padding-bottom: 60px;
    }
`;

const PlaylistContainer = styled.div`
    width: fit-content;
    height: 100%;
    right: 0;
    position: absolute;

    ${screenXSorPortrait} {
        width: 100%;
        height: auto;
        position: unset;
        right: unset;
    }
`;

const selectItems = createSelector(
    (state: GlobalStateShape) => state.audioPlaylist,
    (audioPlaylist) => audioPlaylist.items
);

const MusicPlaylist: React.FC<MusicPlaylistProps> = ({
    isMobile,
    // items,
    onClick,
    currentTrackId,
    play,
    userInteracted,
    isShuffle,
    toggleShuffle,
}) => {
    const didRun = React.useRef<boolean>(false);
    const items = useSelector(selectItems);

    React.useEffect(() => {
        if (didRun.current === false) {
            if (items.length && currentTrackId) {
                document.getElementById(currentTrackId)?.scrollIntoView();
                didRun.current = true;
            }
        }
    }, [items, currentTrackId]);

    return (
        <PlaylistContainer>
            <Playlist
                extraStyles={{ div: musicPlaylistStyle, ul: musicULStyle }}
                isShow={true}
                hasToggler={false}
                shouldAppear={false}
                isMobile={isMobile}
            >
                {items.map((item) => (
                    <MusicPlaylistItem
                        key={item.id}
                        item={item}
                        onClick={onClick}
                        currentItemId={currentTrackId}
                        play={play}
                        userInteracted={userInteracted}
                    />
                ))}
            </Playlist>
            <SpotifyButton />
            <ShuffleButton isMobile={isMobile} onClick={toggleShuffle} on={isShuffle} />
        </PlaylistContainer>
    );
};

export default MusicPlaylist;

// const mapStateToProps = ({ audioPlaylist }: GlobalStateShape) => ({
//     items: audioPlaylist.items,
// });

// export default connect<MusicPlaylistStateToProps, unknown, MusicPlaylistOwnProps>(
//     mapStateToProps,
//     null,
// )(MusicPlaylist);
