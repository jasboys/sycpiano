import styled from '@emotion/styled';

import { LogoInstance } from 'src/components/LogoSVG';
import { toMedia } from 'src/MediaQuery';
import { hiDpx } from 'src/screens';

export const sycLogoSize = {
    hiDpx: 120,
    lowDpx: 150,
    get(hiDpx: boolean) {
        return hiDpx ? this.hiDpx : this.lowDpx;
    },
};

export const SycLogo = styled(LogoInstance)({
    width: sycLogoSize.lowDpx,
    height: sycLogoSize.lowDpx,
    float: 'left',
    flex: '0 0 auto',
    WebkitTapHighlightColor: 'transparent',
    [toMedia(hiDpx)]: {
        width: sycLogoSize.hiDpx,
        height: sycLogoSize.hiDpx,
    },
});
