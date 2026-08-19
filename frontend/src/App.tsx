import { useEffect } from "react"
import { AppBody } from "./AppBody"
import { useApp } from "./context"
import { Login } from "./SignScreen"
import type { State } from "./state"
import { httpRequest } from "./client-auth"

async function testUser(state: State) {
  const response = await httpRequest("app/user_info", {}, 'get')
  if (response.status === 401) {
    state.loggedIn.set(false)
  } else {
    state.loggedIn.set(true)
  }
}

export default function App() {
  const state = useApp()


  useEffect(() => {
    testUser(state)
  }, [])

  return (
    <div>
      {state.loggedIn.val
        ? <AppBody></AppBody>
        : <Login></Login>
      }
    </div>
  )
}
