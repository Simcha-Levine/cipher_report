//remember

import { useState } from "react"

export interface Remember<T> {
    val: T,
    set(val: T): void
}

export function useRemember<T>(nVal: T): Remember<T> {
    const [val, setVal] = useState<T>(nVal)

    function set(val: T) {
        setVal(val)
    }

    return {
        val,
        set
    }
}