export interface Column {
    type: "serial" | "text" | "bool";
    name: string;
    uiName: string;
    canBeEmpty: boolean;
    dynamic: boolean;
}
export interface ColumnPack {
    device: Column[];
    user: Column[];
}
export interface Row {
    id: number;
    columns: string[];
}
export interface UserRow {
    id: string;
    columns: string[];
}
export interface ReportResult {
    success: boolean;
    message: string;
    id: number;
}
export interface ErrorMessage {
    column: number;
    status: number;
}
export declare function evaluateRow(row: string[], columns: Column[]): true | ErrorMessage;
export interface UserInfo {
    id: string;
    name: string;
    email: string;
    association: string;
    phoneNumber: string;
    role: string;
    admin: boolean;
    verified: boolean;
    comment: string;
}
export declare function newUserInfo(): UserInfo;
export interface InitUser {
    phone: string;
    asso: string;
}
//# sourceMappingURL=types.d.ts.map