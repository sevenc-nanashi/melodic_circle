import type p5 from "p5";
import rawChords from "../assets/chords.yml";
import type { State } from "../state";
import { getCurrentMeasure } from "../midi";
import { fg } from "../const";

let graphics: p5.Graphics;

export const draw = import.meta.hmrify((p: p5, state: State) => {
	if (!graphics) {
		graphics = p.createGraphics(p.width, p.height);
	}
	graphics.clear();

	graphics.textSize(32);
	graphics.textFont("M+ 2p");
	graphics.fill(fg);
	graphics.textAlign(p.LEFT, p.BOTTOM);
	graphics.text("_melodic_circle - Nanashi.", 48, p.height - 48);

	graphics.textAlign(p.RIGHT, p.BOTTOM);
	graphics.text("BPM: 187", p.width - 48, p.height - 48);

	graphics.textAlign(p.LEFT, p.TOP);
	graphics.text("Key: D major", 48, 48);

	graphics.textAlign(p.RIGHT, p.TOP);
	graphics.text(
		`Measure: ${Math.min(getCurrentMeasure(state), 12).toFixed(2)}`,
		p.width - 48,
		48,
	);

	p.image(graphics, 0, 0);
});

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		graphics.remove();
	});
}
