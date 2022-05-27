import * as React from 'react';

import styled from '@emotion/styled';

import DiscListItem from 'src/components/About/Discs/DiscListItem';

import { lato2 } from 'src/styles/fonts';
import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppSelector } from 'src/hooks';

interface DiscListOwnProps {
    isMobile: boolean;
}

type DiscListProps = DiscListOwnProps;

const DiscListUL = styled.ul`
    width: 100%;
    height: auto;
    padding: 0;
    margin: 0;
    list-style-type: none;
    font-family: ${lato2};

    ${screenXSorPortrait} {
        padding-top: ${navBarHeight.mobile}px;
        padding-bottom: 60px;
    }
`;

const DiscList: React.FunctionComponent<DiscListProps> = (props) => {
    const items = useAppSelector(({ discs }) => discs.discs);

    return (
        <div>
            <DiscListUL>
                {
                    items.map((item, id) => (
                        <DiscListItem
                            isMobile={props.isMobile}
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
