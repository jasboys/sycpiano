import styled from '@emotion/styled';
import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string, InferType } from 'yup';
import zxcvbn from 'zxcvbn';
import { lato3 } from 'src/styles/fonts';
import { lightBlue, logoBlue } from 'src/styles/colors';
import { getHoverStyle, noHighlight, pushed } from 'src/styles/mixins';
import { screenXSorPortrait } from 'src/styles/screens';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import TextField from '@mui/material/TextField';

const StyledSignupButton = styled.button<{ disabled: boolean; isMouseDown: boolean }>(
    {
        position: 'relative',
        fontSize: '0.8rem',
        letterSpacing: '0.1rem',
        width: 200,
        padding: 10,
        marginBottom: '2rem',
        textAlign: 'center',
        borderRadius: 50,
        fontFamily: lato3,
        backgroundColor: lightBlue,
        color: 'white',
        transition: 'all 0.25s',
        border: `1px solid ${lightBlue}`,
        display: 'block',
        userSelect: 'none',
    },
    noHighlight,
    ({ disabled, isMouseDown }) => disabled
        ? {
            color: logoBlue,
            backgroundColor: 'white',
            border: `1px solid ${logoBlue}`,
        }
        : {
            '&:hover': getHoverStyle(isMouseDown),
        }
);

const strengthColors = [
    'red',
    'orange',
    'yellow',
    'yellowgreen',
    'green'
];

const strengthText = [
    'very weak',
    'weak',
    'moderate',
    'strong',
    'very strong'
];

// const useStyles = makeStyles({
//     colorPrimary: {
//         backgroundColor: '#eee',
//     },
//     barColorPrimary: (props) => {
//         // console.log(props);
//         return {
//             backgroundColor: (props.value !== undefined) ? strengthColors[props.value] : 'transparent',
//         };
//     }
// });

const LinearProgressWithLabel: React.FC<LinearProgressProps> = (props) => {
    // const classes = useStyles({ value: props.value });
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
        }}>
            <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">
                    Strength:
                </Typography>
            </Box>
            <Box width="100%" mr={1}>
                <LinearProgress
                    // classes={classes}
                    variant="determinate"
                    value={(props.value === undefined) ? undefined : props.value * 20}
                />
            </Box>
            <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">
                    {(props.value === undefined) ? '' : strengthText[props.value]}
                </Typography>
            </Box>
        </Box>
    );
};

const Container = styled.div(
    pushed,
    {
        width: '100%',
        overflowY: 'hidden',
        [screenXSorPortrait]: {
            marginTop: 0,
            height: '100%',
        },
    },
);

const validationSchema = object({
    email: string().email().required("Required"),
    password: string().required("Required")
}).required();

type FormValues = InferType<typeof validationSchema>;

const Signup: React.FC<Record<string, unknown>> = (props) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isMouseDown, setIsMouseDown] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const { handleSubmit, control, reset, formState, watch } = useForm<FormValues>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: yupResolver(validationSchema),
    });
    const fields = watch();

    const onSubmit = async (data: FormValues) => {
        try {
            if (!isSubmitting) {
                setIsSubmitting(true);
                const response = await axios.post('/auth/register', {
                    username: data.email,
                    password: data.password,
                });
                setIsSubmitting(false);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleClick = () => setShowPassword(!showPassword);

    const result = (fields.password === '') ? undefined : zxcvbn(fields.password, [fields.email]);
    return (
        <Container>
            <Box maxWidth={800} margin="auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    variant="outlined"
                                    margin="normal"
                                    label="Email"
                                />
                            )}
                        />
                    </Box>
                    <Box>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    label="Password"
                                    type={showPassword ? 'password' : 'text'}
                                    inputProps={{
                                        endAdornment:
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClick}
                                                    onMouseDown={handleClick}
                                                    component="button"
                                                >
                                                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                    }}
                                    {...field}
                                />
                            )}
                        />
                    </Box>
                    <LinearProgressWithLabel value={result?.score} />
                    <StyledSignupButton
                        type="submit"
                        disabled={!formState.isValid}
                        isMouseDown={isMouseDown}
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
                        Sign Up
                    </StyledSignupButton>
                </form>
            </Box>
        </Container>
    )

}

export default Signup;