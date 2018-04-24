'use strict';

const transform = require(".").transform;
const minimist = require("minimist");
const promisify = require("util").promisify;
const fs = require("fs");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
var argv = minimist(process.argv.slice(2), {
  'boolean': true
});

if (argv.h || argv.help) {
  console.log('Usage: node cli.js <input-mips32> [-o <output-tmips>]');
  console.log('    If -o isn\'t provided, it will be treated as -o <input-mips32>.out.');
  process.exit(0);
}

if (argv._.length !== 1) {
  console.error('Exactly one input assembly file expected.');
  process.exit(1);
}

var input = argv._[0];
var output = 'o' in argv ? argv.o : input + '.out';

(async () => {
  try {
    await writeFile(output, JSON.stringify(transform((await readFile(input)).toString('ascii'))));
  } catch (error) {
    console.error(error);
  }
})();