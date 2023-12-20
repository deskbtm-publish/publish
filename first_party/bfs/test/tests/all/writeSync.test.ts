import * as path from 'path';

import { backends, configure, fixturesDir,fs, tmpDir } from '../../common';

describe.each(backends)('%s fs.writeSync', (name, options) => {
	const configured = configure({ fs: name, options });
	it('should write file synchronously with specified content', async () => {
		await configured;

		if (fs.getMount('/').metadata.readonly || !fs.getMount('/').metadata.synchronous) {
			return;
		}

		const fn = path.join(tmpDir, 'write.txt');
		const foo = 'foo';
		const fd = fs.openSync(fn, 'w');

		let written = fs.writeSync(fd, '');
		expect(written).toBe(0);

		fs.writeSync(fd, foo);

		const bar = 'bár';
		written = fs.writeSync(fd, Buffer.from(bar), 0, Buffer.byteLength(bar));
		expect(written).toBeGreaterThan(3);

		fs.closeSync(fd);

		expect(fs.readFileSync(fn).toString()).toBe('foobár');
	});
});
