import type p5 from "p5";
import { BinaryReader } from "@sevenc-nanashi/binaryseeker";
import wave from "../assets/main.wav?uint8array";
import type { State } from "../state";
import fft from "fft.js";
import { fg, frameRate } from "../const";
import { easeOutQuint } from "../easing";

let graphics: p5.Graphics;

// pcm_s32le, 44100Hz, 2 channels, s32, 2822kbps, 00:00:00.000
const wavDataL: number[] = [];
const wavDataR: number[] = [];

const prevSpecLs: number[][] = [];
const prevSpecRs: number[][] = [];

const fftResolution = 64;

const rangeAverage = (arr: number[], start: number, end: number) => {
	let sum = 0;
	for (let i = start; i < end; i++) {
		sum += arr[i];
	}
	return sum / (end - start);
};

const fftInstance = new fft(fftResolution);
export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
	}
	if (!wavDataL.length) {
		const reader = new BinaryReader(wave.buffer);
		reader.seek(44);
		while (reader.hasMoreData) {
			wavDataL.push(reader.readInt32LE() / 2 ** 31);
			wavDataR.push(reader.readInt32LE() / 2 ** 31);
		}
		console.log(wavDataL.length, wavDataR.length);
	}
	graphics.clear();

	const spectrumL = fftInstance.createComplexArray();
	const spectrumR = fftInstance.createComplexArray();
	const dataStart = 44100 * (state.currentFrame / frameRate);
	if (dataStart + fftResolution <= wavDataL.length) {
		fftInstance.realTransform(
			spectrumL,
			wavDataL.slice(dataStart, dataStart + fftResolution),
		);
		fftInstance.realTransform(
			spectrumR,
			wavDataR.slice(dataStart, dataStart + fftResolution),
		);
	}

	prevSpecLs.push(spectrumL.slice());
	prevSpecRs.push(spectrumR.slice());
	if (prevSpecLs.length > 4) {
		prevSpecLs.shift();
		prevSpecRs.shift();
	}

	graphics.stroke(fg);
	graphics.strokeWeight(2);
	graphics.noFill();

	const areaWidth = p.width * (1 / 4 - 1 / 32);
	const areaHeight = p.height / 3;
	const areaBaseX = p.width * (1 / 32);
	const fftMax = 16;

	for (let i = 0; i < fftResolution; i++) {
		const x = p.map(i, 0, fftResolution, 0, areaWidth);
		const avgL =
			prevSpecLs.map((spec) => spec[i * 2]).reduce((a, b) => a + b, 0) /
			prevSpecLs.length;
		const avgR =
			prevSpecRs.map((spec) => spec[i * 2]).reduce((a, b) => a + b, 0) /
			prevSpecRs.length;
		const ryL = easeOutQuint(p.map(avgL, 0, fftMax, 0, 1, true));
		const ryR = easeOutQuint(p.map(avgR, 0, fftMax, 0, 1, true));
		const yL = (ryL * areaHeight) / 2;
		const yR = (ryR * areaHeight) / 2;

		graphics.line(
			x + areaBaseX,
			p.height / 2,
			x + areaBaseX,
			p.height / 2 - yL,
		);
		graphics.line(
			x + areaBaseX,
			p.height / 2,
			x + areaBaseX,
			p.height / 2 + yR,
		);
	}

	p.image(graphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
