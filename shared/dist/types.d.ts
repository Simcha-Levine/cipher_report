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
//# sourceMappingURL=types.d.ts.map