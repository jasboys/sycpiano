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

const HamburgerNav: React.FC<Omit<NavBarLinksProps, 'isHamburger'>> = ({
    currentBasePath,
    specificPath,
}) => {
    const isExpanded = useAppSelector(({ navbar }) => navbar.isExpanded);
    const cartOpen = useAppSelector(({ cart }) => cart.visible);
    const dispatch = useAppDispatch();
    const enterTimeline = React.useRef<GSAPTimeline>();
    const exitTimeline = React.useRef<GSAPTimeline>();
    const el = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        if (el.current) {
            const ctx = gsap.context(() => {
                enterTimeline.current = gsap
                    .timeline({ paused: true })
                    .to(el.current, { autoAlpha: 1, duration: 0.3 }, 0)
                    .fromTo(
                        '.navlink-entry',
                        { autoAlpha: 0, x: 80 },
                        { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.3 },
                        0,
                    );
                exitTimeline.current = gsap
                    .timeline({ paused: true })
                    .to(
                        '.navlink-entry',
                        {
                            autoAlpha: 0,
                            x: 80,
                            stagger: 0.05,
                            duration: 0.25,
                        },
                        0,
                    )
                    .to(
                        el.current,
                        { autoAlpha: 0, duration: 0.3, delay: 0.15 },
                        0,
                    );
            }, el.current);
            return () => ctx.revert();
        }
    }, []);

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
            <Transition<HTMLDivElement>
                nodeRef={el}
                in={isExpanded}
                onEnter={() => {
                    enterTimeline.current?.restart().play();
                }}
                onExit={() => {
                    exitTimeline.current?.restart().play();
                }}
                timeout={1000}
                appear
            >
                <NavBarLinks
                    ref={el}
                    currentBasePath={currentBasePath}
                    isHamburger={true}
                    specificPath={specificPath}
                />
            </Transition>
        </MenuContainer>
    );
};

export default React.memo(HamburgerNav);