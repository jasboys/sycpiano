import React from 'react';
import '@/less/animations/front-logo-animation.less';
import '@/less/animations/front-video-animation.less';
import {TransitionMotion, spring} from 'react-motion';
import FrontVideo from '@/js/components/App/Front/FrontVideo.jsx';
import LogoGroup from '@/js/components/App/Front/LogoGroup.jsx';

export default class Front extends React.Component {
    render() {
        return (
            <div className='frontContainer'>
                <TransitionMotion
                    willLeave={()=>({ opacity: spring(0), top: spring(-50) })}
                    willEnter={()=>({ opacity: 0, top: -50 })}
                    styles={()=>(this.props.show ? [{
                        key: 0,
                        style: { opacity: spring(1), top: spring(0) }
                    }] : [])}>
                    {interpolated =>
                        <div>
                        {interpolated.map(config => {
                            return <LogoGroup key={config.key} style={{...config.style}} />
                        })}
                        </div>
                    }
                </TransitionMotion>
                <TransitionMotion
                    willLeave={()=>({ height: spring(0) })}
                    willEnter={()=>({ height: 0 })}
                    styles={()=>(this.props.show ? [{
                        key: 1,
                        style: { height: spring(100) }
                    }] : [])}>
                    {interpolated =>
                        <div>
                        {interpolated.map(config => {
                            return  <FrontVideo key={config.key} style={{height: `${config.style.height}%`}}/>
                        })}
                        </div>
                    }
                </TransitionMotion>
            </div>
        )
    }
}