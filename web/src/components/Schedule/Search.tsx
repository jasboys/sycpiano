import rgba from 'polished/lib/color/rgba';
import * as React from 'react';

import styled from '@emotion/styled';

import { SearchIconInstance, SearchIconSVG } from 'src/components/Schedule/SearchIconSVG';

import { lightBlue } from 'src/styles/colors';
import { lato1 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { screenXSandPortrait } from 'src/styles/screens';
import { createSearchParams, useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const focusedBlue = rgba(lightBlue, 0.6);
const unfocusedGray = rgba(180, 180, 180, 0.4);

type SearchProps = {
    className?: string;
    isMobile?: boolean;
};

const Container = styled.div<{ focused: boolean }>`
    width: 90%;
    max-width: 30rem;
    height: 50px;
    z-index: 2;
    right: 0;
    position: fixed;
    padding: 0 1rem;
    display: flex;
    margin: 1rem 1.4rem;
    font-family: ${lato1};
    border: 1px solid ${props => props.focused ? focusedBlue : unfocusedGray};
    border-radius: 30px;
    align-items: center;
    background-color: white;
    box-shadow: 0 1px 5px -2px rgba(0 0 0 / 0.4);

    svg {
        fill: ${props => props.focused ? focusedBlue : 'rgba(180 180 180 / 0.4)'};
    }
`;

const Label = styled.label<{ focused: boolean }>`
    flex: 0 0 auto;
    font-size: 1.5rem;
    color: ${props => props.focused ? lightBlue : unfocusedGray};

    ${screenXSandPortrait} {
        font-size: 1.2rem;
    }
`;

const Span = styled.span<{ focused: boolean }>`
    flex: 1 1 auto;
    margin: 0.6rem 0 0.6rem 0.6rem;
    border-bottom: 1px solid ${props => props.focused ? focusedBlue : unfocusedGray};
    display: flex;
    position: relative;
`;

const Input = styled.input`
    flex: 1 1 auto;
    border: none;
    font-family: ${lato1};
    font-size: 1.3rem;
    width: 100%;
`;

const ResetButton = styled.div<{ focused: boolean }>`
    ${noHighlight}
    flex: 0 0 auto;
    text-align: center;
    height: 1.6rem;
    font-size: 1.5rem;

    &:hover {
        cursor: pointer;
    }
`;

const SubmitButton = styled.button({
    flex: '0 0 auto',
    background: 'none',
	color: 'inherit',
	border: 'none',
	padding: 0,
	font: 'inherit',
	cursor: 'pointer',
	outline: 'inherit',
});

export const Search: React.FC<SearchProps> = () => {
    const [searchParams] = useSearchParams();
    const [focused, setFocused] = React.useState(false);
    const match = useMatch('/schedule/search');
    const [showCancel, setShowCancel] = React.useState(!!searchParams.get('q'));
    const { register, handleSubmit, reset } = useForm<{ search: string }>({
        defaultValues: {
            search: searchParams.get('q') ?? '',
        },
    });
    const navigate = useNavigate();

    const onReset = (event: React.SyntheticEvent<HTMLDivElement>) => {
        if (!!match) {
            navigate('/schedule/upcoming');
        } else {
            reset();
            setShowCancel(false);
            event.preventDefault();
        }
    };

    const onSubmit = (data: { search: string }) => {
        navigate(`/schedule/search?${createSearchParams({ q: data.search })}`);
    };

    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== '' && showCancel === false) {
            setShowCancel(true);
        } else if (e.target.value === '' && showCancel === true) {
            setShowCancel(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Container focused={focused}>
                <SearchIconSVG />
                <Label focused={focused} htmlFor="search">Search</Label>
                <Span focused={focused}>
                    <Input
                        id="search"
                        type="text"
                        placeholder={`try 'Mozart'`}
                        onFocus={onFocus}
                        {...register('search', {
                            onBlur,
                            onChange,
                        })}
                    />
                    {(showCancel) && (
                        <ResetButton
                            focused={focused}
                            onClick={onReset}
                        >
                            {'\u00D7'}
                        </ResetButton>
                    )}
                </Span>
                <SubmitButton>
                    <SearchIconInstance />
                </SubmitButton>
            </Container>
        </form>
    );
};
