import { ModelMap } from '../types';

export const up = async (models: ModelMap): Promise<void> => {
    const model = models.bio;
    const texts = [
        `Hailed as a charismatic rising star with “an exceptional ability to connect with an audience combined with an easy virtuosity” (Huffington Post), ##-year-old American pianist Sean Chen, third prize winner at the 2013 Van Cliburn International Piano Competition and recipient of the DeHaan Classical Fellowship as the winner of the 2013 American Pianists Awards, has continued to earn accolades for “alluring, colorfully shaded renditions” (New York Times) and “genuinely sensitive” (LA Times) playing. He was named a 2015 fellow by the prestigious Leonore Annenberg Fellowship Fund for the Performing Arts.`,
        `Mr. Chen has performed with many prominent orchestras, including the Fort Worth, Hartford, Hudson Valley, Indianapolis, Knoxville, Louisiana Philharmonic, Milwaukee, North Carolina, Pasadena, Phoenix, Plano, San Diego, Santa Fe, Tucson, and New West Symphony Orchestras, as well as the Philadelphia, Indianapolis, and South Bay Chamber Orchestras, collaborating with such esteemed conductors as Leonard Slatkin, Gerard Schwarz, Nicholas McGegan, Miguel Harth-Bedoya, Marcelo Lehninger, Nir Kabaretti, James Judd, George Hanson, Hector Guzman, and Boris Brott. Solo recitals have brought him to major venues worldwide, including Jordan Hall in Boston, Subculture in New York City, the American Art Museum at the Smithsonian in Washington, D.C., the National Concert Hall in Taipei, Het Concertgebouw in Amsterdam, and the Salle Cortot in Paris.`,
        `As a result of his relationship with both orchestral musicians and audience members, Mr. Chen has made return appearance with several orchestras, including the San Diego Symphony, Santa Fe Symphony, Columbus Indiana, Indianapolis Chamber, Carmel Symphony, and Sunriver Festival Orchestras. Lauded for his natural charisma and approachable personality, Mr. Chen is particularly in demand for residencies that combine performances with master classes, school concerts, and artist conversations. He has visited institutions such as the Cleveland School of Music, Indiana University, University of British Columbia, Spotlight Awards at the Los Angeles Music Center, Young Artist World Piano Festival, and several Music Teachers’ Associations throughout the country as either a masterclass teacher or resident artist.`,
        `Mr. Chen has been featured in both live and recorded performances on WQXR (New York), WFMT (Chicago), WGBH (Boston), WFYI (Indianapolis), NPR’s From the Top, and American Public Media’s Performance Today. Additional media coverage includes a profile featured on the cover of Clavier Companion in May 2015, recognition as “One to Watch” by International Piano Magazine in March 2014, and inclusion in WFMT’s “30 Under 30.”`,
        `His CD releases include La Valse, a solo recording on the Steinway label, hailed for “penetrating artistic intellect” (Audiophile Audition); a live recording from the Cliburn Competition released by harmonia mundi, praised for his “ravishing tone and cogently contoured lines” (Gramophone); and an album of Michael Williams’s solo piano works on the Parma label. Mr. Chen has also contributed to the catalog of Steinway’s new Spirio system, and is a Steinway Artist.`,
        `A multifaceted musician, Mr. Chen also transcribes, composes, and improvises. His transcription of Ravel’s La Valse has been received with glowing acclaim, and his encore improvisations are lauded as “genuinely brilliant” (Dallas Morning News). His Prelude in F# was commissioned by fellow pianist Eric Zuber, and subsequently performed in New York. An advocate of new music, he has also collaborated with several composers and performed their works, including Lisa Bielawa, Michael Williams, Nicco Athens, Michael Gilbertson, and Reinaldo Moya.`,
        `Born in Florida, Mr. Chen grew up in the Los Angeles area of Oak Park, California. His impressive achievements before college include the NFAA ARTSweek, Los Angeles Music Center’s Spotlight, and 2006 Presidential Scholars awards. These honors combined with diligent schoolwork facilitated offers of acceptance by MIT, Harvard, and The Juilliard School. Choosing to study music, Mr. Chen earned his Bachelor and Master of Music from Juilliard, meanwhile garnering several awards, most notably the Paul and Daisy Soros Fellowship for New Americans. He received his Artist Diploma in 2014 at the Yale School of Music as a George W. Miles Fellow. His teachers include Hung-Kuan Chen, Tema Blackstone, Edward Francis, Jerome Lowenthal, and Matti Raekallio.`,
        `Mr. Chen is currently living in Kansas City, Missouri and is an Artist-in-Residence at the University of Missouri Kansas City. His wife, Betty, is a violinist with the Kansas City Symphony. When not at the piano, Mr. Chen enjoys tinkering with computers.`,
    ];

    const data = texts.map((text, idx) => (
        {
            paragraph: idx,
            text,
        }
    ));

    await model.bulkCreate(data);
};

export const down = async (models: ModelMap): Promise<number> => {
    return models.bio.destroy({ truncate: true });
};
