import * as React from 'react';

import AcclaimsListItem from 'src/components/About/Press/AcclaimsListItem';
import { navBarHeight } from 'src/styles/variables';
import { useAppSelector } from 'src/hooks';
import styled from '@emotion/styled';
import { lato2 } from 'src/styles/fonts';
import { MediaContextType } from 'src/types';
import { MediaContext } from 'src/components/App/App';

interface AcclaimsListProps {
    className?: string;
}

const AcclaimsListUL = styled.ul<MediaContextType>({
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
    const mediaProps = React.useContext(MediaContext);
    const acclaims = useAppSelector(({ pressAcclaimsList }) => pressAcclaimsList.items);

    return (
        <div>
            <AcclaimsListUL {...mediaProps}>
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