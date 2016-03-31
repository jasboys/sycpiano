import React from 'react';
import '@/less/front-video.less';


export default class FrontVideo extends React.Component {
    render() {
        return (
            <div className='frontVideo' style={this.props.style}>
                <video autoPlay loop>
                    <source src="/videos/front_fade.mp4" type="video/mp4" />
                </video>
            </div>
        )
    }
}