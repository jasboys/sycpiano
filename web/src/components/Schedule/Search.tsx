import rgba from 'polished/lib/color/rgba';
import * as React from 'react';

import styled from '@emotion/styled';

import { SearchIconInstance, SearchIconSVG } from 'src/components/Schedule/SearchIconSVG';

import { lightBlue, logoBlue } from 'src/styles/colors';
import { lato1, lato2 } from 'src/styles/fonts';
import {  noHighlight } from 'src/styles/mixins';
import { GLOBAL_QUERIES, screenPortrait, screenXS, screenXSandPortrait } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import { createSearchParams, useLocation, useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createSelector } from 'reselect';
import { useAppSelector } from 'src/hooks';
import { GlobalStateShape } from 'src/store';
import lighten from 'polished/lib/color/lighten';
import { useMedia } from 'react-media';
import { Transition } from 'react-transition-group';
import { fadeOnEnter, fadeOnExit } from 'src/utils';

const unfocusedGray = rgba(180, 180, 180, 0.4);

type SearchProps = {
    className?: string;
};

const ResultsContainer = styled.div({
    width: 'fit-content',
    maxWidth: '25rem',
    height: 80,
    right: 0,
    position: 'fixed',
    padding: '0.2rem 1rem',
    margin: '1rem 1.5rem',
    fontFamily: lato2,
    borderRadius: 30,
    zIndex: 14,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: lighten(0.35, lightBlue),
    border: `1px solid ${lightBlue}`,
    color: logoBlue,
    boxShadow: '0 1px 5px -2px rgba(0 0 0 / 0.4)',
    [toMedia([screenXS, screenPortrait])]: {
        left: 0,
        margin: '1rem auto',
        maxWidth: 'unset',
    },
});

const Container = styled.div<{ dirty: boolean; expanded: boolean; }>(
    {
        height: 50,
        zIndex: 15,
        right: 0,
        position: 'fixed',
        padding: '9px 9px',
        display: 'flex',
        margin: '1rem 1.5rem',
        fontFamily: lato1,
        border: `1px solid ${lightBlue}`,
        borderRadius: 30,
        alignItems: 'center',
        boxShadow: '0 1px 5px -2px rgba(0 0 0 / 0.4)',
        flexDirection: 'row-reverse',
        transition: 'padding 250ms, width 250ms, background-color 250ms, box-shadow 250ms',
        overflow: 'hidden',

        [toMedia(screenXSandPortrait)]: {
            left: 0,
            margin: '1rem auto',
            maxWidth: 'unset',
        },
    },
    props => ({
        'svg': {
            fill: props.expanded ?
                (props.dirty ? lightBlue : unfocusedGray)
                : 'white',
            transition: 'fill 250ms, filter 250ms',
        },
        '&:hover': {
            'svg': {
                filter: props.expanded ? '' : 'drop-shadow(0 0 1px white)',
            },
            boxShadow: props.expanded ? '' : '0 2px 6px -2px rgba(0 0 0 / 0.6)',
        },
        width: props.expanded ? `calc(min(90%, 25rem))` : 50,
        paddingRight: props.expanded ? '1rem' : 9,
        paddingLeft: props.expanded ? '1rem' : 9,
        cursor: props.expanded ? 'unset' : 'pointer',
        backgroundColor: props.expanded ? 'white' : lightBlue,
    })
);

const InputGroup = styled.div<{ isMobile: boolean }>(
    {
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    (props) => ({
        opacity: props.isMobile ? '' : 0,
    })
)

const Label = styled.label<{ focused: boolean }>({
    flex: '0 0 auto',
    fontSize: '1.3rem',
    color: lightBlue,
    [toMedia(screenXSandPortrait)]: {
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
    backgroundColor: 'transparent',
});

const ResetButton = styled.div<{ focused: boolean; show: boolean; }>(
    noHighlight,
    {
        flex: '0 0 auto',
        textAlign: 'center',
        height: '1.6rem',
        fontSize: '1.5rem',

        '&:hover': {
            cursor: 'pointer',
        },
    },
(props) => ({
    opacity: props.show ? '' : 0,
    pointerEvents: props.show ? undefined : 'none'
}));

const SubmitButton = styled.button<{ dirty: boolean; expanded: boolean; }>(
    {
        flex: '0 0 auto',
        background: 'none',
        color: 'inherit',
        border: 'none',
        padding: 0,
        paddingTop: 2,
        font: 'inherit',
        outline: 'inherit',
        marginLeft: '0.2rem',
    },
    (props) => ({
        cursor: 'pointer',
        pointerEvents: props.expanded ? 'unset' : 'none',
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

export const Search: React.FC<SearchProps> = ({ }) => {
    const {
        itemsLength,
        lastQuery,
        isFetching,
    } = useAppSelector(selector);
    const matches = useMedia({ queries: GLOBAL_QUERIES });
    const [searchParams] = useSearchParams();
    const [focused, setFocused] = React.useState(false);
    const match = useMatch('/schedule/search');
    const [showCancel, setShowCancel] = React.useState(!!searchParams.get('q'));
    const [expanded, setExpanded] = React.useState(matches.screenXS || !!searchParams.get('q'));
    const { register, handleSubmit, reset, formState, setFocus, getValues, setValue } = useForm<{ search: string }>({
        defaultValues: {
            search: searchParams.get('q') ?? '',
        },
    });

    const navigate = useNavigate();
    const location = useLocation();

    const onReset = React.useCallback((event: React.SyntheticEvent<HTMLDivElement>) => {
        reset({
            search: '',
        });
        setShowCancel(false);
        if (!!match) {
            navigate((location.state ?? '/schedule/upcoming') as string);
        } else {
            event.preventDefault();
        }
        setTimeout(() => setFocus('search'), 250);
    }, [reset, navigate, match]);

    const onSubmit = (data: { search: string }) => {
        // if (data.search === '') {
        //     navigate('/schedule/upcoming');
        // }
        navigate(`/schedule/search?${createSearchParams({ q: data.search })}`, {
            state: location.pathname === '/schedule/search' ? location.state : location.pathname,
        });
    };

    const onFocus = React.useCallback(() => setFocused(true), []);
    const onBlur = React.useCallback((ev: FocusEvent) => {
        setFocused(false);
        if (getValues('search') === '') {
            !matches.screenXS && setTimeout(() => setExpanded(false), 50);
            if (!!match) {
                navigate('/schedule/upcoming');
            }
        }
    }, [getValues, match, navigate, matches.screenXS]);
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== '' && showCancel === false) {
            setShowCancel(true);
        } else if (e.target.value === '' && showCancel === true) {
            setShowCancel(false);
        }
    }, [showCancel]);

    const onClick = React.useCallback(() => {
        setTimeout(() => setFocus('search'), 200);
        if (!expanded) {
            setExpanded(true);
        }
    }, [expanded]);

    React.useEffect(() => {
        const q = searchParams.get('q');
        if (!q || q === '') {
            !matches.screenXS && setExpanded(false);
        } else {
            setValue('search', searchParams.get('q') ?? '');
        }
    }, [searchParams, setValue, matches.screenXS]);

    // Remember, flex-direction is row reverse inside the Container
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Container dirty={formState.isDirty} expanded={expanded} onClick={onClick} onMouseDown={(ev) => ev.preventDefault()}>
                <SearchIconSVG />
                <SubmitButton disabled={!formState.isDirty} expanded={expanded} dirty={formState.isDirty}>
                    <SearchIconInstance />
                </SubmitButton>
                <Transition<undefined>
                    in={expanded}
                    timeout={250}
                    onEnter={fadeOnEnter()}
                    onExit={fadeOnExit()}
                    mountOnEnter={false}
                    unmountOnExit={false}
                >
                    <InputGroup isMobile={matches.screenXS || !!searchParams.get('q')}>
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
                            <ResetButton
                                show={showCancel}
                                focused={focused}
                                onClick={onReset}
                            >
                                {'\u00D7'}
                            </ResetButton>
                        </Span>
                        <Label focused={focused} htmlFor="search">Search</Label>
                    </InputGroup>
                </Transition>
            </Container>
            {(!!match && !isFetching) &&
                <ResultsContainer>
                    {`${itemsLength} results for "${lastQuery}"`}
                </ResultsContainer>
            }
        </form>
    );
};
