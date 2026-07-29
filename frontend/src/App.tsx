import { useEffect, useState } from 'react'
import './App.css'
import { useApp } from './context'
import mag from "./assets/magg.svg";
import plusw from "./assets/plusw.svg";
import plusg from "./assets/plusg.svg";
import send from "./assets/send.svg";
import v from "./assets/v.svg";
import { Form, InputButton, ReportDialog } from './Form';
import type { Row } from '@cipher-report/shared/types';



function Row({ device, index }: { device: Row, index: number }) {
  const state = useApp()

  const reported = device.columns[0] == "true"

  let name = ""
  if (reported) {
    name = "reported"
  }

  let selected = 'not-selected'
  if (state.rightClickMenu.id == device.id || state.select.idList.has(device.id)) {
    selected = 'selected'
  }

  return (
    <tr
      className={`row ${selected}`}
      onMouseDown={(e) => {
        state.select.updateDragged(true, index)
        if (e.ctrlKey) {
          state.select.toggle(device.id)
        } else if (e.button != 2 || !state.select.idList.has(device.id)) {
          state.select.click(device.id)
        }
      }}
      onMouseMove={(e) => state.select.drag(index, e.ctrlKey)}
    >
      {
        device.columns.map((col, index) => (

          <td
            className={name}
            key={index}
            onContextMenu={(e) => {
              e.preventDefault()
              state.rightClickMenu.setOn(e.clientX, e.clientY, device.id, index)
              state.select.updateDragged(false, -1)
            }}
          >
            {(state.columns[index].type == 'bool') ? (
              col == "true" &&
              <img src={v} alt="v" width={15} />

            ) : (
              <>
                {(state.columns[index].name != "serial_number" ||
                  state.tabMode != 'report' ||
                  reported)
                  ?
                  col
                  :
                  ".".repeat(col.length)
                }
              </>
            )}
          </td>
        )).reverse()
      }
    </tr >
  )
}

function Rows() {
  const state = useApp()
  return (
    <>
      {state.getFiltered().map((device, index) => ((device.id == state.edit.id && !state.removeDialogOn)
        ?
        <Form key={device.id} formType='edit'></Form>
        :
        < Row key={device.id} index={index} device={device} ></Row >
      ))
      }
    </>
  )
}

function Table() {
  const state = useApp()

  return (
    <div>
      <div className="table_box">
        <table id="table">
          <thead>
            <tr>
              {
                state.columns.map((header, index) => (
                  <th key={`header${index}`}>
                    <div className='h center header'>
                      <div
                        className='v center tri-wrap'
                        onClick={() => state.updateSort(index)}>
                        <div
                          className={(state.selected_header == index) ? 'tri-down' : 'tri-up'}></div>
                      </div>
                      <div className='header_name'>{header.uiName}</div>
                    </div>
                  </th>
                )).reverse()
              }
            </tr>
          </thead>

          <tbody>
            <Rows></Rows>
            {state.tabMode == "add" && <Form formType='insert'></Form>}
          </tbody>
        </table>
      </div>
    </div >

  )
}

function FilterTab({ index }: { index: number }) {
  const state = useApp()

  const colIndex = state.filters.list[index].selected
  const colUiName = state.columns[colIndex].uiName

  return (
    <div className='h search-tab search-item'>
      <select
        value={state.filters.list[index].selected}
        onChange={(e) => state.filters.updateFilterSelected(index, Number(e.target.value))}
        style={{ width: `${Math.max(colUiName.length + 3, 3)}ch` }}
      >
        {state.columns.map((value, index) => (
          <option key={index} value={index}>{value.uiName}</option>
        ))}
      </select>

      <input
        type="text"
        value={state.filters.list[index].str}
        onChange={(e) => state.filters.updateFilterString(index, e.target.value)}
        placeholder="Enter"
        list='options'
        style={{ width: `${Math.max(state.filters.list[index].str.length, 1)}ch` }}
      />

      <div className='v center search-tab-x' onClick={() => state.filters.removeFilter(index)}>x</div>
    </div>
  )
}

function SearchBar() {

  const [add_hovered, setAddHovered] = useState(false)
  const state = useApp()


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
        onClick={() => state.filters.addFilter()}
      >
        <div className='h center'>
          <img
            width={20}
            src={add_hovered ? plusw : plusg}
            alt="plus" />
        </div>
      </div>

      <div className='h search-tab-strip'>
        {state.filters.list.map((_, index) => (
          <FilterTab key={`filter${index}`} index={index}></FilterTab>
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
  ]

  return (
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
  )
}

function RightClickMenu() {
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
                const row = state.devices.find((d) => d.id == menu.id)
                if (row) {
                  state.edit.updateEditId(row, menu.colIndex)
                }
                state.select.reset()
              } else if (e.name == "remove") {
                const row = state.devices.find((d) => d.id == menu.id)
                if (row) {
                  state.removeDialogOn.set(true)
                }
              } else if (e.name == "copy") {
                const devices = state.devices.filter(device => state.select.idList.has(device.id))
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

function RemoveDialog() {
  const state = useApp()

  if (!state.removeDialogOn.val)
    return (<></>)

  const devices = state.devices.filter(device => state.select.idList.has(device.id))

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
                state.sendRemove(devices)
                state.removeDialogOn.set(false)
              }}
            >
              remove
            </div>
            <div style={{ width: 200 }}></div>
            <div
              className='button'
              onClick={() => {
                state.select.reset()
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

function App() {

  const state = useApp()

  useEffect(() => {
    state.loadColumns()
    state.loadDevices()
  }, []);

  return (
    <div
      className='main'
      onMouseDown={(e) => {
        const child = e.target as HTMLElement
        if (!child.closest("tbody") && child.id != 'menu_item' && !state.removeDialogOn.val) {
          state.select.reset()
        }
      }}
      onMouseUp={() => {
        state.select.updateDragged(false, -1)
      }}
    >
      <Tabs></Tabs>
      <SearchBar></SearchBar>
      <ReportBar></ReportBar>
      <div className='h center'>
        <Table></Table>
      </div>
      <InputButton input={state.insertForm} name='הוסף' visible={true}></InputButton>
      <InputButton input={state.edit.form} name='שנה' visible={state.edit.changed}></InputButton>
      <Logs></Logs>

      {/* absolute elements*/}
      <RightClickMenu></RightClickMenu>
      <RemoveDialog></RemoveDialog>
      <ReportDialog></ReportDialog>

    </div >
  )
}

export default App
