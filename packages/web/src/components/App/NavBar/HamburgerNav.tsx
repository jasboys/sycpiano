import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import HamburgerMenu from 'src/components/App/NavBar/HamburgerMenu';
import NavBarLinks from 'src/components/App/NavBar/NavBarLinks';
import { toggleExpanded } from 'src/components/App/NavBar/reducers';
import { NavBarLinksProps } from 'src/components/App/NavBar/types';
import { toggleCartList } from 'src/components/Cart/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { logoBlue } from 'src/styles/colors';

const MenuContainer = styled.div({
    margin: 'auto 0',
});

const onEnter = (el: HTMLElement) => {
    gsap.to(el, { autoAlpha: 1, duration: 0.3 });
    gsap.fromTo(
        '.navlink-entry',
        { autoAlpha: 0, x: 80 },
        { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.3 },
    );
};

const onExit = (el: HTMLElement) => {
    gsap.to('.navlink-entry', {
        autoAlpha: 0,
        x: 80,
        stagger: 0.05,
        duration: 0.25,
    });
    gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.15 });
};

const HamburgerNav: React.FC<Omit<NavBarLinksProps, 'isHamburger'>> = ({
    currentBasePath,
    specificPath,
}) => {
    const isExpanded = useAppSelector(({ navbar }) => navbar.isExpanded);
    const cartOpen = useAppSelector(({ cart }) => cart.visible);
    const dispatch = useAppDispatch();

    return (
        <MenuContainer>
            <HamburgerMenu
                isExpanded={isExpanded}
                onClick={() => {
                    dispatch(toggleExpanded());
                    cartOpen && dispatch(toggleCartList(false));
                }}
                layerColor={specificPath === '' ? 'white' : logoBlue}
            />
            <Transition<undefined>
                in={isExpanded}
                onEnter={onEnter}
                onExit={onExit}
                timeout={1000}
                mountOnEnter
                mountOnExit
                appear
            >
                <NavBarLinks
                    currentBasePath={currentBasePath}
                    isHamburger={true}
                    specificPath={specificPath}
                />
            </Transition>
        </MenuContainer>
    );
};

export default HamburgerNav;