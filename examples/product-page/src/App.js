import React, { Component, Fragment } from 'react';
import { Router, view, params, route } from 'react-easy-stack';
import NavBar from './NavBar';
import ProductList from './ProductList';
import ProductEditor from './ProductEditor';
import Login from './Login';
import Notification, { notify } from './Notification';
import appStore, * as app from './appStore';

const appStyle = {
  maxWidth: 880,
  margin: '50px auto',
  position: 'relative',
  padding: 20
};

const enterAnimation = {
  keyframes: {
    opacity: [0, 1],
    transform: ['translateX(-10px)', 'none']
  },
  delay: 200,
  duration: 200,
  fill: 'both'
};

const leaveAnimation = {
  keyframes: {
    opacity: [1, 0],
    transform: ['none', 'translateX(10px)']
  },
  duration: 200
};

class App extends Component {
  onRoute = ({ toPage }) => {
    if (toPage === 'product' && !appStore.isLoggedIn) {
      route({ to: '/login' });
      notify('You must be logged in to access the product editor page');
    }
  };

  render() {
    return (
      <Fragment>
        <NavBar />
        <Router
          defaultPage="products"
          onRoute={this.onRoute}
          style={appStyle}
          enterAnimation={enterAnimation}
          leaveAnimation={leaveAnimation}
        >
          <ProductList page="products" resolve={app.search} timeout={800} />
          <ProductEditor page="product" resolve={app.resolveProduct} />
          <Login page="login" />
        </Router>
        <Notification />
      </Fragment>
    );
  }
}

export default view(App);
