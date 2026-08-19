import type { Column } from "@cipher-report/shared/types"

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
        canEditRoles: ["admin"],
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
        canEditRoles: ["admin"],
    },
    {
        type: 'bool',
        name: 'verified',
        uiName: 'מאומת',
        canBeEmpty: false,
        canEditRoles: ["admin"],
    },
    {
        type: 'text',
        name: 'comment',
        uiName: 'הערה',
        canBeEmpty: true,
        canEditRoles: ["admin"],
    },

]

export const deviceColumns: Column[] = [
    {
        type: 'bool',
        name: 'reported',
        uiName: 'דווח',
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
    },
    {
        type: 'text',
        name: 'device_name',
        uiName: 'שם מכשיר',
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
    },
    {
        type: 'serial',
        name: 'serial_number',
        uiName: "'צ",
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
    },
    {
        type: 'text',
        name: 'association',
        uiName: 'שיוך',
        canBeEmpty: false,
        canEditRoles: ["editor", "admin"],
    },
    {
        type: 'text',
        name: 'assignment',
        uiName: 'יעוד',
        canBeEmpty: false,
        canEditRoles: ["editor", "reporter", "admin"],
    },
    {
        type: 'text',
        name: 'location',
        uiName: 'מיקום',
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
    },
    {
        type: 'serial',
        name: 'vehicle_serial_number',
        uiName: "צ' רכב",
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
    },

    {
        type: 'serial',
        name: 'connected_device',
        uiName: "מכשיר מחובר",
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
    },
    {
        type: 'text',
        name: 'comments',
        uiName: 'הערות',
        canBeEmpty: true,
        canEditRoles: ["editor", "reporter", "admin"],
    },


]
