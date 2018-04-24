'use strict';

function* matchAllLabel(oprand) {
    const re = /%\((.*?)\)/g;
    let match;
    while (match = re.exec(oprand)) {
        yield match[1];
    }
}

exports.trim = function (parsed_asm) {
    let trimmed_asm = {};
    let known_label = new Set();
    for (let seg in parsed_asm) {
        let in_debug = false;
        trimmed_asm[seg] = parsed_asm[seg].filter(inst => {
            // Parse secion info and skip debug section
            let section_info = inst.directives.filter(elem => elem[0] == ".section");
            if (section_info.length > 0)
                in_debug = section_info[section_info.length - 1][1].startsWith(".debug_");
            if (in_debug) return false;

            // Save all known label outside debug sections
            inst.labels.forEach(elem => known_label.add(elem));

            return true;
        })
    }
    let used_label = new Set();
    for (let seg in trimmed_asm)
        trimmed_asm[seg].forEach(inst => {
            if (!inst.instruction) return;
            switch (inst.instruction[0]) {
                case ".4byte":
                    for (let l of matchAllLabel(inst.instruction[1]))
                        if (known_label.has(l))
                            used_label.add(l);
                    break;
                case "j":
                    used_label.add(inst.instruction[1]);
                    break;
                case "beqz":
                    used_label.add(inst.instruction[3]);
                    break;
            }
        });
    for (let seg in trimmed_asm)
        trimmed_asm[seg].forEach(inst => {
            inst.labels = inst.labels.filter(l => !l.startsWith("$") || used_label.has(l));
        });
    return trimmed_asm;
}
