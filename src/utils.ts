import { BASE_FONT_SIZE } from './constants';

// Some times charts will render numbers with units (like "em") which aren't
// supported in react-pdf. This function can be used to convert into a best-
// guess in supported units.
export const convertUnits = (value: string) => {
	if (value.endsWith('em')) {
		const [val] = value.split('em');
		return Math.round(Number.parseFloat(val) * BASE_FONT_SIZE);
	}

	return Number.parseFloat(value);
};
