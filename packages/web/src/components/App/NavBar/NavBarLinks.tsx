import styled from '@emotion/styled';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import NavBarLink from 'src/components/App/NavBar/NavBarLink';
import { links } from 'src/components/App/NavBar/links';
import { LinkShape, NavBarLinksProps } from 'src/components/App/NavBar/types';
import { hiDpx } from 'src/screens';
import { noHighlight, pushedHelper } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';

const StyledUL = styled.ul<{ isHamburger: boolean }>(
    {
        padding: 0,
        margin: 0,
    },
    ({ isHamburger }) =>
        isHamburger && {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            paddingTop: '1.8rem',
            overflow: 'hidden auto',
            alignItems: 'flex-end',
        },
);

const getGradientStops = (
    startPos: number | string,
    startUnit: string,
    stopPos: number | string,
    stopUnit: string,
    num: number,
) => {
    const stops = new Array(num)
        .fill(0)
        .map((_, idx) => {
            const stop = `calc(${startPos}${startUnit} + (${stopPos}${stopUnit} - ${startPos}${startUnit}) * ${idx} / ${num})`;
            const alphaScale = 0.5 * (Math.cos(Math.PI * (idx / num)) + 1);
            return `rgba(255 255 255 / ${alphaScale}) ${stop}`;
        })
        .join(', ');
    return `${stops}, rgba(255 255 255 / 0.0) ${stopPos}${stopUnit}`;
};

const gradient = getGradientStops(180, 'px', 'min(100%, 400px)', '', 12);

const LinksDiv = styled.div<{ isHome: boolean; isHamburger: boolean }>(
    noHighlight,
    {
        textTransform: 'uppercase',
        // transition: 'backdrop-filter 0.2s'
    },
    ({ isHamburger, isHome }) =>
        isHamburger && {
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            boxShadow: 'inset 0 7px 6px -5px rgba(0, 0, 0, 0.25)',
            backdropFilter: isHome ? 'none' : 'blur(1px)',
            overflowY: 'auto',
            background: isHome
                ? 'transparent'
                : `linear-gradient(-90deg, ${gradient})`,
        },
    ({ isHamburger }) => isHamburger && pushedHelper(navBarHeight.lowDpx, 'vh'),
    ({ isHamburger }) =>
        isHamburger && {
            [toMedia(hiDpx)]: pushedHelper(navBarHeight.hiDpx, 'vh'),
        },
);

const NavBarLinks: React.FC<NavBarLinksProps> = ({
    specificPath,
    currentBasePath,
    isHamburger,
}) => (
    <LinksDiv isHome={specificPath === ''} isHamburger={isHamburger}>
        <StyledUL isHamburger={isHamburger}>
            {links.map((link: LinkShape) => {
                return (
                    <NavBarLink
                        key={link.path}
                        link={link}
                        subNavLinks={link.subLinks}
                        active={link.path === currentBasePath}
                        currentSpecificPath={specificPath}
                        isHome={specificPath === ''}
                        isHamburger={isHamburger}
                    />
                );
            })}
        </StyledUL>
    </LinksDiv>
);

const MemoizedLinks = React.memo(NavBarLinks);

export default MemoizedLinks;
