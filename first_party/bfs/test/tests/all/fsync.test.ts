import { promisify } from 'node:util'; // Import promisify

import * as path from 'path';

import { backends, configure,fs } from '../../common';
import { fixturesDir,tmpDir } from '../../common';

describe.each(backends)('%s fs.fileSync', (name, options) => {
	const configured = configure({ fs: name, options });
	const file = path.join(fixturesDir, 'a.js');
	const rootFS = fs.getMount('/');

	if (!fs.getMount('/').metadata.readonly) {
		let fd: number;
		let successes = 0;

		beforeAll(async () => {
			// Promisify the fs.open function
			fd = await promisify<string, string, number, number>(fs.open)(file, 'a', 0o777);
		});

		if (fs.getMount('/').metadata.synchronous) {
			it('should synchronize file data changes (sync)', async () => {
				await configured;
				fs.fdatasyncSync(fd);
				successes++;
				fs.fsyncSync(fd);
				successes++;
			});
		}

		it('should synchronize file data changes (async)', async () => {
			await configured;
			// Promisify the fs.fdatasync and fs.fsync functions
			const fdatasyncAsync = promisify(fs.fdatasync);
			const fsyncAsync = promisify(fs.fsync);

			await fdatasyncAsync(fd);
			successes++;
			await fsyncAsync(fd);
			successes++;
		});

		afterAll(async () => {
			// Promisify the fs.close function
			const closeAsync = promisify(fs.close);
			await closeAsync(fd);
		});

		it('should have correct number of successes', async () => {
			await configured;
			if (fs.getMount('/').metadata.synchronous) {
				expect(successes).toBe(4);
			} else {
				expect(successes).toBe(2);
			}
		});
	}
});
