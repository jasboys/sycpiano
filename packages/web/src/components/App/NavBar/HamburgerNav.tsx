import styled from '@emotion/styled';
import { gsap } from 'gsap';
import { useAtom } from 'jotai';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import HamburgerMenu from 'src/components/App/NavBar/HamburgerMenu';
import NavBarLinks from 'src/components/App/NavBar/NavBarLinks';
import type { NavBarLinksProps } from 'src/components/App/NavBar/types';
import { cartAtoms } from 'src/components/Cart/store';
import { logoBlue } from 'src/styles/colors';
import { navBarAtoms } from './store';

const MenuContainer = styled.div({
    margin: 'auto 0',
});

const HamburgerNav: React.FC<Omit<NavBarLinksProps, 'isHamburger'>> = ({
    currentBasePath,
    specificPath,
}) => {
    const [isExpanded, toggleExpanded] = useAtom(navBarAtoms.isExpanded);
    const [cartOpen, toggleCartOpen] = useAtom(cartAtoms.visible);
    const enterTimeline = React.useRef<GSAPTimeline>(null);
    const exitTimeline = React.useRef<GSAPTimeline>(null);
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

    const onClick = React.useCallback(() => {
        toggleExpanded();
        cartOpen && toggleCartOpen(false);
    }, [cartOpen]);

    return (
        <MenuContainer>
            <HamburgerMenu
                isExpanded={isExpanded}
                onClick={onClick}
                layerColor={specificPath === '' ? 'white' : logoBlue}
            />
            <Transition
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
