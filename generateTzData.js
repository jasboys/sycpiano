const fs = require('fs');
const fancyLog = require('fancy-log');
const moment = require('moment');
const momentTz = require('moment-timezone/moment-timezone-utils');

const packedLatest = require('moment-timezone/data/packed/latest.json');

const nextYear = moment().year() + 1;

function unpackAndUnlink(latest) {
    return {
        zones: latest.zones.map(momentTz.tz.unpack),
        links: latest.links,
    };
}

const filePath = `web/assets/data/tz-data.json`

function main(done) {
    const unpackedLatest = unpackAndUnlink(packedLatest);

    const packed = momentTz.tz.filterLinkPack(unpackedLatest, 2010, nextYear);

    fs.writeFile(filePath, JSON.stringify(packed), 'utf8', (err) => {
        if (err) {
            fancyLog(`[tz-data] Failed to generate new timezone data for 2010-${nextYear}.`);
        } else {
            fancyLog('[tz-data] Timezone data generated and saved at ', filePath);
        }
        done();
    });
}

module.exports = main;
