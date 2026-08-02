export interface Column {
    type: "serial" | "text" | "bool";
    name: string;
    uiName: string;
    canBeEmpty: boolean;
    dynamic: boolean;
}
export interface Row {
    id: number;
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
export interface UserRegister {
    name: string;
    password: string;
    association: string;
    phoneNumber: string;
}
export interface UserLogin {
    name: string;
    password: string;
}
export interface LoginResult {
    success: string;
    token: string;
}
export interface UserData {
    id: number;
    name: string;
    association: string;
    phoneNumber: string;
    admin: boolean;
    authenticated: boolean;
}
//# sourceMappingURL=types.d.ts.map