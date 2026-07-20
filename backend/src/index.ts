import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { editDevice, getDevices, insertNewDevice, removeDevice, version } from './queries.js'
import { cors } from "hono/cors"
import type { Column, Row } from '@cipher-report/shared/types'

export const columns: Column[] = [
  {
    type: 'bool',
    name: 'reported',
    uiName: 'דווח',
    canBeEmpty: false,
  },
  {
    type: 'text',
    name: 'device_name',
    uiName: 'שם מכשיר',
    canBeEmpty: false,
  },
  {
    type: 'serial',
    name: 'serial_number',
    uiName: "'צ",
    canBeEmpty: false,
  },
  {
    type: 'text',
    name: 'association',
    uiName: 'שיוך',
    canBeEmpty: false,
  },
  {
    type: 'text',
    name: 'assignment',
    uiName: 'יעוד',
    canBeEmpty: false,
  },
  {
    type: 'text',
    name: 'location',
    uiName: 'מיקום',
    canBeEmpty: true,
  },
  {
    type: 'serial',
    name: 'vehicle_serial_number',
    uiName: "צ' רכב",
    canBeEmpty: true,
  },

  {
    type: 'serial',
    name: 'connected_device',
    uiName: "מכשיר מחובר",
    canBeEmpty: true,

  },
  {
    type: 'text',
    name: 'comments',
    uiName: 'הערות',
    canBeEmpty: true,
  },


]

const app = new Hono()
app.use("*", cors())

app.get('/columns', async (c) => {
  return c.json(columns)
})

app.get('/devices', async (c) => {
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

app.post("/insert_device", async (c) => {
  const body = await c.req.json<string[]>();

  const result = await insertNewDevice(body)

  return c.json(result)
})

app.post("/edit_device", async (c) => {
  const body = await c.req.json<Row>();

  const result = await editDevice(body)

  return c.json(result)
})

app.post("/remove_device", async (c) => {
  const body = await c.req.json<Row>();

  const result = await removeDevice(body)

  return c.json(result)
})

app.post("/remove_devices", async (c) => {
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