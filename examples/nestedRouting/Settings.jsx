import React, { Component } from 'react'
import { Router, Link } from 'react-easy-stack'

export default class Settings extends Component {
  render () {
    return (
      <div>
        <Link to='privacy'>Privacy</Link>
        <Link to='user'>User</Link>
        <Router defaultPage='privacy' className='router' leaveClass='leave' enterClass='enter' duration={200}>
          <div page='privacy' resolve={() => new Promise(resolve => setTimeout(resolve, 1000))}>Privacy Settings</div>
          <div page='user'>User Settings</div>
        </Router>
      </div>
    )
  }
}
