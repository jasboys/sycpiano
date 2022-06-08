import * as React from 'react';

import styled from '@emotion/styled';

import { staticImage } from 'src/styles/imageUrls';
import { screenM, screenXSorPortrait } from 'src/styles/screens';
import { playlistWidth } from 'src/styles/variables';

const StyledDiv = styled.div`
    position: fixed;
    bottom: 25px;
    right: calc(${playlistWidth.desktop} * 2 / 3);
    transform: translateX(calc(100% / 3));
    z-index: 50;
    filter: drop-shadow(0 2px 2px rgba(0 0 0 / 0.3));
    transition: all 0.2s;

    &:hover {
        cursor: pointer;
        filter: drop-shadow(0 5px 5px rgba(0 0 0 / 0.3));
        transform: translateX(calc(100% / 3)) translateY(-1px) scale(1.05);
    }

    ${screenM} {
        right: calc(${playlistWidth.tablet} * 2 / 3);
    }

    ${screenXSorPortrait} {
        bottom: 10px;
        right: calc(100% * 2 / 3);
    }
`;

const StyledImg = styled.img` display: block; `;

const StyledLink = styled.a` display: block; `;

const SpotifyButton: React.FC<Record<string, unknown>> = () => (
    <StyledDiv>
        <StyledLink href={'https://open.spotify.com/artist/6kMZjx0C2LY2v2fUsaN27y?si=8Uxb9kFTQPisQCvAyOybMQ'} target="_blank" rel="noopener">
            <StyledImg width={50} height={50} src={staticImage(`/logos/spotify-color.svg`)} />
        </StyledLink>
    </StyledDiv>
);

export default SpotifyButton;
