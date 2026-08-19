import type { Column } from "@cipher-report/shared/types"


const units = ['פלוגה א', 'פלוגה ב', 'פלוגה ג', 'מסייעת', 'פלס"ם', 'חפק מגד', 'חפק סמגד', 'תאג"ד']

export const userColumns: Column[] = [
    {
        type: 'text',
        name: 'name',
        uiName: 'שם',
        canBeEmpty: false,
        canEditRoles: [],
        options: [],
    },
    {
        type: 'text',
        name: 'email',
        uiName: 'אימיל',
        canBeEmpty: false,
        canEditRoles: [],
        options: [],
    },
    {
        type: 'text',
        name: 'association',
        uiName: 'שיוך',
        canBeEmpty: true,
        canEditRoles: ["admin"],
        options: units,
    },
    {
        type: 'serial',
        name: 'phone_number',
        uiName: 'טלפון',
        canBeEmpty: false,
        canEditRoles: [],
        options: [],
    },
    {
        type: 'select',
        name: 'role',
        uiName: 'גישה',
        canBeEmpty: true,
        canEditRoles: ["admin"],
        options: ["editor", "reporter", "viewer", "admin", "none"],
    },
    {
        type: 'bool',
        name: 'verified',
        uiName: 'מאומת',
        canBeEmpty: false,
        canEditRoles: ["admin"],
        options: [],
    },
    {
        type: 'text',
        name: 'comment',
        uiName: 'הערה',
        canBeEmpty: true,
        canEditRoles: ["admin"],
        options: [],
    },

]

export const deviceColumns: Column[] = [
    {
        type: 'bool',
        name: 'reported',
        uiName: 'דווח',
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
        options: [],
    },
    {
        type: 'text',
        name: 'device_name',
        uiName: 'שם מכשיר',
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
        options: [],
    },
    {
        type: 'serial',
        name: 'serial_number',
        uiName: "'צ",
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
        options: [],
    },
    {
        type: 'select',
        name: 'association',
        uiName: 'שיוך',
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
        options: units,
    },
    {
        type: 'text',
        name: 'assignment',
        uiName: 'יעוד',
        canBeEmpty: false,
        canEditRoles: ["editor", "reporter", "admin"],
        options: [],
    },
    {
        type: 'text',
        name: 'location',
        uiName: 'מיקום',
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
        options: [],
    },
    {
        type: 'serial',
        name: 'vehicle_serial_number',
        uiName: "צ' רכב",
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
        options: [],
    },

    {
        type: 'serial',
        name: 'connected_device',
        uiName: "מכשיר מחובר",
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
        options: [],
    },
    {
        type: 'text',
        name: 'comments',
        uiName: 'הערות',
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
        options: [],
    },


]
