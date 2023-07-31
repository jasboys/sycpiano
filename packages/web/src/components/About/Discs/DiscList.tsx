import { css } from '@emotion/react';
import * as React from 'react';

import { toMedia } from 'src/MediaQuery';
import DiscListItem from 'src/components/About/Discs/DiscListItem';
import { mqSelectors } from 'src/components/App/reducers';
import { useAppSelector } from 'src/hooks';
import { isHamburger } from 'src/screens';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts';
import { camel2var } from 'src/styles/variables';

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
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const items = useAppSelector(({ discs }) => discs.discs);

    return (
        <div>
            <ul css={styles.ul}>
                {!isHamburger && <li css={styles.li}>Discography</li>}
                {items.map((item) => (
                    <DiscListItem item={item} key={item.id} />
                ))}
            </ul>
        </div>
    );
};

export default DiscList;
