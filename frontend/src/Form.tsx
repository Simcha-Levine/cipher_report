import { useApp } from './context'
import { useEffect, useRef, useState } from 'react'
import vb from "./assets/vb.svg";
import type { InputForm } from './inputForm';
import type { Table } from './table';




function CheckBox({ index, input, id }: {
    index: number,
    input: InputForm,
    id: string,
}) {

    const [focused, setFocused] = useState(false)

    const ref = useRef<(HTMLDivElement | null)>(null);

    useEffect(() => {
        if (input.pointer == index) {
            ref.current?.focus()
            setFocused(true)
        }
    }, [input.pointer]);

    function onFocus() {
        setFocused(true)
        input.setPointer(index)
        if (index + 1 < input.inputs.length) {
            input.setSendButtonOn(false)
        }
    }

    function change() {
        if (input.inputs[index] == 'true') {
            input.updateInput(index, "false")
        } else {
            input.updateInput(index, "true")
        }
    }

    return (
        <div
            id={id}
            className='h center check-con'
            tabIndex={0}
            ref={(e) => { ref.current = e }}
            onFocus={onFocus}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
                e.preventDefault()

                if (e.code == "Space")
                    change()
                else
                    input.handleEnter(e.key, e.ctrlKey)
            }}
        >
            <div
                className={`check ${focused && 'focused'}`}
                onClick={change}
            >
                {input.inputs[index] == 'true' &&
                    < img src={vb} alt="v" width={15} />
                }
            </div>
        </div >
    )
}

function TextInput({ index, input, id }: {
    index: number,
    input: InputForm,
    id: string,
}) {
    let ref = useRef<(HTMLInputElement | null)>(null);

    useEffect(() => {
        if (input.pointer == index) {
            ref.current?.focus()
        }
    }, [input.pointer]);
    return (
        <>
            <input
                id={id}
                ref={(e) => { ref.current = e }}
                type="text"
                value={input.inputs[index]}
                onChange={(e) => input.updateInput(index, e.target.value)}
                placeholder="Enter"
                onFocus={() => {
                    input.setPointer(index)
                    if (index + 1 < input.inputs.length) {
                        input.setSendButtonOn(false)
                    }
                }}
                list='options'
                onKeyDown={(e) => input.handleEnter(e.key, e.ctrlKey)}
            />

            <datalist id="options" key={`options${index}`}>
                {input.options.map((v) => (
                    <option key={v} value={v} />
                ))}
            </datalist>
        </>
    )
}

function SelectInput({ index, input, id }: {
    index: number,
    input: InputForm,
    id: string,
}) {
    let ref = useRef<(HTMLSelectElement | null)>(null);
    const [focused, setFocused] = useState(false)

    const options = input.getSelectOptions(index)

    useEffect(() => {
        if (input.pointer == index) {
            ref.current?.focus()
        }
    }, [input.pointer]);

    return (
        <select
            className={`form-select ${focused && 'focused'}`}
            id={id}
            ref={(e) => { ref.current = e }
            }
            value={input.inputs[index]}
            onChange={(e) => input.updateInput(index, e.target.value)}
            onFocus={() => {
                setFocused(true)
                input.setPointer(index)
                if (index + 1 < input.inputs.length) {
                    input.setSendButtonOn(false)
                }
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => input.handleEnter(e.key, e.ctrlKey)}
        >
            {
                options.map((v) => (
                    <option key={v} value={v}>{v}</option>
                ))
            }
        </select >
    )
}

function NormalCell({ value, isBool }: { value: string, isBool: boolean }) {
    return <div
        tabIndex={0}
    >
        {(isBool) ? (
            value == "true" &&
            <img src={vb} alt="v" width={15} />
        ) : (
            <>
                {value}
            </>
        )}
    </div>
}


export function Form({ formType, show, table, row }: {
    formType: string,
    show: boolean,
    table: Table,
    row: string[]
}) {
    const input = (formType == "insert") ? table.insertForm : table.edit.form

    // useEffect(() => {
    //     if (formType == "edit" && table.edit.editColumns.length == 0)
    //         table.edit.reset()
    // }, []);

    useEffect(() => {
        if (formType === 'insert' && input.focused) {
            input.setPointer(0)
            input.updateOptions(table)
        }
    }, [table.rows]);

    useEffect(() => {
        input.checkInput()
        input.updateOptions(table)
    }, [input.inputs, input.pointer]);

    let inputIndex = 0

    return (
        <>
            <tr
                className={`bottom_bar ${!show && 'hidden-row'}`}
                onFocus={() => {
                    input.setFocused(true)
                }}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        input.setFocused(false)
                        input.setSendButtonOn(false)
                        if (formType == 'edit' && e.relatedTarget?.id != "input_button") {
                            table.edit.reset()
                        }
                    }
                }}
            >
                {
                    table.columns.map((column, index) => (
                        <td key={index} className={formType == "insert" ? 'sticky' : ''}>
                            {
                                (formType == 'insert' ||
                                    column.canEditRoles.includes(table.edit.role) ||
                                    column.canEditRoles[0] == "any")
                                    ?
                                    (table.columns[index].type == 'bool')
                                        ?
                                        (<CheckBox id={`${formType}-form`} index={inputIndex++} input={input}></CheckBox>)
                                        : (table.columns[index].type == 'select')
                                            ? (<SelectInput id={`${formType}-form`} index={inputIndex++} input={input}></SelectInput>)
                                            : (<TextInput id={`${formType}-form`} index={inputIndex++} input={input}></TextInput>)
                                    :
                                    <NormalCell value={row[index]} isBool={table.columns[index].type == 'bool'}></NormalCell>
                            }
                        </td>
                    )).reverse()
                }
            </tr>
        </>
    )
}

export function InputButton({ input, name, visible, table }: {
    input: InputForm,
    name: string,
    visible: boolean,
    table: Table
}) {
    const [focused, setFocused] = useState(false)

    const edit = table.edit

    return (
        <div
            id='input_button'
            tabIndex={0}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
                setFocused(false)
                if (e.relatedTarget?.id != "edit-form") {
                    edit.reset()
                }
            }}>
            <div className={(input.focused || focused) && visible ? '' : 'hidden'}>
                <div className={input.legal ? 'success' : 'error'}>{input.message}</div>

                <div className='h center'>
                    <div
                        className={`
                            button
                            ${(input.sendButtonOn) && 'focused'}
                            ${!input.legal && 'hidden'}
                            `}
                        onClick={() => { input.pressButton() }}
                    >
                        {name}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ReportDialog({ table }: { table: Table }) {
    const state = useApp()

    if (!state.report.dialogOn)
        return

    return (
        <div
            className='back-drop v center'
            onKeyDown={(e) => {
                if (e.key == "Enter" && table.edit.form.sendButtonOn) {
                    state.report.updateDialogOn(false)
                    state.report.reportRef.current?.focus()
                }
            }}
        >
            <div className='h center'>
                <div className='dialog v center'>
                    <h3>וודא שהמידע עדכני</h3>
                    <Confirm table={table}></Confirm>
                </div>
            </div>
        </div >
    )
}

function Confirm({ table }: { table: Table }) {
    const state = useApp()
    const input = table.edit.form

    useEffect(() => {
        input.checkInput()
        input.updateOptions(table)
    }, [input.inputs, input.pointer]);

    return (
        <div className="v">
            {input.inputs.map((_, index) => (
                <div key={index}>
                    {table.columns[index].canEditRoles.includes("reporter") &&
                        <div className='confirm-input'>
                            <div>: {table.columns[index].uiName}</div>
                            <TextInput id={`confirm-form`} index={index} input={input}></TextInput>
                        </div>
                    }
                </div>
            ))
            }
            <div className={input.legal ? 'success' : 'error'}>{input.message}</div>
            <div className='h center'>
                <div
                    className={`button ${(input.sendButtonOn) && 'focused'}`}
                    onClick={() => {
                        input.pressButton()
                        state.report.updateDialogOn(false)
                        state.report.reportRef.current?.focus()
                    }}
                >
                    מעודכן
                </div>
            </div>
        </div>
    )
}
