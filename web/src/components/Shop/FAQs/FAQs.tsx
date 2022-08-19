import axios from 'axios';
import * as React from 'react';
import Markdown from 'markdown-to-jsx';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { pushed } from 'src/styles/mixins';
import { lato2, } from 'src/styles/fonts';

const Container = styled.div(
    pushed,
    {
        fontFamily: lato2,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        marginRight: 'auto',
        alignItems: 'center',
        paddingTop: '2rem',
    },
);

const Question = styled.div({
    fontWeight: 'bold',
});

const Answer = styled.div({
    padding: '1rem 0 1rem 1rem',
});

const Anchor: React.FC<{ href: string; }> = (props) =>
    props.href?.match('mailto') ?
        <a css={{ textDecoration: 'underline' }} href={props.href} children={props.children} />
        : <Link css={{ textDecoration: 'underline' }} to={props.href!} children={props.children} />;

interface FAQ {
    question: string;
    answer: string;
}

const FAQs: React.FC<Record<string, unknown>> = () => {
    const [faqs, setFaqs] = React.useState<FAQ[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const {
                    data
                }: { data: FAQ[] } = await axios.get('/api/shop/faqs');

                setFaqs(data);
            } catch (e) {
                console.error(`Could not fetch faqs.`);
            }
        };

        fetchData();
    }, []);

    return (
        faqs && (
            <Container>
                <ul css={{ paddingRight: '1rem' }}>
                    {faqs.map((faq, idx) => (
                        <li key={idx}>
                            <Markdown
                                options={{
                                    overrides: {
                                        p: Question,
                                    }
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
                                    }
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
export type RequiredProps = Record<string, unknown>;
export type FAQsType = typeof FAQs;