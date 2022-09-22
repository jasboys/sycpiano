import { gsap } from 'gsap';
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears';

export interface FormattedLocationShape {
    venue: string;
    street: string;
    stateZipCountry: string;
}

export const formatLocation = (location: string): FormattedLocationShape => {
    // Example location string:
    // Howard L. Schrott Center for the Arts, 610 W 46th St, Indianapolis, IN 46208, USA
    const [venue, street, ...rest] = location.split(', ');
    const stateZipCountry = `${rest[1]}, ${rest[2]}`;

    return { venue, street, stateZipCountry };
};

export const getViewportSize = (): { width: number; height: number } => (
    {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    }
);

export const titleStringBase = 'Sean Chen: Pianist, Composer, Arranger';

const getAge = () => differenceInCalendarYears(new Date(), new Date(1988, 7, 27));

// map of page name to meta title strings
export const metaDescriptions: {
    home: string;
    biography: string;
    discography: string;
    contact: string;
    upcoming: string;
    archive: string;
    videos: string;
    music: string;
    photos: string;
    press: string;
    getMusic: (piece: string, contributors?: string) => string;
    shop: string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [index: string]: any;
} = {
        home: 'Welcome to the official website of pianist, composer, and arranger Sean Chen. Third Prize at the 2013 Van Cliburn, Christel DeHaan Classical Fellow of the 2013 American Pianists Awards, and Artist-in-Residence at University of Missouri, Kansas City.',
        biography: `Hailed as a charismatic rising star with “an exceptional ability to connect with an audience combined with an easy virtuosity” (Huffington Post), ${getAge()}-year-old American pianist Sean Chen, third prize winner at the 2013 Van Cliburn International Piano Competition and recipient of the DeHaan Classical Fellowship as the winner of the 2013 American Pianists Awards, has continued to earn accolades for “alluring, colorfully shaded renditions” (New York Times) and “genuinely sensitive” (LA Times) playing. He was named a 2015 fellow by the prestigious Leonore Annenberg Fellowship Fund for the Performing Arts.`,
        discography: 'Complete discography of Sean Chen',
        contact: `Contact information for Sean Chen and for booking performances.`,
        upcoming: 'Upcoming recitals, concerti, and masterclasses.',
        archive: 'Past recitals, concerti, and masterclasses.',
        videos: 'A playlist of Sean Chen\'s YouTube clips.',
        music: 'A playlist of Sean Chen\'s live concert recordings, and a link to his Spotify musician page.',
        getMusic: (piece: string, contributors?: string) =>
            `Listen to Sean Chen's live performance of ${piece}` + (contributors ? `, with ${contributors}` : '.'),
        photos: 'Publicity photos for browsing, and a link to a Dropbox folder for high-resolution images.',
        press: `Press of Sean Chen's performances.`,
        shop: `Online shop of Sean Chen's arrangements, cadenzas, and original compositions.`,
        faqs: `Information about Sean Chen Piano online shop.`,
    };

export const formatPrice = (price: number): string => (
    '$' + (price / 100).toFixed(2)
);

export const validateEmail = (email: string): boolean => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email);
};

export const fadeOnEnter = (delay = 0, duration = 0.25) => (element: HTMLElement, isEntering?: boolean): void => {
    if (element) {
        console.log('enter', element);
        console.log(isEntering);
        gsap.fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, delay: isEntering ? delay + 1 : delay, duration, ease: 'power1.inOut' });
    }
};

export const fadeOnExit = (delay = 0, duration = 0.25) => (element: HTMLElement): void => {
    if (element) {
        console.log('exit', element);
        gsap.fromTo(element, { autoAlpha: 1 }, { autoAlpha: 0, delay, duration, ease: 'power1.inOut' });
    }
};

export const slideOnEnter = (delay = 0, duration = 0.25) => (element: HTMLElement): void => {
    if (element) {
        gsap.fromTo(element, { autoAlpha: 1}, { y: '0%', delay, duration, clearProps: 'transform', force3D: true, });
    }
};

export const slideOnExit = (delay = 0, duration = 0.25) => (element: HTMLElement): void => {
    if (element) {
        gsap.to(element, { y: '-100%', delay, duration, force3D: true });
    }
};

export const isImageElement = (el: HTMLImageElement | HTMLElement | Element): el is HTMLImageElement => {
    return (el as HTMLImageElement).currentSrc !== undefined;
};