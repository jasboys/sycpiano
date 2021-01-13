import moment from 'moment-timezone';
import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { AcclaimItemShape } from 'src/components/About/Press/types';
import { logoBlue } from 'src/styles/colors';
import { lato1, lato2 } from 'src/styles/fonts';
import { screenXSorPortrait } from 'src/styles/screens';

const AcclaimContainer = styled.div`
    margin: 0 auto;
    max-width: 800px;
    font-size: 1.2rem;

    ${screenXSorPortrait} {
        font-size: 1rem;
        padding: 0 1.2rem;
    }
`;

interface QuoteProps {
    quote: string;
    className?: string;
}

let Quote: React.FC<QuoteProps> = (props) => (
    <div className={props.className}>
        {props.quote}
    </div>
);

Quote = styled(Quote)`
    font-family: ${lato2};
    margin-bottom: 20px;
    text-align: center;
    line-height: 1.5em;
`;

interface AuthorProps {
    author: string;
    date: moment.Moment;
    hasFullDate: boolean;
    website: string;
    className?: string;
}

const getRepeatCSS = (n: number, s: string) => {
    let result = '';
    for (let i = 0; i < n; i++) {
        result += s + ((i === n - 1) ? '' : ',');
    }
    return result;
};

const Link = styled('a')`
    font-family: ${lato2};
    background:
        linear-gradient(
            to bottom,
            transparent 0%,
            transparent calc(0.95em - 0.51px),
            ${logoBlue} calc(0.95em - 0.5px),
            ${logoBlue} calc(0.95em + 0.5px),
            transparent calc(0.95em + 0.51px),
            transparent 100%
        );
    transition: background 0.5s linear, color 0.5s linear;

    &:hover {
        background:
            linear-gradient(
                to bottom,
                transparent 0%,
                transparent calc(0.951em - 0.51px),
                #000204 calc(0.95em - 0.5px),
                #000204 calc(0.95em + 0.5px),
                transparent calc(0.95em + 0.51px),
                transparent 100%
            );
    }

    text-shadow: ${getRepeatCSS(20, '0 0 1px white')};
`;

let Author: React.FC<AuthorProps> = ({ author, date, hasFullDate, website, className }) => {
    const Container = website ? Link : 'span';
    const attributes = website ? { href: website, target: '_blank' } : {};
    return (
        <div className={className}>
            <Container {...attributes}>
                <span>{`— ${author} `}</span>
                <span css={css` display: inline-block; `}>
                    {`(${hasFullDate ?
                        date.format('MMMM DD, YYYY') :
                        date.format('MMMM YYYY')})`
                    }
                </span>
            </Container>
        </div>
    );
};

Author = styled(Author)`
    font-family: ${lato1};
    text-align: center;
`;

interface AcclaimsListItemProps {
    acclaim: AcclaimItemShape;
    style: React.CSSProperties;
    className?: string;
}

const AcclaimsListItem: React.FC<AcclaimsListItemProps> = ({ className, style, acclaim }) => (
    <div
        css={css`
            padding: 2rem 0;

            &:first-of-type {
                padding-top: 3.5rem;
            }
        `}
        className={className}
        style={style}
    >
        <AcclaimContainer>
            <Quote quote={acclaim.quote} />
            <Author
                author={acclaim.author}
                date={moment(acclaim.date)}
                hasFullDate={acclaim.hasFullDate}
                website={acclaim.website}
            />
        </AcclaimContainer>
    </div>
);

export default AcclaimsListItem;
