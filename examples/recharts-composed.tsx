import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page } from '@react-pdf/renderer';
import {
	Area,
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	XAxis,
	YAxis,
} from 'recharts';
import ReactPDFChart from '../src';

const data = [
	{
		amt: 2400,
		name: 'Page A',
		pv: 2400,
		uv: 4000,
		uw: 800,
	},
	{
		amt: 2210,
		name: 'Page B',
		pv: 1398,
		uv: 3000,
		uw: 400,
	},
	{
		amt: 2290,
		name: 'Page C',
		pv: 9800,
		uv: 2000,
		uw: 500,
	},
	{
		amt: 2000,
		name: 'Page D',
		pv: 3908,
		uv: 2780,
		uw: 100,
	},
	{
		amt: 2181,
		name: 'Page E',
		pv: 4800,
		uv: 1890,
		uw: 900,
	},
	{
		amt: 2500,
		name: 'Page F',
		pv: 3800,
		uv: 2390,
		uw: 1000,
	},
	{
		amt: 2100,
		name: 'Page G',
		pv: 4300,
		uv: 3490,
		uw: 200,
	},
];

const MyDocument = () => (
	<Document>
		<Page size='A4' style={{ padding: 20 }}>
			<ReactPDFChart>
				<ComposedChart data={data} height={250} width={500}>
					<XAxis dataKey='name' />
					<YAxis />
					<CartesianGrid stroke='#f5f5f5' />
					<Area dataKey='amt' fill='#8884d8' stroke='#8884d8' type='monotone' />
					<Bar dataKey='pv' fill='#413ea0' stackId='stack' />
					<Bar dataKey='uw' fill='#ffbb00' stackId='stack' />
					<Line dataKey='uv' stroke='#ff7300' type='monotone' />
					<Legend />
				</ComposedChart>
			</ReactPDFChart>
		</Page>
	</Document>
);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<MyDocument />, `${__dirname}/recharts-composed.pdf`);
