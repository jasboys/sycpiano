import * as React from 'react';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';

import { SycLogo, sycLogoSize } from 'src/components/App/NavBar/SycLogo';

import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';
import { toggleExpanded } from 'src/components/App/NavBar/reducers';
import { MediaContext } from '../App';

const navBarFontSizeREM = 2.5;
const letterSpacing = 0.05;
const capitalRatio = 0.7;

interface NavBarLogoProps {
    isHome: boolean;
    isExpanded: boolean;
    specificRouteName?: string;
}

const LogoText = styled.div<{ hiDpx: boolean }>(
    noHighlight,
    {
        display: 'inline-block',
        verticalAlign: 'middle',
        lineHeight: `${navBarHeight.lowDpx}px`,
        height: navBarHeight.lowDpx,
        textTransform: 'uppercase',
        flex: '1 1 auto',
        marginLeft: 20,
    },
    ({ hiDpx }) => hiDpx && {
        lineHeight: `${navBarHeight.hiDpx}px`,
        height: navBarHeight.hiDpx,
    },
);

const StyledLink = styled(Link, {
    shouldForwardProp: prop => prop !== 'isHome' && prop !== 'isExpanded',
})<{ isHome: boolean; isExpanded: boolean }>(
    {
        display: 'inline-flex',
        fontFamily: lato2,
        fontSize: `${navBarFontSizeREM}rem`,
        letterSpacing: `${letterSpacing}rem`,
        height: '100%',
        color: logoBlue,
        transition: 'all 0.3s',
        overflow: 'hidden',
        cursor: 'pointer',
        alignItems: 'center',
        WebkitTapHighlightColor: 'transparent',

        '&:hover': {
            color: lightBlue,
        },

    },
    ({ isHome }) => (isHome) ?
        {
            fill: 'white',
            '&:hover': {
                filter: 'drop-shadow(0px 0px 4px white)',
            }
        } : {
            fill: logoBlue,
            '&:hover': {
                fill: lightBlue
            }
        },
);

const SeanChenText = styled.span({ verticalAlign: 'middle' });

const RouteText = styled.div({
    fontSize: `${navBarFontSizeREM * 0.8}rem`,
    letterSpacing: 0,
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: 10,
});

// either a string as map, or an array with full-sized map and shortened map (for screenXS)
const routeNameMapping: Record<string, string | string[]> = {
    biography: ['biography', 'bio'],
    discography: ['discography', 'discog'],
    'retrieve-purchased': 'shop',
    scores: 'shop',
    checkout: 'shop',
};

const NavBarLogo: React.FC<React.HTMLAttributes<HTMLDivElement> & NavBarLogoProps> = ({
    isHome,
    isExpanded,
    specificRouteName,
}) => {
    const dispatch = useAppDispatch();
    const { hiDpx, screenS, screenXS, isHamburger } = React.useContext(MediaContext);
    const mapped = specificRouteName && (routeNameMapping[specificRouteName] ?? specificRouteName);
    const displayName = (Array.isArray(mapped)) ? mapped[screenXS ? 1 : 0] : mapped;
    const letterCount = displayName?.length;
    const estimatedTextWidth = letterCount && letterCount * capitalRatio * navBarFontSizeREM * 0.8 + letterSpacing * (letterCount - 1);
    // 120 or 150 is logo, 20 margin, other stuff is cart + menu + 15 + 5 buffer
    const otherObjectSizes = ((sycLogoSize.get(hiDpx)) + 20 + 111);

    return (
        <StyledLink to="/" isHome={isHome} isExpanded={isExpanded} onClick={() => { dispatch(toggleExpanded(false)); }}>
            <SycLogo />
            <LogoText hiDpx={hiDpx}>
                {!isHome && !screenS && <SeanChenText>{'SEAN CHEN' + ((isHamburger) ? ' |' : '')}</SeanChenText>}
                {
                    displayName && !isHome && isHamburger &&
                    <RouteText
                        css={{ fontSize: `min(${navBarFontSizeREM * 0.8}rem, calc(${navBarFontSizeREM * 0.8} * (100vw - ${otherObjectSizes}px) / ${estimatedTextWidth}))` }}
                    >
                        {displayName}
                    </RouteText>
                }
            </LogoText>
        </StyledLink>
    );
};

export default NavBarLogo;
