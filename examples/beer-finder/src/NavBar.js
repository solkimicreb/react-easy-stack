import React from 'react'
import { view, params } from 'react-easy-stack'
import SearchBar from 'material-ui-search-bar'
import { LinearProgress } from 'material-ui/Progress'
import appStore from './appStore'

async function onRequestSearch (filter) {
  await appStore.fetchBeers(filter)
  params.filter = filter
}

export default view(() =>
  <div className='searchbar'>
    <SearchBar
      onRequestSearch={onRequestSearch}
      value={params.filter}
      placeholder='Some food ...'
    />
    {appStore.isLoading && <LinearProgress />}
  </div>
)
