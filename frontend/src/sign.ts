import type { Column, InitUser, input } from "@cipher-report/shared/types"
import { useState } from "react"
import { authClient, httpRequest } from "./client-auth"
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
    setLoggedIn: (val: boolean) => void,
): Sign {
    const [message, setMessage] = useState("")
    const [signType, setSignType] = useState<signType>("login")
    const loginForm = useInputForm(loginFields, send)
    const registerForm = useInputForm(registerFields, send)
    const fields = (signType == "login") ? loginFields : registerFields
    const form = (signType == "login") ? loginForm : registerForm

    async function send(inputs: input[]) {

        let result;

        if (signType == "login") {
            result = await authClient.signIn.email({
                email: inputs[0].val,
                password: inputs[1].val,
            });
        } else {
            result = await authClient.signUp.email({
                name: inputs[0].val,
                email: inputs[1].val,
                password: inputs[4].val
            })

        }

        if (result.error) {
            setMessage((result.error.message) ?? "")
        } else {
            setLoggedIn(true)
            if (signType == "register") {
                const body: InitUser = { phone: inputs[2].val, asso: inputs[3].val }
                httpRequest("app/init_user", body, "post")
            }
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
        isPassword,
        canEditRoles: [],
        options: []
    }
}

//permissions