import { AsyncStorage, BackHandler, Text, View } from 'react-native'
import { Queue, priorities } from '@nx-js/queue-util'
import isNode, * as node from './node'

export const compScheduler = isNode ? node.compScheduler : new Queue(priorities.SYNC)
export const integrationScheduler = isNode ? node.integrationScheduler : new Queue(priorities.LOW)

// TODO -> this is async, which messes up the purpose -> I have to turn all of them into async
export const localStorage = isNode ? node.localStorage : AsyncStorage

function updateUrl (url = '') {
  let tokens = url.split('?')
  location.pathname = tokens[0]
  location.search = tokens[1] ? `?${tokens[1]}` : ''
  tokens = location.search.split('#')
  location.hash = tokens[1] ? `#${tokens[1]}` : ''
}

const historyItems = []
export const history = isNode
  ? node.history
  : {
    replaceState (state, title, url) {
      historyItems.pop()
      historyItems.push(url)
      updateUrl(url)
    },
    pushState (url) {
      historyItems.push(url)
      updateUrl(url)
    }
  }

export const location = isNode
  ? node.location
  : {
    pathname: '',
    search: '',
    hash: ''
  }

export const historyHandler = isNode
  ? node.historyHandler
  : handler => {
    const url = historyItems.pop()
    updateUrl(url)
    BackHandler.addEventListener('hardwareBackPress', handler)
  }

export const anchor = Text
export const div = View

export function normalizeProps (props) {
  delete props.className
  delete props.ref
  if (props.onClick && !props.onPress) {
    props.onPress = props.onClick
    delete props.onClick
  }
  return props
}
