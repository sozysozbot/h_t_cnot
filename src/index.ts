import randomNormal from 'random-normal';
import Complex from 'complex.js'

type Four<T> = [T, T, T, T];
type FourByFour<T> = Four<Four<T>>;

// Mat[i][j] is ith row, jth column
type Mat = FourByFour<Complex>;

const zero: () => Mat = () => {
    return [
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
    ]
}

const random_gaussian: () => Mat = () => {
    const ans = zero();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            ans[i][j] = new Complex(randomNormal(), randomNormal())
        }
    }
    return ans;
}

const test = random_gaussian();
 
const render = (a: Mat) => {
    const svg = document.getElementById("matrix")!;
    const SPACING = 100;
    const X_OFFSET = 50;
    const Y_OFFSET = 50;
    const CIRCLE_MAX_RADIUS = 25;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const center = {
                y: Y_OFFSET + i * SPACING, // ith row 
                x: X_OFFSET + j * SPACING, // jth column 
            };

            const abs = a[i][j].abs();

            if (abs < 0.05) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttributeNS(null, "cy", `${center.y}`);
                circle.setAttributeNS(null, "cx", `${center.x}`);
                circle.setAttributeNS(null, "r", `${CIRCLE_MAX_RADIUS * abs}`);
                circle.setAttributeNS(null, "fill", "#000000");
                circle.setAttributeNS(null, "stroke", "#000000");
                circle.setAttributeNS(null, "stroke-width", "2");
                svg.appendChild(circle);

            } else {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttributeNS(null, "cy", `${center.y}`);
                circle.setAttributeNS(null, "cx", `${center.x}`);
                circle.setAttributeNS(null, "r", `${CIRCLE_MAX_RADIUS * abs}`);
                circle.setAttributeNS(null, "fill", "#009f80");
                circle.setAttributeNS(null, "stroke", "#005242");
                circle.setAttributeNS(null, "stroke-width", "2");
                svg.appendChild(circle);

                const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
                line.setAttributeNS(null, "d", `m 
                ${center.x} 
                ${center.y} 
                ${CIRCLE_MAX_RADIUS * a[i][j].re} 
                ${CIRCLE_MAX_RADIUS * -a[i][j].im /* `i` must point in the negative Y direction */}
                `);
                line.setAttributeNS(null, "stroke", "#000000");
                line.setAttributeNS(null, "stroke-width", `${5 * Math.sqrt(abs)}`);
                svg.appendChild(line);
            }
        }
    }
}

window.onload = () => {
    render(test)
}