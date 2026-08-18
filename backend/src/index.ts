import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {
  editDevice,
  getDevices,
  getUserData,
  initUserData,
  insertNewDevice,
  removeDevice,
  report,
  devices_version,
  users_version,
  getUsers, editUser
} from './queries.js'
import { cors } from "hono/cors"
import type { Column, ColumnPack, EditRow, InitUser, input, Row, TableRows, UserInfo } from '@cipher-report/shared/types'
import { auth } from './auth.js'

export const userColumns: Column[] = [
  {
    type: 'text',
    name: 'name',
    uiName: 'שם',
    canBeEmpty: false,
    canEditRoles: [],
  },
  {
    type: 'text',
    name: 'email',
    uiName: 'אימיל',
    canBeEmpty: false,
    canEditRoles: [],
  },
  {
    type: 'text',
    name: 'association',
    uiName: 'שיוך',
    canBeEmpty: true,
    canEditRoles: ["any"],
  },
  {
    type: 'serial',
    name: 'phone_number',
    uiName: 'טלפון',
    canBeEmpty: false,
    canEditRoles: [],
  },
  {
    type: 'text',
    name: 'role',
    uiName: 'גישה',
    canBeEmpty: true,
    canEditRoles: ["any"],
  },
  {
    type: 'bool',
    name: 'admin',
    uiName: 'מנהל',
    canBeEmpty: false,
    canEditRoles: ["any"],
  },
  {
    type: 'bool',
    name: 'verified',
    uiName: 'מאומת',
    canBeEmpty: false,
    canEditRoles: ["any"],
  },
  {
    type: 'text',
    name: 'comment',
    uiName: 'הערה',
    canBeEmpty: true,
    canEditRoles: ["any"],
  },

]

export const deviceColumns: Column[] = [
  {
    type: 'bool',
    name: 'reported',
    uiName: 'דווח',
    canBeEmpty: false,
    canEditRoles: ["editor"],
  },
  {
    type: 'text',
    name: 'device_name',
    uiName: 'שם מכשיר',
    canBeEmpty: false,
    canEditRoles: ["editor"],
  },
  {
    type: 'serial',
    name: 'serial_number',
    uiName: "'צ",
    canBeEmpty: false,
    canEditRoles: ["editor"],
  },
  {
    type: 'text',
    name: 'association',
    uiName: 'שיוך',
    canBeEmpty: false,
    canEditRoles: ["editor"],
  },
  {
    type: 'text',
    name: 'assignment',
    uiName: 'יעוד',
    canBeEmpty: false,
    canEditRoles: ["editor", "reporter"],
  },
  {
    type: 'text',
    name: 'location',
    uiName: 'מיקום',
    canBeEmpty: true,
    canEditRoles: ["editor", "reporter"],
  },
  {
    type: 'serial',
    name: 'vehicle_serial_number',
    uiName: "צ' רכב",
    canBeEmpty: true,
    canEditRoles: ["editor", "reporter"],
  },

  {
    type: 'serial',
    name: 'connected_device',
    uiName: "מכשיר מחובר",
    canBeEmpty: true,
    canEditRoles: ["editor", "reporter"],
  },
  {
    type: 'text',
    name: 'comments',
    uiName: 'הערות',
    canBeEmpty: true,
    canEditRoles: ["editor", "reporter"],
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

// login
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

//reject none auth users
app.use("/app/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.text("Unauthorized", 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.post('/app/init_user', async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<InitUser>();
  initUserData(body.phone, body.asso, user.id)
})


app.get('/app/user_info', async (c) => {
  const user = c.get('user')!
  const info = await getUserData(user.id)
  if (info) {
    return c.json(info)
  }
  return c.json(null)
})

app.get('/app/columns', async (c) => {
  const pack: ColumnPack = {
    device: deviceColumns,
    user: userColumns
  }
  return c.json(pack)
})

app.get('/app/devices', async (c) => {
  const uv = Number(c.req.query("version"));

  if (uv != devices_version) {
    const table: TableRows = {
      version: devices_version,
      rows: await getDevices()
    }
    return c.json(table)
  } else {
    return c.json(null)
  }
})

app.get('/app/users', async (c) => {
  const uv = Number(c.req.query("version"));

  if (uv != users_version) {
    const table: TableRows = {
      version: users_version,
      rows: await getUsers()
    }
    return c.json(table)
  } else {
    return c.json(null)
  }
})

app.post("/app/insert_device", async (c) => {
  const body = await c.req.json<input[]>();

  const result = await insertNewDevice(body)

  return c.json(result)
})

app.post("/app/edit_device", async (c) => {
  const body = await c.req.json<EditRow>();
  const user = c.get('user')!
  const result = await editDevice(body, user.id)
  return c.json(result)
})

app.post("/app/edit_user", async (c) => {
  const body = await c.req.json<EditRow>();
  const user = c.get('user')!
  const result = await editUser(body, user.id)
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