import { css } from '@emotion/react';
import type * as React from 'react';

import iconMap from 'src/components/About/Discs/iconMap';
import type { Disc } from 'src/components/About/Discs/types';
import { toMedia } from 'src/mediaQuery';
import { isHamburger, screenXS } from 'src/screens';
import { cardShadow } from 'src/styles/mixins';
import { DiscLink } from './DiscLink';

const styles = {
    item: css({
        margin: '4rem auto',
        width: '100%',
        overflow: 'hidden',
        boxShadow: cardShadow,
        backgroundColor: 'white',
        display: 'flex',
        flexWrap: 'wrap',
        [toMedia(isHamburger)]: {
            width: '80vw',
        },
        '&:first-of-type': {
            marginTop: '2rem',
        },
    }),
    imgContainer: css({
        flex: '0 0 300px',
        overflow: 'hidden',
        [toMedia(screenXS)]: {
            height: '80vw',
            flex: '0 0 80vw',
        },
    }),
    img: css({
        minHeight: '100%',
        minWidth: '100%',
        height: 0,
        objectFit: 'cover',
        objectPosition: 'center center',
    }),
    details: css({
        flex: '1',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
    }),
    title: css({
        margin: 0,
        marginBottom: '0.5rem',
        fontSize: '1.5rem',
    }),
    span: css({
        margin: '0.5rem',
    }),
    divider: css({
        borderTop: '1px solid #888',
        height: 1,
        margin: '0.8rem 3rem 1.5rem',
    }),
    links: css({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    }),
    leftHighlight: css({
        borderLeft: '3px solid var(--light-blue)',
        span: {
            margin: '0.8rem',
            display: 'block',
        }
    })
};

interface DiscListProps {
    item: Disc;
}

const DiscListItem: React.FC<DiscListProps> = ({ item }) => {
    return (
        <li>
            <div css={styles.item}>
                <div css={styles.imgContainer}>
                    <img
                        css={styles.img}
                        alt={`${item.title} thumbnail`}
                        src={`/static/images/cd-thumbnails/${item.thumbnailFile}`}
                    />
                </div>
                <div css={styles.details}>
                    <span css={styles.title}>{item.title}</span>
                    <div css={styles.leftHighlight}>
                        <span>{item.label}</span>
                        <span>{item.releaseDate}</span>
                    </div>
                    <p>{item.description}</p>
                    <div css={styles.divider} />
                    <div css={styles.links}>
                        {item.discLinks
                            .filter((value) => value.type !== 'google')
                            .map((value) => (
                                <DiscLink
                                    type={value.type}
                                    key={`${item.id}-${value.type}`}
                                    linkUrl={value.url}
                                    imageUrl={iconMap[value.type]}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </li>
    );
};

export default DiscListItem;
