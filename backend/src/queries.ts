import { Pool } from 'pg'
import "dotenv/config"
import { evaluateRow, type Column, type EditRow, type input, type ReportResult, type role, type Row, type UserInfo } from "@cipher-report/shared/types"
import { deviceColumns, userColumns } from './tables.js'
import type { Role } from 'better-auth/plugins'
import { use } from 'hono/jsx'

export let devices_version = 0
export let users_version = 0

export const pool = new Pool(
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
)

export async function initUserData(phone: string, asso: string, id: string) {
    try {
        await pool.query(
            `
            INSERT INTO 
                user_permissions 
                (id, association,  comment, role, phone_number)
            VALUES ($1,$2,$3,$4,$5)
            `, [id, "", asso, "none", phone]);
    } catch (err: any) {
        if (err.code === "23505") {
            // unique violation
            return "User permissions already exist";
        } else if (err.code === "23503") {
            // foreign key violation
            return "user doesn't exists";
        }
        return "error"
    }
    users_version++
}

export async function getUserData(id: string): Promise<UserInfo | null> {

    const result = await pool.query<UserInfo>(
        `SELECT
            u.id,
            u.name,
            u.email,
            p.association,
            p.role,
            p.verified,
            p.phone_number AS "phoneNumber",
            p.comment
        FROM "user" u
        JOIN user_permissions p ON u.id = p.id
        WHERE u.id = $1
        `, [id])

    if (result.rowCount != 1) {
        return null
    }

    return result.rows[0]
}

export async function getUsers() {
    const columnNames = userColumns.map(c => c.name).join(", ");

    const result = await pool.query<[]>(
        `SELECT 
            ${columnNames}, u.id
         FROM "user" u
         JOIN user_permissions p ON u.id = p.id
         ORDER BY u.id`
    )
    const users: Row[] = result.rows.map(row => {
        let columns = Object.values(row).map(value => String(value))
        const id = columns.pop()!
        return {
            id,
            columns
        }
    });

    return users
}

export async function getDevices() {

    const columnNames = deviceColumns.map(c => c.name).join(", ");

    const result = await pool.query<[]>(
        `SELECT ${columnNames},row_id FROM devices ORDER BY row_id`
    )
    const devices: Row[] = result.rows.map(row => {
        let columns = Object.values(row).map(value => String(value))
        const id = columns.pop()!
        return {
            id,
            columns
        }
    });

    return devices
}

export async function insertNewDevice(device: input[]) {

    const evaluate = evaluateRow(device, deviceColumns)
    if (evaluate !== true) {
        console.log(`error at ${deviceColumns[evaluate.column].name} status: ${evaluate.status}`)
        return `error at ${deviceColumns[evaluate.column].name} status: ${evaluate.status}`
    }

    const columnNames = deviceColumns.map(c => c.name).join(", ");
    const ph = deviceColumns.map((_, index) => `$${index + 1}`).join(", ")

    try {
        await pool.query(
            `
            INSERT INTO devices (${columnNames})
            VALUES (${ph})
            `, device
        );
    } catch (err: any) {
        if (err.code === "23505") {
            // unique violation
            return "Device already exists";
        }
        return "error"
    }
    devices_version++
    return "success"
}

export async function removeDevice(device: Row) {

    const columnNames = deviceColumns.map(c => c.name).join(", ");
    const ph = deviceColumns.map((_, index) => `$${index + 2}`).join(", ")

    try {
        const result = await pool.query(`
            DELETE FROM devices
            WHERE (row_id, ${columnNames}) = ($1, ${ph})
            `, [device.id, ...device.columns])

        if (result.rowCount == 0) {
            return "couldn't find the row to remove"
        }
    } catch (err: any) {
        console.log(err)
        return "error"
    }
    devices_version++
    return "success"
}

export async function report(serial: string): Promise<ReportResult> {
    let id = ""
    try {
        const result = await pool.query(`
            UPDATE devices 
            SET reported = true 
            WHERE serial_number = $1
            RETURNING row_id
        `, [serial])

        if (result.rowCount && result.rowCount > 0) {
            id = result.rows[0].row_id;
        } else {
            return { success: false, message: "doesn't exist", id }
        }
    } catch (err: any) {
        return { success: false, message: "error", id }
    }
    devices_version++
    return { success: true, message: "success", id }

}

export function getEditableColumns(role: role, columns: Column[]) {
    const newColumns = columns.filter((c) => {
        if (c.canEditRoles.length > 0) {
            return c.canEditRoles.includes(role) || c.canEditRoles[0] == "any"
        }
        return false
    })

    return newColumns
}

export async function editDevice(device: EditRow, userId: string) {

    const user = await getUserData(userId)
    if (!user) return `something went wrong couldn't load user data`
    const columns = getEditableColumns(user.role, deviceColumns)

    const evaluate = evaluateRow(device.columns, columns)
    if (evaluate !== true) {
        if (evaluate.column > 0) {
            console.log(`error at ${columns[evaluate.column].name} status: ${evaluate.status}`)
            return `error at ${columns[evaluate.column].name} status: ${evaluate.status}`
        }
        console.log(`error status: ${evaluate.status}`)
        return `error status: ${evaluate.status}`
    }

    const columnNames = columns.map(c => c.name).join(", ");
    const ph = device.columns.map((_, index) => `$${index + 2}`).join(", ")
    const inputs = device.columns.map((c) => c.val)

    try {
        await pool.query(
            `UPDATE devices
             SET (${columnNames}) = (${ph})
             WHERE row_id = $1
            `, [device.id, ...inputs]
        );
    } catch (err: any) {
        if (err.code === "23505") {
            // unique violation
            return "Device already exists";
        }
        return "error"
    }
    devices_version++
    return "success"
}

export async function editUser(row: EditRow, userId: string) {

    const user = await getUserData(userId)
    if (!user) return `something went wrong couldn't load user data`
    const columns = getEditableColumns(user.role, userColumns)

    const evaluate = evaluateRow(row.columns, columns)
    if (evaluate !== true) {
        console.log(`error at ${columns[evaluate.column].name} status: ${evaluate.status}`)
        return `error at ${columns[evaluate.column].name} status: ${evaluate.status}`
    }

    const columnNames = columns.map(c => c.name).join(", ");
    const ph = row.columns.map((_, index) => `$${index + 2}`).join(", ")
    const inputs = row.columns.map((c) => c.val)


    try {
        await pool.query(
            `UPDATE user_permissions
             SET (${columnNames}) = (${ph})
             WHERE id = $1
            `, [row.id, ...inputs]
        );
    } catch (err: any) {
        if (err.code === "23505") {
            // unique violation
            return "user already exists";
        }
        console.log(err)
        return "error"
    }
    console.log(row)
    users_version++
    return "success"
}

async function resetReports() {
    try {
        await pool.query(
            `UPDATE devices
             SET reported = false
            `
        );
    } catch (err: any) {
        return "error"
    }
    devices_version++
}
