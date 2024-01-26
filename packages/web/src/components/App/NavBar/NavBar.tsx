import styled from '@emotion/styled';
import * as React from 'react';

import CartButton from 'src/components/App/NavBar/CartButton';
import HamburgerNav from 'src/components/App/NavBar/HamburgerNav';
import NavBarLinks from 'src/components/App/NavBar/NavBarLinks';
import NavBarLogo from 'src/components/App/NavBar/NavBarLogo';
import {
    setSpecificRouteNameAction,
    toggleExpanded,
} from 'src/components/App/NavBar/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { navBarHeight } from 'src/styles/variables';
import { mqSelectors } from '../reducers';

const shopEnabled = JSON.parse(ENABLE_SHOP) === true;

interface NavBarProps {
    readonly currentBasePath: string;
    readonly delayedRouteBase: string;
    readonly className?: string;
    readonly specificRouteName: string;
}

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

const NavBar = React.forwardRef<HTMLDivElement, NavBarProps>(
    ({ currentBasePath, specificRouteName, delayedRouteBase }, ref) => {
        const isExpanded = useAppSelector(({ navbar }) => navbar.isExpanded);
        const cartIsOpen = useAppSelector(({ cart }) => cart.visible);
        const isHamburger = useAppSelector(mqSelectors.isHamburger);
        const hiDpx = useAppSelector(mqSelectors.hiDpx);

        const dispatch = useAppDispatch();

        React.useEffect(() => {
            dispatch(setSpecificRouteNameAction(specificRouteName ?? ''));
        }, [specificRouteName]);

        React.useEffect(() => {
            if (!isHamburger) {
                dispatch(toggleExpanded(false));
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
                    {shopEnabled && <CartButton isHome={isHome} ref={ref} />}
                </StyledNavAndCart>
            </StyledNavBar>
        );
    },
);

export default NavBar;
