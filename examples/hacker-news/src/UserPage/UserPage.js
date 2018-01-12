import React from 'react'
import { easyComp } from 'react-easy-stack'

function UserPage ({ id, created, karma, about }) {
  return (
    <div>
      <p>user: {id}</p>
      <p>created: {created}</p>
      <p>karma: {karma}</p>
      <p>about: <span dangerouslySetInnerHTML={{ __html: about }} /></p>
    </div>
  )
}

export default easyComp(UserPage)
