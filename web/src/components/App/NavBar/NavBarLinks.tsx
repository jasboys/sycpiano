import styled from '@emotion/styled';
import * as React from 'react';

import { LinkShape, NavBarLinksProps } from 'src/components/App/NavBar/types';

import { links } from 'src/components/App/NavBar/links';
import NavBarLink from 'src/components/App/NavBar/NavBarLink';

import { noHighlight, pushedHelper } from 'src/styles/mixins';
import { screenMorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';

const StyledUL = styled.ul({
    padding: 0,
    margin: 0,

    [screenMorPortrait]: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingTop: '1.8rem',
        overflowY: 'auto',
        overflowX: 'hidden',
        alignItems: 'flex-end',
    },
});

const getGradientStops = (startPos: number, stopPos: number, num: number) =>
    new Array(num)
        .fill(0)
        .map((_, idx) => (stopPos - startPos) * idx / num)
        .reduce((prev, curr, idx) =>
            prev +
            `rgba(255, 255, 255, ${(1 - Math.cos(Math.PI * (idx / num))) / 2}) ${startPos + curr}%`
            + (idx !== num - 1 ? ', ' : '')
            , '');

const gradient = getGradientStops(20, 70, 8);
const pushed = pushedHelper(navBarHeight.mobile);

const LinksDiv = styled.div<{ isHome: boolean }>(
    noHighlight,
    {
        textTransform: 'uppercase',
        [screenMorPortrait]: {
            ...pushed,
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            paddingLeft: 'calc(100vw - 100%)',
            display: 'flex',
            justifyContent: 'center',
            boxShadow: 'inset 0 7px 6px -5px rgba(0, 0, 0, 0.25)',
        },
    }, ({ isHome }) => ({
        [screenMorPortrait]: {
            background: isHome ? 'transparent' : `linear-gradient(90deg, ${gradient}, white 70%)`,
        },
    }),
);

const NavBarLinks: React.FC<NavBarLinksProps> = (props) => (
    <LinksDiv isHome={props.specificPath === ''}>
        <StyledUL>
            {links.map((link: LinkShape, i: number) => {
                return (
                    <NavBarLink
                        key={i}
                        link={link}
                        subNavLinks={link.subLinks}
                        active={link.path === props.currentBasePath}
                        isHome={props.specificPath === ''}
                        isMobile={props.isMobile}
                    />
                );
            })}
        </StyledUL>
    </LinksDiv>
);

const MemoizedLinks = React.memo(NavBarLinks);

export default MemoizedLinks;
