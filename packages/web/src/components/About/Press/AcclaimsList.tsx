import { css } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type * as React from 'react';

import AcclaimsListItem from 'src/components/About/Press/AcclaimsListItem';
import { toMedia } from 'src/mediaQuery';
import { hiDpx, isHamburger } from 'src/screens';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts';
import { navBarHeight } from 'src/styles/variables';
import type { AcclaimItemShape } from './types.js';
import { useStore } from 'src/store.js';

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
            },
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
    const isHamburger = useStore().mediaQueries.isHamburger();
    const { data: acclaims } = useQuery({
        queryKey: ['acclaims'],
        queryFn: async () => {
            const { data: acclaims } =
                await axios.get<AcclaimItemShape[]>('/api/acclaims');
            return acclaims;
        },
    });

    return (
        acclaims && (
            <div>
                {!isHamburger && (
                    <li css={styles.title}>In the Press&hellip;</li>
                )}
                <ul css={styles.ul}>
                    {acclaims.map((acclaim) => (
                        <AcclaimsListItem acclaim={acclaim} key={acclaim.id} />
                    ))}
                </ul>
            </div>
        )
    );
};

export default AcclaimsList;