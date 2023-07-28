import * as React from 'react';

import styled from '@emotion/styled';

import { staticImage } from 'src/imageUrls';
import { screenM, screenPortrait, screenXS } from 'src/screens';
import { playlistWidth } from 'src/styles/variables';
import { toMedia } from 'src/MediaQuery';

const StyledDiv = styled.div`
    position: fixed;
    bottom: 25px;
    right: 150px;
    transform: translateX(50%);
    z-index: 50;
    filter: drop-shadow(0 2px 2px rgba(0 0 0 / 0.3));
    transition: all 0.1s;

    &:hover {
        cursor: pointer;
        filter: drop-shadow(0 5px 5px rgba(0 0 0 / 0.3));
        transform: translateX(50%) translateY(-1px) scale(1.05);
    }

    a img {
        display: block;
    }

    ${toMedia(screenM)} {
        right: calc(${playlistWidth.tablet} / 2);
    }

    ${toMedia([screenXS, screenPortrait])} {
        bottom: 10px;
        right: 50%;
    }
`;

const StyledLink = styled.a({ display: 'block' });

const StyledImg = styled.img({ display: 'block' });

const DropboxButton: React.FC<unknown> = () => (
    <StyledDiv>
        <StyledLink href="https://www.dropbox.com/sh/pzou7yeukjktznn/AADNCU7fmgUy_vmA3WioLiria?dl=0" target="_blank" rel="noopener">
            <StyledImg width={50} height={50} src={staticImage(`/logos/dropbox.svg`)} />
        </StyledLink>
    </StyledDiv>
);

export default DropboxButton;
