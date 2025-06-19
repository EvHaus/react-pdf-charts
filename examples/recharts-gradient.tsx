import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page } from '@react-pdf/renderer';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import ReactPDFChart from '../src/index.jsx';

const data = [
	{ x: 2024, y: 10 },
	{ x: 2026, y: 12 },
	{ x: 2030, y: 14 },
];

/** Test case for https://github.com/EvHaus/react-pdf-charts/issues/523 */
const MyDocument = () => (
	<Document>
		<Page size='A4' style={{ padding: 20 }}>
			<ReactPDFChart>
				<LineChart data={data} height={200} width={523}>
					<defs>
						<linearGradient id='gradient' x1={0.5} x2={0.5} y1={0} y2={1}>
							<stop offset={0} stopColor='blue' stopOpacity={1} />
							<stop offset={1} stopColor='red' stopOpacity={1} />
						</linearGradient>
					</defs>
					<CartesianGrid />
					<XAxis />
					<YAxis />
					<Line
						dataKey='y'
						dot={({ cx, cy }) => (
							<circle
								cx={cx}
								cy={cy}
								fill='url(#gradient)'
								key='custom-dot'
								r={12}
							/>
						)}
						strokeWidth={5}
					/>
				</LineChart>
			</ReactPDFChart>
		</Page>
	</Document>
);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<MyDocument />, `${__dirname}/recharts-gradient.pdf`);
