// Silence `useLayoutEffect does nothing on the server` warnings. These come
// from `recharts` but they're harmless and just clutter the console output.
const consoleError = console.error;
console.error = function (message) {
	if (
		message.startsWith('Warning: useLayoutEffect does nothing on the server')
	) {
		return;
	}
	// @ts-expect-error Skipping type checking
	// biome-ignore lint/style/noArguments: Monkeypatching on purpose
	consoleError.apply(console, arguments);
};

const main = async () => {
	await import('./recharts-basic');
	await import('./recharts-composed');
	await import('./victory-basic');

	// biome-ignore lint/suspicious/noConsoleLog: <explanation>
	return console.log('✅ /examples updated!');
};

main();
