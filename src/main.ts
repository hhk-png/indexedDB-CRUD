import './style.css'
import typescriptLogo from './typescript.svg'
import { setupCounter } from './counter'
import { addData, cursorGetData, cursorGetDataByIndex, getDataByIndex, getDataByKey, openDB } from './dbOptions'


const db = await openDB("tempDataBase", 1)
addData(db, 'signalChat', {
    sequenceId: Math.floor(Math.random() * 30),
    link: 'www.baidu.com' + Math.random(),
    message: 'hello world' + Math.random()
})
getDataByKey(db, 'signalChat', 3)
cursorGetData(db, 'signalChat')
getDataByIndex(db, 'signalChat', 'link', 'www.baidu.com')
cursorGetDataByIndex(db, 'signalChat', 'link', 'www.baidu.com')

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
