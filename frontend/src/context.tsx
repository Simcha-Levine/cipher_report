import { createContext, useContext } from "react"
import type { State } from "./state"
import { useAppState } from "./state"

const AppStateContext = createContext<State | null>(null)

export function useApp() {
    const context = useContext(AppStateContext)
    if (!context) {
        throw new Error(
            "AppStateProvider missing"
        )
    }
    return context
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {

    const state = useAppState()

    return (
        <AppStateContext.Provider value={state} >
            {children}
        </AppStateContext.Provider>
    )
}