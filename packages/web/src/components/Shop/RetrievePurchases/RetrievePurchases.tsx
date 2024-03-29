import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/system';
import axios from 'axios';
import { mix } from 'polished';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from 'src/hooks.js';
import { lightBlue, logoBlue, theme } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight, pushed } from 'src/styles/mixins';
import { validateEmail } from 'src/utils';

const Container = styled.div(latoFont(300), pushed, {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
    padding: '2rem 2rem',
    maxWidth: 600,
});

const StyledForm = styled.form({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 2rem',
});

const StyledTextField = styled(TextField)({
    '&&': {
        margin: '2rem',
        width: '100%',
    },
});

const getHoverStyle = (isMouseDown: boolean) => ({
    backgroundColor: mix(0.75, logoBlue, '#FFF'),
    color: 'white',
    cursor: 'pointer',
    border: `1px solid ${mix(0.75, logoBlue, '#FFF')}`,
    transform: isMouseDown
        ? 'translateY(-1.2px) scale(1.01)'
        : 'translateY(-2px) scale(1.04)',
    boxShadow: isMouseDown
        ? '0 1px 2px rgba(0, 0, 0, 0.8)'
        : '0 4px 6px rgba(0, 0, 0, 0.4)',
});

const StyledSubmitButton = styled.button<{
    disabled: boolean;
    isMouseDown: boolean;
    isSuccess: boolean;
}>(
    latoFont(300),
    {
        position: 'relative',
        fontSize: '1.0rem',
        width: 200,
        padding: 8,
        marginBottom: '2rem',
        textAlign: 'center',
        borderRadius: 8,
        backgroundColor: lightBlue,
        color: 'white',
        transition: 'all 0.25s',
        border: `1px solid ${lightBlue}`,
        display: 'block',
        userSelect: 'none',
    },
    noHighlight,
    ({ disabled, isMouseDown }) =>
        disabled
            ? {
                  color: logoBlue,
                  backgroundColor: 'white',
                  border: `1px solid ${logoBlue}`,
              }
            : {
                  '&:hover': getHoverStyle(isMouseDown),
              },
    ({ isSuccess }) =>
        isSuccess && {
            backgroundColor: '#4BB543',
            color: 'white',
            border: `1px solid ${mix(0.8, '#4BB543', '#000')}`,
        },
);

const Title = styled.div(latoFont(400), {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: logoBlue,
    width: '100%',
    maxWidth: 600,
    marginBottom: '2rem',
});

enum SubmitState {
    initial = 0,
    submitting = 1,
    success = 2,
}

const RetrievalForm: React.FC<Record<never, unknown>> = () => {
    const isHamburger = useAppSelector((state) => state.mediaQuery.isHamburger);
    const [isMouseDown, setIsMouseDown] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState(false);
    const [state, setState] = React.useState<SubmitState>(SubmitState.initial);

    const submitRetrieval = () => {
        const sendRequest = async () => {
            try {
                setState(SubmitState.submitting);
                await axios.post(
                    '/api/shop/resend-purchased',
                    {
                        email,
                    },
                    {
                        headers: {
                            'X-CSRF-TOKEN': 'sycpiano',
                        },
                    },
                );
                setState(SubmitState.success);
            } catch (e) {
                // Return success, because even if email is not found, cannot reveal information to client for security.
                setState(SubmitState.success);
            }
        };

        sendRequest();
    };

    return (
        <Container>
            {!isHamburger && <Title>Retrieve Purchases</Title>}

            <div css={{ fontSize: '1.2rem', width: '100%' }}>
                Enter your email to request previously purchased scores.
            </div>
            <div css={{ fontSize: '1.2rem', width: '100%', marginTop: '1rem' }}>
                If the email exists in the database, you will receive an email
                with the scores attached.
            </div>
            <ThemeProvider theme={theme}>
                <StyledForm
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (error) {
                            return;
                        }
                        if (email === '') {
                            setError(true);
                            return;
                        }
                        submitRetrieval();
                    }}
                >
                    <StyledTextField
                        label={error ? 'Invalid Email' : 'Email Address'}
                        error={error}
                        id="email-text"
                        value={email}
                        onChange={(
                            event: React.ChangeEvent<
                                HTMLTextAreaElement | HTMLInputElement
                            >,
                        ) => {
                            setEmail(event.target.value);
                            setError(
                                event.target.value !== '' &&
                                    !validateEmail(event.target.value),
                            );
                        }}
                        variant="outlined"
                        margin="dense"
                        type="email"
                    />
                    <StyledSubmitButton
                        type="submit"
                        disabled={email === '' || state !== SubmitState.initial}
                        isMouseDown={isMouseDown}
                        isSuccess={state === SubmitState.success}
                        onTouchStart={() => {
                            setIsMouseDown(true);
                        }}
                        onMouseDown={() => {
                            setIsMouseDown(true);
                        }}
                        onTouchEnd={() => {
                            setIsMouseDown(false);
                        }}
                        onMouseUp={() => {
                            setIsMouseDown(false);
                        }}
                    >
                        {state === SubmitState.submitting
                            ? 'Submitting...'
                            : state === SubmitState.success
                              ? 'Submitted'
                              : 'Submit'}
                    </StyledSubmitButton>
                </StyledForm>
            </ThemeProvider>
            {state === SubmitState.success && (
                <div css={{ fontWeight: 'bold' }}>
                    <Link to="/shop/scores">🠔 Go back to the shop</Link>
                </div>
            )}
        </Container>
    );
};

export default RetrievalForm;
export type RequiredProps = React.ComponentProps<typeof RetrievalForm>;
export type RetrievalFormType = typeof RetrievalForm;