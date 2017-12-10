import { observable, observe, exec } from '@nx-js/observer-util'
import { toQuery, toParams } from './searchParams'
import scheduler from './scheduler'

const rawParams = toParams(location.search)
export const params = observable(rawParams)

// on set params there is no need
export function setParams (newParams) {
  for (let param of Object.keys(rawParams)) {
    delete rawParams[param]
  }
  Object.assign(params, newParams)
}

function syncParams () {
  const url = location.pathname + toQuery(params) + location.hash
  history.replaceState(rawParams, '', url)
}

observe(syncParams, { scheduler })
