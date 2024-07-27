import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Markdown from 'markdown-to-jsx';
import type * as React from 'react';
import { Link } from 'react-router-dom';

import { logoBlue } from 'src/styles/colors.js';
import { latoFont } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';
import { useStore } from 'src/store.js';

const Container = styled.div(latoFont(300), pushed, {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
    paddingTop: '2rem',
});

const Question = styled.div({
    fontWeight: 400,
});

const Answer = styled.div({
    padding: '1rem 0 1rem 1rem',
});

const Anchor: React.FC<{ href: string; children: React.ReactNode }> = (
    props,
) =>
    props.href.match('mailto') ? (
        <a css={{ textDecoration: 'underline' }} href={props.href}>
            {props.children}
        </a>
    ) : (
        <Link css={{ textDecoration: 'underline' }} to={props.href}>
            {props.children}
        </Link>
    );

const Title = styled.div(latoFont(400), {
    textAlign: 'left',
    fontSize: '1.5rem',
    color: logoBlue,
    width: '100%',
    maxWidth: 800,
    paddingLeft: '1rem',
    marginBottom: '0.5rem',
});

interface FAQ {
    question: string;
    answer: string;
}

const FAQs: React.FC<Record<never, unknown>> = () => {
    const isHamburger = useStore().mediaQueries.isHamburger();

    const { data: faqs } = useQuery({
        queryKey: ['faqs'],
        queryFn: async () => {
            const { data } = await axios.get<FAQ[]>('/api/shop/faqs');
            return data;
        },
    });

    return (
        faqs && (
            <Container>
                {!isHamburger && <Title>Frequently Asked Questions</Title>}
                <ul css={{ maxWidth: 800 }}>
                    {faqs.map((faq) => (
                        <li key={faq.question.substring(0, 16)}>
                            <Markdown
                                options={{
                                    overrides: {
                                        span: Question,
                                    },
                                }}
                            >
                                {faq.question}
                            </Markdown>
                            <Markdown
                                options={{
                                    forceBlock: true,
                                    overrides: {
                                        p: Answer,
                                        a: Anchor,
                                    },
                                }}
                            >
                                {faq.answer}
                            </Markdown>
                        </li>
                    ))}
                </ul>
            </Container>
        )
    );
};

export default FAQs;
export type FAQsType = typeof FAQs;
export type RequiredProps = React.ComponentProps<FAQsType>;