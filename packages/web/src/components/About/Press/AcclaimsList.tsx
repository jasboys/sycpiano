import styled from '@emotion/styled';
import * as React from 'react';

import AcclaimsListItem from 'src/components/About/Press/AcclaimsListItem';
import { mqSelectors } from 'src/components/App/reducers';
import { useAppSelector } from 'src/hooks';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts';
import { navBarHeight } from 'src/styles/variables';

interface AcclaimsListProps {
    className?: string;
}

const AcclaimsListUL = styled.ul<{ isHamburger: boolean; hiDpx: boolean }>(
    latoFont(200),
    {
        width: '100%',
        maxWidth: 800,
        height: 'auto',
        padding: 0,
        margin: '0 auto',
        listStyleType: 'none',
    },
    ({ isHamburger, hiDpx }) =>
        isHamburger && {
            paddingTop: navBarHeight.get(hiDpx),
            paddingBottom: 60,
        },
);

const Title = styled.li(latoFont(400), {
    fontSize: '1.5rem',
    width: '100%',
    margin: '2rem auto',
    maxWidth: 800,
    listStyle: 'none',
    color: logoBlue,
});

const AcclaimsList: React.FC<AcclaimsListProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx);
    const acclaims = useAppSelector(
        ({ pressAcclaimsList }) => pressAcclaimsList.items,
    );

    return (
        <div>
            {!isHamburger && <Title>In the Press&hellip;</Title>}
            <AcclaimsListUL isHamburger={isHamburger} hiDpx={hiDpx}>
                {acclaims.map((acclaim) => (
                    <AcclaimsListItem acclaim={acclaim} key={acclaim.id} />
                ))}
            </AcclaimsListUL>
        </div>
    );
};

export default AcclaimsList;