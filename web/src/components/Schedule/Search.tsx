import rgba from 'polished/lib/color/rgba';
import * as React from 'react';

import styled from '@emotion/styled';

import { SearchIconInstance, SearchIconSVG } from 'src/components/Schedule/SearchIconSVG';

import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato1, lato2 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { screenXSandPortrait } from 'src/styles/screens';
import { createSearchParams, useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createSelector } from 'reselect';
import { useAppSelector } from 'src/hooks';
import { GlobalStateShape } from 'src/store';
import lighten from 'polished/lib/color/lighten';

const unfocusedGray = rgba(180, 180, 180, 0.4);

type SearchProps = {
    className?: string;
    isMobile?: boolean;
};

const ResultsContainer = styled.div({
    width: '90%',
    maxWidth: '25rem',
    height: 80,
    right: 0,
    position: 'fixed',
    padding: '0.2rem 1rem',
    margin: '1rem 1.4rem',
    fontFamily: lato2,
    borderRadius: 30,
    zIndex: 6,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: lighten(0.35, lightBlue),
    border: `1px solid ${lightBlue}`,
    color: logoBlue,
    boxShadow: '0 1px 5px -2px rgba(0 0 0 / 0.4)',
});

const Container = styled.div<{ dirty: boolean }>({
    width: '90%',
    maxWidth: '25rem',
    height: 50,
    zIndex: 7,
    right: 0,
    left: 0,
    position: 'fixed',
    padding: '0 1rem',
    display: 'flex',
    margin: '1rem auto',
    fontFamily: lato1,
    border: `1px solid ${lightBlue}`,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: 'white',
    boxShadow: '0 1px 5px -2px rgba(0 0 0 / 0.4)',

    [screenXSandPortrait]: {
        maxWidth: 'unset',
    },
},
    props => ({
        'svg': {
            fill: props.dirty ? lightBlue : unfocusedGray,
        },
    }));

const Label = styled.label<{ focused: boolean }>({
    flex: '0 0 auto',
    fontSize: '1.3rem',
    color: lightBlue,
    [screenXSandPortrait]: {
        fontSize: '1.2rem',
    },
});

const Span = styled.span<{ focused: boolean }>(
    {
        flex: '1 1 auto',
        margin: '0.6rem 0 0.6rem 0.6rem',
        display: 'flex',
        position: 'relative',
    },
    props => ({
        borderBottom: `1.2px solid ${props.focused ? lightBlue : unfocusedGray}`,
    })
);

const Input = styled.input({
    flex: ' 1 1 auto',
    border: 'none',
    fontFamily: lato1,
    fontSize: '1.3rem',
    width: '100%',
});

const ResetButton = styled.div<{ focused: boolean }>(
    noHighlight,
    {
        flex: '0 0 auto',
        textAlign: 'center',
        height: '1.6rem',
        fontSize: '1.5rem',

        '&:hover': {
            cursor: 'pointer',
        },
    }
);

const SubmitButton = styled.button<{ dirty: boolean; }>(
    {
        flex: '0 0 auto',
        background: 'none',
        color: 'inherit',
        border: 'none',
        padding: 0,
        font: 'inherit',
        outline: 'inherit',
    },
    (props) => ({
        cursor: props.dirty ? 'pointer' : 'unset',
    })
);

const selector = createSelector(
    (state: GlobalStateShape) => state.scheduleEventItems?.search.items,
    (state: GlobalStateShape) => state.scheduleEventItems?.search.lastQuery,
    (state: GlobalStateShape) => state.scheduleEventItems?.search.isFetchingList,
    (items, lastQuery, isFetching) => ({
        itemsLength: items?.length,
        lastQuery,
        isFetching,
    })
);

export const Search: React.FC<SearchProps> = () => {
    const {
        itemsLength,
        lastQuery,
        isFetching,
    } = useAppSelector(selector);
    const [searchParams] = useSearchParams();
    const [focused, setFocused] = React.useState(false);
    const match = useMatch('/schedule/search');
    const [showCancel, setShowCancel] = React.useState(!!searchParams.get('q'));
    const { register, handleSubmit, reset, formState } = useForm<{ search: string }>({
        defaultValues: {
            search: searchParams.get('q') ?? '',
        },
    });
    const navigate = useNavigate();

    const onReset = React.useCallback((event: React.SyntheticEvent<HTMLDivElement>) => {
        reset({
            search: '',
        });
        setShowCancel(false);
        console.log(match);
        if (!!match) {
            navigate('/schedule/upcoming');
        } else {
            event.preventDefault();
        }
    }, [reset, navigate, setShowCancel]);

    const onSubmit = (data: { search: string }) => {
        if (data.search === '') {
            navigate('/schedule/upcoming');
        }
        navigate(`/schedule/search?${createSearchParams({ q: data.search })}`);
    };

    const onFocus = React.useCallback(() => setFocused(true), [setFocused]);
    const onBlur = React.useCallback(() => setFocused(false), [setFocused]);
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== '' && showCancel === false) {
            setShowCancel(true);
        } else if (e.target.value === '' && showCancel === true) {
            setShowCancel(false);
        }
    }, [showCancel, setShowCancel]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Container dirty={formState.isDirty}>
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
                <SubmitButton disabled={!formState.isDirty} dirty={formState.isDirty}>
                    <SearchIconInstance />
                </SubmitButton>
            </Container>
            {(!!match && !isFetching) &&
                <ResultsContainer>
                    {`${itemsLength} results for "${lastQuery}"`}
                </ResultsContainer>
            }
        </form>
    );
};
