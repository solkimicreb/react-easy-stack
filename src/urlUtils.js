import { getParams } from 'react-easy-params'
import pushState from 'history-throttler'

export function normalizePath (path, depth) {
  let tokens = path.split('/')

  // an absolute path
  // TODO -> validate it!
  if (tokens[0] === '') {
    return tokens.slice(1)
  }

  // remove '.' tokens
  tokens = tokens.filter(notInPlace)

  let parentTokensAllowed = true
  // remove empty tokens
  const result = location.pathname.split('/').filter(notEmpty)

  for (let token of tokens) {
    if (depth < 0) {
      throw new Error(`Malformed path: ${path}, too many '..' tokens.`)
    }
    if (token === '') {
      throw new Error(`Malformed path: ${path}, can not contain empty tokens.`)
    }
    if (token === '..') {
      if (!parentTokensAllowed) {
        throw new Error(
          `Malformed path: ${path}, '..' tokens are only allowed at the beginning.`
        )
      }
      depth--
    } else {
      result[depth] = token
      parentTokensAllowed = false
      depth++
    }
  }

  result.length = depth
  return result
}

export function isLinkActive (linkPages, linkParams) {
  if (linkPages) {
    const pathPages = getPages()
    for (let i = 0; i < linkPages.length; i++) {
      if (linkPages[i] !== pathPages[i]) {
        return false
      }
    }
  }
  if (linkParams) {
    const queryParams = getParams()
    for (let param in linkParams) {
      if (linkParams[param] !== queryParams[param]) {
        return false
      }
    }
  }
  return true
}

export function setPages (pages) {
  const url = pages.join('/') + location.search + location.hash
  pushState(history.state, '', url)
}

export function getPages () {
  return location.pathname.split('/').filter(notEmpty)
}

function notInPlace (token) {
  return token !== '.'
}

function notEmpty (token) {
  return token !== ''
}
