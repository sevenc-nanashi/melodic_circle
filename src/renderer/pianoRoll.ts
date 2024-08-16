import type p5 from "p5";
import type { State } from "../state";
import { getCurrentMeasure, getCurrentTick, midi } from "../midi";
import { easeInQuint, easeOutInQuint, easeOutQuint } from "../easing";
import { fill } from "../const";

let graphics: p5.Graphics;

const base = 62;
const center = 67;

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
	}
	graphics.clear();

	const page = Math.floor(getCurrentMeasure(state) / 2);

	const notesInPage = midi.tracks[3].notes.filter(
		(note) => Math.floor(midi.header.ticksToMeasures(note.ticks) / 2) === page,
	);
	const areaWidth = p.width * (1 / 4 - 1 / 32);
	const areaHeight = p.height / 3;
	const noteHeight = areaHeight / 64;
	const noteLineHeight = noteHeight / 4;
	const notePadding = noteHeight / 4;
	const areaBaseX = p.width * (3 / 4);
	const pageProgress = getCurrentMeasure(state) / 2 - page;
	const shift =
		(page === 0 ? easeInQuint(pageProgress) : easeOutInQuint(pageProgress)) *
		-16;
	const alpha = (1 - easeInQuint(Math.max(0, pageProgress * 4 - 3))) * 255;
	for (const note of notesInPage) {
		const x =
			shift +
			areaBaseX +
			p.map(midi.header.ticksToMeasures(note.ticks) % 2, 0, 2, 0, areaWidth);
		const y = -(note.midi - center) * (noteHeight + notePadding) + p.height / 2;
		const width = p.map(
			midi.header.ticksToMeasures(note.ticks + note.durationTicks) -
				midi.header.ticksToMeasures(note.ticks),
			0,
			2,
			0,
			areaWidth,
		);
		const progress = p.map(
			getCurrentTick(state),
			note.ticks,
			note.ticks + note.durationTicks,
			0,
			1,
			true,
		);
		graphics.noStroke();
		graphics.fill([...fill, alpha / 4]);
		graphics.rect(
			x,
			y + (noteHeight - noteLineHeight) / 2,
			width,
			noteLineHeight,
		);
		graphics.fill([...fill, alpha]);
		graphics.rect(x, y, width * easeOutQuint(progress), noteHeight);
	}
	p.image(graphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
