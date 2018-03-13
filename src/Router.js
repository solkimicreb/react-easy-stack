import React, {
  PureComponent,
  Children,
  isValidElement,
  cloneElement
} from 'react'
import PropTypes from 'prop-types'
import { registerRouter, releaseRouter, routeFromDepth } from './core'
import { path, params } from 'react-easy-params'
import { toPathArray, rethrow, defaults, RoutingStatus } from './urlUtils'

const stateShell = {
  toPage: undefined,
  pageResolved: undefined,
  resolvedData: undefined
}

export default class Router extends PureComponent {
  static propTypes = {
    defaultPage: PropTypes.string.isRequired,
    onRoute: PropTypes.func,
    enterAnimation: PropTypes.object,
    leaveAnimation: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object
  };

  static childContextTypes = { easyRouterDepth: PropTypes.number };
  static contextTypes = { easyRouterDepth: PropTypes.number };

  state = {};

  getChildContext () {
    return { easyRouterDepth: this.depth + 1 }
  }

  get depth () {
    return this.context.easyRouterDepth || 0
  }

  componentWillUnmount () {
    releaseRouter(this, this.depth)
  }

  componentDidMount () {
    registerRouter(this, this.depth)
  }

  route ({ to, params, options } = {}) {
    routeFromDepth(to, params, options, this.depth)
  }

  init (fromPage, toPage) {
    const toChild = this.selectChild(toPage)
    const { resolve, timeout, page, defaultParams } = toChild.props

    path.splice(this.depth, Infinity, page)
    if (defaultParams) {
      defaults(params, defaultParams)
    }
    this.onRoute(fromPage, page)

    return toChild
  }

  resolve (toChild) {
    const { resolve, timeout, page: toPage } = toChild.props
    const resolveThreads = []
    const nextState = { toPage }

    if (resolve) {
      resolveThreads.push(
        Promise.resolve()
          .then(resolve)
          .then(resolvedData =>
            Object.assign(nextState, { resolvedData, pageResolved: true })
          )
      )
      // this is not okay like this!!, I would also need a status check
      // resolveThread.then(() => this.replaceState(nextState))
      if (timeout) {
        resolveThreads.push(this.wait(timeout).then(() => nextState))
      }
      return Promise.race(resolveThreads)
    }
    return nextState
  }

  switch (nextState, fromPage) {
    const { enterAnimation, leaveAnimation } = this.props
    const { toPage } = nextState

    if (this.routingStatus) {
      this.routingStatus.cancelled = true
    }
    const status = (this.routingStatus = new RoutingStatus())

    // leave, update
    const switchPromise = Promise.resolve()
      .then(status.check(() => this.animate(leaveAnimation, fromPage, toPage)))
      .then(status.check(() => this.replaceState(nextState)))

    // enter
    switchPromise.then(
      status.check(() => this.animate(enterAnimation, fromPage, toPage))
    )

    return switchPromise
  }

  selectChild (toPage) {
    const { children, defaultPage } = this.props
    let toChild, defaultChild

    Children.forEach(children, child => {
      if (child.props.page === toPage) {
        toChild = child
      } else if (child.props.page === defaultPage) {
        defaultChild = child
      }
    })
    return toChild || defaultChild
  }

  onRoute (fromPage, toPage) {
    const { onRoute } = this.props

    if (onRoute) {
      onRoute({
        target: this,
        fromPage,
        toPage
      })
    }
  }

  wait (duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
  }

  replaceState (state) {
    defaults(state, stateShell)
    return new Promise(resolve => this.setState(state, resolve))
  }

  saveRef = routerNode => {
    this.routerNode = routerNode
  };

  animate ({ keyframes, options } = {}, fromPage, toPage) {
    const currentPage = toPathArray(location.pathname)[this.depth]
    if (
      keyframes &&
      options &&
      this.routerNode &&
      fromPage &&
      toPage !== fromPage &&
      toPage !== currentPage
    ) {
      const animation = this.routerNode.animate(keyframes, options)
      return new Promise(resolve => (animation.onfinish = resolve))
    }
  }

  render () {
    const { className, style } = this.props
    const { toPage, resolvedData, pageResolved } = this.state

    let toChild
    if (!toPage) {
      toChild = null
    } else if (isValidElement(resolvedData)) {
      // no need to pass pageResolved here, it would always be true
      toChild = resolvedData
    } else {
      toChild = this.selectChild(toPage)
      if (toChild.props.resolve) {
        toChild = cloneElement(
          this.selectChild(toPage),
          Object.assign({}, { pageResolved }, resolvedData)
        )
      }
    }

    return (
      <div className={className} style={style} ref={this.saveRef}>
        {toChild}
      </div>
    )
  }
}

function promiseRace (promises) {
  return promises.length ? Promise.race(promises) : Promise.resolve()
}
