import styled from '@emotion/styled';
import type * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import type { ContactSocialMediaShape } from 'src/components/Contact/types';
import { staticImage } from 'src/imageUrls';
import { minRes, webkitMinDPR } from 'src/screens';
import { latoFont } from 'src/styles/fonts';

const SocialMediaLinkContainer = styled.div({
    paddingTop: 20,
});

const SocialMediaImg = styled.img({
    transition: 'all 0.2s',
    verticalAlign: 'middle',
    margin: '0 20px',
    width: '2.5rem',
    [toMedia([minRes, webkitMinDPR])]: {
        width: '2.0rem',
    },
    '&:hover': {
        transform: 'scale(1.2)',
        cursor: 'pointer',
    },
});

const StyledLink = styled.a(latoFont(400), {
    flex: '1 0 auto',
    textAlign: 'center',
    display: 'block',
});

interface SocialMediaLinkProps {
    className?: string;
    social: string;
    url: string;
}

const SocialMediaLink: React.FC<SocialMediaLinkProps> = (props) => (
    <StyledLink href={props.url} target="_blank" rel="noopener">
        {props.social === 'web' ? (
            <span>{props.url}</span>
        ) : (
            <SocialMediaImg
                src={staticImage(`/logos/${props.social}-color.svg`)}
            />
        )}
    </StyledLink>
);

const LinksContainer = styled.div`
    padding: 0 10px;
    display: flex;
    justify-content: center;
`;

const ContactSocialMedia: React.FC<ContactSocialMediaShape> = (props) => (
    <LinksContainer>
        {Object.keys(props.social).map((social) => (
            <SocialMediaLinkContainer key={social}>
                <SocialMediaLink url={props.social[social]} social={social} />
            </SocialMediaLinkContainer>
        ))}
    </LinksContainer>
);

export { ContactSocialMedia };

