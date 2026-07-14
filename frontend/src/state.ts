import { useEffect, useState } from "react"
import type { Column, Row } from "@cipher-report/shared/types"
import { useInputForm, type InputForm } from "./inputForm"
import { useFilters, type Filters } from "./filters"
import { useEdit, type Edit } from "./edit"
import { useRemove, type Remove } from "./remove"

export interface State {
    columns: Column[]
    devices: Row[]
    sendMessage: string
    sendSuccess: boolean
    selected_header: number
    filters: Filters
    insertForm: InputForm
    edit: Edit
    remove: Remove
    mode: string
    loadColumns(): Promise<void>
    loadDevices(): Promise<void>
    updateSort(index: number): void
    updateMode(newMode: string): void
}

export function useAppState(): State {
    const [columns, setColumns] = useState<Column[]>([])
    const [devices, setDevices] = useState<Row[]>([])
    let [version, setVersion] = useState(-1)
    const [sendMessage, setSendMessage] = useState("")
    const [sendSuccess, setSendSuccess] = useState<boolean>(true)
    const [selected_header, setSelectedHeader] = useState<number>(8)
    const filters = useFilters()
    const insertForm = useInputForm(columns, sendInsert)
    const edit = useEdit(columns, updateSendState)
    const remove = useRemove(updateSendState)
    const [mode, setMode] = useState("list")

    useEffect(() => {
        loadDevices()
        const interval = setInterval(loadDevices, 1000);

        return () => clearInterval(interval);
    })

    function updateMode(newMode: string) {
        if (newMode != mode) {
            setMode(newMode)
            insertForm.setFocused(false)
            edit.reset()
        }
    }

    function updateSort(index: number) {
        setSelectedHeader(index)
        sortColumns(index)
    }

    function compareStrings(a: string, b: string) {
        if (a === "" && b === "") return 0;
        if (a === "") return 1;  // a goes after b
        if (b === "") return -1; // b goes after a

        return a.localeCompare(b);
    }

    function sortColumns(index: number) {
        setDevices(prev => [...prev].sort((a, b) => {
            return compareStrings(a.columns[index], b.columns[index])
        }))
    }

    async function loadColumns() {
        const response = await fetch('http://localhost:3000/columns', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const cols: Column[] = await response.json()
        await setColumns(cols)
        insertForm.setInputsEmpty(cols)
    }

    async function loadDevices() {
        try {
            const response = await fetch(`http://localhost:3000/devices?version=${version}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data: null | { version: number, devices: Row[] } = await response.json()
            if (data) {
                setVersion(data.version)
                setDevices(data.devices)
                sortColumns(selected_header)
            }
        } catch {
            console.log("nothing")
        }
    }


    async function sendInsert(body: string[]) {
        setSendMessage("")

        const response = await fetch('http://localhost:3000/insert_device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

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


    return {
        columns,
        devices,
        sendMessage,
        sendSuccess,
        selected_header,
        filters,
        insertForm,
        edit,
        remove,
        mode,
        loadColumns,
        loadDevices,
        updateSort,
        updateMode,
    }

}