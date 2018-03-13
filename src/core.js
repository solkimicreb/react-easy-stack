import { path, params, scheduler } from 'react-easy-params'
import {
  toPathArray,
  toPathString,
  toParams,
  rethrow,
  clear
} from './urlUtils'

const routers = []
let routingStatus

class RoutingStatus {
  check (fn) {
    return () => (this.cancelled ? undefined : fn())
  }
}

export function registerRouter (router, depth) {
  let routersAtDepth = routers[depth]
  if (!routersAtDepth) {
    routersAtDepth = routers[depth] = new Set()
  }
  routersAtDepth.add(router)
  // route the router if we are not routing currently
  if (!routingStatus) {
    // issue -> if there are multiple, I should cancel all
    const status = routingStatus = new RoutingStatus()
    Promise.resolve()
      .then(() => router.init(path[depth], path[depth]))
      .then(toChild => router.resolve(toChild, status))
      .then(nextState => router.switch(nextState, status))
  }
}

export function releaseRouter (router, depth) {
  const routersAtDepth = routers[depth]
  if (routersAtDepth) {
    routersAtDepth.delete(router)
  }
}

export function route ({ to, params, options } = {}) {
  routeFromDepth(to, params, options, 0)
}

export function routeFromDepth (
  toPath = location.pathname,
  newParams = {},
  options = {},
  depth = 0
) {
  if (routingStatus) {
    console.log('CANCEL!!')
    routingStatus.cancelled = true
  } else {
    // only process if we are not yet routing to prevent mid routing flash!
    scheduler.process()
  }
  const status = (routingStatus = new RoutingStatus())
  scheduler.stop()

  // replace or extend params with nextParams by mutation (do not change the observable ref)
  if (!options.inherit) {
    clear(params)
  }
  Object.assign(params, newParams)
  toPath = path.slice(0, depth).concat(toPathArray(toPath))

  return switchRoutersFromDepth(toPath, depth, status).then(
    status.check(() => onRoutingEnd(options)),
    rethrow(status.check(() => onRoutingEnd(options)))
  )
}

function switchRoutersFromDepth (toPath, depth, status) {
  const routersAtDepth = Array.from(routers[depth] || [])

  if (!routersAtDepth.length) {
    return Promise.resolve()
  }

  // check routersAtDepth defaultPage -> throw an error if they differ
  // check basePath -> reduce -> add it to the url -> bump depth with basePath length
  // do not bump the real depth, just the passed arg depth
  // DO NOT! update the path in the router -> update it here to maintain control
  // add a new baseDepth param -> increment that one too

  const children = routersAtDepth.map(router => router.init(path[depth], toPath[depth]))
  // path[baseDepth + depth] = children[0].props.page
  // could work

  // add status checks
  return Promise.all(
    routersAtDepth.map((router, i) => router.resolve(children[i], status))
  )
    .then(states => Promise.all(
      routersAtDepth.map((router, i) => router.switch(states[i], status))
    ))
    .then(status.check(() => switchRoutersFromDepth(toPath, ++depth, status)))
}

function onRoutingEnd (options) {
  // by default a history item is pushed if the pathname changes!
  if (
    options.history === true ||
    (options.history !== false && toPathString(path) !== location.pathname)
  ) {
    history.pushState(history.state, '')
  }

  scheduler.process()
  scheduler.start()
}

window.addEventListener('popstate', () =>
  route({
    to: location.pathname,
    params: toParams(location.search),
    options: { history: false }
  })
)
