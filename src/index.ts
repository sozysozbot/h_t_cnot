import { dagger, Mat, mmul, random_unitary, Vec } from './linalg'

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
            }
        }
    }
}

window.onload = () => {
    render_unitary(U)
}