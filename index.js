'use strict';

const parse = require("./parser").parse;

function _transform(asm) {
  //!TODO: perform transformation on provided assembly representation.
  return parse(asm);
}

exports.transform = _transform;