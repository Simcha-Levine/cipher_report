import { Pool } from 'pg'
import "dotenv/config"
import { evaluateRow, type Column, type LoginResult, type ReportResult, type Row, type UserData, type UserLogin, type UserRegister } from "@cipher-report/shared/types"
import { columns } from './index.js'
import argon2 from "argon2";


export let version = 0

const pool = new Pool(
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
)
// export async function register(data: UserRegister): Promise<LoginResult> {

//     const result1 = await pool.query(
//         `SELECT 1 FROM users WHERE name = $1 LIMIT 1`,
//         [data.name]
//     )

//     if ((result1.rowCount ?? 0) > 0) {
//         return { success: "name is taken", id: -1 }
//     }

//     const hash = await argon2.hash(data.password)

//     try {
//         const result2 = await pool.query<{ id: number }>(
//             `
//         INSERT INTO users (name, password, association, phone_number)
//         VALUES ($1,$2,$3,$4)
//         RETURNING id
//         `,
//             [data.name, hash, data.association, data.phoneNumber]
//         )
//         if (result2.rowCount != 1) {
//             return { success: "failed", id: -1 }
//         }
//         return { success: "success", id: result2.rows[0].id }


//     } catch (err: any) {
//         console.log(err)
//         return { success: "error", id: -1 }
//     }

// }
export async function login(user: UserLogin) {
    interface Data {
        password: string
        name: string
        id: number
    }
    const result = await pool.query<Data>(
        `
        SELECT 
            id,
            name,
            password,
        FROM users
        WHERE name = $1
        `,
        [user.name]
    )

    if (result.rowCount != 1) {
        return { success: "name or password are wrong 1", id: -1 }
    }
    // const { password, ...userData } = result.rows[0];

    if (await argon2.verify(result.rows[0].password, user.password)) {
        return { success: "success", id: result.rows[0].id }
    }

    return { success: "name or   password are wrong 2", id: -1 }
}

export async function getUserData(id: number): Promise<UserData | null> {
    const result = await pool.query<UserData>(
        `SELECT
            id,
            name,
            association,
            phone_number AS "phoneNumber",
            admin,
            authenticated
        FROM users
        WHERE id = $1
        `, [id])

    if (result.rowCount != 1) {
        return null
    }

    return result.rows[0]
}

export async function getDevices() {

    const columnNames = columns.map(c => c.name).join(", ");

    const result = await pool.query<[]>(
        `SELECT ${columnNames},row_id FROM devices ORDER BY row_id`
    )
    const devices: Row[] = result.rows.map(row => {
        let columns = Object.values(row).map(value => String(value))
        const id = Number(columns.pop())
        return {
            id,
            columns
        }
    }
    );

    return devices
}

export async function insertNewDevice(device: string[]) {

    const evaluate = evaluateRow(device, columns)
    if (evaluate !== true) {
        console.log(`error at ${columns[evaluate.column].name} status: ${evaluate.status}`)
        return `error at ${columns[evaluate.column].name} status: ${evaluate.status}`
    }

    const columnNames = columns.map(c => c.name).join(", ");
    const ph = columns.map((_, index) => `$${index + 1}`).join(", ")

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
    version++
    return "success"
}

export async function removeDevice(device: Row) {

    const columnNames = columns.map(c => c.name).join(", ");
    const ph = columns.map((_, index) => `$${index + 2}`).join(", ")

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
    version++
    return "success"
}

export async function report(serial: string): Promise<ReportResult> {
    let id = 0
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
    version++
    return { success: true, message: "success", id }

}

export async function editDevice(device: Row) {

    const evaluate = evaluateRow(device.columns, columns)
    if (evaluate !== true) {
        console.log(`error at ${columns[evaluate.column].name} status: ${evaluate.status}`)
        return `error at ${columns[evaluate.column].name} status: ${evaluate.status}`
    }

    const columnNames = columns.map(c => c.name).join(", ");
    const ph = device.columns.map((_, index) => `$${index + 2}`).join(", ")

    try {
        await pool.query(
            `UPDATE devices
             SET (${columnNames}) = (${ph})
             WHERE row_id = $1
            `, [device.id, ...device.columns]
        );
    } catch (err: any) {
        if (err.code === "23505") {
            // unique violation
            return "Device already exists";
        }
        return "error"
    }
    console.log(device)
    version++
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
    version++
}
