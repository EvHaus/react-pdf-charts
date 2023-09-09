async function main() {
	// Generate bundle
	await Bun.build({
		entrypoints: ['./src/index.ts'],
		external: [
			'@react-pdf/renderer',
			'@react-pdf/types',
			'html-react-parser',
			'react',
			'react-dom',
		],
		outdir: './dist',
	});

	// Generate types
	const { stdout, stderr } = await Bun.spawn([
		'tsc',
		'-p',
		'tsconfig.build.json',
	]);
	const stdoutStr = await new Response(stdout).text();
	const stderrStr = await new Response(stderr).text();
	if (stderrStr) return console.error(stderrStr);

	// biome-ignore lint/suspicious/noConsoleLog: <explanation>
	return console.log(`✅ DONE! ${stdoutStr}`);
}

await main();

export {};
