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

export const clone: (u: Mat) => Mat = (u: Mat) => {
    const ans = zero();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            ans[i][j] = u[i][j];
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

/**
 * Edit m[i][j] so that its phase changes by e^iφ. To keep the matrix unitary, all the elements in the same row and in the same column gets multiplied by e^(iφ/2).
 * @param m a unitary matrix
 * @param I ith row (0-indexed)
 * @param J jth column (0-indexed)
 * @param phi phase
 * @returns another unitary matrix
 */
export const edit_arg_at: (m: Mat, I: number, J: number, phi: number) => Mat = (m: Mat, I: number, J: number, phi: number) => {
    const ans = zero();
    const half_phase = (new Complex(0, phi / 2)).exp();
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            ans[i][j] = m[i][j];

            if (i === I) {
                ans[i][j] = ans[i][j].mul(half_phase);
            }
            if (j === J) {
                ans[i][j] = ans[i][j].mul(half_phase)
            }
        }
    }
    return ans;
}

const edit_abs_at_0_0: (m: Mat, delta: number) => Mat = (m: Mat, delta: number) => {
    // Too big; cannot grow
    if (m[0][0].abs() > 0.95 && delta > 0) { return m; }
    // Too small; cannot shrink
    if (m[0][0].abs() < 0.05 && delta < 0) { return m; }

    const tweaked = clone(m);

    // Make M[0][0] grow by a factor of e^δ, and then we need to shrink the remaining three components 
    tweaked[0][0] = m[0][0].mul(new Complex(delta, 0).exp());
    const remaining_norm_old = 1 - (m[0][0].abs() * m[0][0].abs());
    const remaining_norm_new = 1 - (tweaked[0][0].abs() * tweaked[0][0].abs());
    if (remaining_norm_new < 0.05 * 0.05 * (4 - 1)) { return m; }
    const scaling = Math.sqrt(remaining_norm_new / remaining_norm_old);
    tweaked[0][1] = m[0][1].mul(scaling);
    tweaked[0][2] = m[0][2].mul(scaling);
    tweaked[0][3] = m[0][3].mul(scaling);

    // The matrix is no longer unitary, so we need Gram-Schmidt to kick in
    // Note that Gram-Schmidt implemented here preserves the unit vector m[0]
    return gram_schmidt(tweaked)
}

/**
 * Try to edit m[i][j] so that its absolute value changes by e^δ. To keep the matrix unitary, a bunch of dirty hacks are employed.
 * @param m a unitary matrix
 * @param I ith row (0-indexed)
 * @param J jth column (0-indexed)
 * @param delta δ such that absolute value of m[i][j] changes by e^δ
 * @returns another unitary matrix
 */
 export const edit_abs_at: (m: Mat, I: number, J: number, delta: number) => Mat = (m: Mat, I: number, J: number, delta: number) => {
    let ans = clone(m);
    // Swap row I and row 0
    if (I !== 0) {
        [ans[0], ans[I]] = [ans[I], ans[0]];
    }

    ans = dagger(ans);

    // Swap "row" J and "row" 0
    if (J !== 0) {
        [ans[0], ans[J]] = [ans[J], ans[0]];
    }

    ans = dagger(ans);

    // Now the element that we want to edit is at (0,0).
    // We do it twice to pretend that we are treating rows and columns symmetrically,
    ans = edit_abs_at_0_0(ans, delta / 2);
    ans = dagger(ans);
    ans = edit_abs_at_0_0(ans, delta / 2);

    // We need a `dagger`, but let's swap "row" J and "row" 0 before applying the `dagger`.
    if (J !== 0) {
        [ans[0], ans[J]] = [ans[J], ans[0]];
    }
    
    ans = dagger(ans);

    // Swap row I and row 0
    if (I !== 0) {
        [ans[0], ans[I]] = [ans[I], ans[0]];
    }

    return ans;
}
