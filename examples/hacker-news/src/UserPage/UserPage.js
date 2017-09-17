import React from 'react'
import { easyComp } from 'react-easy-stack'
import user from './store'

function UserPage() {
  return (
    <div>
      <p>user: {user.id}</p>
      <p>created: {user.created}</p>
      <p>karma: {user.karma}</p>
      <p>about: <span dangerouslySetInnerHTML={{ __html: user.about }} /></p>
    </div>
  )
}

export default easyComp(UserPage)
