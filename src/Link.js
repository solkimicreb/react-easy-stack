import React, {
  Component,
  Children,
  PropTypes,
  createElement,
  cloneElement
} from 'react'
import { easyComp } from 'react-easy-state'
import { toPages } from './urlUtils'
import { route } from './core'
import { params, pages } from './observables'

class Link extends Component {
  static propTypes = {
    to: PropTypes.string,
    element: PropTypes.string,
    activeClass: PropTypes.string,
    params: PropTypes.object,
    options: PropTypes.object,
    onClick: PropTypes.func,
    className: PropTypes.string
  }

  static contextTypes = {
    easyRouterDepth: PropTypes.number
  }

  static defaultProps = {
    element: 'a',
    activeClass: '',
    className: ''
  }

  get linkDepth () {
    const { to } = this.props
    const depth = this.context.easyRouterDepth || 0
    const isRelative = !to || to[0] !== '/'
    return isRelative ? depth : 0
  }

  isLinkActive () {
    return this.isLinkPagesActive() && this.isLinkParamsActive()
  }

  isLinkPagesActive () {
    const { to } = this.props
    if (to) {
      const linkPages = toPages(to)
      return linkPages.every(
        (linkPage, i) => linkPage === pages[i + this.linkDepth]
      )
    }
    return true
  }

  isLinkParamsActive () {
    const linkParams = this.props.params
    if (linkParams) {
      for (let param in linkParams) {
        if (linkParams[param] !== params[param]) {
          return false
        }
      }
    }
    return true
  }

  onClick (ev) {
    ev.preventDefault()
    const { onClick, params, options, to } = this.props
    if (onClick) {
      onClick(ev)
    }

    route(toPages(to), params, options, this.linkDepth)
  }

  render () {
    let { to, element, children, activeClass, params, className } = this.props
    const { onClick, isLinkActive } = this

    if (activeClass && isLinkActive()) {
      className = `${className} ${activeClass}`
    }

    const anchor = createElement('a', { onClick, href: to }, children)
    if (element === 'a') {
      return cloneElement(anchor, { className }, children)
    }
    return createElement(element, { className }, anchor)
  }
}

export default easyComp(Link)
