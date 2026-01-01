import styled from '@emotion/styled';
import { gsap } from 'gsap';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import isEqual from 'react-fast-compare';
import { Transition } from 'react-transition-group';
import { CartList } from 'src/components/Cart/CartList';
import { toMedia } from 'src/mediaQuery.js';
import { hiDpx, screenS } from 'src/screens.js';
import { navBarHeight } from 'src/styles/variables';
import { mediaQueriesAtoms } from '../App/store';
import { cartAtoms } from './store';

const Arrow = styled.div({
    position: 'absolute',
    top: -15,
    width: 0,
    height: 0,
    borderLeft: '16px solid transparent',
    borderRight: '16px solid transparent',
    borderBottom: '15.5px solid rgba(255 255 255 / 0.4)',
});

const CartFilterGroup = styled.div({
    position: 'relative',
    height: '100%',
});
const CartContainer = styled.div<{ top: number }>(
    {
        zIndex: 5001,
        filter: 'drop-shadow(0px 4px 8px rgba(0 0 0 / 0.5))',
        overflow: 'hidden',
        visibility: 'hidden',
        opacity: 0,
        maxHeight: '100%',
        [toMedia(screenS)]: {
            position: 'absolute',
            paddingTop: navBarHeight.lowDpx,
            zIndex: 4999,
            height: '100%',
            [toMedia(hiDpx)]: {
                paddingTop: navBarHeight.hiDpx,
            },
        },
    },
    ({ top }) => ({
        height: `calc(100% - ${top}px)`,
    }),
);

interface CartProps {
    position: {
        x: number | null;
        y: number | null;
    };
    arrow?: {
        x?: number;
        y?: number;
        centerOffset: number;
    };
    strategy: 'absolute' | 'fixed';
    floatingRef: React.RefObject<HTMLDivElement | null>;
    arrowRef: React.RefObject<HTMLDivElement | null>;
    update: () => void;
}

const Cart: React.FC<CartProps> = ({
    position,
    strategy,
    floatingRef,
    arrowRef,
    arrow,
    update,
}) => {
    const screenS = useAtomValue(mediaQueriesAtoms.screenS);
    const cartVisible = useAtomValue(cartAtoms.visible);
    const tl = React.useRef<GSAPTimeline>(null);
    const fadeRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        if (fadeRef.current) {
            const ctx = gsap.context(() => {
                tl.current = gsap
                        .timeline({ reversed: true, paused: true })
                        // .to(el, { height: 'auto', duration: 0.30, ease: 'quad.inOut' });
                        .to(fadeRef.current, {
                            autoAlpha: 1,
                            duration: 0.12,
                            ease: 'quad.inOut',
                        }, 0);
            }, fadeRef.current);
            return () => ctx.revert();
        }
    }, []);

    const arrowCallback = React.useCallback(
        (el: HTMLDivElement) => {
            arrowRef.current = el;
            update();
        },
        [update],
    );

    return (
        <Transition
            in={cartVisible}
            timeout={250}
            onEnter={() => {
                tl.current?.pause().play();
            }}
            onExit={() => {
                tl.current?.pause().reverse();
            }}
            nodeRef={fadeRef}
            appear
        >
            <CartContainer
                css={
                    !screenS && {
                        left: position.x !== null ? position.x : '',
                        top: position.y !== null ? position.y : '',
                        position: strategy,
                    }
                }
                top={!screenS && position.y !== null ? position.y : 0}
                ref={
                    screenS
                        ? (el) => {
                              fadeRef.current = el;
                          }
                        : (el) => {
                              floatingRef.current = el;
                              fadeRef.current = el;
                          }
                } /* eslint-disable-line @typescript-eslint/no-empty-function */
            >
                <CartFilterGroup>
                    {!screenS && (
                        <Arrow
                            ref={
                                screenS ? () => {} : arrowCallback
                            } /* eslint-disable-line @typescript-eslint/no-empty-function */
                            style={{
                                left: arrow?.x !== undefined ? arrow.x - 2 : '',
                                top: arrow?.y !== undefined ? arrow.y : '',
                            }}
                        />
                    )}
                    <CartList />
                </CartFilterGroup>
            </CartContainer>
        </Transition>
    );
};

const MemoizedCart = React.memo(Cart, (prev, next) => {
    return isEqual(prev, next);
});

export default MemoizedCart;
export type RequiredProps = CartProps;
export type MemoizedCart = typeof MemoizedCart;
