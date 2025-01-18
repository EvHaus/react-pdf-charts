// Silence `useLayoutEffect does nothing on the server` warnings. These come
// from `recharts` but they're harmless and just clutter the console output.
const consoleError = console.error;
console.error = (...args) => {
	if (
		typeof args[0] === 'string' &&
		args[0]?.startsWith('Warning: useLayoutEffect does nothing on the server')
	) {
		return;
	}

	consoleError(...args);
};

const main = async () => {
	await import('./recharts-basic');
	await import('./recharts-composed');
	await import('./recharts-gradient');
	await import('./recharts-images');
	await import('./victory-basic');

	return console.debug('✅ /examples updated!');
};

main();
