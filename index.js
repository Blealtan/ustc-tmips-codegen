function transformLine(line) {
  let transformedTMips = []
  //! TODO: do actual transforming stuff.
  return transformedTMips
}

function transform(lines) {
  return lines.map(elem => ({"src": elem, "res": transformLine(elem)}))
}

exports.transform = transform
exports.transformLine = transformLine
