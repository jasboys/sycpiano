import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import MusicPlaylistItem from 'src/components/Media/Music/MusicPlaylistItem';
import ShuffleButton from 'src/components/Media/Music/ShuffleButton';
import SpotifyButton from 'src/components/Media/Music/SpotifyButton';
import { MusicFileItem } from 'src/components/Media/Music/types';
import Playlist from 'src/components/Media/Playlist';
import { useAppSelector } from 'src/hooks';
import { screenPortrait, screenXS } from 'src/screens';
import { playlistBackground } from 'src/styles/colors';

interface MusicPlaylistOwnProps {
    readonly currentTrackId: string;
    readonly onClick: (item: MusicFileItem) => void;
    readonly play: () => void;
    readonly userInteracted: boolean;
    readonly toggleShuffle: () => void;
    readonly isShuffle: boolean;
}

type MusicPlaylistProps = MusicPlaylistOwnProps;

const musicPlaylistStyle = css({
    position: 'initial',
    [toMedia([screenXS, screenPortrait])]: {
        top: 360,
        position: 'relative',
        overflow: 'visible',
    },
});

const musicULStyle = css({
    backgroundColor: playlistBackground,
    paddingBottom: 80,
    [toMedia([screenXS, screenPortrait])]: {
        paddingBottom: 60,
    },
});

const PlaylistContainer = styled.div({
    width: 'fit-content',
    height: '100%',
    right: 0,
    position: 'absolute',
    [toMedia([screenXS, screenPortrait])]: {
        width: '100%',
        height: 'auto',
        position: 'unset',
        right: 'unset',
    },
});

const MusicPlaylist: React.FC<MusicPlaylistProps> = ({
    onClick,
    currentTrackId,
    play,
    userInteracted,
    isShuffle,
    toggleShuffle,
}) => {
    const didRun = React.useRef<boolean>(false);
    const items = useAppSelector(({ audioPlaylist }) => audioPlaylist.items);

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
            <ShuffleButton onClick={toggleShuffle} on={isShuffle} />
        </PlaylistContainer>
    );
};

export default MusicPlaylist;
