import styled from '@emotion/styled';
import type * as React from 'react';

import ContactItem from 'src/components/Contact/ContactItem';
import contacts from 'src/components/Contact/contacts';
import { toMedia } from 'src/mediaQuery';
import { minRes, webkitMinDPR } from 'src/screens';
import { rootStore } from 'src/store.js';
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
    const { isHamburger, hiDpx } = rootStore.mediaQueries.useTrackedStore();

    return (
        <ContactContainer
            onScroll={
                isHamburger
                    ? rootStore.navBar.set.onScroll(navBarHeight.get(hiDpx))
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
