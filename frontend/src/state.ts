import { useEffect, useState } from "react"
import type { Column, ColumnPack, Row } from "@cipher-report/shared/types"
import { useInputForm, type InputForm } from "./inputForm"
import { checkFilter, useFilters, type Filters } from "./filters"
import { useEdit, type Edit } from "./edit"
import { useRightClickMenu, type RightClickMenu } from "./rightClickMenu"
import { useSelect, type Select } from "./select"
import { useRemember, type Remember } from "./remember"
import { useReport, type Report } from "./report"


export interface State {
    deviceColumns: Column[],
    userColumns: Column[]
    devices: Row[]
    sendMessage: string
    sendSuccess: boolean
    selected_header: number
    filters: Filters
    insertForm: InputForm
    edit: Edit
    removeDialogOn: Remember<boolean>
    report: Report,
    rightClickMenu: RightClickMenu
    select: Select
    tabMode: string
    loggedIn: Remember<boolean>
    loadColumns(): Promise<void>
    loadDevices(): Promise<void>
    updateSort(index: number): void
    updateTabMode(newMode: string): void
    sendRemove(device: Row[]): void
    updateSendState(success: boolean, message: string): void
    getFiltered(): Row[]
    // setLoggedIn(val: boolean): void
    httpRequest(path: string, body: any, method: "post" | "get"): Promise<Response>
}

export function useAppState(): State {
    const [deviceColumns, setDeviceColumns] = useState<Column[]>([])
    const [userColumns, setUserColumns] = useState<Column[]>([])
    const [devices, setDevices] = useState<Row[]>([])
    const [version, setVersion] = useState(-1)
    const [sendMessage, setSendMessage] = useState("")
    const [sendSuccess, setSendSuccess] = useState<boolean>(true)
    const [selected_header, setSelectedHeader] = useState<number>(8)
    const filters = useFilters()
    const insertForm = useInputForm(deviceColumns, sendInsert)
    const edit = useEdit(deviceColumns, updateSendState, httpRequest)
    const rightClickMenu = useRightClickMenu()
    const select = useSelect(updateSendState, getFiltered, httpRequest)
    const [tabMode, setTabMode] = useState("list")
    const removeDialogOn = useRemember(false)
    const report = useReport(edit, deviceColumns, devices, updateSendState, httpRequest)
    const loggedIn = useRemember(true)


    //intervals
    useEffect(() => {
        if (!loggedIn.val) return

        loadDevices()
        const interval = setInterval(loadDevices, 1000);

        return () => clearInterval(interval);
    }, [loggedIn])

    function updateTabMode(newMode: string) {
        if (newMode != tabMode) {
            setTabMode(newMode)
            insertForm.setFocused(false)
            edit.reset()
        }
    }

    function getFiltered(): Row[] {
        return devices.filter((device => checkFilter(device.columns, filters)))
    }

    function updateSort(index: number) {
        setSelectedHeader(index)
        sortDevices(index)
    }

    function compareStrings(a: string, b: string, desc: boolean) {
        if (a === "" && b === "") return 0;
        if (a === "") return 1;  // a goes after b
        if (b === "") return -1; // b goes after a

        if (desc) return b.localeCompare(a)
        return a.localeCompare(b);
    }

    function sortDevices(index: number) {
        setDevices(prev => [...prev].sort((a, b) => {
            const desc =
                (a.columns[index] == "true" || a.columns[index] == "false") &&
                (b.columns[index] == "true" || b.columns[index] == "false")
            return compareStrings(a.columns[index], b.columns[index], desc)
        }))
    }

    async function loadColumns() {
        const response = await httpRequest('app/columns', {}, "get")

        const cols: ColumnPack = await response.json()
        await setDeviceColumns(cols.device)
        insertForm.setInputsEmpty(cols.device)

        setUserColumns(cols.user)
    }

    async function loadDevices() {
        try {
            const response = await httpRequest(`app/devices?version=${version}`, {}, "get")
            const data: null | { version: number, devices: Row[] } = await response.json()
            if (data) {
                setVersion(data.version)
                setDevices(data.devices)
                sortDevices(selected_header)
            }
        } catch {
            console.log("nothing")
        }
    }


    async function sendInsert(body: string[]) {
        setSendMessage("")
        const response = await httpRequest('app/insert_device', body, 'post')

        const message: string = await response.json()
        if (message == "success") {
            // loadDevices()
            setSendMessage("מכשיר הוסף בהצלחה")
            setSendSuccess(true)
        } else {
            setSendMessage("מכשיר עם הצ' הזה כבר קיים במערכת")
            setSendSuccess(false)
        }
    }

    function updateSendState(success: boolean, message: string) {
        setSendMessage(message)
        setSendSuccess(success)
    }

    async function sendRemove(devices: Row[]) {
        updateSendState(true, "")

        const response = await httpRequest('app/remove_devices', devices, 'post')

        const message: string = await response.json()
        if (message == "success") {
            updateSendState(true, "המכשירים הוסרו בהצלחה")
        } else {
            updateSendState(false, "ארעה תקלה")

        }
    }

    async function httpRequest(path: string, body: any, method: "post" | "get"): Promise<Response> {

        const fullPath = `http://localhost:3000/${path}`

        if (method == "post")
            return fetch(fullPath, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })
        else
            return fetch(fullPath, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
    }


    return {
        deviceColumns,
        userColumns,
        devices,
        sendMessage,
        sendSuccess,
        selected_header,
        filters,
        insertForm,
        edit,
        rightClickMenu,
        select,
        tabMode,
        removeDialogOn,
        report,
        loggedIn,
        loadColumns,
        loadDevices,
        updateSort,
        updateTabMode,
        sendRemove,
        updateSendState,
        getFiltered,
        httpRequest
    }

}
