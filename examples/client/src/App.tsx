import { Document, PDFViewer, Page } from '@react-pdf/renderer';
import ReactPDFChart from 'react-pdf-charts';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const data = [
	{ name: 'A', uv: 4000, pv: 2400, amt: 2400 },
	{ name: 'B', uv: 3000, pv: 1398, amt: 2210 },
	{ name: 'C', uv: 2000, pv: 9800, amt: 2290 },
	{ name: 'D', uv: 2780, pv: 3908, amt: 2000 },
	{ name: 'E', uv: 1890, pv: 4800, amt: 2181 },
	{ name: 'F', uv: 2390, pv: 3800, amt: 2500 },
	{ name: 'G', uv: 3490, pv: 4300, amt: 2100 },
];

const MyDocument = () => (
	<Document>
		<Page size='A4'>
			<ReactPDFChart>
				<BarChart data={data} width={500} height={300}>
					<XAxis dataKey='name' />
					<YAxis />
					<CartesianGrid stroke='#ccc' strokeDasharray='3 3' />
					<Bar dataKey='uv' fill='#8884d8' isAnimationActive={false} />
					<Bar dataKey='pv' fill='#82ca9d' isAnimationActive={false} />
				</BarChart>
			</ReactPDFChart>
		</Page>
	</Document>
);

const App = () => (
	<div>
		<h1>React PDF Sample</h1>
		<PDFViewer height='600' width='800'>
			<MyDocument />
		</PDFViewer>
	</div>
);

export default App;
