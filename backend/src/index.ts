import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { editDevice, getDevices, insertNewDevice, login, removeDevice, report, version } from './queries.js'
import { cors } from "hono/cors"
import type { Column, Row, UserLogin } from '@cipher-report/shared/types'
import { jwt, sign } from 'hono/jwt'
import type { SignatureKey } from 'hono/utils/jwt/jws'

export const columns: Column[] = [
  {
    type: 'bool',
    name: 'reported',
    uiName: 'דווח',
    canBeEmpty: false,
    dynamic: false,
  },
  {
    type: 'text',
    name: 'device_name',
    uiName: 'שם מכשיר',
    canBeEmpty: false,
    dynamic: false,
  },
  {
    type: 'serial',
    name: 'serial_number',
    uiName: "'צ",
    canBeEmpty: false,
    dynamic: false,
  },
  {
    type: 'text',
    name: 'association',
    uiName: 'שיוך',
    canBeEmpty: false,
    dynamic: true,
  },
  {
    type: 'text',
    name: 'assignment',
    uiName: 'יעוד',
    canBeEmpty: false,
    dynamic: true,
  },
  {
    type: 'text',
    name: 'location',
    uiName: 'מיקום',
    canBeEmpty: true,
    dynamic: true,
  },
  {
    type: 'serial',
    name: 'vehicle_serial_number',
    uiName: "צ' רכב",
    canBeEmpty: true,
    dynamic: true,
  },

  {
    type: 'serial',
    name: 'connected_device',
    uiName: "מכשיר מחובר",
    canBeEmpty: true,
    dynamic: true,
  },
  {
    type: 'text',
    name: 'comments',
    uiName: 'הערות',
    canBeEmpty: true,
    dynamic: true,
  },


]

const app = new Hono()
app.use("*", cors())

const JWT_SECRET = process.env.JWT_SECRET!;

app.use(
  "/app/*",
  jwt({ secret: JWT_SECRET, alg: "HS256" })
);

app.post('/login', async (c) => {
  const body = await c.req.json<UserLogin>();
  const result = await login(body)

  console.log("first" + JWT_SECRET)

  if (result.success == "success" && result.id != -1) {
    const token = await sign({
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
      id: result.id
    }, JWT_SECRET)

    return c.json({ success: result.success, token: token })
  }
  return c.json({ success: result.success, token: "" })
})

app.get('/app/columns', async (c) => {
  return c.json(columns)
})

app.get('/app/devices', async (c) => {
  const uv = Number(c.req.query("version"));

  if (uv != version) {
    return c.json({
      version,
      devices: await getDevices()
    })
  } else {
    return c.json(null)
  }

})

app.post("/app/insert_device", async (c) => {
  const body = await c.req.json<string[]>();

  const result = await insertNewDevice(body)

  return c.json(result)
})

app.post("/app/edit_device", async (c) => {
  const body = await c.req.json<Row>();
  const result = await editDevice(body)
  return c.json(result)
})

app.post("/app/report", async (c) => {
  const body = await c.req.json<string>();
  const result = await report(body)
  return c.json(result)
})

app.post("/app/remove_device", async (c) => {
  const body = await c.req.json<Row>();
  const result = await removeDevice(body)
  return c.json(result)
})

app.post("/app/remove_devices", async (c) => {
  const body = await c.req.json<Row[]>();

  let val = "success"
  for (const row of body) {
    const result = await removeDevice(row)
    if (result == "error") {
      val = "error"
    }
  }

  return c.json(val)
})



serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})