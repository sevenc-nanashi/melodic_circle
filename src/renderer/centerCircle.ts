import type p5 from "p5";
import rawChords from "../assets/chords.yml";
import type { State } from "../state";
import { getCurrentMeasure, getCurrentTick, midi } from "../midi";
import { fg } from "../const";

let graphics: p5.Graphics;

const rome = /([IV]+)/;

const chords = Object.entries(rawChords as Record<string, string>).map(
	([position, chord]) => {
		const [measure, numerator, denominator] = position.split(".").map(Number);
		return { measure: measure + (numerator - 1) / denominator, chord };
	},
);

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
	}
	graphics.clear();

	const chord = chords.findLast(
		(chord) =>
			chord.measure <= getCurrentMeasure(state) + 1 &&
			Math.floor(chord.measure) === Math.floor(getCurrentMeasure(state) + 1),
	);

	if (!chord) {
		graphics.textSize(64);
		graphics.textFont("M+ 2p Thin");
		graphics.textAlign(p.CENTER, p.CENTER);
		graphics.fill(fg);
		graphics.noStroke();
		graphics.text("-", p.width / 2, p.height / 2);
	} else {
		graphics.textSize(64);
		graphics.textFont("M+ 2p");
		graphics.textAlign(p.CENTER, p.CENTER);
		graphics.noStroke();
		graphics.fill(fg);
		const measureDiff = getCurrentMeasure(state) + 1 - chord.measure;
		const shift =
			measureDiff <= 1 / 16 ? p.map(measureDiff, 0, 1 / 16, 4, 0) : 0;
		const [chordText, maybeRoot] = chord.chord.split("/");
		graphics.text(chordText, p.width / 2, p.height / 2 + shift);
		const width = graphics.textWidth(chordText);
		graphics.textSize(32);
		graphics.textAlign(p.LEFT, p.BOTTOM);
		graphics.fill([...fg, maybeRoot ? 255 : 128]);
		const root = maybeRoot || chord.chord.match(rome)![0];
		graphics.text(
			`/${root}`,
			p.width / 2 + width / 2,
			p.height / 2 + 32 + shift,
		);
	}

	p.image(graphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
