import { css } from '@emotion/react';
import { gsap } from 'gsap';
import { mix } from 'polished';
import * as React from 'react';

import { toggleExpanded } from 'src/components/App/NavBar/reducers';
import { toggleCartList } from 'src/components/Cart/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { isHamburger } from 'src/screens';
import { toMedia } from 'src/mediaQuery';

const cartStyles = {
    base: css(latoFont(400), {
        noHighlight,
        fill: '#4d4d4d',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.5s',
        webkitTapHighlightColor: 'transparent',
        paddingBottom: 12,
        '&:hover': {
            cursor: 'pointer',
            fill: mix(0.5, logoBlue, '#444'),
        },
        [toMedia(isHamburger)]: {
            fill: logoBlue,
            paddingBottom: 0,
            marginRight: '1rem',
        },
    }),
    isHome: css({
        fill: 'white',
        filter: 'drop-shadow(0 0 1px rgba(0 0 0 / 0.8))',
        '&:hover': {
            fill: 'white',
            filter: 'drop-shadow(0 0 1px rgba(255 255 255 / 1))',
        },
    }),
    isOpen: css({
        [toMedia(isHamburger)]: {
            fill: lightBlue,
            filter: 'drop-shadow(0 0 1px white)',
        },
    }),
};

const circleStyles = {
    base: css({
        stroke: '#4d4d4d',
        transition: 'all 0.5s',
        fill: 'white',
        '&:hover': {
            stroke: mix(0.5, logoBlue, '#444'),
        },
        [toMedia(isHamburger)]: {
            stroke: logoBlue,
        },
    }),
    isHome: css({
        stroke: 'white',
        fill: 'none',
        '&:hover': {
            stroke: 'white',
        },
    }),
};

const svgStyle = css({ verticalAlign: 'middle' });

const textStyle = css(noHighlight);

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
        const cartCount = useAppSelector(({ cart }) => cart.items.length);
        const cartIsInit = useAppSelector(({ cart }) => cart.isInit);
        const cartOpened = useAppSelector(({ cart }) => cart.visible);
        const menuOpened = useAppSelector(({ navbar }) => navbar.isExpanded);
        const cartRef = React.useRef<HTMLDivElement | null>(null);
        const dispatch = useAppDispatch();

        React.useEffect(() => {
            const el = cartRef.current;
            if (el && cartIsInit) {
                scaleUp(el);
            }
        }, [cartCount]);

        const makeRef = React.useCallback((el: HTMLDivElement) => {
            cartRef.current = el;
            if (typeof ref === 'function') {
                ref(el);
            } else if (ref) {
                ref.current = el;
            }
        }, []);

        const onClick = React.useCallback(() => {
            dispatch(toggleCartList());
            menuOpened && dispatch(toggleExpanded(false));
        }, [menuOpened]);

        return (
            <div
                css={[
                    cartStyles.base,
                    isHome && cartStyles.isHome,
                    cartOpened && cartStyles.isOpen,
                ]}
                onClick={onClick}
                onKeyUp={onClick}
                ref={makeRef}
            >
                <svg
                    css={svgStyle}
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
                    {cartCount !== 0 && (
                        <>
                            <circle
                                css={[
                                    circleStyles.base,
                                    isHome && circleStyles.isHome,
                                ]}
                                cx="23"
                                cy="2"
                                r="6"
                                strokeWidth="1"
                            />
                            <text
                                css={textStyle}
                                x="23.5"
                                y="3"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="0.6rem"
                            >
                                {cartCount}
                            </text>
                        </>
                    )}
                </svg>
            </div>
        );
    },
);

export default CartButton;
