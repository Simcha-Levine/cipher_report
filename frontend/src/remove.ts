import { useState } from "react"

export interface Remove {
    idList: Set<number>
    clickId(id: number): void
    reset(): void
    sendRemove(): void
}

export function useRemove(
    updateSendState: (success: boolean, message: string) => void
): Remove {

    const [idList, setIdList] = useState(new Set<number>)

    function clickId(id: number) {
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

    async function sendRemove() {
        updateSendState(true, "")

        const response = await fetch('http://localhost:3000/remove_devices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: [...idList] })
        })

        const message: string = await response.json()
        if (message == "success") {
            updateSendState(true, "המכשירים הוסרו בהצלחה")
            reset()
        } else {
            updateSendState(false, "ארעה תקלה")

        }
    }

    function reset() {
        setIdList(new Set<number>)
    }

    return {
        idList,
        clickId,
        reset,
        sendRemove,
    }
}