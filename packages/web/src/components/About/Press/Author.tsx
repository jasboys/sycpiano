import { css } from '@emotion/react';
import { format } from 'date-fns';
import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts.js';

interface AuthorProps {
    author: string;
    date: Date;
    hasFullDate: boolean;
    website?: string;
    className?: string;
}

const getRepeatCSS = (n: number, s: string) => {
    return Array(n).fill(s).join(',');
};

const styles = {
    a: css({
        background: `linear-gradient(
                to bottom,
                transparent 0%,
                transparent calc(0.95em - 0.51px),
                ${logoBlue} calc(0.95em - 0.5px),
                ${logoBlue} calc(0.95em + 0.5px),
                transparent calc(0.95em + 0.51px),
                transparent 100%
            )`,
        transition: 'background 0.5s linear, color 0.5s linear',

        '&:hover': {
            background: `linear-gradient(
                    to bottom,
                    transparent 0%,
                    transparent calc(0.951em - 0.51px),
                    #000204 calc(0.95em - 0.5px),
                    #000204 calc(0.95em + 0.5px),
                    transparent calc(0.95em + 0.51px),
                    transparent 100%
                )`,
        },

        textShadow: getRepeatCSS(20, '0 0 1px white'),
    }),
    container: css(latoFont(400), {
        fontSize: '0.9rem',
        textAlign: 'right',
        color: logoBlue,
        padding: '1rem',
    }),
};

export const Author: React.FC<AuthorProps> = ({
    author,
    date,
    hasFullDate,
    website,
}) => {
    const Tag = website ? 'a' : 'span';
    const attributes = website
        ? {
              href: website,
              target: '_blank',
              rel: 'noopener noreferrer',
              css: styles.a,
          }
        : {};
    return (
        <div css={styles.container}>
            <Tag {...attributes}>
                <span>{`— ${author} `}</span>
                {/* <span css={{ display: 'inline-block' }}>
                    {`(${
                        hasFullDate
                            ? format(date, 'MMMM dd, yyyy')
                            : format(date, 'MMMM yyyy')
                    })`}
                </span> */}
            </Tag>
        </div>
    );
};