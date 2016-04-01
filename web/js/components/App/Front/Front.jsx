import React from 'react';
import FrontVideo from '@/js/components/App/Front/FrontVideo.jsx';
import LogoGroup from '@/js/components/App/Front/LogoGroup.jsx';

export default class Front extends React.Component {
    render() {
        return (
            <div className='frontContainer'>
                <LogoGroup {...this.props} />
                <FrontVideo {...this.props} />
            </div>
        )
    }
}