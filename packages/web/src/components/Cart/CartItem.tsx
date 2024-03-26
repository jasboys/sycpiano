import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import type * as React from 'react';
import { Link } from 'react-router-dom';

import { removeItemFromCart } from 'src/components/Cart/reducers';
import type { Product } from 'src/components/Shop/ShopList/types';
import { useAppDispatch } from 'src/hooks';
import { staticImage } from 'src/imageUrls';
import { latoFont } from 'src/styles/fonts.js';
import { formatPrice } from 'src/utils';

const ItemContainer = styled.div({
    display: 'flex',
    margin: '2rem 1rem',
});

const ItemThumbnail = styled.div({
    flex: '0 0 20%',
    display: 'flex',
    img: {
        width: '100%',
        objectFit: 'cover',
        flex: '1',
        overflow: 'hidden',
        objectPosition: 'center',
    },
});

const ItemDescription = styled.div({
    padding: '0 0 0.5rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: '0 0 80%',
});

const ItemName = styled(Link, {
    shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'error',
})<{ error: boolean }>(
    latoFont(400),
    {
        flex: '0 1 auto',
        fontSize: '0.9rem',
        color: 'black',
        paddingRight: '1rem',
        '&:hover': {
            cursor: 'pointer',
            textDecoration: 'underline',
        },
        '&:visited': {
            color: '',
        },
    },
    ({ error }) =>
        error && {
            color: 'darkred',
            '&:visited': {
                color: 'darkred',
            },
            '&:hover': {
                color: 'darkred',
            },
        },
);

const ItemPrice = styled.div({
    display: 'inline',
});

interface CartProps {
    item: Product;
    error: boolean;
}

export const CartItem: React.FC<CartProps> = ({ item, error }) => {
    const dispatch = useAppDispatch();

    return (
        <ItemContainer>
            <ItemThumbnail>
                <img
                    src={staticImage(`/products/thumbnails/${item.images[0]}`)}
                    alt={`${item.name} thumbnail`}
                />
            </ItemThumbnail>
            <ItemDescription>
                <div css={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ItemName
                        to={`/shop/scores/${item.permalink}`}
                        error={error}
                    >
                        {item.name}
                    </ItemName>
                    <a
                        css={{ flex: '0 0 auto', fontWeight: 300 }}
                        role="button"
                        tabIndex={0}
                        // biome-ignore lint/a11y/useValidAnchor: <explanation>
                        onClick={() => dispatch(removeItemFromCart(item.id))}
                    >
                        Remove
                    </a>
                </div>
                <div css={{ marginTop: '0.5rem' }}>
                    <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                    {/* <Divider>|</Divider> */}
                </div>
            </ItemDescription>
        </ItemContainer>
    );
};
