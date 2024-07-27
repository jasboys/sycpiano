import { css } from '@emotion/react';
import { gsap } from 'gsap';
import { mix } from 'polished';
import * as React from 'react';

import { lightBlue, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { isHamburger } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import { cartStore } from 'src/components/Cart/store.js';
import { navBarStore } from './store.js';

const cartStyles = {
    base: css(latoFont(400), {
        noHighlight,
        fill: 'var(--cart-color)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.5s',
        webkitTapHighlightColor: 'transparent',
        paddingBottom: 12,
        text: noHighlight,
        circle: {
            stroke: 'var(--cart-color)',
            transition: 'all 0.5s',
            fill: 'white',
        },
        svg: {
            verticalAlign: 'middle',
        },
        '&:hover': {
            cursor: 'pointer',
            '--cart-color': mix(0.5, logoBlue, '#444'),
        },
        [toMedia(isHamburger)]: {
            '--cart-color': logoBlue,
            paddingBottom: 0,
            marginRight: '1rem',
        },
        '--cart-color': '#4d4d4d',
    }),
    isHome: css({
        '--cart-drop-shadow': 'drop-shadow(0 0 1px rgba(0 0 0 / 0.8))',
        '--cart-color': 'white',
        filter: 'var(--cart-drop-shadow)',
        circle: {
            fill: 'none',
        },
        '&:hover': {
            '--cart-color': 'white',
            '--cart-drop-shadow': 'drop-shadow(0 0 1px white)',
        },
        [toMedia(isHamburger)]: {
            '--cart-drop-shadow': 'drop-shadow(0 0 1px rgba(0 0 0 / 0.8))',
            '--cart-color': 'white',
            '&:hover': {
                '--cart-color': 'white',
                '--cart-drop-shadow': 'drop-shadow(0 0 1px white)',
            },
        },
    }),
    isOpen: css({
        [toMedia(isHamburger)]: {
            '--cart-color': lightBlue,
            '--cart-drop-shadow': 'drop-shadow(0 0 1px white)',
            circle: {
                fill: 'white',
            },
        },
    }),
};

const scaleDown = (tl: gsap.core.Tween) => {
    tl.reverse();
};

const scaleUp = (el: HTMLDivElement) => {
    const tl = gsap.fromTo(
        el,
        {
            scale: 1,
        },
        {
            duration: 0.1,
            scale: 2,
            onComplete: () => {
                scaleDown(tl);
            },
        },
    );
};

interface CartButtonProps {
    isHome: boolean;
}

const CartButton = React.forwardRef<HTMLDivElement, CartButtonProps>(
    ({ isHome }, ref) => {

        const cart = cartStore.useTrackedStore()
        const menuOpened = navBarStore.use.isExpanded();
        const cartRef = React.useRef<HTMLDivElement | null>(null);

        React.useEffect(() => {
            const el = cartRef.current;
            if (el && cart.isInit) {
                scaleUp(el);
            }
        }, [cart.items.length]);

        const makeRef = React.useCallback((el: HTMLDivElement) => {
            cartRef.current = el;
            if (typeof ref === 'function') {
                ref(el);
            } else if (ref) {
                ref.current = el;
            }
        }, []);

        const onClick = React.useCallback(() => {
            cartStore.set.toggleCartVisible();
            menuOpened && navBarStore.set.toggleExpanded(false);
        }, [menuOpened]);

        return (
            <div
                css={[
                    cartStyles.base,
                    isHome && cartStyles.isHome,
                    cart.visible && !isHome && cartStyles.isOpen,
                ]}
                onClick={onClick}
                onKeyUp={onClick}
                ref={makeRef}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-4 -5 36 32"
                    height="36"
                    width="40"
                >
                    <title>Cart Icon</title>
                    <path
                        strokeWidth="0"
                        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 3c0 .55.45 1 1 1h1l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1zm16 15c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                    />
                    {cart.items.length !== 0 && (
                        <>
                            <circle
                                cx="23"
                                cy="2"
                                r="6"
                                strokeWidth="1"
                            />
                            <text
                                x="23.5"
                                y="3"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="0.6rem"
                            >
                                {cart.items.length}
                            </text>
                        </>
                    )}
                </svg>
            </div>
        );
    },
);

export default CartButton;
