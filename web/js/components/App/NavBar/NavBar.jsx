import '@/less/nav-bar.less';
import '@/less/nav-bar-layout.less';
import React from 'react';

import NavBarLogo from '@/js/components/App/NavBar/NavBarLogo.jsx';
import NavBarLinks from '@/js/components/App/NavBar/NavBarLinks.jsx';


export default class NavBar extends React.Component {
    render() {
        var links = ['home', 'about', 'schedule', 'media', 'press', 'contact']
        return (
            <div className='navBar'>
                <NavBarLogo onClick={this.props.onClick} />
                <NavBarLinks links={links} />
            </div>
        )
    }
};