import type { Styles } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Element } from 'html-react-parser';

export type PropsType = {
	children: React.ReactElement;
	debug?: boolean;
	chartStyle?: Styles;
	style?: Style;
};

export type TagElementType = Element & { children?: Array<Element & Element> };
