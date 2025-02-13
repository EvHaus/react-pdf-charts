import {
	Circle,
	ClipPath,
	Defs,
	Ellipse,
	G,
	Image,
	Line,
	LinearGradient,
	Path,
	Polygon,
	Polyline,
	RadialGradient,
	Rect,
	Stop,
	Svg,
	Text,
	Tspan,
	View,
} from '@react-pdf/renderer';
import type { SVGPresentationAttributes, Style } from '@react-pdf/types';
import parse, { type Text as TextNode, domToReact } from 'html-react-parser';
import type { DOMNode, HTMLReactParserOptions } from 'html-react-parser';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRESENTATION_ATTRIBUTES } from './constants';
import { getElementStyle, getSvgElementStyle } from './styling';
import type { PropsType, TagElementType } from './types';
import { getTspanChildrenOffsets } from './utils';

const renderTextElement = ({
	baseProps,
	chartStyle,
	children,
	node,
}: {
	baseProps: SVGPresentationAttributes;
	chartStyle?: Style;
	children: string | React.JSX.Element | Array<React.JSX.Element>;
	node: TagElementType;
}) => {
	const { attribs } = node;
	const { dx, dy } = getTspanChildrenOffsets(node as TagElementType);

	const textChildren = React.Children.map(children, (child) => {
		if (!child || typeof child === 'string') return child;
		return child;
	});

	return (
		<Text
			{...baseProps}
			style={getElementStyle(attribs, chartStyle)}
			x={attribs.x != null ? Number.parseFloat(attribs.x) + dx : dx}
			y={attribs.y != null ? Number.parseFloat(attribs.y) + dy : dy}
		>
			{textChildren}
		</Text>
	);
};

// Converts a web-based SVG element to a react-pdf SVG element
export const convertHTMLToPDF = (
	children: React.ReactElement,
	chartStyle?: Style,
) => {
	const svgString = renderToStaticMarkup(children);

	if (!svgString?.length) {
		throw new Error(
			`[react-pdf-charts]: <ReactPDFChart /> was unable to convert your chart into static markup. The most common reason for this is that your chart is missing a "height" or "width". If you think it's a different problem, please report this issue.`,
		);
	}

	const collectedDefs: Array<React.JSX.Element> = [];

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
								`[react-pdf-charts]: Your chart rendered a (${name}) element with a "${first}" value that's not supported: ${value}.`,
							);
						}
						value = first;
					}
				}

				// Convert presentational SVG attributes to react-pdf props
				if (PRESENTATION_ATTRIBUTES.includes(attrName)) {
					// biome-ignore lint/suspicious/noExplicitAny: Fix me later
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
							style={getSvgElementStyle(attribs)}
						>
							{children}
						</Circle>
					);
				case 'clippath':
					return <ClipPath {...baseProps}>{children}</ClipPath>;
				case 'defs':
					// Due to https://github.com/diegomura/react-pdf/issues/3004,
					// we can't simply render Defs here. Instead we need to collect
					// them all and render them as part of the <Svg> element.
					collectedDefs.push(children as React.JSX.Element);
					return <></>;
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
							style={getSvgElementStyle(attribs)}
						>
							{children}
						</Ellipse>
					);
				case 'g':
					return <G {...baseProps}>{children}</G>;
				case 'img':
					return (
						<Image
							src={attribs.src}
							style={getElementStyle(attribs, chartStyle, {
								height: attribs.height,
								width: attribs.width,
							})}
						/>
					);
				case 'li':
					return (
						<View {...baseProps} style={getElementStyle(attribs, chartStyle)}>
							{children}
						</View>
					);
				case 'line':
					return (
						<Line
							{...baseProps}
							style={getSvgElementStyle(attribs)}
							x1={attribs.x1}
							x2={attribs.x2}
							y1={attribs.y1}
							y2={attribs.y2}
						>
							{children}
						</Line>
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
				case 'link':
					// Not supported in react-pdf. Rendering will be skipped.
					return <></>;
				case 'path':
					return (
						<Path
							{...baseProps}
							d={attribs.d}
							style={getSvgElementStyle(attribs)}
						>
							{children}
						</Path>
					);
				case 'polygon':
					return (
						<Polygon
							{...baseProps}
							points={attribs.points}
							style={getSvgElementStyle(attribs)}
						>
							{children}
						</Polygon>
					);
				case 'polyline':
					return (
						<Polyline
							{...baseProps}
							points={attribs.points}
							style={getSvgElementStyle(attribs)}
						>
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
							style={getSvgElementStyle(attribs)}
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
							stopColor={attribs['stop-color']}
							stopOpacity={attribs['stop-opacity']}
						>
							{children}
						</Stop>
					);
				case 'svg':
					return (
						<Svg
							{...baseProps}
							height={attribs.height}
							style={getElementStyle(attribs, chartStyle)}
							viewBox={attribs.viewBox}
							width={attribs.width}
						>
							{/* See comment above (in Defs case) */}
							<Defs {...baseProps}>
								{React.Children.map(collectedDefs, (def, idx) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Key choice is not critical here
									<React.Fragment key={`def-${idx}`}>{def}</React.Fragment>
								))}
							</Defs>
							{children}
						</Svg>
					);
				case 'text':
					return renderTextElement({
						baseProps,
						chartStyle,
						children,
						node: node as TagElementType,
					});
				case 'title':
					// Not supported in react-pdf. Rendering will be skipped.
					return <></>;
				case 'tspan':
					// `dx` and `dy` attributes are not supported by react-pdf
					// See: https://github.com/diegomura/react-pdf/issues/1271
					return (
						// @ts-expect-error Tspan's don't support a `style` prop,
						// but we're going to pass it in anyway so that the
						// `renderTextElement()` util can extract it.
						<Tspan {...baseProps} style={getElementStyle(attribs, chartStyle)}>
							{children}
						</Tspan>
					);
				case 'ul':
					return (
						<View {...baseProps} style={getElementStyle(attribs, chartStyle)}>
							{children}
						</View>
					);
			}

			throw new Error(
				`[react-pdf-charts]: Your chart rendered a <${name} /> node which isn't supported by <ReactPDFChart /> yet. Please report this issue.`,
			);
		}

		throw new Error(
			`[react-pdf-charts]: Your chart rendered a node type (${node.type}) which isn't supported by <ReactPDFChart /> yet. Please report this issue.`,
		);
	}

	return parse(svgString, htmlReactParserOptions);
};

/**
 * Wrapper used to convert web-based SVG elements into `react-pdf` SVG elements.
 * @param chartStyle {Style} An optional [Stylesheet](https://react-pdf.org/styling) that maps web CSS class names to whatever `react-pdf` styles you wish to replace those classes with.
 * @param debug {boolean} Enables `react-pdf` [debugging mode](https://react-pdf.org/advanced#debugging) for the outer wrapper element.
 * @param style {Style} An optional [style](https://react-pdf.org/styling) that will get applied to the outer element of the wrapper component.
 * @example
 *  <ReactPDFChart>
 *    <LineChart data={data} height={300} width={500}>
 *      <XAxis dataKey="name" />
 *      <YAxis />
 *      <CartesianGrid stroke="#eee" strokeDasharray="5" />
 *      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
 *      <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
 *    </LineChart>
 *  </ReactPDFChart>
 */
const ReactPDFChart = ({ children, chartStyle, debug, style }: PropsType) => {
	let component = convertHTMLToPDF(children, chartStyle);

	// This should never happen, but it's here for type safety
	if (!component || typeof component === 'string') return <>{component}</>;

	// This should never happen (as far as I know) but it's here for type safety
	if (Array.isArray(component)) {
		component = <View>{component}</View>;
	}

	return React.cloneElement(component, { debug, style });
};

export default ReactPDFChart;
