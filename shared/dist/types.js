export function newInput(name, val) { return { name, val }; }
function isAllDigits(str) {
    return /^\d+$/.test(str) || str == "";
}
export function evaluateRow(row, columns) {
    if (columns.length == 0)
        return { column: -1, status: 4 };
    if (columns.length != row.length)
        return { column: -1, status: 3 };
    if (!columns.every((c, i) => c.name == row[i].name))
        return { column: -1, status: 5 };
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const value = row[i].val;
        if (!column.canBeEmpty && value == "") {
            return { column: i, status: 0 };
        }
        if (column.type == "bool") {
            if (value != "true" && value != "false") {
                return { column: i, status: 1 };
            }
        }
        else if (column.type == "serial") {
            if (!isAllDigits(value)) {
                return { column: i, status: 2 };
            }
        }
    }
    return true;
}
export function newUserInfo() {
    return {
        id: "",
        name: "",
        email: "",
        association: "",
        phoneNumber: "",
        role: "viewer",
        verified: false,
        comment: ""
    };
}
export function getTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:` +
        `${String(d.getMinutes()).padStart(2, "0")}:` +
        `${String(d.getSeconds()).padStart(2, "0")}:` +
        `${String(d.getMilliseconds()).padStart(3, "0")}`;
}
//# sourceMappingURL=types.js.map