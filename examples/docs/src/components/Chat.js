import React, { Component, Fragment } from 'react';
import { store, view, path } from 'react-easy-stack';
import styled from 'styled-components';
import Drawer from './Drawer';
import { colors, ease, layout } from './theme';

export const chatStore = store({
  open: !layout.isMobile
});

export function open() {
  chatStore.open = true;
}

export function close() {
  chatStore.open = false;
}

export function toggle() {
  if (!chatStore.open) {
    open();
  } else {
    close();
  }
}

const StyledChat = styled.div`
  border-left: 1px solid #ddd;
`;

class Chat extends Component {
  ref = React.createRef();

  componentDidMount() {
    this.listener = ev => (ev.detail.state ? open() : close());
    this.ref.current.addEventListener('gitter-chat-toggle', this.listener);
  }

  componentWillUnmount() {
    this.ref.current.removeEventListener('gitter-chat-toggle', this.listener);
  }

  render() {
    return (
      <Drawer
        width="full"
        docked={!layout.isMobile}
        right={true}
        open={chatStore.open}
        onOpen={open}
        onClose={close}
      >
        <StyledChat innerRef={this.ref} id="chat" />
      </Drawer>
    );
  }
}

export default view(Chat);
