import * as React from 'react';

import AcclaimsListItem from 'src/components/About/Press/AcclaimsListItem';
import { navBarHeight } from 'src/styles/variables';
import { useAppSelector } from 'src/hooks';
import styled from '@emotion/styled';
import { lato2 } from 'src/styles/fonts';
import { mqSelectors } from 'src/components/App/reducers';

interface AcclaimsListProps {
    className?: string;
}

const AcclaimsListUL = styled.ul<{ isHamburger: boolean; hiDpx: boolean; }>({
    width: '100%',
    height: 'auto',
    padding: 0,
    margin: 0,
    listStyleType: 'none',
    fontFamily: lato2,
}, ({ isHamburger, hiDpx }) => isHamburger && ({
    paddingTop: navBarHeight.get(hiDpx),
    paddingBottom: 60,
}));

const AcclaimsList: React.FC<AcclaimsListProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx);
    const acclaims = useAppSelector(({ pressAcclaimsList }) => pressAcclaimsList.items);

    return (
        <div>
            <AcclaimsListUL isHamburger={isHamburger} hiDpx={hiDpx}>
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