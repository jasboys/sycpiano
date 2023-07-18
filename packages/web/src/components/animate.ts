// This function is not currently used, but it's a damn good function,
// so I'm going to leave it for now.

function animateFn(
    startValue = 0,
    endValue = 1,
    duration = 200, // ms
    fn: (parameter: number) => void,             // the function to use as animation (is called every frame)
    easing: (input: number) => number,           // function input: t => [0, 1], output: eased t => [0, 1]
    callback: () => void,                        // callback for when animation finishes (i.e. return promise)
    animationRequestHandler: (requestId: number) => void,    // for dealing with requestIds (in case you want to cancel it on scroll, etc)
): void {
    if (!fn) {
        return;
    }
    if (!easing) {
        easing = (t) => (t);
    }

    let startTimestamp: number;
    const durationInv = 1 / duration;    // to avoid dividing in the loop
    const startToEndValue = endValue - startValue;

    const animationStep = (timestamp: number): void => {
        if (!startTimestamp) {
            startTimestamp = timestamp;
            window.requestAnimationFrame(animationStep);
        } else {
            // elapsed time normalized to [0, 1]
            const tElapsed = (timestamp - startTimestamp) * durationInv;
            if (tElapsed >= 1.0) {
                if (callback) { callback(); }
                return;
            }
            const tEased = easing(tElapsed);
            const currentValue = startValue + startToEndValue * tEased;
            fn(currentValue);
            window.requestAnimationFrame(animationStep);
        }
    };

    const requestId = window.requestAnimationFrame(animationStep);
    animationRequestHandler(requestId);
}

export default animateFn;
