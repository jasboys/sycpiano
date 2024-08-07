import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ShopItem } from 'src/components/Shop/ShopList/ShopItem';
import type {
    Product,
    ProductTypes,
} from 'src/components/Shop/ShopList/types';
import { toMedia } from 'src/mediaQuery.js';
import { isHamburger, screenPortrait, screenXS } from 'src/screens.js';
import { logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';
import { shopStore } from './store.js';
import { useStore } from 'src/store.js';

type ShopListProps = Record<never, unknown>;

const listStyle = css(pushed, {
    overflowY: 'scroll',
    flex: '1 0 auto',
    zIndex: 10,
});

const Category = styled.div<{ isHamburger: boolean }>(
    ({ isHamburger }) =>
        !isHamburger && {
            display: 'flex',
            flexDirection: 'column',
        },
);

const CategoryTitle = styled.div<{ isHamburger: boolean }>(
    ({ isHamburger }) => ({
        color: logoBlue,
        fontSize: 'min(10vw, 2rem)',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        // background: `linear-gradient(white 0% 48%, ${logoBlue} 48% 52%, white 52%, rgba(255, 255, 255, 0))`,
        zIndex: 5,
        width: '100%',
        maxWidth: isHamburger ? 800 : 750,
        margin: isHamburger ? '0 auto' : '0 auto',
    }),
);

const CategoryTitleText = styled.div<{ isHamburger: boolean }>(latoFont(300), {
    width: '100%',
    background: 'linear-gradient(white 92%, rgba(255, 255, 255, 0) 100%)',
    padding: '2rem 0 0.5rem 0',
    whiteSpace: 'nowrap',
    [toMedia([screenXS, screenPortrait])]: {
        // paddingTop: '2.5rem',
    },
});

const categoryListStyle = css({
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: 650,
    margin: 'auto',
    [toMedia(isHamburger)]: {
        maxWidth: 800,
    },
});

const CategoryToLabel: Record<(typeof ProductTypes)[number], string> = {
    arrangement: 'Arrangements',
    cadenza: 'Cadenzas',
    original: 'Original Compositions',
};

const ShopList: React.FC<ShopListProps> = () => {
    const isHamburger = useStore().mediaQueries.isHamburger();
    const { product } = useParams();
    const shopItems = shopStore.use.items?.();

    React.useEffect(() => {
        if (shopItems && Object.keys(shopItems).length && product) {
            const el = document.getElementById(product);
            if (el) {
                el.scrollIntoView();
            }
        }
    }, [shopItems, product]);

    return (
        shopItems && (
            <div css={listStyle}>
                {Object.entries(shopItems).map(([key, items]) => (
                    <Category isHamburger={isHamburger} key={key}>
                        <CategoryTitle isHamburger={isHamburger}>
                            <CategoryTitleText isHamburger={isHamburger}>
                                {
                                    CategoryToLabel[
                                        key as (typeof ProductTypes)[number]
                                    ]
                                }
                            </CategoryTitleText>
                        </CategoryTitle>
                        <div css={categoryListStyle}>
                            {items.map((item: Product) => (
                                <ShopItem item={item} key={item.id} />
                            ))}
                        </div>
                    </Category>
                ))}
            </div>
        )
    );
};

export default ShopList;
export type ShopListType = typeof ShopList;
export type RequiredProps = React.ComponentProps<ShopListType>;
