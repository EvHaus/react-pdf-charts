import { fileURLToPath } from 'node:url';
import ReactPDF, { Page, Document } from '@react-pdf/renderer';
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from 'recharts';
import ReactPDFChart from '../src/index.jsx';

const data = [
	{ x: 2024, '1': 10, '2': 11 },
	{ x: 2026, '1': 12, '2': 13 },
	{ x: 2030, '1': 14, '2': 15 },
];

const colors = {
	grid: '#E9E8EB',
	lineColors: [
		{
			lineStroke: 'red',
			pointStroke: '#FDB5AC',
			pointFill: 'url(#point0Fill)',
			pointFillC1: '#EFB9C7',
			pointFillC2: '#F2DEE3',
		},
		{
			lineStroke: '#7AA1FA',
			pointStroke: '#B8CEFF',
			pointFill: 'url(#point1Fill)',
			pointFillC1: '#AEAAD5',
			pointFillC2: '#D4D1F3',
		},
		{
			lineStroke: '#8BC5CB',
			pointStroke: '#ABD6C0',
			pointFill: 'url(#point2Fill)',
			pointFillC1: '#CBDFC8',
			pointFillC2: '#F7F7F7',
		},
	],
};

const CustomizedDot = ({
	cx,
	cy,
	fill,
	stroke,
	strokeWidth = 1,
	radius = 6,
}: {
	cx: number;
	cy: number;
	fill: string;
	stroke: string;
	strokeWidth?: number;
	radius?: number;
}) => {
	return (
		<circle
			cx={cx}
			cy={cy}
			fill={fill}
			r={radius}
			stroke={stroke}
			strokeWidth={strokeWidth}
		/>
	);
};

const Linechart = () => {
	return (
		<Document>
			<Page size='A4' style={{ padding: 20 }}>
				<ReactPDFChart>
					<LineChart data={data} height={200} width={523}>
						<defs>
							{['1', '2'].map((id, idx) => (
								<linearGradient
									id={`grad${id}`}
									key={id}
									x1={0.5}
									x2={0.5}
									y1={0}
									y2={1}
									// gradientTransform="rotate(90deg)"
								>
									<stop
										offset='0'
										stopColor={colors.lineColors[idx].pointFillC1}
										stopOpacity={1}
									/>
									<stop
										offset='1'
										stopColor={colors.lineColors[idx].pointFillC2}
										stopOpacity={1}
									/>
								</linearGradient>
							))}
						</defs>

						<CartesianGrid stroke={colors.grid} vertical={false} />
						<XAxis dataKey='x' stroke={colors.grid} />
						<YAxis orientation='left' stroke={colors.grid} tickCount={10}>
							<Label
								angle={-90}
								fill='#9C97A2'
								position={'insideLeft'}
								style={{ textAnchor: 'middle' }}
								value={'Test label'}
							/>
						</YAxis>

						{['1', '2'].map((id, idx) => (
							<Line
								dataKey={id}
								dot={({ cx, cy }) => (
									<CustomizedDot
										cx={cx}
										cy={cy}
										fill={`url(#grad${id})`}
										stroke={colors.lineColors[idx].pointStroke}
										strokeWidth={1}
									/>
								)}
								isAnimationActive={false}
								key={id}
								stroke={colors.lineColors[idx].lineStroke}
								strokeWidth={1}
								type='monotone'
							/>
						))}
					</LineChart>
				</ReactPDFChart>
			</Page>
		</Document>
	);
};

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<Linechart />, `${__dirname}/recharts-gradient.pdf`);
