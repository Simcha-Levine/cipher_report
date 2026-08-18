import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
});

export async function httpRequest(path: string, body: any, method: "post" | "get"): Promise<Response> {

    const fullPath = `http://localhost:3000/${path}`

    if (method == "post")
        return fetch(fullPath, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })
    else
        return fetch(fullPath, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
}