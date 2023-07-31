import * as React from 'react';
import styled from '@emotion/styled';

import iconMap from 'src/components/About/Discs/iconMap';
import { Disc } from 'src/components/About/Discs/types';
import { staticImage } from 'src/imageUrls';
import { isHamburger, screenXS, hiDpx } from 'src/screens';
import { cardShadow } from 'src/styles/mixins';
import { toMedia } from 'src/MediaQuery';

const LinkImage = styled.img({
    transition: 'all 0.2s',
    verticalAlign: 'middle',
    height: '2rem',
    filter: 'saturate(0.3)',
    '&:hover': {
        transform: 'scale(1.1)',
        filter: 'saturate(1)',
        cursor: 'pointer',
    },

    [toMedia(hiDpx)]: {
        height: '1.8rem',
    },
});

const StyledLink = styled.a({
    flex: '1 0 auto',
    textAlign: 'center',
    display: 'block',
});

interface DiscLinkProps {
    imageUrl: string;
    linkUrl: string;
}

const DiscLink: React.FC<DiscLinkProps> = (props) => (
    <StyledLink href={props.linkUrl} target="_blank" rel="noopener">
        <LinkImage src={staticImage(`/logos/${props.imageUrl}`)} />
    </StyledLink>
);

const DiscItem = styled.div({
    margin: '4rem auto',
    width: '100%',
    overflow: 'hidden',
    boxShadow: cardShadow,
    // borderRadius: 8,
    backgroundColor: 'white',
    display: 'flex',
    flexWrap: 'wrap',
    [toMedia(isHamburger)]: {
        width: '80vw',
    },
    '&:first-of-type': {
        marginTop: '2rem',
    },
});

const DiscImageContainer = styled.div({
    flex: '0 0 300px',
    overflow: 'hidden',
    [toMedia(screenXS)]: {
        height: '80vw',
        flex: '0 0 80vw',
    },
});

// const ImageBorder = styled.div({
//     position: 'relative',
//     height: 'calc(100% - 2rem)',
//     margin: '1rem',
//     backgroundColor: 'rgb(244 244 244)',
//     overflow: 'hidden',
//     '&:after': {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         boxShadow: 'inset 0 0 10px rgba(0 0 0 / 0.4)',
//     },
// });

const DiscImage = styled.img({
    minHeight: '100%',
    minWidth: '100%',
    height: 0,
    objectFit: 'cover',
    objectPosition: 'center center',
});

// const TopGradient = styled.div({
//     background: 'radial-gradient(circle, rgb(255, 255, 255) 0%, rgb(238, 238, 238) 35%, rgb(125, 125, 125) 100%)',
//     height: '100%',
//     transform: 'scale(1.5, 0.8) translateY(-20%)',
//     position: 'absolute',
//     width: '100%'
// });

// const BottomGradient = styled.div({
//     background: 'radial-gradient(circle, rgb(255, 255, 255) 0%, rgb(193, 193, 193) 35%, rgb(125, 125, 125) 100%)',
//     height: '100%',
//     transform: 'scale(1.5, 0.8) translateY(80%)',
//     position: 'absolute',
//     width: '100%',
// });

// const BoxShadow = styled.div({
//     position: 'absolute',
//     height: '100%',
//     width: '100%',
//     boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',
// });

const DiscDescription = styled.div({
    flex: '1',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
});

const DiscTitle = styled.span({
    margin: 0,
    marginBottom: '0.5rem',
    fontSize: '1.5rem',
});

const DiscLabel = styled.span({
    margin: '0.5rem',
});

const DiscYear = styled.span({
    margin: '0.5rem',
});

const Divider = styled.div({
    borderTop: '1px solid #888',
    height: 1,
    margin: '0.8rem 3rem 1.5rem',
});

const LinksContainer = styled.div({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
});

interface DiscListProps {
    item: Disc;
}

const DiscListItem: React.FC<DiscListProps> = ({ item }) => {
    return (
        <li>
            <DiscItem>
                <DiscImageContainer>
                    <DiscImage
                        src={`/static/images/cd-thumbnails/${item.thumbnailFile}`}
                    />
                </DiscImageContainer>
                <DiscDescription>
                    <DiscTitle>{item.title}</DiscTitle>
                    <DiscLabel>{item.label}</DiscLabel>
                    <DiscYear>{item.releaseDate}</DiscYear>
                    <p>{item.description}</p>
                    <Divider />
                    <LinksContainer>
                        {item.discLinks
                            .filter((value) => value.type !== 'google')
                            .map((value) => (
                                <DiscLink
                                    key={`${item.id}-${value.type}`}
                                    linkUrl={value.url}
                                    imageUrl={iconMap[value.type]}
                                />
                            ))}
                    </LinksContainer>
                </DiscDescription>
            </DiscItem>
        </li>
    );
};

export default DiscListItem;
