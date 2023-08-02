import React from 'react';
import { Admin, Resource } from 'react-admin';

import authProvider from '../providers/authProvider.js';
import restProvider from '../providers/restProvider.js';

// import { AcclaimList, AcclaimShow, AcclaimEdit, AcclaimCreate }
import { ADMIN_URI, AUTH_URI } from '../uris.js';
import {
    AcclaimCreate,
    AcclaimEdit,
    AcclaimList,
    AcclaimShow,
} from './Acclaim';
import { BioCreate, BioEdit, BioList, BioShow } from './Bio';
import {
    CalendarCreate,
    CalendarEdit,
    CalendarList,
    CalendarShow,
} from './Calendar';
import {
    CollaboratorCreate,
    CollaboratorEdit,
    CollaboratorList,
    CollaboratorShow,
} from './Collaborator';
import { DiscCreate, DiscEdit, DiscList, DiscShow } from './Disc';
import { FaqCreate, FaqEdit, FaqList, FaqShow } from './Faq';
import { MusicCreate, MusicEdit, MusicList, MusicShow } from './Music';
import { PhotoCreate, PhotoEdit, PhotoList, PhotoShow } from './Photo';
import { PieceCreate, PieceEdit, PieceList, PieceShow } from './Piece';
import {
    ProductCreate,
    ProductEdit,
    ProductList,
    ProductShow,
} from './Product';
import { UserList, UserShow } from './User';

export const AdminPage = () => (
    <Admin
        dataProvider={restProvider(ADMIN_URI)}
        authProvider={authProvider(AUTH_URI)}
    >
        <Resource
            name="acclaims"
            list={AcclaimList}
            show={AcclaimShow}
            edit={AcclaimEdit}
            create={AcclaimCreate}
        />
        <Resource
            name="bios"
            list={BioList}
            show={BioShow}
            edit={BioEdit}
            create={BioCreate}
        />
        <Resource
            name="discs"
            list={DiscList}
            show={DiscShow}
            edit={DiscEdit}
            create={DiscCreate}
        />
        <Resource name="disc-links" />
        <Resource
            name="musics"
            list={MusicList}
            show={MusicShow}
            edit={MusicEdit}
            create={MusicCreate}
        />
        <Resource name="music-files" />
        <Resource
            name="photos"
            list={PhotoList}
            show={PhotoShow}
            edit={PhotoEdit}
            create={PhotoCreate}
        />
        <Resource
            name="faqs"
            list={FaqList}
            show={FaqShow}
            edit={FaqEdit}
            create={FaqCreate}
        />
        <Resource
            name="calendars"
            list={CalendarList}
            show={CalendarShow}
            create={CalendarCreate}
            edit={CalendarEdit}
        />
        <Resource
            name="pieces"
            list={PieceList}
            show={PieceShow}
            create={PieceCreate}
            edit={PieceEdit}
        />
        <Resource
            name="collaborators"
            list={CollaboratorList}
            show={CollaboratorShow}
            create={CollaboratorCreate}
            edit={CollaboratorEdit}
        />
        {/* <Resource
            name="calendar-pieces"
            show={CalendarPieceShow}
            list={CalendarPieceList}
            edit={CalendarPieceEdit} />
        <Resource
            name="calendar-collaborators"
            show={CalendarCollaboratorShow}
            list={CalendarCollaboratorList}
            edit={CalendarCollaboratorEdit} /> */}
        <Resource
            name="products"
            list={ProductList}
            show={ProductShow}
            edit={ProductEdit}
            create={ProductCreate}
        />
        <Resource name="users" list={UserList} show={UserShow} />
    </Admin>
);