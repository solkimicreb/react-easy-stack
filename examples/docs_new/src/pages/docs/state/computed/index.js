import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-easy-stack';
import Page from '../../../../components/Page';
import Browser from '../../../../components/Browser';
import GetterDemo from './portals/GetterDemo';
import content from './content.md';

export default props => (
  <Page html={content} {...props}>
    <Link
      to="../mutations"
      scroll={{ anchor: 'keeping-the-store-pure' }}
      portal="mutators-link"
    >
      separate mutator methods
    </Link>
    <Browser mount="getter-demo">{GetterDemo}</Browser>
  </Page>
);