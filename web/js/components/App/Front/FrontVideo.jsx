import React from 'react';
import TweenLite from 'gsap';
import '@/less/front-video.less';


export default class FrontVideo extends React.Component {
    componentWillLeave(callback) {
        console.log(this.comp);
        TweenLite.fromTo(this.comp, 0.5,
            { height: '100%' },
            { height: '0%', onComplete: callback, ease: Power1.easeOut });
    }
    componentWillEnter(callback) {
        TweenLite.fromTo(this.comp, 0.5, { height: '0%' },
            { height: '100%', onComplete: callback, ease: Power1.easeOut });
    }
    render() {
        return (
            <div className='frontVideo' ref={(ref) => this.comp = ref}>
                <video autoPlay loop>
                    <source src="/videos/front_fade.mp4" type="video/mp4" />
                </video>
            </div>
        )
    }
}