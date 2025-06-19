import { Document, Page, PDFViewer } from '@react-pdf/renderer';
import ReactPDFChart from 'react-pdf-charts';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const data = [
	{ amt: 2400, name: 'A', pv: 2400, uv: 4000 },
	{ amt: 2210, name: 'B', pv: 1398, uv: 3000 },
	{ amt: 2290, name: 'C', pv: 9800, uv: 2000 },
	{ amt: 2000, name: 'D', pv: 3908, uv: 2780 },
	{ amt: 2181, name: 'E', pv: 4800, uv: 1890 },
	{ amt: 2500, name: 'F', pv: 3800, uv: 2390 },
	{ amt: 2100, name: 'G', pv: 4300, uv: 3490 },
];

const MyDocument = () => (
	<Document>
		<Page size='A4'>
			<ReactPDFChart>
				<BarChart data={data} height={300} width={500}>
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
