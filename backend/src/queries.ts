import { Pool } from 'pg'
import "dotenv/config"
import { evaluateRow, type Column, type Row } from "@cipher-report/shared/types"
import { columns } from './index.js'

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
            `INSERT INTO devices (${columnNames})
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

// export function removeDevices(ids)

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
    version++
    return "success"
}

