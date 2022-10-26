import * as React from 'react';

import styled from '@emotion/styled';

import DiscListItem from 'src/components/About/Discs/DiscListItem';

import { lato2, lato3 } from 'src/styles/fonts';
import { camel2var } from 'src/styles/variables';
import { useAppSelector } from 'src/hooks';
import { MediaContext } from 'src/components/App/App';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';

type DiscListProps = Record<never, unknown>;

const DiscListUL = styled.ul(
    {
        width: 'fit-content',
        maxWidth: 800,
        height: 'auto',
        padding: 0,
        margin: '0 auto',
        listStyleType: 'none',
        fontFamily: lato2,
        [toMedia(isHamburger)]: {
            paddingBottom: 60,
            paddingTop: camel2var('navBarHeight'),
        }
    }
);

const Title = styled.li({
    fontFamily: lato3,
    fontSize: '2rem',
    width: '100%',
    margin: '4rem auto',
});

const DiscList: React.FunctionComponent<DiscListProps> = () => {
    const { isHamburger } = React.useContext(MediaContext);
    const items = useAppSelector(({ discs }) => discs.discs);

    return (
        <div>
            <DiscListUL>
                {!isHamburger && <Title>Discography</Title>}
                {
                    items.map((item, id) => (
                        <DiscListItem
                            item={item}
                            key={id}
                        />
                    ))
                }
            </DiscListUL>
        </div>
    );
};

export default DiscList;
