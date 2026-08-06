import type { Column } from "@cipher-report/shared/types"
import { useState } from "react"
import { authClient } from "./client-auth"
import { useInputForm, type InputForm } from "./inputForm"

type signType = "login" | "register"

export interface Sign {
    message: string
    signType: signType
    fields: Field[]
    form: InputForm
    setMessage: React.Dispatch<React.SetStateAction<string>>
    setSignType: React.Dispatch<React.SetStateAction<signType>>
}

export function useSign(
    setLoggedIn: (val: boolean) => void
): Sign {
    const [message, setMessage] = useState("")
    const [signType, setSignType] = useState<signType>("login")
    const loginForm = useInputForm(loginFields, send)
    const registerForm = useInputForm(registerFields, send)
    const fields = (signType == "login") ? loginFields : registerFields
    const form = (signType == "login") ? loginForm : registerForm

    async function send(inputs: string[]) {

        let result;

        if (signType == "login") {
            result = await authClient.signIn.email({
                email: inputs[0],
                password: inputs[1],
            });
        } else {
            result = await authClient.signUp.email({
                name: inputs[0],
                email: inputs[1],
                password: inputs[inputs.length - 1]
            })
        }

        if (result.error) {
            setMessage((result.error.message) ?? "")
        } else {
            setLoggedIn(true)
        }
    }

    //sign in
    return {
        message,
        signType,
        fields,
        form,
        setMessage,
        setSignType,
    }
}

interface Field extends Column {
    isPassword: boolean
}

const loginFields: Field[] = [
    genField("email", ":אמיל", false),
    genField("password", ":סיסמה", true)
]

const registerFields: Field[] = [
    genField("name", ":שם", false),
    genField("email", ":אמיל", false),
    genField("phoneNumber", ":טלפון", false),
    genField("association", ":פלוגה", false),
    genField("password", ":סיסמה", true)
]

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

//permissions