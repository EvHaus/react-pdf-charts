import {
	Circle,
	ClipPath,
	Defs,
	Ellipse,
	G,
	Line,
	LinearGradient,
	Path,
	Polygon,
	Polyline,
	RadialGradient,
	Rect,
	Stop,
	StyleSheet,
	Svg,
	Text,
	Tspan,
	View,
} from '@react-pdf/renderer';
import type { SVGPresentationAttributes, Style } from '@react-pdf/types';
import parse, {
	Element,
	Text as TextNode,
	domToReact,
} from 'html-react-parser';
import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

type TagElementType = Element & { children?: Array<Element & Element> };

type PropsType = {
	children: React.ReactElement;
	debug?: boolean;
	chartStyle?: Style;
	style?: Style;
};

// The base font size that will be used for text
const BASE_FONT_SIZE = 11;

// These should match the supported attributes in react-pdf
// See: https://react-pdf.org/svg#presentation-attributes
const PRESENTATION_ATTRIBUTES = [
	'color',
	'dominantBaseline',
	'fill',
	'fillOpacity',
	'fillRule',
	'opacity',
	'stroke',
	'strokeWidth',
	'strokeOpacity',
	'strokeLinecap',
	'strokeDasharray',
	'transform',
	'textAnchor',
	'visibility',
];

const styles = StyleSheet.create({
	'recharts-default-legend': {
		justifyContent: 'center',
		flexDirection: 'row',
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

// Some times charts will render numbers with units (like "em") which aren't
// supported in react-pdf. This function can be used to convert into a best-
// guess in supported units.
const convertUnits = (value: string) => {
	if (value.endsWith('em')) {
		const [val] = value.split('em');
		return Math.round(parseFloat(val) * BASE_FONT_SIZE);
	}

	return parseFloat(value);
};

// For element that allow it (ie. <Text />) this will create custom styling
// so we can allow users to customize fonts and other styles.
const getElementStyle = (
	attribs: TagElementType['attribs'],
	chartStyle: PropsType['chartStyle'],
) => {
	const style: Array<Style> = [];
	if (attribs.class) {
		attribs.class.split(' ').forEach((className) => {
			// @ts-expect-error Not sure how to fix this
			if (className in styles) style.push(styles[className]);
			if (chartStyle && className in chartStyle)
				// @ts-expect-error Not sure how to fix this
				style.push(chartStyle[className]);
		});
	}

	// Apply inline styles that react-pdf supports
	if (attribs.style) {
		attribs.style.split(';').forEach((styleString) => {
			const [key, value] = styleString.split(':');
			if (['backgroundColor', 'color'].includes(key)) {
				style.push({ [key]: value });
			}
		});
	}
	return style;
};

// Because <tspan> elements are broken in react-pdf, if those <tspan>'s have
// positioning offsets, text will be rendered in the wrong position. To try to
// fix this, we'll check if the children of this text element are Tspans, and if
// they have any dx or dy attributes. If they do, we'll add those to the parent
// <Text> element instead. It's not ideal, but the best that we can do until
// react-pdf fully supports <tspan> elements.
const getTspanChildrenOffsets = (node: TagElementType) => {
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

// Converts a web-based SVG element to a react-pdf SVG element
const webSvgToPdfSvg = (children: React.ReactElement, chartStyle?: Style) => {
	const svgString = renderToStaticMarkup(children);

	const htmlReactParserOptions: HTMLReactParserOptions = {
		replace: replaceHtmlWithPdfSvg,
	};

	// This function is where the main magic happens. This converts the <svg />
	// elements created by charting libraries into <Svg /> components that
	// react-pdf can understand.
	function replaceHtmlWithPdfSvg(node: DOMNode): React.ReactElement | null {
		if (node.type === 'text') return <>{(node as TextNode).data}</>;

		if (node.type === 'tag') {
			const {
				attribs,
				children: nodeChildren,
				name,
				// NOTE: Looks like default type definitions are wrong here
			} = node as TagElementType;

			const children = domToReact(nodeChildren, htmlReactParserOptions);

			// Base props that all react-pdf elements support
			const baseProps = Object.entries(
				attribs,
			).reduce<SVGPresentationAttributes>((acc, [attr, value]) => {
				// Convert attribute names to camelCase before checking their name
				const [first, ...rest] = attr.split('-');
				const attrName = [
					first,
					...rest.map((word) => `${word[0].toUpperCase()}${word.slice(1)}`),
				].join('');

				// On the client, sometimes `strokeDasharray` is rendered with
				// `px` units which need to be converted to `react-pdf` units
				if (attrName === 'strokeDasharray') {
					if (value.includes('px')) value = value.replaceAll('px', '');

					// Multiple units aren't supported in react-pdf, ie. `0 0`
					if (value.includes(' ')) {
						const [first, second] = value.split(' ');
						if (first !== second) {
							throw new Error(
								`Your chart rendered a (${name}) element with a "${first}" value that's not supported: ${value}.`,
							);
						}
						value = first;
					}
				}

				// Convert presentational SVG attributes to react-pdf props
				if (PRESENTATION_ATTRIBUTES.includes(attrName)) {
					// rome-ignore lint/suspicious/noExplicitAny: Fix me later
					acc[attrName as keyof SVGPresentationAttributes] = value as any;
				}

				return acc;
			}, {});

			// NOTE: You cannot return `null` from this function, otherwise the
			// `domToReact` function that processes children will ignore the output.
			// So if you want to skip rendering some element, return an empty <></>
			// fragment instead.
			switch (name.toLowerCase()) {
				case 'circle':
					return (
						<Circle
							{...baseProps}
							cx={attribs.cx}
							cy={attribs.cy}
							r={attribs.r}
						>
							{children}
						</Circle>
					);
				case 'clippath':
					return <ClipPath {...baseProps}>{children}</ClipPath>;
				case 'defs':
					return <Defs {...baseProps}>{children}</Defs>;
				case 'desc':
					// Not supported in react-pdf. Rendering will be skipped.
					return <></>;
				case 'div':
					return <View {...baseProps}>{children}</View>;
				case 'ellipse':
					return (
						<Ellipse
							{...baseProps}
							cx={attribs.cx}
							cy={attribs.cy}
							rx={attribs.rx}
							ry={attribs.ry}
						>
							{children}
						</Ellipse>
					);
				case 'g':
					return <G {...baseProps}>{children}</G>;
				case 'line':
					return (
						<Line
							{...baseProps}
							x1={attribs.x1}
							x2={attribs.x2}
							y1={attribs.y1}
							y2={attribs.y2}
						>
							{children}
						</Line>
					);
				case 'li':
					return (
						<View {...baseProps} style={getElementStyle(attribs, chartStyle)}>
							{children}
						</View>
					);
				case 'lineargradient':
					return (
						<LinearGradient
							{...baseProps}
							id={attribs.id}
							x1={attribs.x1}
							x2={attribs.x2}
							y1={attribs.y1}
							y2={attribs.y2}
						>
							{children}
						</LinearGradient>
					);
				case 'path':
					return (
						<Path {...baseProps} d={attribs.d}>
							{children}
						</Path>
					);
				case 'polygon':
					return (
						<Polygon {...baseProps} points={attribs.points}>
							{children}
						</Polygon>
					);
				case 'polyline':
					return (
						<Polyline {...baseProps} points={attribs.points}>
							{children}
						</Polyline>
					);
				case 'radialgradient':
					return (
						<RadialGradient
							{...baseProps}
							cx={attribs.cx}
							cy={attribs.cy}
							fr={attribs.fr}
							fx={attribs.fx}
							fy={attribs.fy}
							id={attribs.id}
						>
							{children}
						</RadialGradient>
					);
				case 'rect':
					return (
						<Rect
							{...baseProps}
							height={attribs.height}
							rx={attribs.rx}
							ry={attribs.ry}
							width={attribs.width}
							x={attribs.x}
							y={attribs.y}
						>
							{children}
						</Rect>
					);
				case 'span':
					return (
						<Text {...baseProps} style={getElementStyle(attribs, chartStyle)}>
							{children}
						</Text>
					);
				case 'stop':
					return (
						<Stop
							{...baseProps}
							offset={attribs.offset}
							stopColor={attribs.stopColor}
							stopOpacity={attribs.stopOpacity}
						>
							{children}
						</Stop>
					);
				case 'svg':
					return (
						<Svg
							{...baseProps}
							height={attribs.height}
							viewBox={attribs.viewBox}
							width={attribs.width}
						>
							{children}
						</Svg>
					);
				case 'text':
					// rome-ignore lint/correctness/noSwitchDeclarations: This is safe
					const { dx, dy } = getTspanChildrenOffsets(node as TagElementType);

					return (
						<Text
							{...baseProps}
							style={getElementStyle(attribs, chartStyle)}
							x={attribs.x != null ? parseFloat(attribs.x) + dx : dx}
							y={attribs.y != null ? parseFloat(attribs.y) + dy : dy}
						>
							{React.Children.map(children, (child) => {
								if (!child || typeof child === 'string') return child;

								// TSpan elements are broken in react-pdf. This will
								// convert them to plain text until the issue is fixed:
								// https://github.com/diegomura/react-pdf/issues/2003
								if (child.type === 'TSPAN') return child.props.children;

								return child;
							})}
						</Text>
					);
				case 'title':
					// Not supported in react-pdf. Rendering will be skipped.
					return <></>;
				case 'tspan':
					// `dx` and `dy` attributes are not supported by react-pdf
					// See: https://github.com/diegomura/react-pdf/issues/1271
					return <Tspan {...baseProps}>{children}</Tspan>;
				case 'ul':
					return (
						<View {...baseProps} style={getElementStyle(attribs, chartStyle)}>
							{children}
						</View>
					);
			}

			throw new Error(
				`Your chart rendered a <${name} /> node which isn't supported by <ReactPDFChart /> yet. Please report this issue.`,
			);
		}

		throw new Error(
			`Your chart rendered a node type (${node.type}) which isn't supported by <ReactPDFChart /> yet. Please report this issue.`,
		);
	}

	return parse(svgString, htmlReactParserOptions);
};

const ReactPDFChart = ({ children, chartStyle, debug, style }: PropsType) => {
	const component = webSvgToPdfSvg(children, chartStyle);

	// This should never happen, but it's here for type safety
	if (!component || typeof component === 'string') return <>{component}</>;

	// This should never happen (as far as I know) but it's here for type safety
	if (Array.isArray(component)) {
		throw new Error(
			`<ReactPDFChart />'s webSvgToPdfSvg() method returned an array. Which isn't supported at the moment. Please report this issue.`,
		);
	}

	return React.cloneElement(component, { debug, style });
};

export default ReactPDFChart;
