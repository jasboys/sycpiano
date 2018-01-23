import { injectGlobal } from 'emotion';

import { logoBlue } from 'src/styles/colors';

injectGlobal`
* {
    box-sizing: border-box;
    outline: none;
}

html {
    height: 100%;
    overflow: hidden;
}

body {
    margin: 0px;
    height: 100%;
    background-color: #FFF;
}

#hero-container {
    height: 100%;
}

#router {
    display: none;
}

.appContainer {
    height: 100%;
    width: 100%;
}

.container {
    position: absolute;
    top: 0;
    left: 0;
}

a {
    .link(${logoBlue});
}

.no-highlight {
    .user-select(none);
}
`;