import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/system';
import {
    useMutation,
} from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Markdown from 'markdown-to-jsx';
import { mix } from 'polished';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from 'src/components/Cart/CartItem';
import { toMedia } from 'src/mediaQuery';
import { screenS } from 'src/screens';
import { lightBlue, logoBlue, theme } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { cartWidth } from 'src/styles/variables';
import { formatPrice } from 'src/utils';
import isEmail from 'validator/es/lib/isEmail';
import { LoadingInstance } from '../LoadingSVG.jsx';
import { shopFlatItemsAtom } from '../Shop/ShopList/store.js';
import { cartActions, cartAtoms } from './store.js';

const ARROW_SIDE = 32;

const CartListDiv = styled.div(latoFont(300), {
    backgroundColor: 'rgba(255 255 255 / 0.4)',
    position: 'relative',
    width: cartWidth,
    margin: `${ARROW_SIDE / 2}px 1.5rem`,
    fontSize: '0.8rem',
    borderRadius: '4px',
    border: '4px solid transparent',
    overflowY: 'auto',
    height: 'fit-content',
    maxHeight: 'calc(100% - 2rem)',
    [toMedia(screenS)]: {
        width: '100vw',
        margin: 'unset',
        height: '100%',
        maxHeight: 'unset',
        borderRadius: 'unset',
    },
});

const StyledItemList = styled.div({
    backgroundColor: 'white',
    padding: '1rem',
});

const StyledHeading = styled.div({
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    backgroundColor: lightBlue,
    color: 'white',
});

const CloseSVG = styled.svg({
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    stroke: 'white',
    '&:hover': {
        cursor: 'pointer',
    },
});

const getHoverStyle = (isMouseDown: boolean) => ({
    backgroundColor: mix(0.75, logoBlue, '#FFF'),
    color: 'white',
    cursor: 'pointer',
    border: `1px solid ${mix(0.75, logoBlue, '#FFF')}`,
    transform: isMouseDown
        ? 'translateY(-1.2px) scale(1.01)'
        : 'translateY(-2px) scale(1.04)',
    boxShadow: isMouseDown
        ? '0 1px 2px rgba(0, 0, 0, 0.8)'
        : '0 4px 6px rgba(0, 0, 0, 0.4)',
});

const StyledCheckoutButton = styled.button<{
    disabled: boolean;
    isMouseDown: boolean;
}>(
    latoFont(300),
    {
        position: 'relative',
        fontSize: '1rem',
        width: 160,
        padding: 12,
        marginBottom: '2rem',
        textAlign: 'center',
        borderRadius: 8,
        backgroundColor: lightBlue,
        color: 'white',
        transition: 'all 0.25s',
        border: `1px solid ${lightBlue}`,
        display: 'block',
        userSelect: 'none',
    },
    noHighlight,
    ({ disabled, isMouseDown }) =>
        disabled
            ? {
                  color: logoBlue,
                  backgroundColor: 'white',
                  border: `1px solid ${logoBlue}`,
              }
            : {
                  '&:hover': getHoverStyle(isMouseDown),
              },
);

const ErrorMessage = styled.div({
    color: 'darkred',
    fontSize: '0.8rem',
    margin: '1rem',
});

const PromoMessage = styled.div<{ green: boolean }>(
    {
        fontSize: '0.8rem',
        margin: '1rem',
    },
    ({ green }) =>
        green && {
            color: 'darkgreen',
        },
);

const StyledForm = styled.form({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 2rem',
    backgroundColor: 'white',
});

const StyledTextField = styled(TextField)({
    '&&': {
        margin: '2rem',
        width: '100%',
    },
});

const Subtotal = styled.div({
    backgroundColor: lightBlue,
    color: 'white',
    fontSize: '1rem',
    fontWeight: 400,
    padding: '1rem',
    display: 'flex',
    'div:nth-of-type(1)': {
        flex: '0 0 20%',
        textAlign: 'right',
    },
    'div:nth-of-type(2)': {
        paddingLeft: '0.5rem',
    },
});

const EmptyMessage = styled.div({
    padding: '2rem 1rem',
    width: '100%',
    fontSize: '1rem',
    backgroundColor: 'white',
    textAlign: 'center',
});

const StripeDiv = styled.div({
    height: '2.4rem',
    padding: '0.5rem',
    backgroundColor: lightBlue,
    direction: 'rtl',
});

const StripeIcon = styled.img({
    height: '100%',
    flex: '0 0 auto',
});

const StripeLink = styled.a({
    display: 'block',
    height: '100%',
});

const Heading: React.FC<Record<never, unknown>> = () => {
    const toggleCartVisible = useSetAtom(cartAtoms.visible);
    return (
        <StyledHeading>
            <div
                style={{
                    width: '100%',
                    fontSize: '2rem',
                    padding: '1rem 0 0.5rem 0',
                }}
            >
                Cart
            </div>
            <CloseSVG
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                height="42"
                width="42"
                onClick={() => toggleCartVisible(false)}
            >
                <path
                    d="M40 40L80 80M40 80L80 40"
                    strokeLinecap="square"
                    strokeWidth="6"
                />
            </CloseSVG>
        </StyledHeading>
    );
};

const CheckoutForm: React.FC<{ cartLength: number }> = ({ cartLength }) => {
    const [isMouseDown, setIsMouseDown] = React.useState(false);
    const [email, setEmail] = useAtom(cartAtoms.email);
    const [error, setError] = React.useState(false);
    const checkoutFn = useSetAtom(cartActions.checkoutFn);
    const setIsCheckingOut = useSetAtom(cartAtoms.isCheckingOut);

    const { mutate, isPending } = useMutation({
        mutationFn: checkoutFn,
        onSettled: (data) => {
            if (data) {
                window.location.href = data;
            }
        }
    });

    React.useEffect(() => {
        setIsCheckingOut(isPending);
    }, [isPending]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setError(event.target.value !== '' && !isEmail(event.target.value));
    };

    return (
        <ThemeProvider theme={theme}>
            <StyledForm
                onSubmit={(e) => {
                    e.preventDefault();
                    if (error || isPending) {
                        return;
                    }
                    if (email === '') {
                        setError(true);
                        return;
                    }
                    mutate(email);
                }}
            >
                <StyledTextField
                    label={error ? 'Invalid Email' : 'Email Address'}
                    error={error}
                    id="email-text"
                    value={email}
                    onChange={onChange}
                    variant="outlined"
                    margin="dense"
                    type="email"
                />
                <StyledCheckoutButton
                    type="submit"
                    disabled={cartLength === 0 || email === ''}
                    isMouseDown={isMouseDown}
                    onTouchStart={() => {
                        setIsMouseDown(true);
                    }}
                    onMouseDown={() => {
                        setIsMouseDown(true);
                    }}
                    onTouchEnd={() => {
                        setIsMouseDown(false);
                    }}
                    onMouseUp={() => {
                        setIsMouseDown(false);
                    }}
                >
                    Checkout
                </StyledCheckoutButton>
            </StyledForm>
        </ThemeProvider>
    );
};

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

const InnerBorderContainer = styled.div<{ isCheckingOut: boolean }>(
    {
        height: '100%',
        width: '100%',
        borderRadius: 4,
    },
    ({ isCheckingOut }) =>
        isCheckingOut && {
            filter: 'brightness(0.75)',
        },
);

const faqRedirectLink: React.FC<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
> = ({ href }) => {
    const toggleCartVisible = useSetAtom(cartAtoms.visible);

    return (
        href && (
            <Link to={href} onClick={() => toggleCartVisible(false)}>
                FAQs
            </Link>
        )
    );
};

export const CartList: React.FC<Record<never, unknown>> = () => {
    const isCheckingOut = useAtomValue(cartAtoms.isCheckingOut);
    const cartItems = useAtomValue(cartAtoms.items);
    const checkoutError = useAtomValue(cartAtoms.checkoutError);
    const clearErrors = useSetAtom(cartActions.clearErrors);

    const shopItems = useAtomValue(shopFlatItemsAtom);

    let subtotal = 0;
    const clearError =
        checkoutError.message !== '' &&
        cartItems.every((val) => !checkoutError.data?.includes(val));
    if (clearError) {
        clearErrors();
    }

    return (
        <CartListDiv>
            {isCheckingOut && (
                <LoadingDiv>
                    <LoadingInstance width={60} height={60} />
                </LoadingDiv>
            )}
            <InnerBorderContainer isCheckingOut={isCheckingOut}>
                <Heading />
                {cartItems.length !== 0 &&
                shopItems &&
                shopItems.length !== 0 ? (
                    <StyledItemList>
                        <PromoMessage green={cartItems.length >= 2}>
                            <div>
                                {cartItems.length >= 2 && cartItems.length < 5
                                    ? 'You are receiving 10% off your order!'
                                    : cartItems.length < 2
                                      ? '2+ scores: 10% off'
                                      : ''}
                            </div>
                            <div>
                                {cartItems.length >= 5
                                    ? 'You are receiving 20% off your order!'
                                    : '5+ scores: 20% off'}
                            </div>
                            <div>Discount applied at checkout.</div>
                        </PromoMessage>
                        {checkoutError.message !== '' && (
                            <ErrorMessage>
                                <Markdown
                                    options={{
                                        overrides: {
                                            a: {
                                                component: faqRedirectLink,
                                            },
                                        },
                                    }}
                                >
                                    {checkoutError.message}
                                </Markdown>
                            </ErrorMessage>
                        )}
                        {cartItems
                            .map((id) => {
                                return shopItems.find((prod) => prod.id === id);
                            })
                            .map((prod) => {
                                if (!prod) {
                                    return null;
                                }
                                subtotal += prod.price;
                                const error =
                                    checkoutError.message !== '' &&
                                    !!checkoutError.data &&
                                    checkoutError.data?.includes(prod.id);
                                return (
                                    <CartItem
                                        key={prod.id}
                                        item={prod}
                                        error={error}
                                    />
                                );
                            })}
                    </StyledItemList>
                ) : (
                    <EmptyMessage>Cart is Empty! Add items at the <Link to="/shop/scores" state={{ from: 'cart' }}>shop</Link> page.</EmptyMessage>
                )}
                <Subtotal>
                    <div>Subtotal:</div>
                    <div>{formatPrice(subtotal)}</div>
                </Subtotal>
                <CheckoutForm cartLength={cartItems.length} />
                <StripeDiv>
                    <StripeLink
                        href="https://stripe.com"
                        target="_blank"
                        rel="noopener, noreferrer"
                    >
                        <StripeIcon src="/static/images/logos/stripe-white.svg" />
                    </StripeLink>
                </StripeDiv>
            </InnerBorderContainer>
        </CartListDiv>
    );
};

export type CartListType = typeof CartList;
export type RequiredProps = Record<never, unknown>;
