import React from 'react';
import '@/less/front-name.less';

export default class FrontName extends React.Component {
    render() {
        let {hover, ...other} = this.props;
        return (
            <div className='frontName'>
                <div className={hover ? 'blur-hover' : 'blur'}>
                    <div className='left'>
                        SEAN
                    </div>
                    <div className='right'>
                        CHEN
                    </div>
                </div>
                <div className='solid'>
                    <div className='left'>
                        <span {...other}>
                            SEAN
                        </span>
                    </div>
                    <div className='right'>
                        <span {...other}>
                            CHEN
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}