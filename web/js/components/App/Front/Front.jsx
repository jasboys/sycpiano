import React from 'react';
import TransitionGroup from 'react-addons-transition-group';
import FrontVideo from '@/js/components/App/Front/FrontVideo.jsx';
import LogoGroup from '@/js/components/App/Front/LogoGroup.jsx';

export default class Front extends React.Component {
    render() {
        return (
            <div className='frontContainer'>
                <TransitionGroup>
                {this.props.show && <LogoGroup />}
                {this.props.show && <FrontVideo />}
                </TransitionGroup>
            </div>
        )
    }
}