import { useEffect, useState } from 'react'
import './App.css'
import { useApp } from './context'
import mag from "./assets/magg.svg";
import plusw from "./assets/plusw.svg";
import plusg from "./assets/plusg.svg";
import v from "./assets/v.svg";
import { checkFilter } from './filters';
import { Form, InputButton } from './Form';
import type { Row } from '@cipher-report/shared/types';



function Row({ device }: { device: Row }) {
  const state = useApp()

  let name = ""
  if (device.columns[0] == "true") {
    name = "reported"
  }

  if (state.mode == "remove" && state.remove.idList.has(device.id)) {
    name = "remove-selected"
  }

  function press(e: React.MouseEvent, index: number) {
    if (state.mode == 'edit') {
      e.preventDefault()
      state.edit.updateEditId(device, index)
    } else if (state.mode == 'remove') {
      e.preventDefault()
      state.remove.clickId(device.id)
    } else if (state.mode == 'list') {

    }
  }

  return (
    <tr
      className={`row ${state.mode}`}
    >
      {
        device.columns.map((col, index) => (

          <td
            className={name}
            key={index}
            onMouseDown={(e) => press(e, index)}
          >
            {(state.columns[index].type == 'bool') ? (
              col == "true" &&
              <img src={v} alt="v" width={15} />

            ) : (
              col
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
      {state.devices
        .filter((device => checkFilter(device.columns, state.filters)))
        .map((device) => (state.mode == "edit" && device.id == state.edit.id
          ?
          <Form key={device.id} formType='edit'></Form>
          :
          < Row key={device.id} device={device} ></Row >
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
            {state.mode == "add" && <Form formType='insert'></Form>}
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
    { name: "edit", ui: "עריכה" },
    { name: "remove", ui: "הסרה" },
    { name: "report", ui: "'דוח צ" },
    { name: "swap", ui: "החלפת חתימות" },
  ]

  return (
    <div className='h tabs-header'>

      {tabs.map((e) => (
        <div
          key={e.name}
          className={`tab ${state.mode == e.name && 'selected'}`}
          onMouseDown={() => { state.updateMode(e.name) }}
        >{e.ui}</div>
      ))
      }
    </div >
  )
}

function RemoveButton() {
  const state = useApp()

  return (
    <div className={`v ${(state.mode != 'remove' || state.remove.idList.size == 0) && 'hidden'}`}>
      <div>שורות להסרה {state.remove.idList.size}</div>
      <div className='h center'>
        <div
          className='button remove'
          onClick={() => {
            state.remove.sendRemove()
          }}
        >הסר</div>
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
    <div className='main'>
      <Tabs></Tabs>
      <SearchBar></SearchBar>
      <div className='h center'>
        <Table></Table>
      </div>
      <InputButton input={state.insertForm} name='הוסף' visible={true}></InputButton>
      <InputButton input={state.edit.form} name='שנה' visible={state.edit.changed}></InputButton>
      <RemoveButton></RemoveButton>
      <Logs></Logs>
    </div >
  )
}

export default App
