import { css } from '@emotion/react';
import styled from '@emotion/styled';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import * as React from 'react';

import { toMedia } from 'src/MediaQuery';
import { AcclaimItemShape } from 'src/components/About/Press/types';
import { screenPortrait, screenXS } from 'src/screens';
import { logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';

const AcclaimContainer = styled.div({
    margin: '2rem auto 3rem',
    maxwidth: 800,
    fontSize: '1.1rem',
    [toMedia([screenXS, screenPortrait])]: {
        fontSize: '1rem',
        padding: '0 1.2rem',
    },
});

interface QuoteProps {
    quote: string;
}

const QuoteDiv = styled.div(latoFont(300), {
    margin: '2rem 0 1.5rem',
    padding: '2rem',
    textAlign: 'left',
    lineHeight: '1.5rem',
    backgroundColor: 'white',
    boxShadow: '0 4px 7px -7px rgba(0 0 0 / 0.7)',
});

const Quote: React.FC<QuoteProps> = (props) => (
    <QuoteDiv>{props.quote}</QuoteDiv>
);

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

const Link = styled.a(latoFont(200), {
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
});

const AuthorDiv = styled.div(latoFont(400), {
    fontSize: '0.9rem',
    textAlign: 'right',
    color: logoBlue,
});

const Author: React.FC<AuthorProps> = ({
    author,
    date,
    hasFullDate,
    website,
}) => {
    const Container = website ? Link : 'span';
    const attributes = website
        ? { href: website, target: '_blank', css: latoFont(400) }
        : {};
    return (
        <AuthorDiv>
            <Container {...attributes}>
                <span>{`— ${author} `}</span>
                <span css={css` display: inline-block; `}>
                    {`(${
                        hasFullDate
                            ? format(date, 'MMMM dd, yyyy')
                            : format(date, 'MMMM yyyy')
                    })`}
                </span>
            </Container>
        </AuthorDiv>
    );
};

const StyledAuthor = styled(Author)(latoFont(100), {
    textAlign: 'center',
});

interface AcclaimsListItemProps {
    acclaim: AcclaimItemShape;
    className?: string;
}

const AcclaimsListItem: React.FC<AcclaimsListItemProps> = ({ acclaim }) => (
    <div>
        <AcclaimContainer>
            <Quote quote={acclaim.quote} />
            <StyledAuthor
                author={acclaim.author}
                date={parseISO(acclaim.date)}
                hasFullDate={acclaim.hasFullDate}
                website={acclaim.website}
            />
        </AcclaimContainer>
    </div>
);

export default AcclaimsListItem;
