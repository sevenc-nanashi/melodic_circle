import vs from "./shader.vert?raw";
import fs from "./shader.frag?raw";
import type p5 from "p5";
import type { State } from "../state";
import { fg, fill, frameRate, songLength } from "../const";
import { getCurrentMeasure, getCurrentTick, midi } from "../midi";

let shader: p5.Shader;
let curveGraphics: p5.Graphics;
let croppedCurveGraphics: p5.Graphics;
let graphics: p5.Graphics;
let prevFrameGraphics: p5.Graphics;
let circleGraphics: p5.Graphics;

const texts = ["D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#"];
const notes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
const onScale = [0, 2, 4, 5, 7, 9, 11];

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!shader) {
		console.log("create shader");
		shader = p.createShader(vs, fs);
	}
	if (!curveGraphics) {
		curveGraphics = p.createGraphics(p.width * 2, p.height);
		curveGraphics.translate(p.width / 2, 0);
		graphics = p.createGraphics(p.width, p.height, p.WEBGL);
		croppedCurveGraphics = p.createGraphics(p.width, p.height);
		circleGraphics = p.createGraphics(p.width, p.height);
		prevFrameGraphics = p.createGraphics(p.width, p.height);

		graphics.shader(shader);
	}
	curveGraphics.clear();
	croppedCurveGraphics.clear();
	graphics.clear();

	circleGraphics.clear();
	circleGraphics.tint(255, 192);
	circleGraphics.image(prevFrameGraphics, 0, 0);
	circleGraphics.noTint();
	prevFrameGraphics.clear();

	const upperThreshold = 61;
	const currentUpperNotes = midi.tracks[0].notes.filter(
		(note) =>
			note.midi >= upperThreshold &&
			note.ticks <=
				midi.header.secondsToTicks(state.currentFrame / frameRate) &&
			note.ticks + note.durationTicks >=
				midi.header.secondsToTicks(state.currentFrame / frameRate),
	);
	const lastBaseNote = midi.tracks[0].notes.findLast(
		(note) =>
			note.midi < upperThreshold &&
			note.ticks <=
				midi.header.secondsToTicks(state.currentFrame / frameRate) &&
			note.ticks + note.durationTicks >=
				midi.header.secondsToTicks(state.currentFrame / frameRate),
	);

	for (let i = 0; i < 12; i++) {
		curveGraphics.noStroke();
		const upperNote = currentUpperNotes.findLast(
			(note) => note.midi % 12 === notes[i],
		);
		curveGraphics.fill([...fill, upperNote ? 255 : 0]);
		const x = (i - 0.5) * (p.width / 12);
		const x2 = (i + 0.5) * (p.width / 12);
		curveGraphics.rect(x, 0.25 * p.height, x2 - x, 0.2 * p.height);

		if (i === 0) {
			curveGraphics.fill([...fill, 8]);
			curveGraphics.rect(x, 0.25 * p.height, x2 - x, 0.35 * p.height);
		}
		if (lastBaseNote && lastBaseNote.midi % 12 === notes[i]) {
			const secondLastBaseNote = midi.tracks[0].notes.findLast(
				(note) =>
					note.midi < upperThreshold &&
					note.ticks <=
						midi.header.secondsToTicks(state.currentFrame / frameRate) &&
					note !== lastBaseNote,
			);
			if (secondLastBaseNote?.midi !== lastBaseNote.midi) {
				const shiftFactor = p.map(
					getCurrentTick(state),
					lastBaseNote.ticks,
					lastBaseNote.ticks + lastBaseNote.durationTicks,
					0.1,
					0,
				);
				const shiftDirection = !secondLastBaseNote
					? 0
					: lastBaseNote.midi > secondLastBaseNote.midi
						? -1
						: 1;
				curveGraphics.fill([...fill, 255]);
				const sx = (i - 0.5 + shiftDirection * shiftFactor) * (p.width / 12);
				const sx2 = (i + 0.5 + shiftDirection * shiftFactor) * (p.width / 12);
				curveGraphics.rect(sx, 0.45 * p.height, sx2 - sx, 0.05 * p.height);
			} else {
				curveGraphics.fill([...fill, 255]);
				curveGraphics.rect(x, 0.45 * p.height, x2 - x, 0.05 * p.height);
			}
		}
		if (!onScale.includes(i)) {
			curveGraphics.fill([...fill, 255]);
			curveGraphics.rect(x, 0.5 * p.height, x2 - x, 0.1 * p.height);
		}
	}
	for (let i = 0; i < 12; i++) {
		curveGraphics.noFill();
		curveGraphics.stroke(fg);
		curveGraphics.strokeWeight(2);
		const x = ((i - 0.5) * (p.width / 12) + p.width) % p.width;
		const x2 = ((i - 0.25) * (p.width / 12) + p.width) % p.width;
		const x3 = (i * (p.width / 12)) % p.width;
		const x4 = ((i + 0.25) * (p.width / 12)) % p.width;
		const x5 = ((i + 0.5) * (p.width / 12)) % p.width;
		const x6 = (i + 1) * (p.width / 12);
		curveGraphics.line(x, 0.25 * p.height, x, 0.6 * p.height);
		curveGraphics.strokeWeight(4);
		curveGraphics.line(x, 0.25 * p.height, x2, 0.25 * p.height);
		curveGraphics.line(x4, 0.25 * p.height, x5, 0.25 * p.height);
		curveGraphics.strokeWeight(4);
		curveGraphics.line(x3, 0.45 * p.height, x6, 0.45 * p.height);
		curveGraphics.line(x3, 0.5 * p.height, x6, 0.5 * p.height);
		curveGraphics.line(x3, 0.6 * p.height, x6, 0.6 * p.height);
	}

	const startPadding = midi.header.ticksToSeconds(6.5 * midi.header.ppq);
	const songProgress =
		Math.max(0, state.currentFrame / frameRate - startPadding) /
		(songLength - startPadding);
	curveGraphics.fill([...fill, 16]);
	curveGraphics.noStroke();
	curveGraphics.rect(0, 0.6 * p.height, p.width * songProgress, 0.4 * p.height);

	shader.setUniform("u_resolution", [p.width, p.height]);
	shader.setUniform("u_texResolution", [
		curveGraphics.width,
		curveGraphics.height,
	]);
	croppedCurveGraphics.image(curveGraphics, -p.width / 2, 0);
	croppedCurveGraphics.image(curveGraphics, p.width / 2, 0);
	shader.setUniform("u_texture", croppedCurveGraphics);
	graphics.quad(-1, -1, 1, -1, 1, 1, -1, 1);

	circleGraphics.image(graphics, 0, 0);
	for (let i = 0; i < 12; i++) {
		circleGraphics.push();
		circleGraphics.fill(fg);
		circleGraphics.textSize(64);
		circleGraphics.textAlign(p.CENTER, p.CENTER);
		circleGraphics.textFont("M+ 2m Light");
		const rad = ((Math.PI * 2) / 12) * i;
		const posRad = ((Math.PI * 2) / 12) * (i + 3);
		const distance = 400;
		const targetX = p.width / 2 + Math.cos(posRad) * -distance;
		const targetY = p.height / 2 + Math.sin(posRad) * -distance;

		const x = Math.cos(-rad) * targetX - Math.sin(-rad) * targetY;
		const y = Math.sin(-rad) * targetX + Math.cos(-rad) * targetY;

		circleGraphics.rotate((p.TWO_PI / 12) * i);
		circleGraphics.text(texts[i], x, y);
		circleGraphics.pop();
	}

	prevFrameGraphics.image(circleGraphics, 0, 0);

	p.image(circleGraphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		curveGraphics.remove();
		graphics.remove();
		croppedCurveGraphics.remove();
		circleGraphics.remove();
		prevFrameGraphics.remove();
	});
}
