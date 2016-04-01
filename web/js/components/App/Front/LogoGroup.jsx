import React from 'react';
import TweenLite from 'gsap';
import '@/less/front-logo.less';
import {LogoInstance} from '@/js/components/LogoSVG.jsx';

function enterAnim(element, callback) {
    TweenLite.fromTo(element, 0.5,
        {
            opacity: 0,
            top: '-50px'
        }, {
            delay: 0.5,
            opacity: 1,
            top: '0px',
            onComplete: callback,
            ease: Power2.easeOut
        });
}

function leaveAnim(element, callback) {
    TweenLite.fromTo(element, 0.5,
        {
            opacity: 1,
            top: '0px'
        }, {
            opacity: 0,
            top: '-50px',
            onComplete: callback,
            ease: Power2.easeOut
        });
}

export default class LogoGroup extends React.Component {
    componentWillEnter(callback) {
        enterAnim(this.ref, callback);
    }
    componentWillLeave(callback) {
        leaveAnim(this.ref, callback);
    }
    componentDidMount(callback) {
        enterAnim(this.ref, callback);
    }
    render() {
        return (
            <div className='frontLogo' ref={(ref) => this.ref = ref}>
                <LogoInstance className='blur'/>
                <LogoInstance className='solid'/>
            </div>

        )
    }
}