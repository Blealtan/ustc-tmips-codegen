
import * as tmips from './index'
var argv = require('minimist')(process.argv.slice(2))

if (argv.h || argv.help) {
  console.log('Usage: node cli.js <input-mips32> -o <output-tmips>.')
  process.exit(0)
}

if (argv._.length !== 1) {
  console.error('Exactly one input assembly file expected.')
  process.exit(1)
}

var input = argv._[0]
var output = 'o' in argv ? argv.o : input + '.s'

//! TODO: read input, process thru tmips, and write output.
