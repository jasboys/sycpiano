import { css } from '@emotion/react';
import * as React from 'react';

import AcclaimsListItem from 'src/components/About/Press/AcclaimsListItem';
import { mqSelectors } from 'src/components/App/reducers';
import { useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { hiDpx, isHamburger } from 'src/screens';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts';
import { navBarHeight } from 'src/styles/variables';

interface AcclaimsListProps {
    className?: string;
}

const styles = {
    ul: css(latoFont(200), {
        width: '100%',
        maxWidth: 800,
        height: 'auto',
        padding: 0,
        margin: '0 auto',
        listStyleType: 'none',
        [toMedia(isHamburger)]: {
            paddingBottom: 60,
            paddingTop: navBarHeight.lowDpx,
            [toMedia(hiDpx)]: {
                paddingTop: navBarHeight.hiDpx,
            }
        },
    }),
    title: css(latoFont(400), {
        fontSize: '1.5rem',
        width: '100%',
        margin: '2rem auto',
        maxWidth: 800,
        listStyle: 'none',
        color: logoBlue,
    }),
};

const AcclaimsList: React.FC<AcclaimsListProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const acclaims = useAppSelector(
        ({ pressAcclaimsList }) => pressAcclaimsList.items,
    );

    return (
        <div>
            {!isHamburger && <li css={styles.title}>In the Press&hellip;</li>}
            <ul css={styles.ul}>
                {acclaims.map((acclaim) => (
                    <AcclaimsListItem acclaim={acclaim} key={acclaim.id} />
                ))}
            </ul>
        </div>
    );
};

export default AcclaimsList;