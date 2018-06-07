import { Component } from "react";
import { observe, unobserve, raw, isObservable } from "@nx-js/observer-util";

// this is used to save the component on the state for static lifecycle methods
const COMPONENT = Symbol("owner component");
// this used for empty setState calls to trigger component updates
const DUMMY_STATE = {};

export default function view(Comp, { devtool: rawDevtool } = {}) {
  const isStatelessComp = !(Comp.prototype && Comp.prototype.isReactComponent);
  const BaseComp = isStatelessComp ? Component : Comp;

  const devtool = rawDevtool
    ? operation => rawDevtool(Object.assign({ Component: Comp }, operation))
    : undefined;

  // return a HOC which overwrites render, shouldComponentUpdate and componentWillUnmount
  // it decides when to run the new reactive methods and when to proxy to the original methods
  class ReactiveHOC extends BaseComp {
    constructor(props, context) {
      super(props, context);

      this.state = this.state || {};
      this.state[COMPONENT] = this;
      // create a reactive render for the component
      // run a dummy setState to schedule a new reactive render, avoid forceUpdate
      this.render = observe(this.render, {
        scheduler: () => this.setState(DUMMY_STATE),
        debugger: devtool,
        lazy: true
      });
    }

    render() {
      return isStatelessComp ? Comp(this.props, this.context) : super.render();
    }

    // react should trigger updates on prop changes, while easyState handles store changes
    shouldComponentUpdate(nextProps, nextState) {
      const { props, state } = this;

      // respect the case when user prohibits updates
      if (
        super.shouldComponentUpdate &&
        !super.shouldComponentUpdate(nextProps, nextState)
      ) {
        devtool && devtool({ type: "render", renderType: "blocked" });
        return false;
      }

      // return true if it is a reactive render or state changes
      if (state !== nextState) {
        devtool && devtool({ type: "render", renderType: "reactive" });
        return true;
      }

      // the component should update if any of its props shallowly changed value
      const keys = Object.keys(props);
      const nextKeys = Object.keys(nextProps);
      if (
        nextKeys.length !== keys.length ||
        nextKeys.some(key => props[key] !== nextProps[key])
      ) {
        devtool &&
          devtool({
            type: "render",
            renderType: "normal",
            props: nextProps,
            oldProps: props
          });
        return true;
      }
      return false;
    }

    // add a custom deriveStoresFromProps lifecyle method
    static getDerivedStateFromProps(props, state) {
      if (super.deriveStoresFromProps) {
        // inject all local stores and let the user mutate them directly
        const stores = mapStateToStores(state);
        super.deriveStoresFromProps(props, ...stores);
      }
      // respect user defined getDerivedStateFromProps
      if (super.getDerivedStateFromProps) {
        return super.getDerivedStateFromProps(props, state);
      }
      return null;
    }

    componentWillUnmount() {
      // call user defined componentWillUnmount
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }
      // clean up memory used by Easy State
      unobserve(this.render);
    }
  }

  ReactiveHOC.displayName = Comp.displayName || Comp.name;
  // static props are inherited by class components,
  // but have to be copied for function components
  if (isStatelessComp) {
    Object.assign(ReactiveHOC, Comp);
  }

  return ReactiveHOC;
}

function mapStateToStores(state) {
  // find store properties and map them to their none observable raw value
  // to do not trigger none static this.setState calls
  // from the static getDerivedStateFromProps lifecycle method
  const component = state[COMPONENT];
  return Object.keys(component)
    .map(key => component[key])
    .filter(isObservable)
    .map(raw);
}
