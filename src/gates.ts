type SingleBitGate = "H" | "T";

type BitIndex = 1 | 2;

export type TwoBitGate = { type: "single", index: BitIndex, gate: SingleBitGate }
    | { type: "cnot", control_bit: BitIndex }

import Complex from 'complex.js';
import { identity, Mat, mmul } from './linalg'

export function gates_to_matrix(gs: TwoBitGate[]): Mat {
    return gs.map(to_matrix).reduce((a, b) => mmul(a, b), identity());
}

const candidates: TwoBitGate[] = [
    { type: "single", index: 1, gate: "H" },
    { type: "single", index: 2, gate: "H" },
    { type: "single", index: 1, gate: "T" },
    { type: "single", index: 2, gate: "T" },
    { type: "cnot", control_bit: 1 },
    { type: "cnot", control_bit: 2 },
];

function choose_from<T>(a: T[]): T {
    return a[Math.random() * a.length | 0]
}

export function non_wasteful_random_gates(o: { length: number }): TwoBitGate[] {
    const ans: TwoBitGate[] = [];
    let first_qubit_ended_with_h = false;
    let second_qubit_ended_with_h = false;
    let ended_in_cnot_1 = false;
    let ended_in_cnot_2 = false;
    while (ans.length < o.length) {
        const cand: TwoBitGate[] = [
            { type: "single", index: 1, gate: "T" },
            { type: "single", index: 2, gate: "T" },
        ];
        if (!first_qubit_ended_with_h) {
            cand.push({ type: "single", index: 1, gate: "H" });
        }
        if (!second_qubit_ended_with_h) {
            cand.push({ type: "single", index: 2, gate: "H" })
        }
        if (!ended_in_cnot_1) {
            cand.push({ type: "cnot", control_bit: 1 });
        }
        if (!ended_in_cnot_2) {
            cand.push({ type: "cnot", control_bit: 2 });
        }

        const gate = choose_from(cand);
        ans.push(gate);
        if (gate.type === "cnot") {
            first_qubit_ended_with_h = false;
            second_qubit_ended_with_h = false;
            ended_in_cnot_1 = (gate.control_bit === 1);
            ended_in_cnot_2 = (gate.control_bit === 2);
        } else if (gate.type === "single") {
            ended_in_cnot_1 = false;
            ended_in_cnot_2 = false;

            if (gate.index === 1) {
                first_qubit_ended_with_h = gate.gate === "H";
            }

            if (gate.index === 2) {
                second_qubit_ended_with_h = gate.gate === "H";
            }
        }

    }

    return ans;
}


type TwoByTwo<T> = [[T, T], [T, T]]

function tensor_product(a: TwoByTwo<Complex>, b: TwoByTwo<Complex>,): Mat {
    return [
        [a[0][0].mul(b[0][0]), a[0][1].mul(b[0][0]), a[0][0].mul(b[0][1]), a[0][1].mul(b[0][1])],
        [a[1][0].mul(b[0][0]), a[1][1].mul(b[0][0]), a[1][0].mul(b[0][1]), a[1][1].mul(b[0][1])],
        [a[0][0].mul(b[1][0]), a[0][1].mul(b[1][0]), a[0][0].mul(b[1][1]), a[0][1].mul(b[1][1])],
        [a[1][0].mul(b[1][0]), a[1][1].mul(b[1][0]), a[1][0].mul(b[1][1]), a[1][1].mul(b[1][1])],
    ]
}

function to_matrix(g: TwoBitGate): Mat {
    const H: TwoByTwo<Complex> = [
        [new Complex(Math.SQRT1_2, 0), new Complex(Math.SQRT1_2, 0)],
        [new Complex(Math.SQRT1_2, 0), new Complex(-Math.SQRT1_2, 0)]
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
                [Complex.ZERO, Complex.ZERO, Complex.ONE, Complex.ZERO],
                [Complex.ZERO, Complex.ONE, Complex.ZERO, Complex.ZERO],
            ];
        } else {
            const _unreachable: never = g.control_bit;
            throw new Error("unreachable")
        }
    } else if (g.type === "single") {
        if (g.index === 1) {
            return tensor_product({ H, T }[g.gate], I);
        } else if (g.index === 2) {
            return tensor_product(I, { H, T }[g.gate]);
        } else {
            const _unreachable: never = g.index;
            throw new Error("unreachable")
        }
    } else {
        const _unreachable: never = g;
        throw new Error("unreachable")
    }
}