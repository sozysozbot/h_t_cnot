import randomNormal from 'random-normal';
import Complex from 'complex.js'

type Four<T> = [T, T, T, T];
type FourByFour<T> = Four<Four<T>>;

// Mat[i][j] is ith row, jth column
type Mat = FourByFour<Complex>;
type Vec = Four<Complex>;

const zero: () => Mat = () => {
    return [
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
    ]
}

const mmul: (a: Mat, b: Mat) => Mat = (a: Mat, b: Mat) => {
    const ans = zero();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                ans[i][j] = ans[i][j].add(a[i][k].mul(b[k][j]))
            }
        }
    }
    return ans;
}

const dagger: (u: Mat) => Mat = (u: Mat) => {
    const ans = zero();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            ans[i][j] = u[j][i].conjugate()
        }
    }
    return ans;
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

const scale: (scaling: Complex, u: Vec) => Vec = (scaling: Complex, u: Vec) => [
    u[0].mul(scaling),
    u[1].mul(scaling),
    u[2].mul(scaling),
    u[3].mul(scaling),
];

const dot: (u: Vec, v: Vec) => Complex = (u: Vec, v: Vec) =>
    Array.from({ length: 4 }, (_, i) => u[i].conjugate().mul(v[i])).reduce((a, b) => a.add(b), Complex.ZERO);

const proj: (u: Vec, v: Vec) => Vec = (u: Vec, v: Vec) => scale(dot(u, v).div(dot(u, u)), u);

const normalize: (u: Vec) => Vec = (u: Vec) => scale(dot(u, u).sqrt().inverse(), u);

const sub: (u: Vec, v: Vec) => Vec = (u: Vec, v: Vec) => [
    u[0].sub(v[0]),
    u[1].sub(v[1]),
    u[2].sub(v[2]),
    u[3].sub(v[3]),
]

const gram_schmidt: (vs: Mat) => Mat = (vs: Mat) => {
    const u0 = vs[0];
    const e0 = normalize(u0);
    const u1 = sub(vs[1], proj(u0, vs[1]));
    const e1 = normalize(u1);
    const u2 = sub(sub(vs[2], proj(u0, vs[2])), proj(u1, vs[2]));
    const e2 = normalize(u2);
    const u3 = sub(sub(sub(vs[3], proj(u0, vs[3])), proj(u1, vs[3])), proj(u2, vs[3]));
    const e3 = normalize(u3);
    return [e0, e1, e2, e3];
}

const random_unitary: () => Mat = () => {
    // According to https://mathoverflow.net/questions/333187/random-unitary-matrices :
    // 
    // > I understand your question as asking for a constructive method to sample uniformly from the unitary group U(N) or orthogonal group O(N), 
    // > where "uniformly" is understood in the sense of the Haar measure. 
    // > A simple method starts from an N×N matrix filled with independent Gaussian random variables [Complex for U(N) and real for O(N)]. 
    // > Then orthonormalize the columns via Gram-Schmidt and you're done.
    return gram_schmidt(random_gaussian());
}

const U = random_unitary();
console.log("mmul(U, dagger(U))", mmul(U, dagger(U))); // Check that it is unitary

const render_unitary = (a: Mat) => {
    const svg = document.getElementById("matrix")!;
    const SPACING = 100;
    const X_OFFSET = 50;
    const Y_OFFSET = 50;
    const CIRCLE_MAX_RADIUS = 40;
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
    render_unitary(U)
}