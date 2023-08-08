import ReactPDFChart from '../src';
import { Document, Page } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { VictoryBar, VictoryChart } from 'victory';

const data = [
	{ x: 1, y: 2, y0: 1 },
	{ x: 2, y: 3, y0: 2 },
	{ x: 3, y: 5, y0: 2 },
	{ x: 4, y: 4, y0: 3 },
	{ x: 5, y: 6, y0: 3 },
];

const MyDocument = () => (
	<Document>
		<Page size='A4' style={{ padding: 20 }}>
			<ReactPDFChart>
				<VictoryChart>
					<VictoryBar
						data={data}
						height={100}
						style={{ data: { fill: '#c43a31' } }}
						width={100}
					/>
				</VictoryChart>
			</ReactPDFChart>
		</Page>
	</Document>
);

const __dirname = fileURLToPath(new URL('.', import.meta.url));

ReactPDF.render(<MyDocument />, `${__dirname}/victory-basic.pdf`);
