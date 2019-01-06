import * as React from 'react';

import styled from '@emotion/styled';

import { ContactSocialMediaShape } from 'src/components/Contact/types';
import { staticImage } from 'src/styles/imageUrls';
import { screenXSorPortrait } from 'src/styles/screens';

const SocialMediaLinkContainer = styled.div` padding-top: 20px; `;

const SocialMediaImg = styled.img`
    transition: all 0.2s;
    vertical-align: middle;
    margin: 0 20px;
    width: 3em;

    ${screenXSorPortrait} {
        width: 2em;
    }

    &:hover {
        transform: scale(1.2);
        cursor: pointer;
    }
`;

const StyledLink = styled.a`
    flex: 1 0 auto;
    text-align: center;
    display: block;
`;

interface SocialMediaLinkProps {
    className?: string;
    social: string;
    url: string;
}

const SocialMediaLink: React.FC<SocialMediaLinkProps> = (props) => (
    <StyledLink href={props.url} target="_blank" rel="noopener">
        <SocialMediaImg
            src={staticImage(`/soc-logos/${props.social}-color.svg`)}
        />
    </StyledLink>
);

const LinksContainer = styled.div`
    padding: 0 10px;
    display: flex;
    justify-content: center;
`;

const ContactSocialMedia = React.memo((props: ContactSocialMediaShape) => (
    <LinksContainer>
        {
            Object.keys(props.social).map((social) => (
                <SocialMediaLinkContainer key={social}>
                    <SocialMediaLink url={props.social[social]} social={social}/>
                </SocialMediaLinkContainer>
            ))
        }
    </LinksContainer>
));

export { ContactSocialMedia };
