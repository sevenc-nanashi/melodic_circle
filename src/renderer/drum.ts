import type p5 from "p5";
import type { State } from "../state";
import { getCurrentMeasure, getCurrentTick, midi } from "../midi";
import { easeInQuint, easeOutInQuint, easeOutQuint } from "../easing";
import { fg } from "../const";

let graphics: p5.Graphics;
let prevFrameGraphics: p5.Graphics;

const kick = 36;
const snare = 37;

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
		prevFrameGraphics = p.createGraphics(p.width, p.height);
	}
	graphics.clear();
	graphics.tint(255, 128);
	graphics.image(prevFrameGraphics, 0, 0);
	graphics.noTint();
	prevFrameGraphics.clear();

	const notesInPage = midi.tracks[1].notes.filter(
		(note) =>
			Math.floor(midi.header.ticksToMeasures(note.ticks)) ===
			Math.floor(getCurrentMeasure(state)),
	);
	const areaWidth = p.width * (1 / 4 - 1 / 32);
	const rectSize = areaWidth / 8;
	const areaBaseX = p.width * (3 / 4);
	const baseY = p.height * (2 / 3);
	for (let i = 0; i < 8; i++) {
		graphics.stroke(fg);
		graphics.strokeWeight(2);
		graphics.noFill();
		graphics.rect(areaBaseX + i * rectSize, baseY, rectSize, rectSize);

		const note = notesInPage.find(
			(note) =>
				Math.abs((midi.header.ticksToMeasures(note.ticks) % 1) - i / 8) <
				1 / 16,
		);
		if (!note) {
			continue;
		}
		if (note.ticks >= getCurrentTick(state)) {
			continue;
		}

		const diff =
			getCurrentMeasure(state) - midi.header.ticksToMeasures(note.ticks);
		if (note.midi === kick) {
			const progress = p.map(diff, 0, 1 / 16, 0, 1, true);
			graphics.noStroke();
			graphics.fill([...fg, 255 * easeInQuint(progress)]);
			const size = p.map(
				progress,
				0,
				1,
				rectSize * (4 / 8),
				rectSize * (7 / 8),
			);
			const shift = (rectSize - size) / 2;
			graphics.rect(
				areaBaseX + i * rectSize + shift,
				baseY + shift,
				size,
				size,
			);
		} else if (note.midi === snare) {
			const progress = p.map(diff, 0, 1 / 16, 0, 1, true);
			graphics.noFill();
			graphics.stroke([...fg, 255 * easeOutQuint(progress)]);
			graphics.strokeWeight(2);
			const padding = 3 / 32;
			graphics.rect(
				areaBaseX + i * rectSize + rectSize * padding,
				baseY + rectSize * padding,
				rectSize * (1 - padding * 2),
				rectSize * (1 - padding * 2),
			);
		}

		const lastCrash = midi.tracks[2].notes.find(
			(note) => note.ticks <= getCurrentTick(state),
		);

		if (lastCrash) {
			const diff =
				getCurrentMeasure(state) - midi.header.ticksToMeasures(lastCrash.ticks);
			const progress = p.map(diff, 0, 1, 0, 1, true);
			graphics.noStroke();
			graphics.fill([...fg, 255 * (1 - progress)]);
			graphics.rect(
				areaBaseX - rectSize / 4 - 2,
				baseY - 1,
				rectSize / 4,
				rectSize + 2,
			);
			graphics.rect(
				areaBaseX + areaWidth + 2,
				baseY - 1,
				rectSize / 4,
				rectSize + 2,
			);
		}
	}

	prevFrameGraphics.image(graphics, 0, 0);
	p.image(graphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
