import { staticImage } from 'src/imageUrls';
import { toMedia } from 'src/mediaQuery';
import React from 'react';
import { css } from '@emotion/react';
import { hiDpx } from 'src/screens';

const styles = {
    img: css({
        transition: 'all 0.2s',
        verticalAlign: 'middle',
        height: '2rem',
        filter: 'saturate(0.3)',
        '&:hover': {
            transform: 'scale(1.1)',
            filter: 'saturate(1)',
            cursor: 'pointer',
        },

        [toMedia(hiDpx)]: {
            height: '1.8rem',
        },
    }),
    link: css({
        flex: '1 0 auto',
        textAlign: 'center',
        display: 'block',
    }),
};

interface DiscLinkProps {
    imageUrl: string;
    linkUrl: string;
    type: string;
}

export const DiscLink: React.FC<DiscLinkProps> = (props) => (
    <a
        css={styles.link}
        href={props.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
    >
        <img
            css={styles.img}
            alt={`${props.type} Icon`}
            src={staticImage(`/logos/${props.imageUrl}`)}
        />
    </a>
);