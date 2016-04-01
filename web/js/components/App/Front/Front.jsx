import React from 'react';
import {TransitionMotion, spring} from 'react-motion';
import FrontVideo from '@/js/components/App/Front/FrontVideo.jsx';
import LogoGroup from '@/js/components/App/Front/LogoGroup.jsx';

export default class Front extends React.Component {
    render() {
        return (
            <div className='frontContainer'>
                <TransitionMotion
                    defaultStyles={[{
                        key: '0',
                        style: { opacity: 0, top: -50 }
                    }]}
                    willLeave={() => ({ opacity: spring(0), top: spring(-50) }) }
                    willEnter={() => ({ opacity: 0, top: -50 }) }
                    styles={() => (this.props.show ? [{
                        key: '0',
                        style: { opacity: spring(1), top: spring(0) }
                    }] : []) }>
                    {interpolated =>
                        <div>
                            {interpolated.length ?
                                <LogoGroup key={interpolated[0].key} style={{...interpolated[0].style}} />
                            : null}
                        </div>
                    }
                </TransitionMotion>
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
                                <FrontVideo key={interpolated[0].key} style={{ height: `${interpolated[0].style.height}%` }}/>
                                : null}
                        </div>
                    }
                </TransitionMotion>
            </div>
        )
    }
}