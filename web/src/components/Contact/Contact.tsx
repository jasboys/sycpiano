import * as React from 'react';

import styled from '@emotion/styled';

import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import StyledContactItem from 'src/components/Contact/ContactItem';
import contacts from 'src/components/Contact/contacts';

import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';
import { pushed } from 'src/styles/mixins';

interface ContactProps {
    isMobile: boolean;
    className?: string;
}

const ContactContainer = styled.div(
    pushed,
    {
        display: 'flex',
        // visibility: 'hidden',
        flexFlow: 'row wrap',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        overflowX: 'hidden',
        overflowY: 'unset',
        [screenXSorPortrait]: {
            height: '100%',
            marginTop: 0,
            overflowY: 'scroll',
            justifyContent: 'space-around',
            WebkitOverflowScrolling: 'touch',
        },
    });

const Contact: React.FC<ContactProps> = ({ isMobile }) => {
    const dispatch = useAppDispatch();

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <ContactContainer
            onScroll={isMobile ? scrollFn(navBarHeight.mobile, onScrollDispatch) : undefined}
        >
            {contacts.map((contact, i) => (
                <StyledContactItem {...contact} isMobile={isMobile} key={i} />
            ))}
        </ContactContainer>
    );
};

export type ContactType = typeof Contact;
export type RequiredProps = ContactProps;
export default Contact;
