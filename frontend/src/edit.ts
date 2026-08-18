import { useEffect, useState } from "react"
import { useInputForm, type InputForm } from "./inputForm"
import type { Column, EditRow, input, Row, role, UserInfo } from "@cipher-report/shared/types"
import { httpRequest } from "./client-auth"

export interface Edit {
    form: InputForm
    id: string
    changed: boolean
    role: role
    editColumns: Column[]
    updateEditId(row: Row, index: number): void
    reset(): void
}

export function useEdit(
    columns: Column[],
    send: (row: EditRow) => Promise<boolean>
): Edit {
    const [editColumns, setEditColumns] = useState<Column[]>([])
    const form = useInputForm(editColumns, sendEdit)
    const [id, setId] = useState("")
    const [changed, setChanged] = useState(false)
    const [role, setRole] = useState<role>("none")
    const [original, setOriginal] = useState<string[]>([])


    function checkIfChanged(): boolean {
        for (let i = 0; i < original.length; i++) {
            if (form.inputs[i] != original[i]) {
                return true
            }
        }
        return false
    }

    useEffect(() => {
        setChanged(checkIfChanged())
    }, [form.inputs])

    async function getUserRole() {
        const response = await httpRequest("app/user_info", {}, 'get')
        const userInfo: UserInfo | null = await response.json()
        if (userInfo) {
            return userInfo.role
        }
        return "none"
    }

    async function getEditableColumns(cols: string[]) {
        if (cols.length != columns.length) return {
            columns: [],
            inputs: [],
            indices: []
        }
        const role: role = await getUserRole()
        setRole(role)

        const pack = columns.map((c, i) => {
            return {
                column: c,
                val: cols[i],
                index: i
            }
        })

        const newPack = pack.filter((c) => {
            if (c.column.canEditRoles.length > 0) {
                return c.column.canEditRoles.includes(role) || c.column.canEditRoles[0] == "any"
            }
            return false
        })

        return {
            columns: newPack.map((c) => c.column),
            inputs: newPack.map((c) => c.val),
            indices: newPack.map((c) => c.index)
        }
    }

    async function updateEditId(row: Row, index: number) {
        const pack = await getEditableColumns(row.columns)
        if (pack.columns.length == 0) return
        setEditColumns(pack.columns)
        form.setInputs(pack.inputs)
        setOriginal(pack.inputs)
        setId(row.id)
        form.setPointer(Math.max(pack.indices.indexOf(index), 0))
        setChanged(false)
    }

    async function sendEdit(inputs: input[]) {
        if (!changed)
            return
        const result = await send({ id, columns: inputs })
        if (result) {
            reset()
        }
    }

    function reset() {
        setId("")
        form.setFocused(false)
        setChanged(false)
    }


    return {
        form,
        id,
        changed,
        role,
        editColumns,
        updateEditId,
        reset
    }
}