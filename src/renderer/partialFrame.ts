import type p5 from "p5";
import type { State } from "../state";
import { fg } from "../const";

let graphics: p5.Graphics;
const padding = 32;
const length = 128;

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
	}
	graphics.clear();

	graphics.stroke(fg);
	graphics.strokeWeight(2);
	graphics.noFill();

	graphics.line(padding, padding, padding, padding + length);
	graphics.line(padding, padding, padding + length, padding);
	graphics.line(
		p.width - padding,
		padding,
		p.width - padding,
		padding + length,
	);
	graphics.line(
		p.width - padding,
		padding,
		p.width - padding - length,
		padding,
	);
	graphics.line(
		padding,
		p.height - padding,
		padding,
		p.height - padding - length,
	);
	graphics.line(
		padding,
		p.height - padding,
		padding + length,
		p.height - padding,
	);
	graphics.line(
		p.width - padding,
		p.height - padding,
		p.width - padding,
		p.height - padding - length,
	);
	graphics.line(
		p.width - padding,
		p.height - padding,
		p.width - padding - length,
		p.height - padding,
	);

	p.image(graphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
