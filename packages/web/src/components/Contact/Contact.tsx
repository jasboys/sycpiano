import styled from '@emotion/styled';
import * as React from 'react';

import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import { mqSelectors } from 'src/components/App/reducers';
import ContactItem from 'src/components/Contact/ContactItem';
import contacts from 'src/components/Contact/contacts';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { minRes, webkitMinDPR } from 'src/screens';
import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';

type ContactProps = Record<never, unknown>;

const ContactContainer = styled.div(pushed, {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-evenly',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    overflowX: 'hidden',
    overflowY: 'hidden',
    backgroundColor: 'white',
    [toMedia([minRes, webkitMinDPR])]: {
        height: '100%',
        marginTop: 0,
        overflowY: 'scroll',
        justifyContent: 'unset',
    },
});

const Contact: React.FC<ContactProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx);
    const dispatch = useAppDispatch();

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <ContactContainer
            onScroll={
                isHamburger
                    ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch)
                    : undefined
            }
        >
            {contacts.map((contact) => (
                <ContactItem {...contact} key={contact.name} />
            ))}
        </ContactContainer>
    );
};

export type ContactType = typeof Contact;
export type RequiredProps = ContactProps;
export default Contact;
