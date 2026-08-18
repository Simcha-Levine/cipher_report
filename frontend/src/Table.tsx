
import { type Row } from '@cipher-report/shared/types';
import v from "./assets/v.svg";
import { useApp } from './context';
import { Form } from './Form';
import type { Table } from './table';


function UiRow({ row, index, table, greenIndex }: {
    row: Row,
    index: number,
    table: Table,
    greenIndex: number
}) {
    const state = useApp()
    const menu = state.rightClickMenu
    const select = table.select
    const columns = table.columns

    const isGreen = row.columns[greenIndex] == "true"

    let name = ""
    if (isGreen) {
        name = "green"
    }

    let selected = 'not-selected'
    if (menu.id == row.id || select.idList.has(row.id)) {
        selected = 'selected'
    }

    return (
        <tr
            className={`row ${selected}`}
            onMouseDown={(e) => {
                select.updateDragged(true, index)
                if (e.ctrlKey) {
                    select.toggle(row.id)
                } else if (e.button != 2 || !select.idList.has(row.id)) {
                    select.click(row.id)
                }
            }}
            onMouseMove={(e) => select.drag(index, e.ctrlKey)}
        >
            {
                row.columns.map((col, index) => (

                    <td
                        className={name}
                        key={index}
                        onContextMenu={(e) => {
                            e.preventDefault()
                            menu.setOn(e.clientX, e.clientY, row.id, index)
                            select.updateDragged(false, -1)
                        }}
                    >
                        {(columns[index].type == 'bool') ? (
                            col == "true" &&
                            <img src={v} alt="v" width={15} />
                        ) : (
                            <>
                                {(columns[index].name != "serial_number" ||
                                    state.tabMode != 'report' ||
                                    isGreen)
                                    ?
                                    col
                                    :
                                    ".".repeat(col.length)
                                }
                            </>
                        )}
                    </td>
                )).reverse()
            }
        </tr >
    )
}


function UiRows({ table }: { table: Table }) {
    const state = useApp()

    return (
        <>
            {table.getFiltered().map((row, index) => ((row.id == table.edit.id && !state.removeDialogOn.val)
                ?
                <Form table={table} key={row.id} formType='edit' show={true} row={row.columns}></Form>
                :
                < UiRow
                    key={row.id}
                    index={index}
                    row={row}
                    table={table}
                    greenIndex={table.green}
                />
            ))
            }
        </>
    )
}

export function UiTable({ table }: { table: Table }) {
    const tabMode = useApp().tabMode

    return (
        <div>
            <div className="table_box">
                <table id="table">
                    <thead>
                        <tr>
                            {
                                table.columns.map((header, index) => (
                                    <th key={`header${index}`}>
                                        <div className='h center header'>
                                            <div
                                                className='v center tri-wrap'
                                                onClick={() => table.updateSort(index)}>
                                                <div
                                                    className={(table.selected_header == index) ? 'tri-down' : 'tri-up'}></div>
                                            </div>
                                            <div className='header_name'>{header.uiName}</div>
                                        </div>
                                    </th>
                                )).reverse()
                            }
                        </tr>
                    </thead>

                    <tbody>
                        <UiRows table={table}></UiRows>
                        <Form table={table} formType='insert' show={tabMode == "add"} row={[]}></Form>
                    </tbody>
                </table>
            </div>
        </div >

    )
}
