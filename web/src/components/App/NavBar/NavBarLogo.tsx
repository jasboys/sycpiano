import * as React from 'react';
import { useMedia } from 'react-media';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';

import { SycLogo } from 'src/components/App/NavBar/SycLogo';

import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato2 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { screenBreakPoints } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';
import { toggleExpanded } from 'src/components/App/NavBar/reducers';

const navBarFontSizeREM = 2.5;
const letterSpacing = 0.05;
const capitalRatio = 0.7;

interface NavBarLogoProps {
    isHome: boolean;
    isExpanded: boolean;
    specificRouteName?: string;
}

const LogoText = styled.div<{ isMobile: boolean }>(
    noHighlight,
    {
        display: 'inline-block',
        verticalAlign: 'middle',
        lineHeight: `${navBarHeight.desktop}px`,
        height: navBarHeight.desktop,
        textTransform: 'uppercase',
        flex: '1 1 auto',

        screenXSorPortrait: {
            marginLeft: 0,
            lineHeight: navBarHeight.mobile,
            height: navBarHeight.mobile,
        },
    },
    ({ isMobile }) => !isMobile && {
        marginLeft: 20,
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
    ({ isHome, isExpanded }) => (isHome) ?
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

const SeanChenText = styled.span` vertical-align: middle; `;

const RouteText = styled.div({
    fontSize: `${navBarFontSizeREM * 0.8}rem`,
    letterSpacing: 0,
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: 10,
});

const routeNameMapping: Record<string, string> = {
    biography: 'bio',
    discography: 'discog',
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
    const { xs, medium } = useMedia({ queries: screenBreakPoints });
    const displayName = specificRouteName && ((xs && routeNameMapping[specificRouteName]) || specificRouteName);
    const letterCount = displayName?.length;
    const estimatedTextWidth = letterCount && letterCount * capitalRatio * navBarFontSizeREM * 0.8 + letterSpacing * (letterCount - 1);
    const otherObjectSizes = (xs || medium) && ((xs ? 120 : 150) + (xs ? 0 : 20) + 111);   // other stuff 56 + 35 + 15 + 5 buffer

    return (
        <StyledLink to="/" isHome={isHome} isExpanded={isExpanded} onClick={() => { dispatch(toggleExpanded(false)); }}>
            <SycLogo />
            <LogoText isMobile={xs}>
                {!isHome && !xs && <SeanChenText>{'SEAN CHEN' + (medium ? ' |' : '')}</SeanChenText>}
                {
                    displayName &&
                    !isHome &&
                    (xs || medium) &&
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
