import { differenceInCalendarYears } from 'date-fns';

export const baseString = 'Sean Chen: Pianist, Composer, Arranger | ';
export const getAge = () =>
    differenceInCalendarYears(new Date(), new Date(1988, 7, 27));
export const descriptions: {
    home: string;
    biography: string;
    discography: string;
    contact: string;
    upcoming: string;
    archive: string;
    search: string;
    videos: string;
    music: string;
    photos: string;
    press: string;
    scores: string;
    faqs: string;
    getMusic: (piece: string, contributors?: string) => string;
    searchResults: (query: string) => string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [key: string]: string | ((...args: any[]) => string);
} = {
    home: 'Welcome to the official website of pianist, composer, and arranger Sean Chen. Third Prize at the 2013 Van Cliburn, Christel DeHaan Classical Fellow of the 2013 American Pianists Awards, and Artist-in-Residence at University of Missouri, Kansas City.',
    biography: `Hailed as a charismatic rising star with “an exceptional ability to connect with an audience combined with an easy virtuosity” (Huffington Post), ${getAge()}-year-old American pianist Sean Chen, third prize winner at the 2013 Van Cliburn International Piano Competition and recipient of the DeHaan Classical Fellowship as the winner of the 2013 American Pianists Awards, has continued to earn accolades for “alluring, colorfully shaded renditions” (New York Times) and “genuinely sensitive” (LA Times) playing.`,
    discography: 'Complete discography of Sean Chen',
    contact: 'Contact information for Sean Chen and for booking performances.',
    upcoming: 'Upcoming recitals, concerti, and masterclasses.',
    archive: 'Past recitals, concerti, and masterclasses.',
    search: 'Search recitals, concerti, and masterclasses,',
    searchResults: (query: string) => `Search results for "${query}"`,
    videos: `A playlist of Sean Chen's YouTube clips.`,
    music: `A playlist of Sean Chen's live concert recordings, and a link to his Spotify musician page.`,
    getMusic: (piece: string, contributors?: string) =>
        `Listen to Sean Chen's live performance of ${piece}${
            contributors ? `, with ${contributors}` : '.'
        }`,
    photos: 'Publicity photos for browsing, and a link to a Dropbox folder for high-resolution images.',
    press: `Reviews of Sean Chen's performances.`,
    scores: `Online shop of Sean Chen's arrangements, cadenzas, and original compositions.`,
    faqs: 'Information about Sean Chen Piano online shop.',
};
