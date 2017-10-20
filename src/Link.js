import React, {
  Component,
  Children,
  PropTypes,
  createElement,
  cloneElement
} from 'react'
import { easyComp } from 'react-easy-state'
import { getParams } from 'react-easy-params'
import { normalizePath, isLinkActive } from './urlUtils'
import { route } from './core'

class Link extends Component {
  static propTypes = {
    to: PropTypes.string,
    element: PropTypes.string,
    activeClass: PropTypes.string,
    params: PropTypes.object,
    onClick: PropTypes.func,
    className: PropTypes.string
  }

  static contextTypes = {
    easyRouterDepth: PropTypes.number
  }

  static defaultProps = {
    element: 'a',
    activeClass: 'active'
  }

  get depth () {
    return this.context.easyRouterDepth || 0
  }

  onClick(ev) {
    ev.preventDefault()
    route(this.tokens, this.props.params)
    if (this.props.onClick) {
      this.props.onClick(ev)
    }
  }

  updateActivity() {
    this.forceUpdate()
  }

  render() {
    const { to, element, children, activeClass } = this.props
    const { onClick } = this

    if (to) {
      this.tokens = normalizePath(to, this.depth)
    }

    // also take in the params for this!
    const href = this.tokens ? this.tokens.join('/') : ''

    const isActive = isLinkActive(this.tokens, this.props.params)
    let className = isActive ? activeClass : ''
    if (this.props.className) {
      className += ` ${this.props.className}`
    }

    const anchor = createElement('a', { onClick, href }, children)
    if (element === 'a') {
      return cloneElement(anchor, { className }, children)
    }
    return createElement(element, { className }, anchor)
  }
}

export default easyComp(Link)
