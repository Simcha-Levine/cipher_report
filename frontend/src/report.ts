import { useRef, useState } from "react"
import type { Edit } from "./edit"
import type { Column, ReportResult, Row } from "@cipher-report/shared/types";

export interface Report {
    dialogOn: boolean,
    reportRef: React.RefObject<HTMLInputElement | null>
    updateDialogOn(state: boolean): void
    sendReport(serial: string): void
}

export function useReport(
    edit: Edit,
    columns: Column[],
    devices: Row[],
    updateSendState: (success: boolean, message: string) => void,
    httpRequest: (path: string, body: any) => Promise<Response>
): Report {
    const [dialogOn, setDialogOn] = useState(false)
    const reportRef = useRef<(HTMLInputElement | null)>(null);

    function updateDialogOn(state: boolean) {
        setDialogOn(state)
    }

    function setReportDialog(id: number) {
        setDialogOn(true)
        let last = 0
        for (let i = columns.length - 1; i > 0; i--) {
            if (columns[i].dynamic) {
                last = i
                break
            }
        }
        const row = devices.find((d) => d.id == id)
        if (row) {
            console.log(row)
            edit.updateEditId(row, last)
            const index = columns.findIndex((e) => e.name == "reported")
            edit.form.updateInput(index, 'true')
        }
    }

    async function sendReport(serial: string) {
        updateSendState(true, "")

        const response = await httpRequest('app/report', serial)


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