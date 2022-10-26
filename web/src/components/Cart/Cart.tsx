import styled from '@emotion/styled';
import * as React from 'react';
import { Transition } from 'react-transition-group';
import { initCartAction, syncLocalStorage } from 'src/components/Cart/reducers';
import { CartList } from 'src/components/Cart/CartList';
import { LoadingInstance } from 'src/components/LoadingSVG';
import isEqual from 'react-fast-compare';

import { gsap } from 'gsap';

import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { MediaContext } from 'src/components/App/App';

const Arrow = styled.div({
    position: 'absolute',
    top: -15,
    width: 0,
    height: 0,
    borderLeft: '16px solid transparent',
    borderRight: '16px solid transparent',
    borderBottom: `15.5px solid rgba(255 255 255 / 0.4)`,
});

const LoadingDiv = styled.div({
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    fill: 'white',
});

const CartFilterGroup = styled.div<{ isCheckingOut: boolean; }>(
    {
        position: 'relative',
        height: '100%',
    },
    ({ isCheckingOut }) => isCheckingOut && ({
        filter: 'brightness(0.75)',
    }),
);
const CartContainer = styled.div<{ hiDpx: boolean; top: number }>(
    {
        zIndex: 5001,
        filter: `drop-shadow(0px 4px 8px rgba(0 0 0 / 0.5))`,
        overflow: 'hidden',
        visibility: 'hidden',
        opacity: 0,
        maxHeight: '100%',
    },
    ({ top }) => ({
        height: `calc(100% - ${top}px)`
    }),
    ({ hiDpx }) => hiDpx && ({
        position: 'absolute',
        paddingTop: navBarHeight.hiDpx,
        zIndex: 4999,
        height: '100%',
    })
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
    }
    strategy: 'absolute' | 'fixed';
    floatingRef: (node: HTMLElement | null) => void;
    arrowRef: React.MutableRefObject<HTMLDivElement | null>;
    update: () => void;
}

const Cart: React.FC<CartProps> = ({ position, strategy, floatingRef, arrowRef, arrow, update }) => {
    const { isHamburger, hiDpx } = React.useContext(MediaContext);
    const dispatch = useAppDispatch();
    const visible = useAppSelector(({ cart }) => cart.visible);
    const isCheckingOut = useAppSelector(({ cart }) => cart.isCheckingOut);
    const cartLength = useAppSelector(({ cart }) => cart.items.length);
    const tl = React.useRef<gsap.core.Timeline>();
    const firstRun = React.useRef(true);

    React.useEffect(() => {
        dispatch(initCartAction());
        firstRun.current = false;
    }, []);

    React.useEffect(() => {
        if (!firstRun.current) {
            dispatch(syncLocalStorage());
        }
    }, [cartLength]);

    const arrowCallback = React.useCallback((el) => {
        arrowRef.current = el;
        update();
    }, [update]);

    return (
        <Transition<undefined>
            in={visible}
            timeout={250}
            onEnter={(el: HTMLElement) => {
                if (!tl.current) {
                    tl.current = gsap.timeline({ reversed: true, paused: true })
                        // .to(el, { height: 'auto', duration: 0.30, ease: 'quad.inOut' });
                        .to(el, { autoAlpha: 1, duration: 0.12, ease: 'quad.inOut' });
                }
                tl.current.pause().play();
            }}
            onExit={() => {
                tl.current?.pause().reverse();
            }}
        >
            <CartContainer
                css={!isHamburger && {
                    left: position.x !== null ? position.x : '',
                    top: position.y !== null ? position.y : '',
                    position: strategy,
                }}
                top={(!isHamburger && position.y !== null) ? position.y : 0}
                hiDpx={hiDpx}
                ref={isHamburger ? () => { } : floatingRef}    /* eslint-disable-line @typescript-eslint/no-empty-function */
            >
                {isCheckingOut &&
                    <LoadingDiv>
                        <LoadingInstance width={60} height={60} />
                    </LoadingDiv>
                }
                <CartFilterGroup isCheckingOut={isCheckingOut}>
                    {!isHamburger && (
                        <Arrow
                            ref={isHamburger ? () => { } : arrowCallback}     /* eslint-disable-line @typescript-eslint/no-empty-function */
                            style={{
                                left: arrow?.x !== undefined ? arrow?.x : '',
                                top: arrow?.y !== undefined ? arrow?.y : '',
                            }}
                        />
                    )}
                    <CartList />
                </CartFilterGroup>
            </CartContainer>
        </Transition>
    );
};

const MemoizedCart = React.memo(
    Cart,
    (prev, next) => {
        return isEqual(prev, next);
    }
);

export default MemoizedCart;
export type RequiredProps = CartProps;
export type MemoizedCart = typeof MemoizedCart;