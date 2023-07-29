// Color defines.
import { createTheme } from '@mui/material/styles';

export const lightBlue = '#4e86a4';
export const logoBlue = '#0a4260';
export const magenta = '#57003a';
export const offWhite = '#f4f4f4';
export const textGrey = '#ccc';
export const contactPageLinkColor = '#4e94ba';
export const gold = '#b0a04a';
export const navFontColor = 'rgba(0, 0, 0, 0.7)';

export const playlistBackground = 'rgb(248, 248, 248)';

export const theme = createTheme({
    palette: {
        primary: {
            main: lightBlue,
        },
        secondary: {
            main: magenta,
        },
    },
});

export const colorVars = {
    lightBlue,
    logoBlue,
    magenta,
    offWhite,
    textGrey,
    contactPageLinkColor,
    gold,
    navFontColor,
    playlistBackground,
};