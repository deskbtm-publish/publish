import * as p from '@clack/prompts';

export const create = async function () {
  await p.group({
    projectName: () =>
      p.text({
        message: 'Project name ?',
      }),
    language: () =>
      p.select({
        message: 'Pick a project language.',
        options: [
          { value: 'ts', label: 'TypeScript' },
          { value: 'js', label: 'JavaScript' },
        ],
        initialValue: 'ts',
      }),
  });
};
