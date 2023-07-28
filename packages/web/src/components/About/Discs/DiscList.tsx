import * as React from 'react';

import styled from '@emotion/styled';

import DiscListItem from 'src/components/About/Discs/DiscListItem';

import { latoFont } from 'src/styles/fonts';
import { camel2var } from 'src/styles/variables';
import { useAppSelector } from 'src/hooks';
import { toMedia } from 'src/MediaQuery';
import { isHamburger } from 'src/screens';
import { mqSelectors } from 'src/components/App/reducers';
import { logoBlue } from 'src/styles/colors.js';

type DiscListProps = Record<never, unknown>;

const DiscListUL = styled.ul(
    latoFont(300),
    {
        width: 'fit-content',
        maxWidth: 800,
        height: 'auto',
        padding: 0,
        margin: '0 auto',
        listStyleType: 'none',
        [toMedia(isHamburger)]: {
            paddingBottom: 60,
            paddingTop: camel2var('navBarHeight'),
        }
    }
);

const Title = styled.li(
    latoFont(400),
    {
        fontSize: '1.5rem',
        width: '100%',
        margin: '2rem auto',
        color: logoBlue,
    });

const DiscList: React.FunctionComponent<DiscListProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
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
