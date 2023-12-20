import { jest } from '@jest/globals';
import * as path from 'path';

import { backends, configure, fixturesDir,fs, tmpDir } from '../../common';

describe.each(backends)('%s File Writing with Custom Mode', (name, options) => {
	const configured = configure({ fs: name, options });
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should write file synchronously with custom mode', async () => {
		await configured;

		const file = path.join(tmpDir, 'testWriteFileSync.txt');
		const mode = 0o755;

		jest.spyOn(fs, 'openSync').mockImplementation((...args) => {
			return fs.openSync.apply(fs, args);
		});

		jest.spyOn(fs, 'closeSync').mockImplementation((...args) => {
			return fs.closeSync.apply(fs, args);
		});

		fs.writeFileSync(file, '123', { mode: mode });

		const content = fs.readFileSync(file, { encoding: 'utf8' });
		expect(content).toBe('123');

		if (fs.getMount('/').metadata.supportsProperties) {
			const actual = fs.statSync(file).mode & 0o777;
			expect(actual).toBe(mode);
		}

		fs.unlinkSync(file);
	});

	it('should append to a file synchronously with custom mode', async () => {
		await configured;

		const file = path.join(tmpDir, 'testAppendFileSync.txt');
		const mode = 0o755;

		jest.spyOn(fs, 'openSync').mockImplementation((...args) => {
			return fs.openSync.apply(fs, args);
		});

		jest.spyOn(fs, 'closeSync').mockImplementation((...args) => {
			return fs.closeSync.apply(fs, args);
		});

		fs.appendFileSync(file, 'abc', { mode: mode });

		const content = fs.readFileSync(file, { encoding: 'utf8' });
		expect(content).toBe('abc');

		if (fs.getMount('/').metadata.supportsProperties) {
			expect(fs.statSync(file).mode & mode).toBe(mode);
		}

		fs.unlinkSync(file);
	});
});
