import React from 'react';
import '@/less/front-logo.less';
import {LogoInstance} from '@/js/components/LogoSVG.jsx';

export default class LogoGroup extends React.Component {
    render() {
        return (
            <div key={this.props.key} className='frontLogo' style={this.props.style} >
                <LogoInstance className='blur'/>
                <LogoInstance className='solid'/>
            </div>
        )
    }
}