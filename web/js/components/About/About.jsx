import '@/less/about.less';
import React from 'react';
import blurbs from '@/js/components/About/blurbs.js';

export default class About extends React.Component {
    render() {
        return (
            <div className='aboutContainer container'>
                <div className='leftContainer'></div>
                <div className='rightContainer'>
                    {blurbs.map(function(blurb, i) {
                        if (i == 0) {
                            var firstLetter = blurb[0];
                            var withoutFirstLetter = blurb.slice(1);
                            return (
                                <p key={i}><span className='firstLetter'>{firstLetter}</span>{withoutFirstLetter}</p>
                            )
                        }
                        return <p key={i}>{blurb}</p>;
                    })}
                </div>
            </div>
        )
    }
};
