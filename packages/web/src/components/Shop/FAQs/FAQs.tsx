import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAtomValue } from 'jotai';
import Markdown from 'markdown-to-jsx';
import type * as React from 'react';
import { Link } from 'react-router-dom';
import { mediaQueriesAtoms } from 'src/components/App/store.js';

import { latoFont } from 'src/styles/fonts';
import { pushed, verticalTextStyle } from 'src/styles/mixins';

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

const Title = styled.div(verticalTextStyle, {
    left: 'calc(50% - min(50%, 400px))',
    transform: 'rotate(90deg)',
});

interface FAQ {
    question: string;
    answer: string;
}

const FAQs: React.FC<Record<never, unknown>> = () => {
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);

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
                {!isHamburger && <Title>FAQs</Title>}
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