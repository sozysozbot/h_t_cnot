type SingleBitGate = "H" | "T";

type BitIndex = 1 | 2;

type TwoBitGate = { type: "single", index: BitIndex, gate: SingleBitGate }
    | { type: "cnot", control_bit: BitIndex }

import Complex from 'complex.js';
import { Mat } from './linalg'

type TwoByTwo<T> = [[T, T], [T, T]]

function tensor_product(a: TwoByTwo<Complex>, b: TwoByTwo<Complex>,): Mat {
    return [
        [a[0][0].mul(b[0][0]), a[0][1].mul(b[0][0]), a[0][0].mul(b[0][1]), a[0][1].mul(b[0][1])],
        [a[1][0].mul(b[0][0]), a[1][1].mul(b[0][0]), a[1][0].mul(b[0][1]), a[1][1].mul(b[0][1])],
        [a[0][0].mul(b[1][0]), a[0][1].mul(b[1][0]), a[0][0].mul(b[1][1]), a[0][1].mul(b[1][1])],
        [a[1][0].mul(b[1][0]), a[1][1].mul(b[1][0]), a[1][0].mul(b[1][1]), a[1][1].mul(b[1][1])],
    ]
}

export function to_matrix(g: TwoBitGate) {
    const H: TwoByTwo<Complex> = [
        [new Complex(Math.SQRT1_2), new Complex(Math.SQRT1_2)],
        [new Complex(Math.SQRT1_2), new Complex(-Math.SQRT1_2)]
    ];
    const I: TwoByTwo<Complex> = [[Complex.ONE, Complex.ZERO], [Complex.ZERO, Complex.ONE]];
    const T: TwoByTwo<Complex> = [[Complex.ONE, Complex.ZERO], [Complex.ZERO, new Complex(Math.SQRT1_2, Math.SQRT1_2)]];

    if (g.type === "cnot") {
        if (g.control_bit === 1) {
            return [
                [Complex.ONE, Complex.ZERO, Complex.ZERO, Complex.ZERO],
                [Complex.ZERO, Complex.ONE, Complex.ZERO, Complex.ZERO],
                [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ONE],
                [Complex.ZERO, Complex.ZERO, Complex.ONE, Complex.ZERO],
            ];
        } else if (g.control_bit === 2) {
            return [
                [Complex.ONE, Complex.ZERO, Complex.ZERO, Complex.ZERO],
                [Complex.ZERO, Complex.ZERO, Complex.ZERO, Complex.ONE],
                [Complex.ZERO, Complex.ZERO, Complex.ONE, Complex.ONE],
                [Complex.ZERO, Complex.ONE, Complex.ZERO, Complex.ZERO],
            ];
        } else {
            const _unreachable: never = g.control_bit;
            throw new Error("unreachable")
        }
    } else if (g.type === "single") {
        if (g.index === 1) {
            if (g.gate === "H") {
                return tensor_product(H, I);
            } else if (g.gate === "T") {
                return tensor_product(T, I);
            }
        } else if (g.index === 2) {
            if (g.gate === "H") {
                return tensor_product(I, H);
            } else if (g.gate === "T") {
                return tensor_product(I, T);
            }
        }
    }
}