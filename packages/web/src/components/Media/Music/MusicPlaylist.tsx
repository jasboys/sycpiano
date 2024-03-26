import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import { createSelector } from 'reselect';
import { mqSelectors } from 'src/components/App/reducers.js';
import MusicPlaylistItem from 'src/components/Media/Music/MusicPlaylistItem';
import ShuffleButton from 'src/components/Media/Music/ShuffleButton';
import SpotifyButton from 'src/components/Media/Music/SpotifyButton';
import Playlist from 'src/components/Media/Playlist';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { hiDpx, screenPortrait } from 'src/screens';
import type { GlobalStateShape } from 'src/store.js';
import { playlistBackground } from 'src/styles/colors';
import { toggleShuffleAction } from './reducers.js';
import type { MusicFileItem } from './types.js';

interface MusicPlaylistOwnProps {
    readonly onClick: (item: MusicFileItem, fade?: boolean) => void;
}

type MusicPlaylistProps = MusicPlaylistOwnProps;

const musicPlaylistStyle = css({
    position: 'initial',
    [toMedia(screenPortrait)]: {
        position: 'relative',
        overflow: 'visible',
    },
});

const musicULStyle = css({
    backgroundColor: playlistBackground,
    paddingBottom: 80,
    [toMedia(screenPortrait)]: {
        paddingBottom: 60,
    },
});

const PlaylistContainer = styled.div({
    width: 'fit-content',
    height: '100%',
    right: 0,
    position: 'absolute',
    top: 0,
    [toMedia(screenPortrait)]: {
        width: '100%',
        height: 'auto',
        position: 'relative',
        right: 'unset',
        // top: navBarHeight.lowDpx,
        [toMedia(hiDpx)]: {
            // top: navBarHeight.hiDpx,
        },
    },
});

const selector = createSelector(
    (state: GlobalStateShape) => state.musicPlayer,
    ({ currentTrack, isShuffle, items }) => ({
        currentTrack,
        isShuffle,
        items,
    }),
);

const MusicPlaylist: React.FC<MusicPlaylistProps> = ({ onClick }) => {
    const didRun = React.useRef<boolean>(false);
    const { currentTrack, isShuffle, items } = useAppSelector(selector);
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const dispatch = useAppDispatch();

    const currentTrackId = currentTrack?.id;

    React.useEffect(() => {
        if (didRun.current === false) {
            if (items.length && currentTrackId) {
                !isHamburger &&
                    document.getElementById(currentTrackId)?.scrollIntoView();
                didRun.current = true;
            }
        }
    }, [items, currentTrackId, isHamburger]);

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
                    />
                ))}
            </Playlist>
            <SpotifyButton />
            <ShuffleButton
                onClick={() => dispatch(toggleShuffleAction())}
                on={isShuffle}
            />
        </PlaylistContainer>
    );
};

export default React.memo(MusicPlaylist);
