'use strict';

exports.parse = function (source) {
    let assert = () => {};

    let splitRegex = /[ \t,]+/;

    let directives = [
        ".p2align",
        ".loc",
        ".file",
        ".section"
    ];

    let instructions = [
        "addiu",
        "sw",
        "move",
        "lui",
        "lw",
        "jr",
        "j",
        "jal",
        "beqz",
        "nop"
    ];

    let pseudoInstructions = [
        ".byte",
        ".2byte",
        ".4byte",
        ".asciz"
    ];

    let unsupportedPseudo = [
        // TODO
    ];

    let genEmpty = () => ({
        directives: [],
        labels: [],
        instruction: undefined
    });

    let assembly = {
        ".text": [genEmpty()],
        ".data": [genEmpty()],
        ".bss": [genEmpty()]
    };

    let currentSegment = assembly[".text"];

    function switchSegment(targetSegment) {
        currentSegment = assembly[targetSegment];
        assert(currentSegment, "Unexpected segment");
    }

    function addInstruction(instruction) {
        currentSegment[currentSegment.length - 1].instruction = instruction;
        currentSegment.push(genEmpty());
    }

    function addDirective(directive) {
        currentSegment[currentSegment.length - 1].directives.push(directive);
    }

    function addLabel(label) {
        currentSegment[currentSegment.length - 1].labels.push(label);
    }

    source.split('\n').forEach((rawLine, lineNum) => {
        assert = (condition, message) => {
            if (!condition) {
                message = `line ${lineNum}: ${message || "Assertion failed"}`;
                if (typeof Error !== "undefined")
                    throw new Error(message);
                throw message; // Fallback
            }
        }

        // Tokenize input line.
        let line = [];
        for (let i = 0; i < rawLine.length; ++i) {
            let curr = rawLine[i];
            if (curr == "\t" || curr == " ")
            ; // Do nothing
            else if (curr == ",")
                line.push(",");
            else if (curr == ":")
                line.push(":");
            else if (curr == "#")
                break;
            else if (curr == "\"" || curr == "'") {
                let beg = i;
                do ++i; while (i < rawLine.length && rawLine[i] != curr || rawLine[i - 1] == "\\");
                line.push(rawLine.substring(beg, i + 1));
            } else {
                let beg = i;
                do ++i; while (i < rawLine.length && !["\t", " ", ",", ":", "#", "\"", "'"].includes(rawLine[i]));
                --i;
                line.push(rawLine.substring(beg, i + 1));
            }
        }

        // In case of empty or comment-only lines, continue for next line's processing.
        if (line.length == 0) return;

        if (line[1] == ":") {
            // Label line ends with ':'
            assert(line.length == 2, "Extra content found in label line");
            addLabel(line[0]);
        } else if (line.length == 3 && line[1] == "=" && line[2][0] == "(" && line[2].slice(-1) == ")") {
            // Label line such as '$label1 = ($label0)'
            let rhsLabelName = line[2].slice(1, -1);
            assert(currentSegment[currentSegment.length - 1].labels.find(l => l == rhsLabelName),
                "Assigned label not present at the same address");
            addLabel(line[0].slice(0, -1));
        } else if (line[0][0] == ".") {
            // Lines start with a pseudo instruction
            let pseudoInstrName = line[0];
            if (assembly[pseudoInstrName]) // Segment switching
                switchSegment(pseudoInstrName);
            else if (directives.includes(pseudoInstrName)) // Directive
                addDirective(line);
            else if (pseudoInstructions.includes(pseudoInstrName)) // Actual pseudo instruction
                addInstruction(line);
            else
                assert(!unsupportedPseudo.includes(pseudoInstrName), "Unsupported pseudo instruction");
        } else {
            assert(instructions.includes(line[0]));
            addInstruction(line);
        }
    });

    return assembly;
}