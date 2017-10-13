import pushState from 'history-throttler'
import { routeParams, getParams, activate, deactivate } from 'react-easy-params'
import { activePages } from './stores'
import { getPages } from './urlUtils'

export const routers = []
export const links = new Set()

export function registerRouter(router, depth) {
  let routersAtDepth = routers[depth]
  if (!routersAtDepth) {
    routersAtDepth = routers[depth] = new Set()
  }
  routersAtDepth.add(router)
}

export function releaseRouter(router, depth) {
  const routersAtDepth = routers[depth]
  if (routersAtDepth) {
    routersAtDepth.delete(router)
  }
}

export function route (pages, params) {
  pushState(undefined, '', location.pathname + location.hash)

  // do not deactivate app stores!
  activePages.forEach(deactivate)
  // maybe check for undefined instead at these places!
  if (params) {
    routeParams(params)
  }
  if (pages) {
    routeRouters(pages, params)
  }
}

function routeRouters (pages, params) {
  for (let depth = 0; depth < routers.length; depth++) {
    const newPage = pages[depth]
    const routersAtDepth = routers[depth]
    routersAtDepth.forEach(router => router.route(newPage, params))
  }
}

window.addEventListener('popstate', () => routeRouters(getPages(), getParams()))
