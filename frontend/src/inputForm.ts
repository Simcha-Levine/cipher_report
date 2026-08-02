import { evaluateRow, type Column, type Row } from "@cipher-report/shared/types"
import { useState } from "react"

export interface InputForm {
    inputs: string[]
    options: string[]
    message: string
    legal: boolean
    pointer: number
    sendButtonOn: boolean
    focused: boolean
    updateInput(index: number, newName: string): void
    updateOptions(index: number, devices: Row[]): void
    checkInput(): void
    setPointer: React.Dispatch<React.SetStateAction<number>>
    handleEnter(key: string, ctrl: boolean): void
    setInputsEmpty(cols: Column[]): void
    setInputs: React.Dispatch<React.SetStateAction<string[]>>
    setSendButtonOn: React.Dispatch<React.SetStateAction<boolean>>
    setFocused: React.Dispatch<React.SetStateAction<boolean>>
    pressButton(): void
}

export function useInputForm(columns: Column[], send: (inputs: string[]) => void): InputForm {
    const [inputs, setInputs] = useState<string[]>(Array(columns.length).fill(""))
    const [options, setInputOptions] = useState<string[]>([])
    const [pointer, setPointer] = useState(-1)
    const [message, setMessage] = useState("")
    const [legal, setLegal] = useState(true)
    const [sendButtonOn, setSendButtonOn] = useState(false)
    const [focused, setFocused] = useState(false)

    function setInputsEmpty(cols: Column[]) {
        let array = Array(cols.length).fill("")
        for (let i = 0; i < cols.length; i++) {
            if (cols[i].type == "bool") {
                array[i] = "false"
            }
        }
        setInputs(array)
    }
    function updateInput(index: number, newName: string) {
        setInputs(prev =>
            prev.map((name, i) =>
                i === index ? newName : name
            )
        );
    }
    function updateOptions(index: number, devices: Row[]) {
        let str = inputs[index]
        const options = [...new Set(devices.map(v => v.columns[index]).filter(v => v?.includes(str) && v != ""))]
        setInputOptions(options)
    }
    function checkInput() {
        const result = evaluateRow(inputs, columns)
        if (result === true) {
            setMessage("הכל תקין")
            setLegal(true)
            return true
        } else {
            switch (result.status) {
                case 0: setMessage(`${columns[result.column].uiName} צריך להיות מלא`); break
                case 2: setMessage(`${columns[result.column].uiName} צריך להיות רק מספרים`); break
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
                    send(inputs)
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
            send(inputs)
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
        updateInput,
        updateOptions,
        checkInput,
        setPointer,
        handleEnter,
        setInputsEmpty,
        setInputs,
        setSendButtonOn,
        setFocused,
        pressButton
    }
}