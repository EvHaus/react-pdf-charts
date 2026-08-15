import { rm } from 'node:fs/promises';

async function build() {
	// Delete dist folder
	await rm('./dist', { force: true, recursive: true });

	// Generate bundle
	await Bun.build({
		entrypoints: ['./src/index.tsx'],
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
	const { exitCode, stderr, stdout } = await Bun.$`tsc -p tsconfig.build.json`
		.nothrow()
		.quiet();
	const stdoutStr = stdout.toString();
	if (exitCode !== 0) {
		console.error(stderr.toString() || stdoutStr);
		process.exit(exitCode);
	}

	console.debug(`✅ DONE! ${stdoutStr}`);
}

await build();
