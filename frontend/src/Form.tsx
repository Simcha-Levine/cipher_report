import { useApp } from './context'
import { useEffect, useRef, useState } from 'react'
import vb from "./assets/vb.svg";
import type { InputForm } from './inputForm';



function CheckBox({ index, input, id }: { index: number, input: InputForm, id: string }) {
    const state = useApp()

    const [focused, setFocused] = useState(false)

    let ref = useRef<(HTMLDivElement | null)>(null);

    useEffect(() => {
        if (input.pointer == index) {
            ref.current?.focus()
            setFocused(true)
            input.updateOptions(index, state.devices)
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

function TextInput({ index, input, id }: { index: number, input: InputForm, id: string }) {

    const state = useApp()

    let ref = useRef<(HTMLInputElement | null)>(null);

    useEffect(() => {
        if (input.pointer == index) {
            ref.current?.focus()
            input.updateOptions(index, state.devices)
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


export function Form({ formType, show }: { formType: string, show: boolean }) {

    const state = useApp()
    const input = (formType == "insert") ? state.insertForm : state.edit.form

    useEffect(() => {
        if (formType === 'insert' && input.focused) {
            input.setPointer(0)
            input.updateOptions(0, state.devices)
        }
    }, [state.devices]);

    useEffect(() => {
        input.checkInput()
        input.updateOptions(input.pointer, state.devices)
    }, [input.inputs, input.pointer]);


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
                            state.edit.reset()
                        }
                    }
                }}
            >
                {
                    state.columns.map((_, index) => (
                        <td key={index} className={formType == "insert" ? 'sticky' : ''}>
                            {
                                (state.columns[index].type == 'bool')
                                    ?
                                    (<CheckBox id={`${formType}-form`} index={index} input={input}></CheckBox>)
                                    :
                                    (<TextInput id={`${formType}-form`} index={index} input={input}></TextInput>)
                            }
                        </td>
                    )).reverse()
                }
            </tr >
        </>
    )
}

export function InputButton({ input, name, visible }: { input: InputForm, name: string, visible: boolean }) {
    const [focused, setFocused] = useState(false)

    const edit = useApp().edit

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

export function ReportDialog() {
    const state = useApp()

    if (!state.report.dialogOn)
        return

    return (
        <div
            className='back-drop v center'
            onKeyDown={(e) => {
                if (e.key == "Enter" && state.edit.form.sendButtonOn) {
                    state.report.updateDialogOn(false)
                    state.report.reportRef.current?.focus()
                }
            }}
        >
            <div className='h center'>
                <div className='dialog v center'>
                    <h3>וודא שהמידע עדכני</h3>
                    <Confirm></Confirm>
                </div>
            </div>
        </div >
    )
}

function Confirm() {
    const state = useApp()
    const input = state.edit.form

    useEffect(() => {
        input.checkInput()
        input.updateOptions(input.pointer, state.devices)
    }, [input.inputs, input.pointer]);

    return (
        <div className="v">
            {input.inputs.map((_, index) => (
                <div key={index}>
                    {state.columns[index].dynamic &&
                        <div className='confirm-input'>
                            <div>: {state.columns[index].uiName}</div>
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
