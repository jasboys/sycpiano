import * as React from 'react';

import styled from '@emotion/styled';

import iconMap from 'src/components/About/Discs/iconMap';
import { Disc } from 'src/components/About/Discs/types';
import { ChildRendererProps } from 'src/components/Media/types';

import { staticImage } from 'src/styles/imageUrls';
import { screenXSorPortrait } from 'src/styles/screens';

const LinkImage = styled.img`
    transition: all 0.2s;
    vertical-align: middle;
    height: 2em;
    filter: saturate(0.3);

    ${screenXSorPortrait} {
        height: 1.8em;
    }

    &:hover {
        transform: scale(1.1);
        filter: saturate(1);
        cursor: pointer;
    }
`;

const StyledLink = styled.a`
    flex: 1 0 auto;
    text-align: center;
    display: block;
`;

interface DiscLinkProps {
    imageUrl: string;
    linkUrl: string;
}

const DiscLink: React.FC<DiscLinkProps> = (props) => (
    <StyledLink href={props.linkUrl} target="_blank" rel="noopener">
        <LinkImage
            src={staticImage(`/logos/${props.imageUrl}`)}
        />
    </StyledLink>
);

const DiscItem = styled.div<{ isMobile: boolean }>`
    margin: 4rem auto;
    max-width: 800px;
    overflow: hidden;
    box-shadow:
        0 1px 3px 0 rgba(0, 0, 0, 0.2),
        0 1px 1px 0 rgba(0, 0, 0, 0.14),
        0 2px 1px -1px rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    background-color: white;
    display: flex;
    flex-wrap: wrap;

    ${screenXSorPortrait} {
        width: 80vw;
    }
`;

const DiscImageContainer = styled.div<{ bgImage: string }>`
    flex: 0 0 300px;
    background-image: url(${props => props.bgImage});
    background-size: cover;

    ${screenXSorPortrait} {
        height: 80vw;
        flex: 0 0 80vw;
    }
`;

const DiscDescription = styled.div`
    flex: 1;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
`;

const DiscTitle = styled.h4`
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
`;

const DiscLabel = styled.h5`
    margin: 0.5rem;
`;

const DiscYear = styled.h5`
    margin: 0.5rem;
`;

const Divider = styled.div`
    border-top: 1px solid #888;
    height: 1px;
    margin: 0.8rem 3rem 1.5rem;
`;

const LinksContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-end;
`;

class DiscListItem extends React.PureComponent<ChildRendererProps<Disc>, Record<string, never>> {
    render(): JSX.Element {
        return (
            <li>
                <DiscItem isMobile={this.props.isMobile}>
                    <DiscImageContainer bgImage={`/static/images/cd-thumbnails/${this.props.item.thumbnailFile}`} />
                    <DiscDescription>
                        <DiscTitle>{this.props.item.title}</DiscTitle>
                        <DiscLabel>{this.props.item.label}</DiscLabel>
                        <DiscYear>{this.props.item.releaseDate}</DiscYear>
                        <p>{this.props.item.description}</p>
                        <Divider />
                        <LinksContainer>
                            {this.props.item.discLinks.map((value) => (
                                <DiscLink key={`${this.props.item.id}-${value.type}`} linkUrl={value.url} imageUrl={iconMap[value.type]} />
                            ))}
                        </LinksContainer>
                    </DiscDescription>
                </DiscItem>
            </li>
        );
    }
}

export default DiscListItem;
