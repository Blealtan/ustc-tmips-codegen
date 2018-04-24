'use strict';

const parse = require("./parser").parse;
const trim = require("./trimmer").trim;

function _transform(asm) {
  //!TODO: perform transformation on provided assembly representation.
  return trim(parse(asm));
}

exports.transform = _transform;