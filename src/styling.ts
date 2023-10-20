import { StyleSheet } from '@react-pdf/renderer';
import type { SVGPresentationAttributes, Style } from '@react-pdf/types';
import { BASE_FONT_SIZE } from './constants';
import type { PropsType, TagElementType } from './types';
import { convertUnits } from './utils';

const styles = StyleSheet.create({
	'recharts-default-legend': {
		justifyContent: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	'recharts-legend-item': {
		flexDirection: 'row',
		gap: 4,
	},
	'recharts-legend-item-text': {
		fontSize: BASE_FONT_SIZE - 1,
	},
	'recharts-text': {
		fontSize: BASE_FONT_SIZE,
	},
});

// For element that allow it (ie. <Text />) this will create custom styling
// so we can allow users to customize fonts and other styles.
export const getElementStyle = (
	attribs: TagElementType['attribs'],
	chartStyle: PropsType['chartStyle'],
	additionalStyle?: Style,
) => {
	const style: Array<Style> = [];
	if (attribs.class) {
		for (const className of attribs.class.split(' ')) {
			// @ts-expect-error Not sure how to fix this
			if (className in styles) style.push(styles[className]);
			if (chartStyle && className in chartStyle)
				// @ts-expect-error Not sure how to fix this
				style.push(chartStyle[className]);
		}
	}

	// Convert inline attributes to styles
	// See: https://github.com/EvHaus/react-pdf-charts/issues/46
	if ('color' in attribs) style.push({ color: attribs.color });
	if ('font-family' in attribs)
		style.push({ fontFamily: attribs['font-family'] });
	if ('font-size' in attribs) style.push({ fontSize: attribs['font-size'] });

	// Apply inline styles that react-pdf supports
	if (attribs.style) {
		for (const styleString of attribs.style.split(';')) {
			const [rawKey, value] = styleString.split(':');
			const key = rawKey.toLowerCase();

			if (['backgroundColor', 'color', 'fill'].includes(key)) {
				style.push({ [key]: value });
			} else if (key === 'font-size') {
				style.push({ fontSize: convertUnits(value) });
			} else {
				// This warning is super noisy, but can be helpful when debugging
				// console.warn(
				// 	`<ReactPDFChart /> detected that your chart has a node with an unsupported inline style. "${attribs.style}" mentions "${key}" which isn't supported in react-pdf yet.`,
				// );
			}
		}
	}

	if (additionalStyle) style.push(additionalStyle);

	return style;
};

// For SVG elements this will process inline styles into something react-pdf
// can understand
export const getSvgElementStyle = (attribs: TagElementType['attribs']) => {
	const style: SVGPresentationAttributes = {};

	// Apply inline styles that react-pdf supports
	if (attribs.style) {
		for (const styleString of attribs.style.split(';')) {
			const [rawKey, value] = styleString.split(':');
			const key = rawKey.toLowerCase();

			switch (key) {
				case 'color':
				case 'fill':
				case 'opacity':
				case 'stroke':
					style[key] = value;
					break;
				case 'stroke-width':
					style.strokeWidth = value;
					break;
				case 'stroke-linecap':
					style.strokeLineCap =
						value as SVGPresentationAttributes['strokeLineCap'];
					break;
				default:
				// This warning is super noisy, but can be helpful when debugging
				// console.warn(
				// 	`<ReactPDFChart /> detected that your chart has a node with an unsupported inline style. "${attribs.style}" mentions "${key}" which isn't supported in react-pdf yet.`,
				// );
			}
		}
	}

	return style;
};
