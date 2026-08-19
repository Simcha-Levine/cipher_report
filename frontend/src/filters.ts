import { useState } from "react"

export interface Filter {
    selected: number,
    str: string
}

export interface Filters {
    list: Filter[]
    addFilter(): void
    removeFilter(index: number): void
    updateFilterSelected(index: number, selected: number): void
    updateFilterString(index: number, filter: string): void
    clear(): void
}

export function useFilters(): Filters {

    const [list, setFilters] = useState<Filter[]>([])


    function addFilter() {
        setFilters(prev => [...prev, {
            selected: 1,
            str: ""
        }])
    }

    function removeFilter(index: number) {
        setFilters(prev =>
            prev.filter((_, i) => i !== index)
        );
    }

    function updateFilterSelected(index: number, selected: number) {
        setFilters(prev =>
            prev.map((item, i) =>
                i === index ? { selected, str: item.str } : item
            )
        );
    }

    function updateFilterString(index: number, filter: string) {
        setFilters(prev =>
            prev.map((item, i) =>
                i === index ? { selected: item.selected, str: filter } : item
            )
        );
    }

    function clear() {
        setFilters([])
    }

    return {
        list,
        addFilter,
        removeFilter,
        updateFilterSelected,
        updateFilterString,
        clear,
    }
}

export function checkFilter(device: string[], filters: Filters): boolean {
    for (const filter of filters.list) {
        if (!device[filter.selected].includes(filter.str)) {
            return false
        }
    }
    return true
}