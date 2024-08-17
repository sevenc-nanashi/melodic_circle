import type p5 from "p5";
import { getCurrentMeasure } from "../midi";
import { fg } from "../const";
import { easeInQuint, easeOutQuint } from "../easing";

let graphics: p5.Graphics;

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
	}
	graphics.clear();

	if (getCurrentMeasure(state) >= 2) {
		return;
	}

	const progress = p.map(getCurrentMeasure(state), 1 + 4 / 8, 2, 0, 1, true);

	const shift = 16 * easeInQuint(progress);

	graphics.textSize(24);
	graphics.textFont("M+ 2p");
	graphics.fill(fg);
	const radius = (p.height / 2) * 0.8;
	graphics.textAlign(p.RIGHT, p.TOP);
	graphics.text(
		"Yamaha Grand Piano (Keyzone Classic),\nSynth Bass 1 (Vital):",
		p.width / 2 - radius - shift,
		p.height / 2 - radius,
	);

	graphics.textAlign(p.LEFT, p.TOP);
	graphics.text("Piano1 (NeoPiano):", p.width * (3 / 4) - shift, p.height / 3);

	graphics.textAlign(p.LEFT, p.BOTTOM);
	graphics.text(
		"Grime Kick 6,\nUltimate Snare 1 (Cymatics),\nSI-Drum Kit:",
		p.width * (3 / 4) - shift,
		p.height * (2 / 3) - 16,
	);
	p.tint(255, 255 * (1 - progress));
	p.image(graphics, 0, 0);
	p.noTint();
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
