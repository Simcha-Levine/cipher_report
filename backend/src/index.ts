import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { editDevice, getDevices, insertNewDevice, removeDevice, report, version } from './queries.js'
import { cors } from "hono/cors"
import type { Column, Row, UserInfo } from '@cipher-report/shared/types'
import { auth } from './auth.js'

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

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("/app/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.text("Unauthorized", 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});


app.get('/app/user_info', async (c) => {
  const user = c.get('user')!
  const info: UserInfo = {
    name: user.name,
    email: user.email
  }

  return c.json(info)
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