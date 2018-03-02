import React, { Component, Children, isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { registerRouter, releaseRouter, isRouting } from './core';
import { path, params } from 'react-easy-params';

export default class Router extends Component {
  static propTypes = {
    onRoute: PropTypes.func,
    className: PropTypes.string
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

  state = {};

  componentWillUnmount() {
    releaseRouter(this, this.depth)
  }

  componentDidMount() {
    registerRouter(this, this.depth)
  }

  route(fromPage, toPage) {
    const startTime = Date.now()

    const defaultPrevented = this.onRoute(fromPage, toPage)
    if (defaultPrevented) {
      throw new Error('Routing prevented')
    }

    this.setDefaultParams()
    const currentView = this.selectPage(toPage)

    return Promise.resolve()
      .then(() => this.resolveData(currentView))
      .then(currentView => this.enter(currentView))
  }

  setDefaultParams () {
    const { defaultParams } = this.props
    if (defaultParams) {
      for (let key in defaultParams) {
        if (params[key] === undefined) {
          params[key] = defaultParams[key]
        }
      }
    }
  }

  selectPage(toPage) {
    const { children, defaultPage } = this.props
    let currentView = Children.toArray(children).find(
      child => child.props.page === toPage
    )
    if (!currentView) {
      currentView = Children.toArray(children).find(
        child => child.props.page === defaultPage
      )
    }
    return currentView
  }

  onRoute (fromPage, toPage) {
    const { onRoute } = this.props;
    let defaultPrevented = false;

    if (onRoute) {
      onRoute({
        target: this,
        fromPage,
        toPage,
        preventDefault: () => (defaultPrevented = true)
      });
    }
    return defaultPrevented
  }

  resolveData (currentView) {
    const { resolve } = currentView.props

    if (resolve) {
      return Promise.resolve()
        .then(resolve)
        .then(data => this.handleResolvedData(data, currentView))
    }
    return currentView
  }

  handleResolvedData (data, currentView) {
    if (isValidElement(data)) {
      return data
    }
    if (typeof data === 'object') {
      return cloneElement(currentView, data)
    }
    return currentView
  }

  enter(currentView) {
    const { currentView: oldView } = this.state
    path[this.depth] = currentView.props.page

    if (currentView !== oldView) {
      return new Promise(resolve =>
        this.setState({ currentView }, resolve)
      )
    }
  }

  render() {
    const { className, style } = this.props
    const { currentView } = this.state

    return (
      <div className={className} style={style}>
        {currentView || null}
      </div>
    )
  }
}
