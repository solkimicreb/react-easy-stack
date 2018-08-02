import React, { Fragment } from 'react'
import { view, store, path } from 'react-easy-stack'
import styled from 'styled-components'
import { colors, layout, ease } from './theme'
import * as sidebar from './Sidebar'
import Button from './Button'

const StyledApp = styled.main`
  transform: translateX(${props => props.correction / 2}px);
  transition: transform 0.15s;
  max-width: ${layout.appWidth}px;
  margin: ${layout.topbarHeight}px auto;
  margin-bottom: 0;
`

export default view(({ children }) => (
  <StyledApp correction={layout.correction}>{children}</StyledApp>
))
