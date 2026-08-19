import { evaluateRow, newInput, type Column, type input } from "@cipher-report/shared/types"
import { useState } from "react"
import type { Table } from "./table"

export interface InputForm {
    inputs: string[]
    options: string[]
    message: string
    legal: boolean
    pointer: number
    sendButtonOn: boolean
    focused: boolean
    fields: Column[]
    updateInput(index: number, newName: string): void
    updateOptions(table: Table): void
    checkInput(): void
    setPointer: React.Dispatch<React.SetStateAction<number>>
    handleEnter(key: string, ctrl: boolean): void
    setInputsEmpty(cols: Column[]): void
    setInputs: React.Dispatch<React.SetStateAction<string[]>>
    setSendButtonOn: React.Dispatch<React.SetStateAction<boolean>>
    setFocused: React.Dispatch<React.SetStateAction<boolean>>
    pressButton(): void
    getSelectOptions(index: number): string[]
}

export function useInputForm(fields: Column[], send: (inputs: input[],) => void): InputForm {
    const [inputs, setInputs] = useState<string[]>(fields.map(() => ""))
    const [options, setInputOptions] = useState<string[]>([])
    const [pointer, setPointer] = useState(-1)
    const [message, setMessage] = useState("")
    const [legal, setLegal] = useState(true)
    const [sendButtonOn, setSendButtonOn] = useState(false)
    const [focused, setFocused] = useState(false)

    function setInputsEmpty(cols: Column[]) {
        let array = cols.map(() => "")
        for (let i = 0; i < cols.length; i++) {
            if (cols[i].type == "bool") {
                array[i] = "false"
            }
        }
        setInputs(array)
    }

    function updateInput(index: number, newVal: string) {
        setInputs(prev =>
            prev.map((c, i) =>
                i === index ? newVal : c
            )
        );
    }

    function getSelectOptions(index: number) {
        return fields[index].options
    }

    function updateOptions(table: Table) {
        if (pointer >= 0 && pointer < inputs.length) {
            const name = fields[pointer].name
            const index = table.columns.findIndex((c) => c.name == name)
            const str = inputs[pointer]
            const options = new Set(
                [
                    ...table.rows.map(v => v.columns[index]),
                    ...table.columns[index].options
                ].filter(v => v?.includes(str) && v != "")
            )
            setInputOptions([...options])
        }
    }

    function genInputs(inputs: string[]): input[] {
        if (inputs.length != fields.length) return []
        return fields.map((c, i) => newInput(c.name, inputs[i]))
    }

    function checkInput() {
        const result = evaluateRow(genInputs(inputs), fields)
        if (result === true) {
            setMessage("הכל תקין")
            setLegal(true)
            return true
        } else {
            switch (result.status) {
                case 0: setMessage(`${fields[result.column].uiName} צריך להיות מלא`); break
                case 2: setMessage(`${fields[result.column].uiName} צריך להיות רק מספרים`); break
            }
            setLegal(false)
            return false
        }
    }

    function handleEnter(key: string, ctrl: boolean) {
        const result = checkInput()

        if (key == "Enter") {
            if (ctrl) {
                if (pointer > 0)
                    setPointer(pointer - 1)
            } else {
                if (sendButtonOn) {
                    send(genInputs(inputs))
                    setSendButtonOn(false)
                } else if (pointer + 1 == inputs.length && result) {
                    setPointer(Math.min(pointer + 1, inputs.length))
                    setSendButtonOn(true)
                } else {
                    setPointer(Math.min(pointer + 1, inputs.length))
                }
            }
        }
    }

    function pressButton() {
        if (checkInput()) {
            send(genInputs(inputs))
            setSendButtonOn(false)
        }
    }


    return {
        inputs,
        options,
        message,
        legal,
        pointer,
        sendButtonOn,
        focused,
        fields,
        updateInput,
        updateOptions,
        checkInput,
        setPointer,
        handleEnter,
        setInputsEmpty,
        setInputs,
        setSendButtonOn,
        setFocused,
        pressButton,
        getSelectOptions,
    }
}