import { gates_to_matrix, random_gate, TwoBitGate } from './gates';
import { dagger, Mat, mmul, random_unitary } from './linalg'

const U = random_unitary();
console.log("mmul(U, dagger(U))", mmul(U, dagger(U))); // Check that it is unitary

const render_gate_svg = (gates: TwoBitGate[]) => {
    const svg = document.getElementById("gates")!;

    let inner = "";

    let x_position = 2.5;
    let x_position_occupied = false;
    for (let i = 0; i < gates.length; i++) {
        const current_gate = gates[i];
        if (current_gate.type === "single") {
            inner += `<rect x="${x_position}" y="${-5 + current_gate.index * 6}" width="5" height="4" stroke-width="0.125" stroke="#000000" fill="#ffffff" />`;
            if (current_gate.gate === "H") {
                inner += `<path d="m${x_position + 3.7} ${-4.1 + current_gate.index * 6}c0-.037-.031-.037-.048-.037c-.119 0-.246.007-.369.007c-.126 0-.256-.007-.379-.007c-.027 0-.065 0-.065.065c0 .034.024.034.089.034c.085 0 .181 0 .181.055c0 .021 0 .031-.007.051l-.215.863h-.938l.204-.826c.031-.116.051-.143.263-.143c.058 0 .089 0 .089-.061c0-.037-.031-.037-.048-.037c-.119 0-.246.007-.369.007c-.126 0-.256-.007-.379-.007c-.027 0-.065 0-.065.065c0 .034.024.034.089.034c.085 0 .181 0 .181.055c0 .021 0 .031-.007.051l-.467 1.879c-.031.119-.051.147-.259.147c-.061 0-.092 0-.092.065c0 .034.034.034.048.034c.119 0 .246-.007.369-.007c.123 0 .256.007.376.007c.027 0 .065 0 .065-.065c0-.034-.027-.034-.079-.034c-.191 0-.191-.027-.191-.058l.007-.051.242-.956h.937l-.228.918c-.031.119-.051.147-.259.147c-.061 0-.092 0-.092.065c0 .034.034.034.048.034c.119 0 .246-.007.369-.007c.123 0 .256.007.376.007c.027 0 .065 0 .065-.065c0-.034-.027-.034-.079-.034c-.191 0-.191-.027-.191-.058c0-.027.003-.044.007-.051l.469-1.881c.031-.116.051-.143.263-.143c.058 0 .089 0 .089-.061z" />`;
            } else if (current_gate.gate === "T") {
                inner += `<path d="m${3.5 + x_position} ${-3.4 + current_gate.index * 6} .103-.618c.007-.034.007-.041.007-.041c0-.038-.024-.038-.082-.038h-1.713c-.072 0-.079 0-.096.055l-.209.629c-.003.01-.01.034-.01.044c0 .034.034.034.044.034c.034 0 .038-.003.065-.072c.171-.508.246-.59.71-.59h.116c.079 0 .079.014.079.038c0 .02-.01.065-.014.072l-.461 1.846c-.03.126-.058.16-.348.16h-.041c-.061 0-.092 0-.092.065c0 .034.031.034.058.034l.485-.007.495.007c.034 0 .072 0 .072-.061c0-.038-.024-.038-.082-.038h-.041c-.058 0-.113-.003-.167-.01c-.065-.007-.099-.01-.099-.065c0-.017 0-.024.007-.058l.463-1.857c.024-.096.044-.113.072-.119c.024-.007.123-.007.184-.007c.297 0 .437.02.437.256c0 .102-.027.276-.038.331l-.007.038c0 .038.034.038.048.038c.041 0 .044-.01.055-.065z"/>`
            }

            const next: TwoBitGate | undefined = gates[i + 1];
            if (next?.type === "cnot") {
                x_position += 12.5;
                x_position_occupied = false;
            } else if (next?.type === "single") {
                if (next.index === current_gate.index || x_position_occupied) {
                    x_position += 7;
                    x_position_occupied = false;
                } else {
                    // render on the same x position, since the two gates act on different qubits
                    x_position_occupied = true;
                }
            } else if (next === undefined) {
                x_position += 8.5;
                x_position_occupied = false;
            }
        } else if (current_gate.type === "cnot") {
            if (current_gate.control_bit === 1) {
                inner += `<circle cy="3" cx="${x_position}" r="0.6" />
                <path d="m${x_position} 3 v 7.2" stroke-width="0.125" stroke="#000000" />
                <circle cy="9" cx="${x_position}" r="1.2" stroke-width="0.125" stroke="#000000" fill="none" />`;
            } else if (current_gate.control_bit === 2) {
                inner += `<circle cy="9" cx="${x_position}" r="0.6" />
                <path d="m${x_position} 9 v -7.2" stroke-width="0.125" stroke="#000000" />
                <circle cy="3" cx="${x_position}" r="1.2" stroke-width="0.125" stroke="#000000" fill="none" />`
            }

            if (gates[i + 1]?.type === "cnot") {
                x_position += 9;
            } else if (gates[i + 1]?.type === "single") {
                x_position += 7.5;
            } else if (gates[i + 1] === undefined) {
                x_position += 3.5;
            }
            x_position_occupied = false;
        }
    }
    svg.innerHTML = `
    <path d="m-1 3 h ${x_position - (-1)}" stroke-width="0.125" stroke="#000000" />
    <path d="m-1 9 h ${x_position - (-1)}" stroke-width="0.125" stroke="#000000" />` + inner;
}

const render_unitary = (svg_id: string, a: Mat) => {
    console.log(svg_id, a);
    const svg = document.getElementById(svg_id)!;
    const SPACING = 100;
    const X_OFFSET = 50;
    const Y_OFFSET = 50;
    const CIRCLE_MAX_RADIUS = 40;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const CENTER = {
                Y: Y_OFFSET + i * SPACING, // ith row 
                X: X_OFFSET + j * SPACING, // jth column 
            };

            const abs = a[i][j].abs();

            if (abs < 0.05) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttributeNS(null, "cy", `${CENTER.Y}`);
                circle.setAttributeNS(null, "cx", `${CENTER.X}`);
                circle.setAttributeNS(null, "r", `${CIRCLE_MAX_RADIUS * abs}`);
                circle.setAttributeNS(null, "fill", "#000000");
                circle.setAttributeNS(null, "stroke", "#000000");
                circle.setAttributeNS(null, "stroke-width", "2");
                svg.appendChild(circle);

            } else {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttributeNS(null, "cy", `${CENTER.Y}`);
                circle.setAttributeNS(null, "cx", `${CENTER.X}`);
                circle.setAttributeNS(null, "r", `${CIRCLE_MAX_RADIUS * abs}`);
                circle.setAttributeNS(null, "fill", "#009f80");
                circle.setAttributeNS(null, "stroke", "#005242");
                circle.setAttributeNS(null, "stroke-width", "2");
                svg.appendChild(circle);

                const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
                line.setAttributeNS(null, "d", `m 
                ${CENTER.X} 
                ${CENTER.Y} 
                ${CIRCLE_MAX_RADIUS * a[i][j].re} 
                ${CIRCLE_MAX_RADIUS * -a[i][j].im /* `i` must point in the negative Y direction */}
                `);
                line.setAttributeNS(null, "stroke", "#000000");
                line.setAttributeNS(null, "stroke-width", `${5 * Math.sqrt(abs)}`);
                svg.appendChild(line);

                // I will implement the dragging later
                /*
                const edit_arg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                edit_arg.setAttributeNS(null, "cy", `${CENTER.Y + CIRCLE_MAX_RADIUS * -a[i][j].im * 0.5}`);
                edit_arg.setAttributeNS(null, "cx", `${CENTER.X + CIRCLE_MAX_RADIUS * a[i][j].re * 0.5}`);
                edit_arg.setAttributeNS(null, "r", `${CIRCLE_MAX_RADIUS * abs * 0.15}`);
                edit_arg.setAttributeNS(null, "fill", "#808080");
                edit_arg.setAttributeNS(null, "stroke", "#005242");
                edit_arg.setAttributeNS(null, "stroke-width", "1");
                edit_arg.style.cursor = "move";
                svg.appendChild(edit_arg);

                const edit_abs = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                edit_abs.setAttributeNS(null, "cy", `${CENTER.Y}`);
                edit_abs.setAttributeNS(null, "cx", `${CENTER.X + CIRCLE_MAX_RADIUS * abs}`);
                edit_abs.setAttributeNS(null, "r", `${CIRCLE_MAX_RADIUS * abs * 0.2}`);
                edit_abs.setAttributeNS(null, "fill", "#ffffff");
                edit_abs.setAttributeNS(null, "stroke", "#005242");
                edit_abs.setAttributeNS(null, "stroke-width", "2");
                edit_abs.style.cursor = "ew-resize";
                svg.appendChild(edit_abs);
                */
            }
        }
    }
}

window.onload = () => {
    render_unitary("matrix", U);
    const random_gates = Array.from({ length: 4 }, random_gate);
    console.log(random_gates);
    render_gate_svg(random_gates);
    render_unitary("approx", gates_to_matrix(random_gates));
}