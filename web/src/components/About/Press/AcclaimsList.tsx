import * as React from 'react';

import AcclaimsListItem from 'src/components/About/Press/AcclaimsListItem';
import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppSelector } from 'src/hooks';
import styled from '@emotion/styled';
import { lato2 } from 'src/styles/fonts';

interface AcclaimsListProps {
    className?: string;
    isMobile?: boolean;
}

const AcclaimsListUL = styled.ul`
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

const AcclaimsList: React.FC<AcclaimsListProps> = () => {
    const acclaims = useAppSelector(({ pressAcclaimsList }) => pressAcclaimsList.items);

    return (
        <div>
            <AcclaimsListUL>
                {
                    acclaims.map((acclaim, id) => (
                        <AcclaimsListItem acclaim={acclaim} key={id} />
                    ))
                }
            </AcclaimsListUL>
        </div>
    );
}

export default AcclaimsList;