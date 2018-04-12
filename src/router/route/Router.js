import React, { PureComponent, Children } from 'react';
import PropTypes from 'prop-types';
import { div, animate } from 'env';
import { path, params } from '../integrations';
import { log, addExtraProps } from '../utils';
import { registerRouter, releaseRouter, routeFromDepth } from './core';

export default class Router extends PureComponent {
  static propTypes = {
    defaultPage: PropTypes.string,
    notFoundPage: PropTypes.string,
    onRoute: PropTypes.func,
    enterAnimation: PropTypes.object,
    leaveAnimation: PropTypes.object,
    element: PropTypes.any
  };

  static defaultProps = {
    element: div
  };

  static childContextTypes = { easyRouterDepth: PropTypes.number };
  static contextTypes = { easyRouterDepth: PropTypes.number };

  get depth() {
    return this.context.easyRouterDepth || 0;
  }

  getChildContext() {
    return { easyRouterDepth: this.depth + 1 };
  }

  state = {};

  componentDidMount() {
    registerRouter(this, this.depth);
  }

  componentWillUnmount() {
    releaseRouter(this, this.depth);
  }

  route({ to, params, options } = {}) {
    routeFromDepth(to, params, options, this.depth);
  }

  route1(fromPage, toPage, fromParams) {
    const { onRoute, leaveAnimation } = this.props;

    if (this.fromDOM) {
      this.fromDOM.remove();
    }
    if (leaveAnimation) {
      const { firstElementChild } = this.container;
      this.fromDOM = firstElementChild && firstElementChild.cloneNode(true);
    }

    if (onRoute) {
      return onRoute({
        target: this,
        fromPage,
        toPage: toPage || this.props.defaultPage,
        fromParams,
        toParams: params
      });
    }
  }

  route2(toPage, resolvedData) {
    toPage = toPage || this.props.defaultPage || path[this.depth];
    const nextState = {
      resolvedData,
      toPage
    };
    // I need an inbetween step to calc the page!!
    // issue the order counts here, if the one with the defaultPage is routed last, I am screwed!!
    path[this.depth] = toPage;

    return new Promise(resolve => this.setState(nextState, resolve)).then(
      this.animate()
    );
  }

  selectChild(toPage) {
    const { notFoundPage } = this.props;
    const children = Children.toArray(this.props.children);

    const toChild = children.find(child => child.props.page === toPage);
    // mounted and has no child
    if (!toChild && this.container) {
      return children.find(child => child.props.page === notFoundPage);
    }
    return toChild;
  }

  saveRef = container => (this.container = container);

  animate() {
    const { enterAnimation, leaveAnimation } = this.props;
    const fromDOM = this.fromDOM;
    const toDOM = this.container.firstElementChild;

    if (enterAnimation && toDOM) {
      animate(enterAnimation, toDOM);
    }
    if (leaveAnimation && fromDOM) {
      this.container.appendChild(fromDOM);
      animate(leaveAnimation, fromDOM).then(() => {
        fromDOM.remove();
        this.fromDOM = undefined;
      });
    }
  }

  render() {
    const { onRoute, element } = this.props;
    const { toPage, resolvedData } = this.state;

    let toChild;
    if (React.isValidElement(resolvedData)) {
      toChild = resolvedData;
    } else {
      /// I should probably still clone here to make a fresh child on each render!
      toChild = this.selectChild(toPage);
      if (toChild && resolvedData) {
        toChild = React.cloneElement(toChild, resolvedData);
      }
    }

    return React.createElement(
      element,
      addExtraProps({ ref: this.saveRef }, this.props, Router.propTypes),
      toChild
    );
  }
}
