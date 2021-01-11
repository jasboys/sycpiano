import { css } from '@emotion/core';
import * as React from 'react';

import { ShopItem } from 'src/components/Shop/ShopItem';
import { Product, ProductTypes } from 'src/components/Shop/types';
import { useSelector } from 'react-redux';
import { GlobalStateShape } from 'src/types';
import { pushed } from 'src/styles/mixins';
import { RouteComponentProps } from 'react-router-dom';
import styled from '@emotion/styled';
import { lato2 } from 'src/styles/fonts';
import { logoBlue } from 'src/styles/colors';

type ShopListProps = {
    isMobile: boolean;
} & RouteComponentProps<{ product?: string }>

const listStyle = css(
    pushed,
    {
        overflowY: 'scroll',
        flex: '1 0 auto',
        zIndex: 10,
    }
);

const Category = styled.div<{ isMobile: boolean }>(({ isMobile }) => !isMobile && ({
    display: 'flex',
    flexDirection: 'column',
}));

const CategoryTitle = styled.div<{ isMobile: boolean }>(({ isMobile }) => ({
    color: logoBlue,
    fontFamily: lato2,
    fontSize: '1.6rem',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    background: `linear-gradient(white 0% 86%, ${logoBlue} 86% 88%, white 88%, rgba(255, 255, 255, 0))`,
    zIndex: 5,
    width: '100%',
    maxWidth: isMobile ? 'unset' : '800px',
    margin: isMobile ? 'unset' : '0 auto',
}));

const CategoryTitleText = styled.div<{ isMobile: boolean }>(({ isMobile }) => ({
    width: 'min-content',
    background: `linear-gradient(white 88%, rgba(255, 255, 255, 0) 88%)`,
    padding: isMobile ? '1.6rem 0.5rem 0' : '2.5rem 0.5rem 0',
    whiteSpace: 'nowrap',
}));

const CategoryToLabel: Record<typeof ProductTypes[number], string> = {
    arrangement: 'Arrangements',
    cadenza: 'Cadenzas',
    original: 'Original Compositions',
};

const ShopList: React.FC<ShopListProps> = ({ match: { params: { product } }, isMobile }) => {
    const categorizedItems = useSelector(({ shop }: GlobalStateShape) => shop.items);
    React.useEffect(() => {
        if (Object.keys(categorizedItems).length && product) {
            const el = document.getElementById(product);
            if (el) {
                el.scrollIntoView();
            }
        }
    }, [categorizedItems, product]);

    return (
        <div css={listStyle}>
            {
                Object.entries(categorizedItems).map(([key, items]) => (
                    <Category isMobile={isMobile} key={key}>
                        <CategoryTitle isMobile={isMobile}>
                            <CategoryTitleText isMobile={isMobile}>{CategoryToLabel[key as typeof ProductTypes[number]]}</CategoryTitleText>
                        </CategoryTitle>
                        {
                            items.map((item: Product, idx: number) => (
                                <ShopItem
                                    item={item}
                                    key={idx}
                                    isMobile={isMobile}
                                />
                            ))
                        }
                    </Category>
                ))
            }
        </div>
    )
};

export { ShopList };
