import * as React from 'react';

import styled from '@emotion/styled';

import { lightBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { staticImage } from 'src/imageUrls';
import { screenXSorPortrait } from 'src/styles/screens';

const StyledDiv = styled.div`
    position: fixed;
    bottom: 25px;
    right: calc(45vw / 2);
    width: fit-content;
    z-index: 50;
    filter: drop-shadow(0 2px 2px rgba(0 0 0 / 0.3));
    transform: translateX(50%);
    background-color: ${lightBlue};
    border-radius: 30px;
    transition: all 0.1s;

    &:hover {
        cursor: pointer;
        filter: drop-shadow(0 5px 5px rgba(0 0 0 / 0.3));
        transform: translateX(50%) translateY(-1px) scale(1.05);
    }

    a img {
        display: block;
    }

    ${screenXSorPortrait} {
        bottom: 10px;
        right: 50%;
    }
`;

const StyledLink = styled.a({
    display: 'flex',
    alignItems: 'center',
});

const StyledText = styled.span({
    fontFamily: lato2,
    fontSize: '1.25rem',
    color: 'white',
    marginLeft: '1rem',
    flex: '0 1 auto',
});

const StyledImg = styled.img({ flex: '0 1 auto', marginRight: '0.2rem' });

const PortfolioButton: React.FC<unknown> = () => (
    <StyledDiv>
        <StyledLink href="https://www.dropbox.com/sh/zv4q9qchzn83i4q/AABecbr-vlVemO-nrHeHyCVQa?dl=0" target="_blank" rel="noopener">
            <StyledText>Repertoire</StyledText>
            <StyledImg width={50} height={50} src={staticImage(`/logos/dropbox-nobg.svg`)} />
        </StyledLink>
    </StyledDiv>
);

const MemoizedButton = React.memo(PortfolioButton, () => true);

export default MemoizedButton;
