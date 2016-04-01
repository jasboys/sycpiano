import React from 'react';
import {TransitionMotion, spring} from 'react-motion';
import '@/less/front-logo.less';
import {LogoInstance} from '@/js/components/LogoSVG.jsx';

export default class LogoGroup extends React.Component {
    render() {
        return (
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
                            <div key={interpolated[0].key} className='frontLogo' style={interpolated[0].style} >
                                <LogoInstance className='blur'/>
                                <LogoInstance className='solid'/>
                            </div>

                            : null}
                    </div>
                }
            </TransitionMotion>
        )
    }
}