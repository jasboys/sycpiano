import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { toMedia } from 'src/MediaQuery.js';
import { mqSelectors } from 'src/components/App/reducers';
import { ShopItem } from 'src/components/Shop/ShopList/ShopItem';
import { Product, ProductTypes } from 'src/components/Shop/ShopList/types';
import { useAppSelector } from 'src/hooks';
import { screenPortrait, screenXS } from 'src/screens.js';
import { logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';

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
        maxWidth: isHamburger ? 'unset' : '750px',
        margin: isHamburger ? 'unset' : '0 auto',
    }),
);

const CategoryTitleText = styled.div<{ isHamburger: boolean }>(latoFont(300), {
    width: '100%',
    background: 'linear-gradient(white 92%, rgba(255, 255, 255, 0) 100%)',
    padding: '2rem 0 0.5rem 0',
    whiteSpace: 'nowrap',
    [toMedia([screenXS, screenPortrait])]: {
        paddingTop: '2.5rem',
    },
});

const CategoryToLabel: Record<typeof ProductTypes[number], string> = {
    arrangement: 'Arrangements',
    cadenza: 'Cadenzas',
    original: 'Original Compositions',
};

const ShopList: React.FC<ShopListProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const { product } = useParams();
    const categorizedItems = useAppSelector(({ shop }) => shop.items);

    React.useEffect(() => {
        if (
            categorizedItems &&
            Object.keys(categorizedItems).length &&
            product
        ) {
            const el = document.getElementById(product);
            if (el) {
                el.scrollIntoView();
            }
        }
    }, [categorizedItems, product]);

    return categorizedItems === undefined ? null : (
        <div css={listStyle}>
            {Object.entries(categorizedItems).map(([key, items]) => (
                <Category isHamburger={isHamburger} key={key}>
                    <CategoryTitle isHamburger={isHamburger}>
                        <CategoryTitleText isHamburger={isHamburger}>
                            {
                                CategoryToLabel[
                                    key as typeof ProductTypes[number]
                                ]
                            }
                        </CategoryTitleText>
                    </CategoryTitle>
                    {items.map((item: Product) => (
                        <ShopItem item={item} key={item.id} />
                    ))}
                </Category>
            ))}
        </div>
    );
};

export default ShopList;
export type ShopListType = typeof ShopList;
export type RequiredProps = React.ComponentProps<ShopListType>;
