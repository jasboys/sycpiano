import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { QueryObserverResult } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { mediaQueriesAtoms } from 'src/components/App/store.js';
import { cartAtoms } from 'src/components/Cart/store.js';
import { ShopItem } from 'src/components/Shop/ShopList/ShopItem';
import type { Product, ProductMap, ProductTypes } from 'src/components/Shop/ShopList/types';
import { toMedia } from 'src/mediaQuery.js';
import { isHamburger, screenPortrait, screenXS } from 'src/screens.js';
import { logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { pushed, verticalTextStyle } from 'src/styles/mixins';
import { shopItemsAtom } from './store.js';

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

const verticalStyle = css(
    verticalTextStyle,
    {
        left: 'calc(50% - min(50%, 375px))',
        transform: 'rotate(90deg)',
    }
)

const CategoryToLabel: Record<(typeof ProductTypes)[number], string> = {
    arrangement: 'Arrangements',
    cadenza: 'Cadenzas',
    original: 'Original Compositions',
};

const ShopList: React.FC<ShopListProps> = () => {
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);
    const setCartOpen = useSetAtom(cartAtoms.visible);
    const params = useParams();
    const { data: shopItems } = useAtomValue<QueryObserverResult<ProductMap>>(shopItemsAtom);
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        console.log(params.product);
        if (shopItems && Object.keys(shopItems).length && params.product) {
            const el = document.getElementById(params.product);
            if (el) {
                el.scrollIntoView();
            }
        }
    }, [shopItems, params.product, location.key]);

    React.useEffect(() => {
        console.log(location);
        if (location.state?.from === 'cart') {
            setCartOpen(false);
            navigate({}, { replace: true });
        }
    }, [location])

    return (
        <>
        {!isHamburger && <div css={verticalStyle}>SCORES</div>}
        {shopItems && (
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
        )}
        </>
    );
};

export default ShopList;
export type ShopListType = typeof ShopList;
export type RequiredProps = React.ComponentProps<ShopListType>;
