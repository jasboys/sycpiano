import { css } from '@emotion/react';
import * as React from 'react';

import { ShopItem } from 'src/components/Shop/ShopList/ShopItem';
import { Product, ProductTypes } from 'src/components/Shop/ShopList/types';
import { pushed } from 'src/styles/mixins';
import styled from '@emotion/styled';
import { latoFont } from 'src/styles/fonts';
import { logoBlue } from 'src/styles/colors';
import { useAppSelector } from 'src/hooks';
import { useParams } from 'react-router-dom';
import { mqSelectors } from 'src/components/App/reducers';

type ShopListProps = Record<never, unknown>;

const listStyle = css(
    pushed,
    {
        overflowY: 'scroll',
        flex: '1 0 auto',
        zIndex: 10,
    }
);

const Category = styled.div<{ isHamburger: boolean }>(({ isHamburger }) => !isHamburger && ({
    display: 'flex',
    flexDirection: 'column',
}));

const CategoryTitle = styled.div<{ isHamburger: boolean }>(({ isHamburger }) => (
    latoFont(200),
    {
        color: logoBlue,
        fontSize: '1.6rem',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        background: `linear-gradient(white 0% 86%, ${logoBlue} 86% 88%, white 88%, rgba(255, 255, 255, 0))`,
        zIndex: 5,
        width: '100%',
        maxWidth: isHamburger ? 'unset' : '800px',
        margin: isHamburger ? 'unset' : '0 auto',
    }));

const CategoryTitleText = styled.div<{ isHamburger: boolean }>(({ isHamburger }) => ({
    width: 'min-content',
    background: `linear-gradient(white 88%, rgba(255, 255, 255, 0) 88%)`,
    padding: isHamburger ? '1.6rem 0.5rem 0' : '2.5rem 0.5rem 0',
    whiteSpace: 'nowrap',
}));

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
        if (categorizedItems && Object.keys(categorizedItems).length && product) {
            const el = document.getElementById(product);
            if (el) {
                el.scrollIntoView();
            }
        }
    }, [categorizedItems, product]);

    return (categorizedItems === undefined) ? null : (
        <div css={listStyle}>
            {
                Object.entries(categorizedItems).map(([key, items]) => (
                    <Category isHamburger={isHamburger} key={key}>
                        <CategoryTitle isHamburger={isHamburger}>
                            <CategoryTitleText isHamburger={isHamburger}>{CategoryToLabel[key as typeof ProductTypes[number]]}</CategoryTitleText>
                        </CategoryTitle>
                        {
                            items.map((item: Product, idx: number) => (
                                <ShopItem
                                    item={item}
                                    key={idx}
                                />
                            ))
                        }
                    </Category>
                ))
            }
        </div>
    )
};

export default ShopList;
export type ShopListType = typeof ShopList;
export type RequiredProps = React.ComponentProps<ShopListType>;
