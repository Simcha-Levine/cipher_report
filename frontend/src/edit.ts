import { useEffect, useState } from "react"
import { useInputForm, type InputForm } from "./inputForm"
import type { Column, Row } from "@cipher-report/shared/types"

export interface Edit {
    form: InputForm
    id: number
    changed: boolean
    updateEditId(row: Row, index: number): void
    reset(): void
}

export function useEdit(
    columns: Column[],
    updateSendState: (success: boolean, message: string) => void
): Edit {
    const form = useInputForm(columns, sendEdit)
    const [id, setId] = useState(-1)
    const [changed, setChanged] = useState(false)
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

    function updateEditId(row: Row, index: number) {
        form.setInputs(row.columns)
        setOriginal(row.columns)
        setId(row.id)
        form.setPointer(index)
        setChanged(false)
    }

    async function sendEdit(body: string[]) {
        updateSendState(true, "")

        const response = await fetch('http://localhost:3000/edit_device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, columns: body })
        })

        const message: string = await response.json()
        if (message == "success") {
            // loadDevices()
            updateSendState(true, "מכשיר שונה בהצלחה")
            reset()
        } else {
            updateSendState(false, "מכשיר עם הצ' הזה כבר קיים במערכת")

        }
    }

    function reset() {
        setId(-1)
        form.setFocused(false)
        setChanged(false)
    }


    return {
        form,
        id,
        changed,
        updateEditId,
        reset
    }
}