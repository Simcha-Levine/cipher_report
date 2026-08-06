import { useEffect } from "react"
import { AppBody } from "./AppBody"
import { useApp } from "./context"
import { Login } from "./SignScreen"
import type { State } from "./state"

async function testUser(state: State) {
  const response = await state.httpRequest("app/user", {}, 'get')
  if (response.status === 401) {
    state.loggedIn.set(false)
  } else {
    state.loggedIn.set(true)
    const user: { name: string } = await response.json()
    console.log(user.name)
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
