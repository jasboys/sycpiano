import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { gsap } from 'gsap';
import * as React from 'react';
import isEqual from 'react-fast-compare';
import { Transition } from 'react-transition-group';

import { CartList } from 'src/components/Cart/CartList';
import { toMedia } from 'src/mediaQuery.js';
import { hiDpx, screenS } from 'src/screens.js';
import { navBarHeight } from 'src/styles/variables';
import { cartStore, initCartFn } from './store.js';
import { useStore } from 'src/store.js';

const Arrow = styled.div({
    position: 'absolute',
    top: -15,
    width: 0,
    height: 0,
    borderLeft: '16px solid transparent',
    borderRight: '16px solid transparent',
    borderBottom: '15.5px solid rgba(255 255 255 / 0.4)',
});

const CartFilterGroup = styled.div(
    {
        position: 'relative',
        height: '100%',
    },
);
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
    floatingRef: React.MutableRefObject<HTMLDivElement | null>;
    arrowRef: React.MutableRefObject<HTMLDivElement | null>;
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
    const screenS = useStore().mediaQueries.screenS();
    const visible = cartStore.use.visible();
    const cartLength = cartStore.use.items().length;
    const tl = React.useRef<gsap.core.Timeline>();

    const {
        data: { items, email } = { items: [], email: '' },
        isSuccess,
    } = useQuery({
        queryKey: ['localStorageCart'],
        queryFn: initCartFn,
    });

    React.useEffect(() => {
        if (isSuccess) {
            cartStore.set.items(items);
            cartStore.set.email(email);
        }
    }, [items, email, isSuccess])

    React.useEffect(() => {
        cartStore.set.syncStorage();
    }, [cartLength]);

    const arrowCallback = React.useCallback(
        (el: HTMLDivElement) => {
            arrowRef.current = el;
            update();
        },
        [update],
    );

    return (
        <Transition<undefined>
            in={visible}
            timeout={250}
            onEnter={(el: HTMLElement) => {
                if (!tl.current) {
                    tl.current = gsap
                        .timeline({ reversed: true, paused: true })
                        // .to(el, { height: 'auto', duration: 0.30, ease: 'quad.inOut' });
                        .to(el, {
                            autoAlpha: 1,
                            duration: 0.12,
                            ease: 'quad.inOut',
                        });
                }
                tl.current.pause().play();
            }}
            onExit={() => {
                tl.current?.pause().reverse();
            }}
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
                    screenS ? () => {} : floatingRef
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