import type { Column, Row } from "@cipher-report/shared/types"
import { checkFilter, useFilters, type Filters } from "./filters"
import { useInputForm, type InputForm } from "./inputForm"
import { useEdit, type Edit } from "./edit"
import { useState } from "react"
import { useSelect, type Select } from "./select"
import type { TableRequests } from "./requestsProfiles"

export interface Table {
    columns: Column[]
    rows: Row[]
    selected_header: number
    filters: Filters
    select: Select
    insertForm: InputForm
    edit: Edit
    requests: TableRequests
    green: number
    loadRows(): void
    updateSort(index: number): void
    getFiltered(): Row[]
    updateColumns(columns: Column[]): void
    reset(): void
}

export function useTable(
    requests: TableRequests,
    green: number
): Table {
    const [columns, setColumns] = useState<Column[]>([])
    const [rows, setRows] = useState<Row[]>([])
    const [selected_header, setSelectedHeader] = useState<number>(0)
    const filters = useFilters()
    const select = useSelect(getFiltered)
    const insertForm = useInputForm(columns, requests.sendInsert)
    const edit = useEdit(columns, requests.sendEdit)

    function updateColumns(columns: Column[]) {
        setColumns(columns)
        insertForm.setInputsEmpty(columns)
    }

    function compareStrings(a: string, b: string, desc: boolean) {
        if (a === "" && b === "") return 0;
        if (a === "") return 1;  // a goes after b
        if (b === "") return -1; // b goes after a

        if (desc) return b.localeCompare(a)
        return a.localeCompare(b);
    }

    function sortRows(index: number) {
        setRows(prev => [...prev].sort((a, b) => {
            const desc =
                (a.columns[index] == "true" || a.columns[index] == "false") &&
                (b.columns[index] == "true" || b.columns[index] == "false")
            return compareStrings(a.columns[index], b.columns[index], desc)
        }))
    }

    async function loadRows() {
        const newRows = await requests.loadRows()
        if (newRows) {
            setRows(newRows)
            sortRows(selected_header)
        }
    }

    function updateSort(index: number) {
        setSelectedHeader(index)
        sortRows(index)
    }

    function getFiltered(): Row[] {
        return rows.filter((device => checkFilter(device.columns, filters)))
    }

    function reset() {
        insertForm.setFocused(false)
        edit.reset()
    }


    return {
        columns,
        rows,
        selected_header,
        filters,
        select,
        insertForm,
        edit,
        requests,
        green,
        loadRows,
        updateSort,
        getFiltered,
        updateColumns,
        reset,
    }
}