import Complex from 'complex.js'
import randomNormal from 'random-normal';
type Four<T> = [T, T, T, T];
type FourByFour<T> = Four<Four<T>>;

// Mat[i][j] is ith row, jth column
export type Mat = FourByFour<Complex>;
export type Vec = Four<Complex>;

const zero: () => Mat = () => {
    return [
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
        [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ZERO],
    ]
}

export const mmul: (a: Mat, b: Mat) => Mat = (a: Mat, b: Mat) => {
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

export const dagger: (u: Mat) => Mat = (u: Mat) => {
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

export const gram_schmidt: (vs: Mat) => Mat = (vs: Mat) => {
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

export const random_unitary: () => Mat = () => {
    // According to https://mathoverflow.net/questions/333187/random-unitary-matrices :
    // 
    // > I understand your question as asking for a constructive method to sample uniformly from the unitary group U(N) or orthogonal group O(N), 
    // > where "uniformly" is understood in the sense of the Haar measure. 
    // > A simple method starts from an N×N matrix filled with independent Gaussian random variables [Complex for U(N) and real for O(N)]. 
    // > Then orthonormalize the columns via Gram-Schmidt and you're done.
    return gram_schmidt(random_gaussian());
}
