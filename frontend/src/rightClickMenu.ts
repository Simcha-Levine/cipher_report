import { useState } from "react"

export interface RightClickMenu {
    isOn: boolean
    pos: { x: number, y: number }
    id: string
    colIndex: number
    setOn(top: number, left: number, id: string, index: number): void
    setOff(): void
}

export function useRightClickMenu(): RightClickMenu {
    const [id, setId] = useState("")
    const [colIndex, setColIndex] = useState(-1)
    const [isOn, setIsOn] = useState(false)
    const [pos, setPos] = useState({ x: 0, y: 0 })

    function setOn(x: number, y: number, id: string, index: number) {
        setIsOn(true)
        setPos({ x, y })
        setId(id)
        setColIndex(index)
    }

    function setOff() {
        setIsOn(false)
        setId("")
    }

    return {
        isOn,
        pos,
        id,
        colIndex,
        setOn,
        setOff,
    }
}