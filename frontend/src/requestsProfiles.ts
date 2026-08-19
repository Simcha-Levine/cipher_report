import { type EditRow, type input, type Row, type TableRows } from "@cipher-report/shared/types";
import { httpRequest } from "./client-auth";
import { useRef } from "react";

export interface TableRequests {
    loadRows(): Promise<Row[] | null>
    sendInsert(inputs: input[]): Promise<boolean>
    sendRemove(row: Row[]): Promise<boolean>
    sendEdit(row: EditRow): Promise<boolean>
    resetVersion(): void
}

export function useDeviceRequest(
    updateSendState: (success: boolean, message: string) => void,
): TableRequests {
    let version = useRef(-1)

    return {
        loadRows: async function () {
            try {
                const response = await httpRequest(`app/devices?version=${version.current}`, {}, "get")
                const data: null | TableRows = await response.json()
                if (data) {
                    version.current = data.version
                    return data.rows
                }
            } catch {
            }
            return null
        },

        sendInsert: async function (inputs: input[]) {
            updateSendState(true, "")
            const response = await httpRequest('app/insert_device', inputs, 'post')

            const message: string = await response.json()
            if (message == "success") {
                updateSendState(true, "מכשיר הוסף בהצלחה")
                return true
            } else {
                updateSendState(false, "מכשיר עם הצ' הזה כבר קיים במערכת")
                return false
            }
        },

        sendRemove: async function (rows: Row[]) {
            updateSendState(true, "")

            const response = await httpRequest('app/remove_devices', rows, 'post')

            const message: string = await response.json()
            if (message == "success") {
                updateSendState(true, "המכשירים הוסרו בהצלחה")
                return true
            } else {
                updateSendState(false, "ארעה תקלה")
                return false
            }
        },

        sendEdit: async function (row: EditRow) {
            updateSendState(true, "")
            const response = await httpRequest('app/edit_device', row, 'post')

            const message: string = await response.json()
            if (message == "success") {
                updateSendState(true, "מכשיר שונה בהצלחה")
                return true
            } else {
                updateSendState(false, "מכשיר עם הצ' הזה כבר קיים במערכת")
                return false
            }
        },
        resetVersion() {
            version.current = -1
        }
    }
}

export function useUsersRequest(
    updateSendState: (success: boolean, message: string) => void,
): TableRequests {
    let version = useRef(-1)

    return {
        loadRows: async function () {
            try {
                const response = await httpRequest(`app/users?version=${version.current}`, {}, "get")
                const data: null | TableRows = await response.json()
                if (data) {
                    version.current = data.version
                    return data.rows
                }
            } catch {
                console.log("nothing")
            }
            return null
        },

        sendInsert: async function (_: input[]) {
            updateSendState(false, "how even did you do that?")
            return false
        },

        sendRemove: async function (_: Row[]) {
            updateSendState(false, "not really supposed to do that")
            return false
        },

        sendEdit: async function (row: EditRow) {

            updateSendState(true, "")

            const response = await httpRequest('app/edit_user', row, 'post')

            const message: string = await response.json()
            if (message == "success") {
                updateSendState(true, "משתמש עודכן בהצלחה")
                return true
            } else {
                updateSendState(false, "ארעה תקלה")
                return false
            }
        },

        resetVersion() {
            version.current = -1
        }
    }
}