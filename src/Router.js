import React, { Component, Children, isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { registerRouter, releaseRouter, route } from './core';
import { path, params } from 'react-easy-params';

export default class Router extends Component {
  static propTypes = {
    onRoute: PropTypes.func,
    defaultPage: PropTypes.string.isRequired,
    className: PropTypes.string,
    timeout: PropTypes.number
  };

  static childContextTypes = {
    easyRouterDepth: PropTypes.number
  };

  static contextTypes = {
    easyRouterDepth: PropTypes.number
  };

  get depth() {
    return this.context.easyRouterDepth || 0;
  }

  getChildContext() {
    return { easyRouterDepth: this.depth + 1 };
  }

  state = {}

  componentWillUnmount() {
    releaseRouter(this, this.depth)
  }

  componentDidMount() {
    registerRouter(this, this.depth)
  }

  route (routeConfig) {
    route(routeConfig, this.depth)
  }

  _route(fromPage, toPage) {
    const { timeout, enterAnimation, leaveAnimation } = this.props
    const toChild = this.selectChild(toPage)
    toPage = toChild.props.page

    path[this.depth] = toPage
    this.setDefaultParams(toChild)

    const defaultPrevented = this.onRoute(fromPage, toPage)
    if (defaultPrevented) {
      return Promise.resolve()
    }

    const { resolve } = toChild.props
    const routingThreads = []
    let pending = true
    let timedOut = false

    if (resolve && timeout) {
      routingThreads.push(
        this.wait(timeout)
          .then(() => pending && this.animate(leaveAnimation, fromPage, toPage))
          .then(() => pending && this.updateState({ toPage, pageResolved: undefined }))
          .then(() => (timedOut = true))
      )
    }

    routingThreads.push(
      Promise.resolve()
        .then(() => resolve && resolve())
        .then(() => !timedOut && this.animate(leaveAnimation, fromPage, toPage))
        // this should come after!
        .then(() => (pending = false))
        .then(
          resolvedData => this.updateState({ toPage, pageResolved: true, resolvedData }),
          error => this.handleError(error, { toPage, pageResolved: false })
        )
    )

    const routing = Promise.race(routingThreads)
    routing.then(() => this.animate(enterAnimation, fromPage, toPage))
    return routing
  }

  setDefaultParams (toChild) {
    const { defaultParams } = toChild.props
    if (defaultParams) {
      for (let key in defaultParams) {
        if (params[key] === undefined) {
          params[key] = defaultParams[key]
        }
      }
    }
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
    let defaultPrevented = false

    if (onRoute) {
      onRoute({
        target: this,
        fromPage,
        toPage,
        preventDefault: () => (defaultPrevented = true)
      })
    }
    return defaultPrevented
  }

  wait (duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
  }

  handleError (error, state) {
    return this.updateState(state)
      .then(() => {
        throw error
      })
  }

  updateState (state) {
    return new Promise(resolve => this.setState(state, resolve))
  }

  saveRef = routerNode => {
    this.routerNode = routerNode
  }

  animate ({ keyframes, options } = {}, fromPage, toPage) {
    if (keyframes && options && this.routerNode && fromPage && toPage !== fromPage) {
      const animation = this.routerNode.animate(keyframes, options)
      return new Promise(resolve => animation.onfinish = resolve)
    }
  }

  render() {
    const { className, style } = this.props
    const { toPage, resolvedData, pageResolved } = this.state

    let toChild
    if (!toPage) {
      toChild = null
    } else if (isValidElement(resolvedData)) {
      toChild = cloneElement(resolvedData, { pageResolved })
    } else {
      toChild = cloneElement(
        this.selectChild(toPage),
        Object.assign({}, { pageResolved }, resolvedData)
      )
    }

    return (
      <div className={className} style={style} ref={this.saveRef}>
        {toChild || null}
      </div>
    )
  }
}
