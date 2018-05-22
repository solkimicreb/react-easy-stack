import { path, params, scheduler } from '../integrations';
import { toPathArray, toPathString, toParams, toHash, isNode } from '../utils';

const routers = [];
let routingStatus;
const initStatuses = new Set();

export function registerRouter(router, depth) {
  if (!routers[depth]) {
    routers[depth] = new Set();
  }
  routers[depth].add(router);
  // route the router if we are not routing currently
  // or the routing is already past the current depth
  if (!routingStatus || depth <= routingStatus.depth) {
    initRouter(router, depth);
  }
}

function initRouter(router, depth) {
  const status = { depth, cancelled: false };
  initStatuses.add(status);

  Promise.resolve()
    .then(() => router.startRouting())
    .then(resolvedData => {
      initStatuses.delete(status);
      if (!status.cancelled) {
        return router.finishRouting(resolvedData);
      }
    });
}

export function releaseRouter(router, depth) {
  routers[depth].delete(router);
}

export function route({ to, params, options }) {
  routeFromDepth(to, params, options, 0);
}

export function routeFromDepth(
  toPath = location.pathname,
  toParams = {},
  options = {},
  depth = 0
) {
  const status = (routingStatus = initStatus(depth));

  path.splice(depth, Infinity, ...toPathArray(toPath));
  // replace or extend params with nextParams by mutation (do not change the observable ref)
  if (!options.inherit) {
    Object.keys(params).forEach(key => delete params[key]);
  }
  Object.assign(params, toParams);

  return Promise.resolve()
    .then(() => switchRoutersFromDepth(depth, status))
    .then(() => finishRouting(options, status));
}

function initStatus(depth) {
  if (initStatuses.length) {
    initStatuses.forEach(status => {
      if (depth <= status.depth) {
        status.cancelled = true;
      }
    });
  }
  if (routingStatus) {
    routingStatus.cancelled = true;
  } else {
    // only process if we are not yet routing to prevent mid routing flash!
    scheduler.process();
  }
  scheduler.stop();
  return { depth, cancelled: false };
}

function switchRoutersFromDepth(depth, status) {
  const routersAtDepth = Array.from(routers[depth] || []);

  if (!status.cancelled && routersAtDepth.length) {
    return Promise.all(routersAtDepth.map(router => router.startRouting()))
      .then(resolvedData => {
        if (!status.cancelled) {
          return Promise.all(
            routersAtDepth.map((router, i) =>
              router.finishRouting(resolvedData[i])
            )
          );
        }
      })
      .then(() => switchRoutersFromDepth(++depth, status));
  }
}

function finishRouting({ history, scroll }, status) {
  if (!status.cancelled) {
    if (!isNode) {
      // by default a history item is pushed if the pathname changes!
      handleHistory(history);
      // by default the page is scrolled to the top left
      handleScroll(scroll);
    }

    scheduler.process();
    scheduler.start();
    routingStatus = undefined;
  }
}

// DONT DO THIS IN NODE
function handleHistory(shouldPush) {
  if (
    shouldPush === true ||
    (shouldPush !== false && toPathString(path) !== location.pathname)
  ) {
    history.pushState(undefined, '', toHash(scroll));
  } else {
    history.replaceState(undefined, '', toHash(scroll));
  }
}

// TODO: maybe do not scroll if the pathname didn't change
// DONT DO THIS IN NODE
function handleScroll(scroll = toParams(location.hash)) {
  if (scroll.to) {
    const scrollAnchor = document.getElementById(scroll.to);
    if (scrollAnchor) {
      scrollAnchor.scrollIntoView(scroll);
    }
  } else {
    const container = scroll.container
      ? document.querySelector(scroll.container)
      : window;
    container.scrollTo({ left: scroll.x || 0, top: scroll.y || 0 });
  }
}

window.addEventListener('popstate', () =>
  route({
    to: location.pathname,
    params: toParams(location.search),
    options: { history: false, scroll: toParams(location.hash) }
  })
);
