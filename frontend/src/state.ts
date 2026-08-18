import { useEffect, useState } from "react"
import type { ColumnPack } from "@cipher-report/shared/types"
import { useRightClickMenu, type RightClickMenu } from "./rightClickMenu"
import { useRemember, type Remember } from "./remember"
import { useReport, type Report } from "./report"
import { useTable, type Table } from "./table"
import { httpRequest } from "./client-auth"
import { useDeviceRequest, useUsersRequest } from "./requestsProfiles"


export interface State {
    devices: Table
    users: Table
    sendMessage: string
    sendSuccess: boolean
    removeDialogOn: Remember<boolean>
    report: Report,
    rightClickMenu: RightClickMenu
    tabMode: string
    loggedIn: Remember<boolean>
    loadColumns(): Promise<void>
    updateTabMode(newMode: string): void
    updateSendState(success: boolean, message: string): void
    getCurrentTable(): Table
}

export function useAppState(): State {
    const devices: Table = useTable(useDeviceRequest(updateSendState), 0)
    const users: Table = useTable(useUsersRequest(updateSendState), 6)
    const [sendMessage, setSendMessage] = useState("")
    const [sendSuccess, setSendSuccess] = useState<boolean>(true)
    const rightClickMenu = useRightClickMenu()
    const [tabMode, setTabMode] = useState("list")
    const removeDialogOn = useRemember(false)
    const report = useReport(devices, updateSendState)
    const loggedIn = useRemember(true)

    //intervals
    useEffect(() => {
        if (!loggedIn.val) return

        getCurrentTable().loadRows()
        const interval = setInterval(getCurrentTable().loadRows, 1000);

        return () => clearInterval(interval);
    }, [loggedIn])

    function updateTabMode(newMode: string) {
        if (newMode != tabMode) {
            setTabMode(newMode)
            devices.reset()
            users.reset()
        }
    }

    async function loadColumns() {
        const response = await httpRequest('app/columns', {}, "get")

        const cols: ColumnPack = await response.json()
        devices.updateColumns(cols.device)
        users.updateColumns(cols.user)
    }

    function updateSendState(success: boolean, message: string) {
        setSendMessage(message)
        setSendSuccess(success)
    }

    function getCurrentTable() {
        if (tabMode == "users") {
            return users
        }
        return devices
    }

    return {
        devices,
        users,
        sendMessage,
        sendSuccess,
        rightClickMenu,
        tabMode,
        removeDialogOn,
        report,
        loggedIn,
        loadColumns,
        updateTabMode,
        updateSendState,
        getCurrentTable,
    }

}
