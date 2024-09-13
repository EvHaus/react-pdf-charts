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
	const { stdout, stderr } = await Bun.spawn([
		'tsc',
		'-p',
		'tsconfig.build.json',
	]);
	const stdoutStr = await new Response(stdout).text();
	const stderrStr = await new Response(stderr).text();
	if (stderrStr) return console.error(stderrStr);

	return console.debug(`✅ DONE! ${stdoutStr}`);
}

build();
