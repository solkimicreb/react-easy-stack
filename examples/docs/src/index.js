import React from 'react'
import ReactDOM from 'react-dom'
import 'web-animations-js'
import 'whatwg-fetch'
import './instrumentScroll'
import registerServiceWorker from './registerServiceWorker'
import App from './App'

const ua = navigator.userAgent.toLowerCase()
//if (ua.indexOf('safari') === -1 || ua.indexOf('chrome') !== -1) {
import('./code.css')
import('./markdown.css')
//}

const app = document.getElementById('root')

window.renderApp = function renderApp() {
  ReactDOM.render(<App />, app)
  app.style.opacity = 1
}

const landed = localStorage.getItem('landed')
if (landed) {
  app.style.transition = 'unset'
  window.renderApp()
}

registerServiceWorker()
