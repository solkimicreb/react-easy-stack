import { path, params } from '../integrations';
import { scheduler, location, history, historyHandler } from 'env';
import {
  toPathArray,
  toPathString,
  toParams,
  toHash,
  rethrow,
  clear
} from '../utils';

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
    const status = { depth, cancelled: false };
    initStatuses.add(status);

    Promise.resolve()
      .then(() => router.startRouting())
      .then(
        resolvedData => !status.cancelled && router.finishRouting(resolvedData)
      )
      .then(() => initStatuses.delete(status));
  }
}

export function releaseRouter(router, depth) {
  routers[depth].delete(router);
}

export function route({ to, params, options }) {
  routeFromDepth(to, params, options, 0);
}

export function routeFromDepth(
  toPath = location.pathname,
  newParams = {},
  options = {},
  depth = 0
) {
  // cancel inits
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
  const status = (routingStatus = { depth, cancelled: false });
  scheduler.stop();

  path.splice(depth, Infinity, ...toPathArray(toPath));
  // replace or extend params with nextParams by mutation (do not change the observable ref)
  if (!options.inherit) {
    clear(params);
  }
  Object.assign(params, newParams);

  return Promise.resolve()
    .then(() => switchRoutersFromDepth(depth, status))
    .then(
      () => onRoutingEnd(options, status),
      rethrow(() => onRoutingEnd(options, status))
    );
}

function switchRoutersFromDepth(depth, status) {
  const routersAtDepth = Array.from(routers[depth] || []);

  if (!status.cancelled && routersAtDepth.length) {
    return Promise.all(routersAtDepth.map(router => router.startRouting()))
      .then(
        resolvedData =>
          !status.cancelled &&
          Promise.all(
            routersAtDepth.map((router, i) =>
              router.finishRouting(resolvedData[i])
            )
          )
      )
      .then(() => switchRoutersFromDepth(++depth, status));
  }
}

function onRoutingEnd({ history, scroll }, status) {
  if (!status.cancelled) {
    // by default a history item is pushed if the pathname changes!
    handleHistory(history);
    // byt default the page is scrolled to the top left
    handleScroll(scroll);

    scheduler.process();
    scheduler.start();
    routingStatus = undefined;
  }
}

function handleHistory(history) {
  if (
    history === true ||
    (history !== false && toPathString(path) !== location.pathname)
  ) {
    // do I want to push options as the state? I should add it to the hash instead probably
    window.history.pushState(undefined, '', toHash(scroll));
  } else {
    window.history.replaceState(undefined, '', toHash(scroll));
  }
}

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

historyHandler(() =>
  route({
    to: location.pathname,
    params: toParams(location.search),
    options: { history: false, scroll: toParams(location.hash) }
  })
);
