import * as React from 'react';

import styled from '@emotion/styled';

import { lightBlue, playlistBackground } from 'src/styles/colors';
import { noHighlight } from 'src/styles/mixins';
import { playlistTogglerWidth } from 'src/styles/variables';
import { SerializedStyles } from '@emotion/react';

const playlistTogglerHeight = playlistTogglerWidth * 1.8;

const StyledToggler = styled.div({
    flexBasis: playlistTogglerWidth,
    alignSelf: 'center',
    // borderTopLeftRadius: playlistTogglerHeight,
    // borderBottomLeftRadius: playlistTogglerHeight,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    lineHeight: `${playlistTogglerHeight + 1}px`,
    height: playlistTogglerHeight,
    textAlign: 'center',
    backgroundColor: playlistBackground,
    color: '#000',
    transition: 'all 0.15s',

    '&:hover': {
        // backgroundColor: 'rgba(255, 255, 255, 1)',
        backgroundColor: lightBlue,
        color: 'white',
        cursor: 'pointer',
    },

    zIndex: 50,
    noHighlight
});

interface PlaylistTogglerProps {
    readonly onClick: () => void;
    readonly isPlaylistVisible: boolean;
    readonly style?: SerializedStyles;
}

const PlaylistToggler: React.FC<PlaylistTogglerProps> = ({ onClick, isPlaylistVisible, style }) => (
    <StyledToggler css={style} onClick={onClick}>
        {isPlaylistVisible ? '\u25B6' : '\u25C0'}
    </StyledToggler>
);

export default PlaylistToggler;
