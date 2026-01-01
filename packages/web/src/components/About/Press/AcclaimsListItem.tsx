import { css } from '@emotion/react';
import type * as React from 'react';

import type { AcclaimItemShape } from 'src/components/About/Press/types';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { Author } from './Author';

const styles = {
    container: css({
        margin: '2rem auto 3rem',
        maxwidth: 800,
        fontSize: '1.1rem',
        backgroundColor: 'white',
        boxShadow: '0 4px 7px -7px rgba(0 0 0 / 0.7)',
        [toMedia([screenXS, screenPortrait])]: {
            fontSize: '1rem',
            padding: '0 1.2rem',
        },
    }),
    quote: css(latoFont(300), {
        margin: '2rem 0 0',
        padding: '2rem 2rem 0',
        textAlign: 'left',
        lineHeight: '1.5rem',
    }),
};

interface AcclaimsListItemProps {
    acclaim: AcclaimItemShape;
    className?: string;
}

const AcclaimsListItem: React.FC<AcclaimsListItemProps> = ({ acclaim }) => (
    <div>
        <div css={styles.container}>
            <div css={styles.quote}>{acclaim.quote}</div>
            <Author
                author={acclaim.author}
                website={acclaim.website}
            />
        </div>
    </div>
);

export default AcclaimsListItem;
