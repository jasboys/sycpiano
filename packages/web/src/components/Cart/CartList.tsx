import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/system';
import Markdown from 'markdown-to-jsx';
import { mix } from 'polished';
import * as React from 'react';
import isEmail from 'validator/es/lib/isEmail';

import { toMedia } from 'src/mediaQuery';
import { CartItem } from 'src/components/Cart/CartItem';
import {
    checkoutAction,
    clearErrors,
    toggleCartList,
} from 'src/components/Cart/reducers';
import { Product } from 'src/components/Shop/ShopList/types';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { screenS } from 'src/screens';
import { lightBlue, logoBlue, theme } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { cartWidth } from 'src/styles/variables';
import { formatPrice } from 'src/utils';
import { LoadingInstance } from '../LoadingSVG.jsx';
import { Link } from 'react-router-dom';

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
    padding: '1rem',
    width: '100%',
    fontSize: '1.2rem',
    backgroundColor: 'white',
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
    const dispatch = useAppDispatch();

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
                onClick={() => dispatch(toggleCartList(false))}
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
    const dispatch = useAppDispatch();
    const [isMouseDown, setIsMouseDown] = React.useState(false);
    const savedEmail = useAppSelector(({ cart }) => cart.email);
    const isCheckingOut = useAppSelector(({ cart }) => cart.isCheckingOut);
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        setEmail(savedEmail);
    }, [savedEmail]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setError(event.target.value !== '' && !isEmail(event.target.value));
    };

    return (
        <ThemeProvider theme={theme}>
            <StyledForm
                onSubmit={(e) => {
                    e.preventDefault();
                    if (error || isCheckingOut) {
                        return;
                    }
                    if (email === '') {
                        setError(true);
                        return;
                    }
                    dispatch(checkoutAction(email));
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

const faqRedirectLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> =
    ({ href }) => {
        const dispatch = useAppDispatch();

        return (
            href && (
                <Link to={href} onClick={() => dispatch(toggleCartList(false))}>
                    FAQs
                </Link>
            )
        );
    };

export const CartList: React.FC<Record<never, unknown>> = () => {
    const isCheckingOut = useAppSelector(({ cart }) => cart.isCheckingOut);
    const shopItems = useAppSelector(({ shop }) => shop.items);
    const cart = useAppSelector(({ cart }) => cart.items);
    const checkoutError = useAppSelector(({ cart }) => cart.checkoutError);

    const dispatch = useAppDispatch();

    let subtotal = 0;
    const clearError =
        checkoutError.message !== '' &&
        cart.every((val) => !checkoutError.data?.includes(val));
    if (clearError) {
        dispatch(clearErrors());
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
                {cart.length !== 0 &&
                shopItems &&
                Object.keys(shopItems).length !== 0 ? (
                    <StyledItemList>
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
                        {cart.map((item: string) => {
                            // item = cart item
                            // reduce over all categories of shop items { arrangement: Product[]; cadenza: Product[]; original: Product[] },
                            // accumulate starting with undefined
                            // if accumulator is falsy, then return
                            // within all items in that category find the one where id === item
                            // null coalesce
                            const currentItem = Object.values(shopItems).reduce(
                                (acc: Product | undefined, prods) =>
                                    acc !== undefined
                                        ? acc
                                        : prods?.find((el) => el.id === item),
                                undefined,
                            );
                            subtotal += currentItem ? currentItem.price : 0;
                            const error =
                                checkoutError.message !== '' &&
                                !!checkoutError.data &&
                                checkoutError.data?.includes(item);
                            return (
                                currentItem && (
                                    <CartItem
                                        key={item}
                                        item={currentItem}
                                        error={error}
                                    />
                                )
                            );
                        })}
                    </StyledItemList>
                ) : (
                    <EmptyMessage>Cart is Empty!</EmptyMessage>
                )}
                <Subtotal>
                    <div>Subtotal:</div>
                    <div>{formatPrice(subtotal)}</div>
                </Subtotal>
                <CheckoutForm cartLength={cart.length} />
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
