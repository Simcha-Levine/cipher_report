export interface Column {
    type: "serial" | "text" | "bool"
    name: string
    uiName: string
    canBeEmpty: boolean
    dynamic: boolean
}

export interface ColumnPack {
    device: Column[]
    user: Column[];
}

export interface Row {
    id: number
    columns: string[]
}

export interface UserRow {
    id: string
    columns: string[]
}


export interface ReportResult {
    success: boolean,
    message: string,
    id: number
}

// states
// 0 = cant be empty
// 1 = needs to be bool
// 2 = should be a number
// 3 = row and columns lengths don't match
export interface ErrorMessage {
    column: number,
    status: number
}

function isAllDigits(str: string): boolean {
    return /^\d+$/.test(str) || str == "";
}

export function evaluateRow(row: string[], columns: Column[]): true | ErrorMessage {

    if (columns.length != row.length) {
        return { column: -1, status: 3 }
    }

    for (let i = 0; i < columns.length; i++) {
        const column = columns[i]!
        const value = row[i]!

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
    role: string
    admin: boolean,
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
        role: "",
        admin: false,
        verified: false,
        comment: ""
    }
}

export interface InitUser {
    phone: string,
    asso: string,
}