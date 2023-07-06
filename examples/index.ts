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
	// rome-ignore lint/style/noArguments: Monkeypatching on purpose
	consoleError.apply(console, arguments);
};

const main = async () => {
	await import('./basic');
	await import('./composed');

	// rome-ignore lint/nursery/noConsoleLog: <explanation>
	return console.log('✅ /examples updated!');
};

main();
