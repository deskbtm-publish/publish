export const runScriptSafely = function (script: string, strict = false) {
  const fn = new Function(`${strict ? "'use strict';" : ''}  ${script}`)();

  return fn?.();
};
