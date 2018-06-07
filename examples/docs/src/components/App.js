import React, { Fragment } from "react";
import { view, store, path } from "react-easy-stack";
import styled from "styled-components";
import { colors, layout, ease } from "./theme";
import * as sidebar from "./Sidebar";
import Button from "./Button";

const StyledApp = styled.main`
  box-sizing: content-box;
  max-width: ${layout.appWidth}px;
  margin: ${layout.topbarHeight + 15}px auto;
  transform: ${props =>
    props.withSidebar ? `translateX(${layout.sidebarWidth / 2}px)` : "none"};
  transition: transform 0.15s ${ease.both};
`;

export default view(({ children }) => (
  <StyledApp withSidebar={sidebar.hasSidebar() && !layout.isMobile}>
    {children}
  </StyledApp>
));
