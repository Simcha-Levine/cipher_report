import { useRef, useState } from "react"
import type { ReportResult } from "@cipher-report/shared/types";
import { httpRequest } from "./client-auth";
import type { Table } from "./table";

export interface Report {
    dialogOn: boolean,
    reportRef: React.RefObject<HTMLInputElement | null>
    updateDialogOn(state: boolean): void
    sendReport(serial: string): void
}

export function useReport(
    table: Table,
    updateSendState: (success: boolean, message: string) => void,
): Report {
    const [dialogOn, setDialogOn] = useState(false)
    const reportRef = useRef<(HTMLInputElement | null)>(null);

    function updateDialogOn(state: boolean) {
        setDialogOn(state)
    }

    function setReportDialog(id: string) {
        setDialogOn(true)
        let last = 0
        for (let i = table.columns.length - 1; i > 0; i--) {
            if (table.columns[i].canEditRoles.includes("reporter")) {
                last = i
                break
            }
        }
        const row = table.rows.find((d) => d.id == id)
        if (row) {
            table.edit.updateEditId(row, last)
            const index = table.columns.findIndex((e) => e.name == "reported")
            table.edit.form.updateInput(index, 'true')
        }
    }

    async function sendReport(serial: string) {
        updateSendState(true, "")

        const response = await httpRequest('app/report', serial, "post")


        const result: ReportResult = await response.json()
        if (result.message == "success") {
            updateSendState(true, `דווח בהצלחה ${serial} מכשיר`)
            setReportDialog(result.id)
        } else if (result.message == "error") {
            updateSendState(false, "ארעה תקלה")
        } else {
            updateSendState(false, `לא קיים במערכת ${serial} 'צ`)
        }
    }

    return {
        dialogOn,
        reportRef,
        updateDialogOn,
        sendReport,
    }
}