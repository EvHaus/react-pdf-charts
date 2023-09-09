import { fileURLToPath } from 'node:url';
import { Document, Page } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
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
		name: 'Page A',
		uv: 4000,
		uw: 800,
		pv: 2400,
		amt: 2400,
	},
	{
		name: 'Page B',
		uv: 3000,
		uw: 400,
		pv: 1398,
		amt: 2210,
	},
	{
		name: 'Page C',
		uv: 2000,
		uw: 500,
		pv: 9800,
		amt: 2290,
	},
	{
		name: 'Page D',
		uv: 2780,
		uw: 100,
		pv: 3908,
		amt: 2000,
	},
	{
		name: 'Page E',
		uv: 1890,
		uw: 900,
		pv: 4800,
		amt: 2181,
	},
	{
		name: 'Page F',
		uv: 2390,
		uw: 1000,
		pv: 3800,
		amt: 2500,
	},
	{
		name: 'Page G',
		uv: 3490,
		uw: 200,
		pv: 4300,
		amt: 2100,
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
					<Area type='monotone' dataKey='amt' fill='#8884d8' stroke='#8884d8' />
					<Bar dataKey='pv' fill='#413ea0' stackId='stack' />
					<Bar dataKey='uw' fill='#ffbb00' stackId='stack' />
					<Line type='monotone' dataKey='uv' stroke='#ff7300' />
					<Legend />
				</ComposedChart>
			</ReactPDFChart>
		</Page>
	</Document>
);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<MyDocument />, `${__dirname}/recharts-composed.pdf`);
