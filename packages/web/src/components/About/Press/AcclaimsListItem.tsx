import { css } from '@emotion/react';
import { parseISO } from 'date-fns';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import { AcclaimItemShape } from 'src/components/About/Press/types';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { Author } from './Author';

const styles = {
    container: css({
        margin: '2rem auto 3rem',
        maxwidth: 800,
        fontSize: '1.1rem',
        [toMedia([screenXS, screenPortrait])]: {
            fontSize: '1rem',
            padding: '0 1.2rem',
        },
    }),
    quote: css(latoFont(300), {
        margin: '2rem 0 1.5rem',
        padding: '2rem',
        textAlign: 'left',
        lineHeight: '1.5rem',
        backgroundColor: 'white',
        boxShadow: '0 4px 7px -7px rgba(0 0 0 / 0.7)',
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
                date={parseISO(acclaim.date)}
                hasFullDate={acclaim.hasFullDate}
                website={acclaim.website}
            />
        </div>
    </div>
);

export default AcclaimsListItem;
