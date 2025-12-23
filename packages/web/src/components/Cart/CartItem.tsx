import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { useSetAtom } from 'jotai';
import { mix } from 'polished';
import type * as React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from 'src/components/Shop/ShopList/types';
import { staticImage } from 'src/imageUrls';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts.js';
import { formatPrice } from 'src/utils';
import { cartActions } from './store';

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
    const removeItem = useSetAtom(cartActions.removeItem);
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
                    <button
                        css={{
                            all: 'unset',
                            flex: '0 0 auto',
                            fontWeight: 300,
                            fontSize: '0.72rem',
                            borderRadius: 4,
                            color: logoBlue,
                            backgroundColor: 'white',
                            border: `1px solid ${logoBlue}`,
                            padding: '0.25rem 0.4rem',
                            height: 'fit-content',
                            transition: 'all 0.15s',
                            '&:hover': {
                                backgroundColor: mix(0.75, logoBlue, '#FFF'),
                                color: 'white',
                                cursor: 'pointer',
                                border: `1px solid ${mix(0.75, logoBlue, '#FFF')}`,
                            },
                        }}
                        type="button"
                        tabIndex={0}
                        onClick={() => removeItem(item.id)}
                    >
                        remove
                    </button>
                </div>
                <div css={{ marginTop: '0.5rem' }}>
                    <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                    {/* <Divider>|</Divider> */}
                </div>
            </ItemDescription>
        </ItemContainer>
    );
};
