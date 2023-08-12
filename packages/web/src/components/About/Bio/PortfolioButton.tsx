import { css } from '@emotion/react';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import { staticImage } from 'src/imageUrls';
import { screenPortrait, screenXS } from 'src/screens';
import { lightBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';

const styles = {
    container: css({
        position: 'fixed',
        bottom: 25,
        right: '22.5vw',
        width: 'fit-content',
        zIndex: 50,
        filter: 'drop-shadow(0 2px 2px rgba(0 0 0 / 0.3))',
        transform: 'translateX(50%)',
        backgroundColor: lightBlue,
        borderRadius: 30,
        transition: 'all 0.1s',

        '&:hover': {
            cursor: 'pointer',
            filter: 'drop-shadow(0 5px 5px rgba(0 0 0 / 0.3))',
            transform: 'translateX(50%) translateY(-1px) scale(1.05)',
        },

        'a img': {
            display: 'block',
        },

        [toMedia([screenXS, screenPortrait])]: {
            bottom: 10,
            right: '50%',
        },
    }),
    link: css({
        display: 'flex',
        alignItems: 'center',
    }),
    text: css(latoFont(200), {
        fontSize: '1.25rem',
        color: 'white',
        marginLeft: '1rem',
        flex: '0 1 auto',
    }),
    img: css({
        flex: '0 1 auto',
        marginRight: '0.2rem',
    }),
};

const PortfolioButton: React.FC<unknown> = () => (
    <div css={styles.container}>
        <a
            css={styles.link}
            href="https://www.dropbox.com/sh/zv4q9qchzn83i4q/AABecbr-vlVemO-nrHeHyCVQa?dl=0"
            target="_blank"
            rel="noopener noreferrer"
        >
            <div css={styles.text}>Repertoire</div>
            <img
                css={styles.img}
                alt="Dropbox Icon"
                width={50}
                height={50}
                src={staticImage('/logos/dropbox-nobg.svg')}
            />
        </a>
    </div>
);

const MemoizedButton = React.memo(PortfolioButton, () => true);

export default MemoizedButton;
