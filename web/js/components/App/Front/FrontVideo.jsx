import React from 'react';
import {TransitionMotion, spring} from 'react-motion';
import '@/less/front-video.less';


export default class FrontVideo extends React.Component {
    render() {
        return (
            <TransitionMotion
                willLeave={() => ({ height: spring(0) }) }
                willEnter={() => ({ height: 0 }) }
                styles={() => (this.props.show ? [{
                    key: 1,
                    style: { height: spring(100) }
                }] : []) }>
                {interpolated =>
                    <div>
                        {interpolated.length ?
                            <div className='frontVideo' key={interpolated[0].key} style={{ height: `${interpolated[0].style.height}%` }}>
                                <video autoPlay loop>
                                    <source src="/videos/front_fade.mp4" type="video/mp4" />
                                </video>
                            </div>
                            : null}
                    </div>
                }
            </TransitionMotion>
        )
    }
}