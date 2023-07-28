import * as React from 'react';

import styled from '@emotion/styled';

import {
    PersonalContactShape,
    PersonalInfoShape,
} from 'src/components/Contact/types';

import { contactPageLinkColor } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { link } from 'src/styles/mixins';
import { screenXL } from 'src/screens';
import { toMedia } from 'src/MediaQuery';

const dividerColor = '#888';

const NameContainer = styled.div(
    latoFont(400),
    {
        flex: '0 0 auto',
        fontSize: '2em',
        marginBottom: '0.5rem',
        [toMedia(screenXL)]: {
            fontSize: '2.4rem',
        }
    });

const SubInfo = styled.div`
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const SubInfoTitle = styled.div`
    font-size: 1.2em;
    margin-top: 0.6rem;
    margin-bottom: 0.6rem;
`;

const PersonalInfo: React.FC<PersonalInfoShape> = ({
    className,
    name,
    position,
}) => (
    <div className={className}>
        <NameContainer>{name}</NameContainer>

        {position.map((pos) => (
            <SubInfo key={pos.title}>
                <SubInfoTitle>{pos.title}</SubInfoTitle>
                {pos.organization && (
                    <div>
                        {pos.organization}
                    </div>
                )}
            </SubInfo>
        ))}

    </div>
);

const StyledPersonalInfo = styled(React.memo(PersonalInfo))`
    flex: 0 1 125px;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;

    ${toMedia(screenXL)} {
        flex: 0 0 150px;
    }
`;

const Divider = styled.div`
    border-top: 1px solid ${dividerColor};
    height: 1px;
    margin: 0 85px 15px;
`;

const ContactMethod = styled.div`
    flex: 1 0 auto;
    flex-direction: column;
    justify-content: center;
    display: flex;
    margin-bottom: 0.5rem;
`;

const PersonalContact: React.FC<PersonalContactShape> = ({
    className,
    phone,
    email,
    website,
}) => (
    <div className={className}>
        {phone && <ContactMethod>{phone}</ContactMethod>}

        {email.map((em) => (
            <ContactMethod key={em}>
                <div>
                    <a href={`mailto:${em}`} css={link(contactPageLinkColor)}>
                        {em}
                    </a>
                </div>
            </ContactMethod>
        ))}
        {(website) && (
            <ContactMethod>
                <a href={website} css={link(contactPageLinkColor)}>
                    {website}
                </a>
            </ContactMethod>
        )}
    </div>
);

const StyledPersonalContact = styled(PersonalContact)(
    latoFont(400),
    {
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    });

const InfoContainer = styled.div(
    latoFont(300),
    {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '30px 0 10px',
        boxSizing: 'border-box',
    });

type ContactInfoProps = PersonalContactShape & PersonalInfoShape;

const ContactInfo: React.FC<ContactInfoProps> = (props) => (
    <InfoContainer>
        <StyledPersonalInfo
            name={props.name}
            position={props.position}
        />

        <Divider />

        <StyledPersonalContact
            phone={props.phone}
            email={props.email}
            website={props.website}
        />
    </InfoContainer>
);

export { ContactInfo };
