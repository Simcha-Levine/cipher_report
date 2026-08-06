import type { Row } from "@cipher-report/shared/types"
import { useEffect, useState } from "react"

export interface Select {
    idList: Set<number>
    click(id: number): void
    reset(): void
    sendRemove(): void
    updateDragged(newDragged: boolean, index: number): void
    drag(index: number, ctrl: boolean): void
    toggle(id: number): void
}

export function useSelect(
    updateSendState: (success: boolean, message: string) => void,
    getFiltered: () => Row[],
    httpRequest: (path: string, body: any, method: "post" | "get") => Promise<Response>
): Select {

    const [idList, setIdList] = useState(new Set<number>)
    const [dragged, setDragged] = useState(false)
    const [dragStartIndex, setDragStartIndex] = useState(-1)

    useEffect(() => {
        document.addEventListener('keydown', (e) => {
            if (e.key == 'Escape') {
                reset()
            }
        })
    }, [])


    function updateDragged(newDragged: boolean, index: number) {
        setDragged(newDragged)
        setDragStartIndex(index)
    }

    function drag(index: number, ctrl: boolean) {
        if (dragged) {
            window.getSelection()?.removeAllRanges();

            const start = Math.min(dragStartIndex, index);
            const end = Math.max(dragStartIndex, index);

            const ids = getFiltered().slice(start, end + 1).map(device => device.id)
            if (ctrl) {
                setIdList(prev => new Set([...prev, ...ids]))
            } else {
                setIdList(new Set(ids))
            }
        }
    }

    function addId(id: number) {
        setIdList(prev => {
            const next = new Set(prev)
            next.add(id)
            return next;
        })
    }

    function toggle(id: number) {
        setIdList(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next;
        })
    }

    function click(id: number) {
        setIdList(new Set())
        addId(id)
    }

    async function sendRemove() {
        updateSendState(true, "")

        const response = await httpRequest('app/remove_devices', { ids: [...idList] }, 'post')


        const message: string = await response.json()
        if (message == "success") {
            updateSendState(true, "המכשירים הוסרו בהצלחה")
            reset()
        } else {
            updateSendState(false, "ארעה תקלה")

        }
    }

    function reset() {
        setIdList(new Set())
    }

    return {
        idList,
        click,
        reset,
        sendRemove,
        updateDragged,
        drag,
        toggle,
    }
}