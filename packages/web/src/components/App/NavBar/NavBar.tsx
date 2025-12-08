import styled from '@emotion/styled';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import * as React from 'react';

import { focusAtom } from 'jotai-optics';
import CartButton from 'src/components/App/NavBar/CartButton';
import HamburgerNav from 'src/components/App/NavBar/HamburgerNav';
import NavBarLinks from 'src/components/App/NavBar/NavBarLinks';
import NavBarLogo from 'src/components/App/NavBar/NavBarLogo';
import { cartAtoms } from 'src/components/Cart/store';
import { navBarHeight } from 'src/styles/variables';
import { mediaQueriesBaseAtom } from '../store';
import { navBarAtoms } from './store';

const shopEnabled = JSON.parse(ENABLE_SHOP) === true;

type NavBarProps = {
    readonly currentBasePath: string;
    readonly delayedRouteBase: string;
    readonly className?: string;
    readonly specificRouteName: string;
    readonly anchorRef: React.RefObject<HTMLButtonElement | null>;
    readonly navbarRef: React.RefObject<HTMLDivElement | null>;
};

const StyledNavBar = styled.div<{
    height: number;
    hiDpx: boolean;
    isHamburger: boolean;
    isHome: boolean;
    menuExpanded: boolean;
    cartExpanded: boolean;
}>(
    {
        visibility: 'hidden',
        padding: '0 30px 0 0',
        position: 'fixed',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5000,
        transition: 'background-color 0.25s',
        boxShadow: '0 0 6px 1px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(1px)',
    },
    ({ height }) => ({
        height,
    }),
    ({ hiDpx }) =>
        hiDpx && {
            paddingRight: 15,
        },
    ({ isHome, menuExpanded, cartExpanded, isHamburger }) => ({
        backgroundColor: isHome
            ? isHamburger && (menuExpanded || cartExpanded)
                ? 'rgba(0, 0, 0, 0.1)'
                : 'transparent'
            : 'white',
    }),
);

const StyledNavAndCart = styled.div<{ isHamburger: boolean }>(
    {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    ({ isHamburger }) =>
        isHamburger && {
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
            flexDirection: 'row-reverse',
        },
);

/*
STYLING LOGIC
height: dppx > 2 ? mobile height : desktop height
menu: (portrait || dppx > 2 || (max-width: 1280 and orientation: landscape)) ? hamburger : normal


*/

const mediaQueries = focusAtom(mediaQueriesBaseAtom, (optic) =>
    optic.pick(['isHamburger', 'hiDpx']),
);

const NavBar = ({
    currentBasePath,
    specificRouteName,
    delayedRouteBase,
    navbarRef,
    anchorRef,
}: NavBarProps) => {
    const [isExpanded, toggleExpanded] = useAtom(navBarAtoms.isExpanded);
    const cartIsOpen = useAtomValue(cartAtoms.visible);
    const { isHamburger, hiDpx } = useAtomValue(mediaQueries);
    const setSpecificRouteName = useSetAtom(navBarAtoms.specificRouteName);

    React.useEffect(() => {
        setSpecificRouteName(specificRouteName ?? '');
    }, [specificRouteName]);

    React.useEffect(() => {
        if (!isHamburger) {
            toggleExpanded(false);
        }
    }, [isHamburger]);

    const isHome = delayedRouteBase === '/';
    return (
        <StyledNavBar
            isHome={isHome}
            hiDpx={hiDpx}
            isHamburger={isHamburger}
            menuExpanded={isExpanded}
            cartExpanded={cartIsOpen}
            height={navBarHeight.get(hiDpx)}
            ref={navbarRef}
        >
            <NavBarLogo
                isHome={isHome}
                isExpanded={isExpanded}
                specificRouteName={specificRouteName}
            />
            <StyledNavAndCart isHamburger={isHamburger}>
                {isHamburger ? (
                    <HamburgerNav
                        currentBasePath={currentBasePath}
                        specificPath={specificRouteName}
                        key="hamburger-nav"
                    />
                ) : (
                    <NavBarLinks
                        currentBasePath={currentBasePath}
                        specificPath={specificRouteName}
                        isHamburger={false}
                    />
                )}
                {shopEnabled && <CartButton isHome={isHome} ref={anchorRef} />}
            </StyledNavAndCart>
        </StyledNavBar>
    );
};

export default NavBar;
