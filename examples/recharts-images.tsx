import { fileURLToPath } from 'node:url';
import ReactPDF, { Document, Page } from '@react-pdf/renderer';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import ReactPDFChart from '../src';

const data = [
	{
		amt: 2400,
		name: 'Page A',
		pv: 2400,
	},
	{
		amt: 2210,
		name: 'Page B',
		pv: 1398,
	},
	{
		amt: 2290,
		name: 'Page C',
		pv: 9800,
	},
	{
		amt: 2000,
		name: 'Page D',
		pv: 3908,
	},
	{
		amt: 2181,
		name: 'Page E',
		pv: 4800,
	},
	{
		amt: 2500,
		name: 'Page F',
		pv: 3800,
	},
	{
		amt: 2100,
		name: 'Page G',
		pv: 4300,
	},
];

const MyDocument = () => (
	<Document>
		<Page size='A4' style={{ padding: 20 }}>
			<ReactPDFChart>
				<div>
					<LineChart data={data} height={300} width={500}>
						<XAxis dataKey='name' />
						<YAxis />
						<CartesianGrid stroke='#eee' strokeDasharray='5' />
						<Line dataKey='pv' stroke='#8884d8' type='monotone' />
					</LineChart>
					<img
						alt='Red Apple'
						height='100'
						src='https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/661px-Red_Apple.jpg'
						style={{
							border: '2px solid black',
							position: 'absolute',
							right: 10,
							top: 10,
						}}
						width='100'
					/>
				</div>
			</ReactPDFChart>
		</Page>
	</Document>
);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<MyDocument />, `${__dirname}/recharts-images.pdf`);
