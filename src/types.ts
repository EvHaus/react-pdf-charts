import type { Style } from '@react-pdf/types';
import type { Element } from 'html-react-parser';

export type PropsType = {
	children: React.ReactElement;
	debug?: boolean;
	chartStyle?: Style;
	style?: Style;
};

export type TagElementType = Element & { children?: Array<Element & Element> };
