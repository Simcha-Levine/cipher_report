function isAllDigits(str) {
    return /^\d+$/.test(str) || str == "";
}
export function evaluateRow(row, columns) {
    if (columns.length != row.length) {
        return { column: -1, status: 3 };
    }
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const value = row[i];
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
        role: "",
        admin: false,
        verified: false,
        comment: ""
    };
}
//# sourceMappingURL=types.js.map