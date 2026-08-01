import type { ContactItemShape } from 'src/components/Contact/types';

const contacts: Omit<ContactItemShape, 'isMobile'>[] = [
    {
        name: 'Cadenza Artists',
        className: 'cadenza',
        position: [
            {
                title: 'Worldwide Representation',
            },
            {
                title: 'For booking inquiries, please contact:',
            },
        ],
        phone: ['(310) 896-5827'],
        website: 'https://www.cadenzaartists.com',
        email: ['info@cadenzaartists.com'],
        social: {
            facebook: 'https://www.facebook.com/CadenzaArtists/',
            twitter: 'https://twitter.com/CadenzaArtist',
            instagram: 'https://www.instagram.com/cadenzaartists/',
        },
    },
    {
        name: 'Sean Chen',
        className: 'seanChen',
        position: [
            {
                title: 'Pianist | Composer | Arranger',
            },
            {
                title: 'Jack Strandberg/Missouri Endowed Associate Professor of Piano',
                organization: 'University of Missouri-Kansas City Conservatory',
            },
        ],
        email: ['seanchen@seanchenpiano.com', 'chensy@umkc.edu'],
        social: {
            facebook: 'https://www.facebook.com/seanchenpiano',
            twitter: 'https://twitter.com/seanchenpiano',
            youtube: 'https://www.youtube.com/user/SeanChenPiano',
            linkedin: 'https://www.linkedin.com/in/seanchenpiano',
            instagram: 'https://www.instagram.com/seanchenpiano',
        },
    },
    // {
    //     name: 'Joel Harrison',
    //     className: 'joelHarrison',
    //     title: 'Artistic Director, President/CEO',
    //     organization: 'American Pianists Association',
    //     phone: '317.940.9947',
    //     email: 'joel@americanpianists.org',
    //     social: {
    //         facebook: 'https://www.facebook.com/AmericanPianistsAssociation/?ref=search',
    //         twitter: 'https://twitter.com/APApianists',
    //         youtube: 'https://www.youtube.com/user/apaPianists',
    //         instagram: 'https://www.instagram.com/apapianists/',
    //     },
    // },
    // {
    //     name: 'Martha Woods',
    //     className: 'marthaWoods',
    //     position: [
    //         {
    //             title: 'President',
    //             organization: 'Jonathan Wentworth Associates',
    //         },
    //     ],
    //     phone: ['(301) 277-8205'],
    //     email: ['martha@jwentworth.com'],
    //     social: {
    //         web: 'https://www.jwentworth.com/',
    //     },
    // },
];

export default contacts;
