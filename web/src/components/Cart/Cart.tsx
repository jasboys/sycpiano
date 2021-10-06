import styled from '@emotion/styled';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Transition } from 'react-transition-group';
import { initCartAction, syncLocalStorage } from './actions';
import { GlobalStateShape } from 'src/types';
import { CartList } from 'src/components/Cart/CartList';
import { LoadingInstance } from 'src/components/LoadingSVG';

import { gsap } from 'gsap';

import { navBarHeight } from 'src/styles/variables';
import { lightBlue } from 'src/styles/colors';

const Arrow = styled.div<{ transform: string }>({
    top: -15,
    width: 0,
    height: 0,
    borderLeft: '24px solid transparent',
    borderRight: '24px solid transparent',
    borderBottom: `24px solid ${lightBlue}`,
    zIndex: 10,
}, ({ transform }) => ({
    transform,
}));

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

const CartFilterGroup = styled.div<{ isCheckingOut: boolean }>({
    position: 'relative',
}, ({ isCheckingOut }) =>
    isCheckingOut && ({
        filter: 'brightness(0.75)',
    })
);
const CartContainer = styled.div<{ isMobile: boolean }>({
    zIndex: 5001,
    filter: `drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.5))`,
    overflow: 'hidden',
    height: 0,
}, ({ isMobile }) => isMobile && ({
    position: 'absolute',
    top: navBarHeight.mobile,
    zIndex: 4999,
    maxHeight: `calc(100% - ${navBarHeight.mobile}px)`,
}));

interface CartProps {
    styles: {
        [key: string]: React.CSSProperties;
    };
    attributes: {
        [key: string]: {
            [key: string]: string;
        };
    };
    setPopperElement: (el: HTMLDivElement) => void;
    setArrowElement: (el: HTMLDivElement) => void;
    isMobile: boolean;
}

export const Cart: React.FC<CartProps> = ({ styles, attributes, isMobile, setPopperElement, setArrowElement }) => {
    const dispatch = useDispatch();
    const visible = useSelector(({ cart }: GlobalStateShape) => cart.visible);
    const isCheckingOut = useSelector(({ cart }: GlobalStateShape) => cart.isCheckingOut);
    const cartLength = useSelector(({ cart }: GlobalStateShape) => cart.items.length);
    const tl = React.useRef<gsap.core.Timeline>(null);
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

    const popperStyles = isMobile ? {} : { style: styles.popper };
    const popperAttributes = isMobile ? {} : attributes.popper;
    const { transform: arrowTransform = '', ...arrowStyles } = styles.arrow ?? {};

    return (
        <Transition<undefined>
            in={visible}
            timeout={250}
            onEnter={(el: HTMLDivElement) => {
                if (!tl.current) {
                    tl.current = gsap.timeline({ reversed: true, paused: true })
                        .to(el, { height: 'auto', duration: 0.30, ease: 'quad.inOut' });
                }
                tl.current.pause().play();
            }}
            onExit={() => {
                tl.current.pause().reverse();
            }}
        >
            <CartContainer
                {...popperStyles}
                isMobile={isMobile}
                ref={isMobile ? () => { } : setPopperElement}    /* eslint-disable-line @typescript-eslint/no-empty-function */
                {...popperAttributes}
            >
                {isCheckingOut &&
                    <LoadingDiv>
                        <LoadingInstance width={60} height={60} />
                    </LoadingDiv>
                }
                <CartFilterGroup isCheckingOut={isCheckingOut}>
                    {!isMobile && (
                        < Arrow
                            ref={isMobile ? () => { } : setArrowElement}     /* eslint-disable-line @typescript-eslint/no-empty-function */
                            style={arrowStyles}
                            transform={arrowTransform}
                        />
                    )}
                    <CartList isMobile={isMobile} />
                </CartFilterGroup>
            </CartContainer>
        </Transition>
    );
};

export type CartType = typeof Cart;