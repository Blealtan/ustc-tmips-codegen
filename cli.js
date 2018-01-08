import {
  transformLine
} from '.';

var argv = require('minimist')(process.argv.slice(2), {
  'boolean': true
})
const promisify = require('util').promisify
const fs = require('fs')
const readFile = promisify(fs.readFile),
  writeFile = promisify(fs.writeFile)

if (argv.h || argv.help) {
  console.log('Usage: node cli.js <input-mips32> [-o <output-tmips>] [--pretty].')
  console.log('    If -o isn\'t provided, it will be treated as -o <input-mips32>.s.')
  process.exit(0)
}

if (argv._.length !== 1) {
  console.error('Exactly one input assembly file expected.')
  process.exit(1)
}

var input = argv._[0]
var output = 'o' in argv ? argv.o : input + '.s'

try {
  (async() =>
    await writeFile(output,
      (await readFile(input))
      .toString('ascii')
      .split('\n')
      .map(transformLine)
      .reduce((acc, val) => acc.concat(val))
      .join('\n')
    )
  )()
} catch (error) {
  console.error(error)
}
