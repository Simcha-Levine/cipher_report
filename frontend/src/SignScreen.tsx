import { useEffect, useRef } from "react";
import { useApp } from "./context"
import { type InputForm } from "./inputForm";
import { useSign } from "./sign";

function LogInput({ form, index, isPassword }: { form: InputForm, index: number, isPassword: boolean }) {

    let ref = useRef<(HTMLInputElement | null)>(null);

    useEffect(() => {
        if (form.pointer == index) {
            ref.current?.focus()
        }
    }, [form.pointer]);

    return (
        <input
            ref={(e) => { ref.current = e }}
            type={isPassword ? 'password' : 'text'}
            value={form.inputs[index]}
            onChange={(e) => form.updateInput(index, e.target.value)}
            placeholder="Enter"
            onFocus={() => {
                form.setPointer(index)
                if (index + 1 < form.inputs.length) {
                    form.setSendButtonOn(false)
                }
            }}
            list='options'
            onKeyDown={(e) => form.handleEnter(e.key, e.ctrlKey)}
        />
    )
}

export function Login() {
    const state = useApp()
    const sign = useSign(state.loggedIn.set, state.httpRequest)

    useEffect(() => {
        sign.form.checkInput()
    }, [])


    return (
        <div className="main v center login">
            <h1>התחברות</h1>
            <div className="h center">
                <div className="v">

                    {sign.fields.map((e, i) => (
                        <div key={i} className="confirm-input">
                            <div>{e.uiName}</div>
                            <LogInput index={i} form={sign.form} isPassword={e.isPassword}></LogInput>
                        </div>
                    ))
                    }
                </div>
            </div>
            <div className={sign.form.legal ? 'success' : 'error'}>{sign.form.message}</div>
            <div className="h center">
                <div
                    className={`button ${(sign.form.sendButtonOn) && 'focused'}`}
                    onClick={() => {
                        sign.form.pressButton()
                    }}
                >
                    התחבר
                </div>
            </div>
            <div className="h center">
                <div
                    className={`button`}
                    onClick={() => {
                        if (sign.signType == "login")
                            sign.setSignType("register")
                        else
                            sign.setSignType("login")
                    }}
                >
                    {sign.signType == "login" ? 'הרשמה' : 'משתמש קיים'}
                </div>
            </div>
            <div className={'error'}>{sign.message}</div>
        </div>
    )
}