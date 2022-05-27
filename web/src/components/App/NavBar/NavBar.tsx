import * as React from 'react';
import { useMedia } from 'react-media';

import styled from '@emotion/styled';

import CartButton from 'src/components/App/NavBar/CartButton';
import HamburgerNav from 'src/components/App/NavBar/HamburgerNav';
import NavBarLinks from 'src/components/App/NavBar/NavBarLinks';
import NavBarLogo from 'src/components/App/NavBar/NavBarLogo';

import { screenBreakPoints } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { toggleExpanded } from 'src/components/App/NavBar/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';

interface NavBarProps {
    readonly currentBasePath: string;
    readonly className?: string;
    readonly specificRouteName?: string;
}

const StyledNavBar = styled.div<{ isMobile: boolean; isHome: boolean }>(
    {
        visibility: 'hidden',
        padding: '0 30px 0 0',
        backgroundColor: 'white',
        height: navBarHeight.desktop,
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
    }, ({ isMobile }) => isMobile && ({
        height: navBarHeight.mobile,
        paddingRight: 15,
    }), ({ isHome }) => isHome && ({
        backgroundColor: 'transparent',
    })
);

const StyledNavAndCart = styled.div<{ isMobile: boolean }>({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
}, ({ isMobile }) => isMobile && ({
    height: '100%',
    justifyContent: 'center',
}));

const NavBar = React.forwardRef<HTMLDivElement, NavBarProps>(({
    currentBasePath,
    specificRouteName,
}, ref) => {
    const isExpanded = useAppSelector(({ navbar }) => navbar.isExpanded);
    const { xs, medium } = useMedia({ queries: screenBreakPoints });
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        if (!xs && !medium) {
            dispatch(toggleExpanded(false));
        }
    }, [xs, medium]);

    const isHome = currentBasePath === '/';
    return (
        <StyledNavBar
            isHome={isHome}
            isMobile={medium}
        >
            <NavBarLogo
                isHome={isHome}
                isExpanded={isExpanded}
                specificRouteName={specificRouteName}
            />
            {medium ?
                (
                    <StyledNavAndCart isMobile={medium}>
                        <CartButton
                            isHome={isHome}
                            ref={medium ? () => {} : ref}   /* eslint-disable-line @typescript-eslint/no-empty-function */
                        />
                        <HamburgerNav
                            currentBasePath={currentBasePath}
                            isMobile={true}
                            key="hamburger-nav"
                        />
                    </StyledNavAndCart>
                ) : (
                    <StyledNavAndCart isMobile={medium}>
                        <NavBarLinks
                            currentBasePath={currentBasePath}
                            isMobile={false}
                        />
                        <CartButton
                            isHome={isHome}
                            ref={medium ? () => {} : ref}   /* eslint-disable-line @typescript-eslint/no-empty-function */
                        />
                    </StyledNavAndCart>
                )
            }
        </StyledNavBar >
    );
});

export default NavBar;
