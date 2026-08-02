import { useEffect, useRef, useState } from "react";
import { AppBody } from "./AppBody"
import { useApp } from "./context"
import type { Column, LoginResult, UserLogin } from "@cipher-report/shared/types";
import { useInputForm, type InputForm } from "./inputForm";

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

interface Field extends Column {
  isPassword: boolean
}

function genField(name: string, uiName: string, isPassword: boolean): Field {
  return {
    type: "text",
    name,
    uiName,
    canBeEmpty: false,
    dynamic: false,
    isPassword
  }
}

function Login() {
  const state = useApp()

  const [message, setMessage] = useState("")

  const fields: Field[] = [
    genField("name", ":שם", false),
    genField("password", ":סיסמה", true)
  ]
  async function send(inputs: string[]) {

    const body: UserLogin = {
      name: inputs[0],
      password: inputs[1]
    }

    const response = await state.httpRequest('login', body)

    const message: LoginResult = await response.json()
    if (message.success == "success") {
      state.setLogin(message.token)
    } else {
      setMessage(message.success)
    }
  }

  const form = useInputForm(fields, send)

  useEffect(() => {
    form.checkInput()
  }, [])


  return (
    <div className="main v center login">
      <h1>התחברות</h1>
      {fields.map((e, i) => (
        <div key={i} className="confirm-input">
          <div>{e.uiName}</div>
          <LogInput index={i} form={form} isPassword={e.isPassword}></LogInput>
        </div>
      ))
      }
      <div className="h center">
        <div
          className={`button ${(form.sendButtonOn) && 'focused'}`}
          onClick={() => {
            form.pressButton()
          }}
        >
          התחבר
        </div>
      </div>
      <div className={form.legal ? 'success' : 'error'}>{form.message}</div>
      <div className={'error'}>{message}</div>
    </div>
  )
}

export default function App() {

  const state = useApp()

  return (
    <>
      {state.loggedIn.val
        ? <AppBody></AppBody>
        : <Login></Login>
      }
    </>
  )
}
