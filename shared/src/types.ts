export type role = "editor" | "reporter" | "viewer" | "admin" | "any" | "none"
export type input = { name: string, val: string }

export function newInput(name: string, val: string): input { return { name, val } }


export interface Column {
    type: "serial" | "text" | "bool"
    name: string
    uiName: string
    canBeEmpty: boolean
    canEditRoles: role[]
}

export interface ColumnPack {
    device: Column[]
    user: Column[];
}

export interface TableRows {
    version: number,
    rows: Row[]
}

export interface Row {
    id: string
    columns: string[]
}

export interface EditRow {
    id: string
    columns: input[]
}

export interface UserRow {
    id: string
    columns: string[]
}


export interface ReportResult {
    success: boolean,
    message: string,
    id: string
}

// states
// 0 = cant be empty
// 1 = needs to be bool
// 2 = should be a number
// 3 = row and columns lengths don't match
// 4 = no editable columns
// 5 = column names don't match
export interface ErrorMessage {
    column: number,
    status: number
}

function isAllDigits(str: string): boolean {
    return /^\d+$/.test(str) || str == "";
}

export function evaluateRow(row: input[], columns: Column[]): true | ErrorMessage {

    if (columns.length == 0) return { column: -1, status: 4 }

    if (columns.length != row.length) return { column: -1, status: 3 }
    if (!columns.every((c, i) => c.name == row[i]!.name)) return { column: -1, status: 5 }

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i]!
        const value = row[i]!.val

        if (!column.canBeEmpty && value == "") {
            return { column: i, status: 0 }
        }

        if (column.type == "bool") {
            if (value != "true" && value != "false") {
                return { column: i, status: 1 }
            }
        } else if (column.type == "serial") {
            if (!isAllDigits(value)) {
                return { column: i, status: 2 }
            }
        }
    }
    return true
}


// export interface UserRegister {
//     name: string,
//     password: string
//     association: string
//     phoneNumber: string
// }

// export interface UserLogin {
//     name: string,
//     password: string
// }

// export interface LoginResult {
//     success: string,
//     token: string
// }

export interface UserInfo {
    id: string
    name: string,
    email: string
    association: string,
    phoneNumber: string,
    role: role
    verified: boolean
    comment: string
}

export function newUserInfo(): UserInfo {
    return {
        id: "",
        name: "",
        email: "",
        association: "",
        phoneNumber: "",
        role: "viewer",
        verified: false,
        comment: ""
    }
}

export interface InitUser {
    phone: string,
    asso: string,
}

export function getTime() {
    const d = new Date();

    return `${String(d.getHours()).padStart(2, "0")}:` +
        `${String(d.getMinutes()).padStart(2, "0")}:` +
        `${String(d.getSeconds()).padStart(2, "0")}:` +
        `${String(d.getMilliseconds()).padStart(3, "0")}`;
}