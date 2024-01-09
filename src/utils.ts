import { BASE_FONT_SIZE } from './constants';
import type { TagElementType } from './types';

// Some times charts will render numbers with units (like "em") which aren't
// supported in react-pdf. This function can be used to convert into a best-
// guess in supported units.
export const convertUnits = (value: string) => {
	if (value.endsWith('em')) {
		const [val] = value.split('em');
		return Math.round(Number.parseFloat(val) * BASE_FONT_SIZE);
	}

	return Number.parseFloat(value);
};

// Because <tspan> elements are broken in react-pdf, if those <tspan>'s have
// positioning offsets, text will be rendered in the wrong position. To try to
// fix this, we'll check if the children of this text element are Tspans, and if
// they have any dx or dy attributes. If they do, we'll add those to the parent
// <Text> element instead. It's not ideal, but the best that we can do until
// react-pdf fully supports <tspan> elements.
export const getTspanChildrenOffsets = (node: TagElementType) => {
	const { allDx, allDy } = node.children.reduce<{
		allDx: Array<number>;
		allDy: Array<number>;
	}>(
		(acc, child) => {
			if (child.type === 'tag' && child.name === 'tspan') {
				if (child.attribs.dx) acc.allDx.push(convertUnits(child.attribs.dx));
				if (child.attribs.dy) acc.allDy.push(convertUnits(child.attribs.dy));
			}
			return acc;
		},
		{ allDx: [], allDy: [] },
	);

	// If children have different values -- there's not much we can do. We'll
	// take the first one and display a warning to the user to let them know
	// things might not be positioned correctly.
	if (allDx.length > 1 || allDy.length > 1) {
		console.warn(
			`<ReactPDFChart /> detected that your chart has <Tspan> nodes nested inside a <Text> node which have different 'dx' or 'dy' attributes. Unfortunately this isn't supported by react-pdf. Text positioning may not be accurate.`,
		);
	}

	return { dx: allDx[0] || 0, dy: allDy[0] || 0 };
};
