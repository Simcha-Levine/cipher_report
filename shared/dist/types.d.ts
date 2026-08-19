export type role = "editor" | "reporter" | "viewer" | "admin" | "any" | "none";
export type input = {
    name: string;
    val: string;
};
export declare function newInput(name: string, val: string): input;
export interface Column {
    type: "serial" | "text" | "bool" | "select";
    name: string;
    uiName: string;
    canBeEmpty: boolean;
    canEditRoles: role[];
    options: string[];
}
export interface ColumnPack {
    device: Column[];
    user: Column[];
}
export interface TableRows {
    version: number;
    rows: Row[];
}
export interface Row {
    id: string;
    columns: string[];
}
export interface EditRow {
    id: string;
    columns: input[];
}
export interface UserRow {
    id: string;
    columns: string[];
}
export interface ReportResult {
    success: boolean;
    message: string;
    id: string;
}
export interface ErrorMessage {
    column: number;
    status: number;
}
export declare function evaluateRow(row: input[], columns: Column[]): true | ErrorMessage;
export interface UserInfo {
    id: string;
    name: string;
    email: string;
    association: string;
    phoneNumber: string;
    role: role;
    verified: boolean;
    comment: string;
}
export declare function newUserInfo(): UserInfo;
export interface InitUser {
    phone: string;
    asso: string;
}
export declare function getTime(): string;
//# sourceMappingURL=types.d.ts.map