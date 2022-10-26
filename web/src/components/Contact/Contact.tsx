import * as React from 'react';

import styled from '@emotion/styled';

import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import ContactItem from 'src/components/Contact/ContactItem';
import contacts from 'src/components/Contact/contacts';

import { minRes, webkitMinDPR } from 'src/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';
import { pushed } from 'src/styles/mixins';
import { MediaContext } from 'src/components/App/App';
import { toMedia } from 'src/mediaQuery';

type ContactProps = Record<never, unknown>;

const ContactContainer = styled.div(
    pushed,
    {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        overflowX: 'hidden',
        overflowY: 'unset',
        [toMedia([minRes, webkitMinDPR])]: {
            height: '100%',
            marginTop: 0,
            overflowY: 'scroll',
            justifyContent: 'space-around',
        },
    });

const Contact: React.FC<ContactProps> = () => {
    const { isHamburger, hiDpx } = React.useContext(MediaContext);
    const dispatch = useAppDispatch();

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <ContactContainer
            onScroll={isHamburger ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch) : undefined}
        >
            {contacts.map((contact, i) => (
                <ContactItem {...contact} key={i} />
            ))}
        </ContactContainer>
    );
};

export type ContactType = typeof Contact;
export type RequiredProps = ContactProps;
export default Contact;
