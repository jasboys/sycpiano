import { css } from '@emotion/react';
import styled from '@emotion/styled';
import toUpper from 'lodash-es/toUpper';
import { mix } from 'polished';
import * as React from 'react';

import type { Product } from 'src/components/Shop/ShopList/types';
import { staticImage } from 'src/imageUrls';
import { toMedia } from 'src/mediaQuery.js';
import { screenTouch } from 'src/screens.js';
import { logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { getHoverStyle, noHighlight } from 'src/styles/mixins';
import { formatPrice } from 'src/utils.js';
import { rootStore, useStore } from 'src/store.js';

interface ShopItemProps {
    item: Product;
    className?: string;
}

const ThumbnailContainer = styled.div<{ isHamburger: boolean }>(
    {
        zIndex: 0,
        position: 'relative',
        '&:before, &:after': {
            zIndex: -1,
            position: 'absolute',
            content: '""',
            bottom: '16px',
            left: '0.35rem',
            width: '50%',
            top: '85%',
            maxWidth: '48%',
            background: 'rgba(0,0,0,0.7)',
            boxShadow: '0 1.0rem 0.75rem -2px rgba(0, 0, 0, 0.7)',
            transform: 'rotate(-3deg)',
        },
        '&:after': {
            transform: 'rotate(3deg)',
            right: '0.35rem',
            left: 'unset',
        },
    },
    ({ isHamburger }) => ({
        flex: `0 0 ${isHamburger ? '80vw' : '210px'}`,
        boxShadow: `0 2px 7px -4px rgba(0,0,0,0.8)${
            isHamburger ? ', 0 -2px 7px -4px rgba(0, 0, 0, 0.8)' : ''
        }`,
        width: isHamburger ? '60vw' : '',
        height: isHamburger ? '80vw' : 280,
        maxHeight: isHamburger ? 280 : 'unset',
        maxWidth: isHamburger ? 210 : 'unset',
    }),
);

const Thumbnail = styled.div<{ imageUrl: string; isHamburger: boolean }>(
    {
        backgroundColor: '#fff',
        backgroundPosition: 'center 10px',
        backgroundSize: '92%',
        backgroundRepeat: 'no-repeat',
        height: '100%',
    },
    (props) => {
        const spread = props.isHamburger ? '0.5rem' : '0.5rem';
        return {
            backgroundImage: `url(${props.imageUrl})`,
            boxShadow: `0 0 2px ${spread} rgba(255, 255, 255, 1) inset`,
        };
    },
);

const ContentContainer = styled.div<{ isHamburger: boolean }>(
    {
        flex: '1 1 auto',
        height: 'auto',
        padding: '1rem 1rem 1rem 4rem',
        backgroundColor: 'transparent',
        letterSpacing: '0.01rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ({ isHamburger }) =>
        isHamburger && {
            padding: '1rem',
        },
);

const baseItemInCart = css({
    color: 'white',
    backgroundColor: mix(0.5, logoBlue, '#FFF'),
    border: `1px solid ${mix(0.52, logoBlue, '#FFF')}`,
});

const baseItemNotInCart = css({
    color: logoBlue,
    backgroundColor: 'white',
    border: `1px solid ${logoBlue}`,
});

const CartButton = styled.button<{
    isItemInCart: boolean;
    isMouseDown: boolean;
    isHamburger: boolean;
}>(
    latoFont(300),
    {
        fontSize: '0.9rem',
        width: 230,
        padding: 10,
        textAlign: 'center',
        borderRadius: 8,
        transition: 'all 0.25s',
        userSelect: 'none',
        [toMedia(screenTouch)]: {
            boxShadow: '0 1px 5px -2px rgba(0, 0, 0, 0.4)',
        },
    },
    noHighlight,
    ({ isMouseDown }) => ({
        '&:hover': getHoverStyle(isMouseDown),
    }),
    ({ isItemInCart }) => {
        return isItemInCart ? baseItemInCart : baseItemNotInCart;
    },
);

const ShopItemContainer = styled.div<{ isHamburger: boolean }>(
    latoFont(300),
    {
        height: 'auto',
        display: 'flex',
        borderRadius: 4,
        margin: '2.5rem auto',
        flex: '0 1 auto',
        scrollMarginTop: '5rem',
    },
    ({ isHamburger }) =>
        isHamburger && {
            flex: '0 0 300px',
            flexDirection: 'column',
            alignItems: 'center',
        },
);

const ItemName = styled.div<{ isHamburger: boolean }>(({ isHamburger }) => ({
    margin: isHamburger ? '0.8rem 0' : 'unset',
    fontSize: '1.2rem',
    // textAlign: isHamburger ? 'center' : 'unset',
    fontWeight: 400,
    flex: '0 0 auto',
}));

const ItemDescription = styled.div<{ isHamburger: boolean }>(
    ({ isHamburger }) => ({
        // margin: isHamburger ? '1rem 2rem' : '1rem 0',
        paddingLeft: isHamburger ? '2rem' : '1rem',
    }),
);

const ItemDetails = styled.span({
    margin: '0.2rem 0',
});

const ItemPrice = styled.span({
    margin: '0.2rem 0',
    fontWeight: 500,
});

const DetailContainer = styled.div<{ isHamburger: boolean }>(
    {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 500,
        marginBottom: '1.5rem',
    },
    ({ isHamburger }) =>
        isHamburger && {
            justifyContent: 'space-evenly',
        },
);

const Separator = styled.span({
    margin: '0.2rem 1rem',
    fontSize: '1.5rem',
});

const SampleLink = styled.div<{ isHamburger: boolean }>(
    latoFont(400),
    {
        a: {
            color: 'var(--light-blue)',
        },
    },
    ({ isHamburger }) => ({
        margin: isHamburger ? '1rem 2rem' : '1.5rem 0 0',
        paddingLeft: isHamburger ? 'unset' : '1rem',
    }),
);

const leftHighlight = css({
    margin: '1rem 0',
    padding: '1rem 0',
    borderLeft: '3px solid var(--light-blue)',
    flex: '1 1 auto',
});

export const ShopItem: React.FC<ShopItemProps> = ({ item, className }) => {
    const isHamburger = useStore().mediaQueries.isHamburger();
    const isItemInCart = rootStore.cart.useStore((state) =>
        state.items.includes(item.id),
    );
    const [isMouseDown, setIsMouseDown] = React.useState(false);

    return (
        <ShopItemContainer
            id={item.permalink}
            isHamburger={isHamburger}
            className={className}
        >
            <ThumbnailContainer isHamburger={isHamburger}>
                <Thumbnail
                    isHamburger={isHamburger}
                    imageUrl={
                        staticImage(`/products/thumbnails/${item.images[0]}`) ||
                        ''
                    }
                />
            </ThumbnailContainer>
            <ContentContainer isHamburger={isHamburger}>
                <ItemName isHamburger={isHamburger}>{item.name}</ItemName>
                <div css={leftHighlight}>
                    <ItemDescription isHamburger={isHamburger}>
                        {item.description}
                    </ItemDescription>
                    {item.sample && (
                        <SampleLink isHamburger={isHamburger}>
                            <a href={item.sample} target="seanchenpiano_sample">
                                Listen to the work here.
                            </a>
                        </SampleLink>
                    )}
                </div>
                <div>
                    <DetailContainer isHamburger={isHamburger}>
                        <ItemDetails>
                            {toUpper(item.format)}
                            {isHamburger ? '' : ' format'}
                        </ItemDetails>
                        <Separator>|</Separator>
                        <ItemDetails>
                            {item.pages}
                            {isHamburger ? ' pp.' : ' pages'}
                        </ItemDetails>
                        <Separator>|</Separator>
                        <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                    </DetailContainer>
                    <CartButton
                        isHamburger={isHamburger}
                        isMouseDown={isMouseDown}
                        isItemInCart={isItemInCart}
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
                        onClick={() =>
                            isItemInCart
                                ? rootStore.cart.set.removeItem(item.id)
                                : rootStore.cart.set.addItem(item.id)
                        }
                    >
                        {isItemInCart ? 'Remove from Cart' : 'Add to Cart'}
                    </CartButton>
                </div>
            </ContentContainer>
        </ShopItemContainer>
    );
};
