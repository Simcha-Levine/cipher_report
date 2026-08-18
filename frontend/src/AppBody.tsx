import { useEffect, useState } from 'react'
import './App.css'
import { useApp } from './context'
import mag from "./assets/magg.svg";
import plusw from "./assets/plusw.svg";
import plusg from "./assets/plusg.svg";
import userIcon from "./assets/user.svg";
import send from "./assets/send.svg";
import { InputButton, ReportDialog } from './Form';
import { type UserInfo } from '@cipher-report/shared/types';
import type { State } from './state';
import { authClient, httpRequest } from './client-auth';
import { UiTable } from './Table';
import type { Table } from './table';




function FilterTab({ index, table }: { index: number, table: Table }) {

    const colIndex = table.filters.list[index].selected
    const colUiName = table.columns[colIndex].uiName

    return (
        <div className='h search-tab search-item'>
            <select
                value={table.filters.list[index].selected}
                onChange={(e) => table.filters.updateFilterSelected(index, Number(e.target.value))}
                style={{ width: `${Math.max(colUiName.length + 3, 3)}ch` }}
            >
                {table.columns.map((value, index) => (
                    <option key={index} value={index}>{value.uiName}</option>
                ))}
            </select>

            <input
                type="text"
                value={table.filters.list[index].str}
                onChange={(e) => table.filters.updateFilterString(index, e.target.value)}
                placeholder="Enter"
                list='options'
                style={{ width: `${Math.max(table.filters.list[index].str.length, 1)}ch` }}
            />

            <div className='v center search-tab-x' onClick={() => table.filters.removeFilter(index)}>x</div>
        </div>
    )
}

function SearchBar({ table }: { table: Table }) {

    const [add_hovered, setAddHovered] = useState(false)

    return (
        <div className='search-bar h'>
            <div className='v center'>
                <img
                    className='search-item'
                    width="20"
                    src={mag}
                    alt="mag" />
            </div>

            <div
                className='v center add-search'
                onMouseEnter={() => setAddHovered(true)}
                onMouseLeave={() => setAddHovered(false)}
                onClick={() => table.filters.addFilter()}
            >
                <div className='h center'>
                    <img
                        width={20}
                        src={add_hovered ? plusw : plusg}
                        alt="plus" />
                </div>
            </div>

            <div className='h search-tab-strip'>
                {table.filters.list.map((_, index) => (
                    <FilterTab table={table} key={`filter${index}`} index={index}></FilterTab>
                ))}
            </div>
        </div >
    )
}

function Logs() {
    const state = useApp()

    const [show, setShow] = useState(false)

    useEffect(() => {
        setShow(true)
        const timer = setTimeout(() => {
            setShow(false)
            state.updateSendState(true, "")
        }, 2000);
        return () => clearTimeout(timer);
    }, [state.sendMessage]);

    return (
        <div>
            {show &&
                <div className={state.sendSuccess ? 'success' : 'error'}>{state.sendMessage}</div>
            }
        </div>
    )

}

function Tabs() {

    const state = useApp()

    const tabs = [
        { name: "list", ui: "רשימה" },
        { name: "add", ui: "הוספה" },
        { name: "report", ui: "'דוח צ" },
        { name: "swap", ui: "החלפת חתימות" },
        { name: "users", ui: "משתמשים" },
    ]

    return (
        <div className='h tabs-header-con'>
            <div className='h tabs-header'>

                {tabs.map((e) => (
                    <div
                        key={e.name}
                        className={`tab ${state.tabMode == e.name && 'selected'}`}
                        onMouseDown={() => { state.updateTabMode(e.name) }}
                    >{e.ui}</div>
                ))
                }
            </div >
            <UserIcon></UserIcon>
        </div>
    )
}

function UserIcon() {
    const state = useApp()
    const [show, setShow] = useState(false)
    const [user, setUser] = useState<UserInfo | null>(null)

    useEffect(() => {
        async function getUserInfo() {
            const response = await httpRequest("app/user_info", {}, 'get')
            const userInfo: UserInfo | null = await response.json()
            setUser(userInfo)
        }
        if (show) {
            getUserInfo()
        }
    }, [show])

    return (
        <div className='user-icon-con v center'>
            <div
                className={`user-info ${!show && 'hidden'}`}
                onMouseLeave={() => setShow(false)}
            >
                {user &&
                    <div>
                        <div className='user-menu'>שם: {user.name}</div>
                        <div className='user-menu'>{user.email} :אימיל</div>
                        <div className='user-menu'>{user.association} :שיוך</div>
                        <div className='user-menu'>{user.phoneNumber} :טלפון</div>
                        <div className='user-menu'>{user.role} :רמה</div>
                        <div className='user-menu'>{String(user.admin)} :מנהל</div>
                        <div className='user-menu'>{String(user.verified)} :מאומת</div>
                        <div className='user-menu'>{user.comment} :הערה</div>
                    </div>
                }
                <div
                    className='user-menu gray'
                    onMouseDown={async () => {
                        const { error } = await authClient.signOut();
                        if (!error) {
                            state.loggedIn.set(false)
                        }
                    }}
                > {'<- יציאה'}
                </div>
            </div>
            <img
                src={userIcon}
                alt="user"
                width="50"
                onMouseDown={() => {
                    setShow(true)
                }}
            />
        </div>
    )
}

function RightClickMenu({ table }: { table: Table }) {
    const state = useApp()
    const menu = state.rightClickMenu

    const tabs = [
        { name: "copy", ui: "העתק" },
        { name: "edit", ui: "עריכה" },
        { name: "remove", ui: "הסרה" },
    ]

    return (
        <div
            className={`right-click-menu ${!menu.isOn && 'hidden'}`}
            style={{ top: menu.pos.y - 10, left: menu.pos.x - 10 }}
            onMouseLeave={() => {
                menu.setOff()
            }}
        >
            {
                tabs.map((e) => (
                    <div
                        id='menu_item'
                        key={e.name}
                        className="menu_item"
                        onClick={() => {
                            menu.setOff()
                            if (e.name == "edit") {
                                const row = table.rows.find((d) => d.id == menu.id)
                                if (row) {
                                    table.edit.updateEditId(row, menu.colIndex)
                                }
                                table.select.reset()
                            } else if (e.name == "remove") {
                                const row = table.rows.find((d) => d.id == menu.id)
                                if (row) {
                                    state.removeDialogOn.set(true)
                                }
                            } else if (e.name == "copy") {
                                const devices = table.rows.filter(device => table.select.idList.has(device.id))
                                let text = ""
                                for (const device of devices) {
                                    for (const col of device.columns) {
                                        text = `${text} ${col}, `
                                    }
                                    text = `${text} \n`
                                }
                                navigator.clipboard.writeText(text)
                            }
                        }}
                    >{e.ui}</div>
                ))
            }
        </div >
    )
}

function RemoveDialog({ table }: { table: Table }) {
    const state = useApp()

    if (!state.removeDialogOn.val)
        return (<></>)

    const devices = table.rows.filter(device => table.select.idList.has(device.id))

    return (
        <div className='back-drop v center'>
            <div className='h center'>
                <div className='dialog'>
                    <div>:האם אתה רוצה להסיר את השורות</div>

                    <div className='h center dialog-table'>
                        <table>
                            <tbody>
                                {devices.map(device => (
                                    <tr key={device.id}>{device.columns.map((column, index) => (
                                        <td key={index}>{column}</td>
                                    ))
                                    }</tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    <div className='h center'>
                        <div
                            className='button remove'
                            onClick={() => {
                                table.requests.sendRemove(devices)
                                state.removeDialogOn.set(false)
                            }}
                        >
                            remove
                        </div>
                        <div style={{ width: 200 }}></div>
                        <div
                            className='button'
                            onClick={() => {
                                table.select.reset()
                                state.removeDialogOn.set(false)
                            }}
                        >
                            cancel
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

function ReportBar() {
    const state = useApp()
    const [value, setValue] = useState("")
    const [pressed, setPressed] = useState(false);


    if (state.tabMode != 'report')
        return (<></>)

    return (
        <div>
            <div className='h center report-bar'>
                <input
                    className='report-input'
                    type="text"
                    ref={(e) => { state.report.reportRef.current = e }}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter"
                    list='options'
                    onKeyDown={(e) => {
                        if (e.key == "Enter" && value != "") {
                            setPressed(true);
                            setTimeout(() => setPressed(false), 100);
                            state.report.sendReport(value.trim())
                            setValue("")
                        }
                    }}
                />

                <div
                    className={`send-icon h center ${pressed && 'click'}`}
                    onMouseDown={() => {
                        if (value != "") {
                            state.report.sendReport(value.trim())
                            setValue("")
                        }
                    }}
                >
                    <img
                        src={send}
                        alt="send"
                        width="30"
                    />
                </div>
            </div>
            <div style={{ height: 30 }}>
                <Logs></Logs>
            </div>
        </div >
    )
}

async function loadStart(state: State) {
    await state.loadColumns()
    await state.getCurrentTable().loadRows()
}

export function AppBody() {

    const state = useApp()
    const table = state.getCurrentTable()

    useEffect(() => {
        loadStart(state)
    }, []);

    return (
        <div
            className='main'
            onMouseDown={(e) => {
                const child = e.target as HTMLElement
                if (!child.closest("tbody") && child.id != 'menu_item' && !state.removeDialogOn.val) {
                    table.select.reset()
                }
            }}
            onMouseUp={() => {
                table.select.updateDragged(false, -1)
            }}
        >
            <Tabs></Tabs>
            <SearchBar table={table}></SearchBar>
            <ReportBar></ReportBar>
            <div className='h center'>
                <UiTable table={table}></UiTable>
            </div>
            <InputButton table={table} input={table.insertForm} name='הוסף' visible={true}></InputButton>
            <InputButton table={table} input={table.edit.form} name='שנה' visible={table.edit.changed}></InputButton>
            <Logs></Logs>

            {/* absolute elements*/}
            <RightClickMenu table={table}></RightClickMenu>
            <RemoveDialog table={table}></RemoveDialog>
            <ReportDialog table={table}></ReportDialog>

        </div >
    )
}
