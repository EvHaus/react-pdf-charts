import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page } from '@react-pdf/renderer';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import ReactPDFChart from '../src';

const data = [
	{
		amt: 2400,
		name: 'Page A',
		pv: 2400,
		uv: 4000,
	},
	{
		amt: 2210,
		name: 'Page B',
		pv: 1398,
		uv: 3000,
	},
	{
		amt: 2290,
		name: 'Page C',
		pv: 9800,
		uv: 2000,
	},
	{
		amt: 2000,
		name: 'Page D',
		pv: 3908,
		uv: 2780,
	},
	{
		amt: 2181,
		name: 'Page E',
		pv: 4800,
		uv: 1890,
	},
	{
		amt: 2500,
		name: 'Page F',
		pv: 3800,
		uv: 2390,
	},
	{
		amt: 2100,
		name: 'Page G',
		pv: 4300,
		uv: 3490,
	},
];

const MyDocument = () => (
	<Document>
		<Page size='A4' style={{ padding: 20 }}>
			<ReactPDFChart>
				<LineChart data={data} height={300} width={500}>
					<XAxis dataKey='name' />
					<YAxis />
					<CartesianGrid stroke='#eee' strokeDasharray='5' />
					<Line dataKey='uv' stroke='#8884d8' type='monotone' />
					<Line dataKey='pv' stroke='#82ca9d' type='monotone' />
				</LineChart>
			</ReactPDFChart>
		</Page>
	</Document>
);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<MyDocument />, `${__dirname}/recharts-basic.pdf`);
