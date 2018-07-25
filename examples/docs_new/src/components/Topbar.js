import React from 'react';
import { view } from 'react-easy-stack';
import styled from 'styled-components';
import { colors, layout, ease } from './theme';
import * as sidebar from './Sidebar';
import ActionIcons from './ActionIcons';

const Topbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${layout.topbarHeight}px;
  background-color: ${colors.text};
  z-index: 50;
`;

const Navbar = styled.div`
  position: relative;
  left: ${props => props.correction / 2}px;
  font-size: 26px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  max-width: ${layout.appWidth}px;
  color: ${colors.textLight};

  svg,
  a {
    cursor: pointer;
    &:hover,
    &:active {
      color: ${colors.accentLight};
    }
  }
`;

const MenuItems = styled.div`
  display: flex;
  justify-content: ${props => (props.isMobile ? 'space-around' : 'flex-start')};
  width: ${props => (props.isMobile ? '100%' : 'auto')};
`;

const Actions = styled.div`
  svg {
    margin: 10px;
  }
`;

export default view(({ children }) => (
  <Topbar>
    <Navbar correction={layout.correction}>
      <MenuItems isMobile={layout.isMobile} className="items">
        {children}
      </MenuItems>
      {!layout.isMobile && (
        <Actions>
          <ActionIcons />
        </Actions>
      )}
    </Navbar>
  </Topbar>
));
