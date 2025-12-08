import { css } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type * as React from 'react';

import DiscListItem from 'src/components/About/Discs/DiscListItem';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts';
import { camel2var } from 'src/styles/variables';
import type { Disc } from './types.js';
import { mediaQueriesAtoms } from 'src/components/App/store.js';
import { useAtomValue } from 'jotai';

type DiscListProps = Record<never, unknown>;

const styles = {
    ul: css(latoFont(300), {
        width: 'fit-content',
        maxWidth: 800,
        height: 'auto',
        padding: 0,
        margin: '0 auto',
        listStyleType: 'none',
        [toMedia(isHamburger)]: {
            paddingBottom: 60,
            paddingTop: camel2var('navBarHeight'),
        },
    }),
    li: css(latoFont(400), {
        fontSize: '1.5rem',
        width: '100%',
        margin: '2rem auto',
        color: logoBlue,
    }),
};

const DiscList: React.FunctionComponent<DiscListProps> = () => {
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);
    const { data: items } = useQuery({
        queryKey: ['discs'],
        queryFn: async () => {
            const { data: discs }: { data: Disc[] } =
                await axios.get('/api/discs');
            // sort by date descending
            return discs.sort((a, b) => b.releaseDate - a.releaseDate);
        },
    });

    return (
        items && (
            <div>
                <ul css={styles.ul}>
                    {!isHamburger && <li css={styles.li}>Discography</li>}
                    {items.map((item) => (
                        <DiscListItem item={item} key={item.id} />
                    ))}
                </ul>
            </div>
        )
    );
};

export default DiscList;
