## store(obj)

### Description

Wraps the passed object with a reactive Proxy, that is invisible from the outside. The returned object behaves exactly like the passed one.

### Parameters

- `obj`: An object, which may also be an array, Map or Set.

### Return value

The passed object, wrapped in a transparent Proxy.

## view(Comp)

### Description

Wraps the passed component with a [higher-order component](https://reactjs.org/docs/higher-order-components.html), which re-renders when the reactive data - used inside its render - is mutated.

### Parameters

- `Comp`: A React component, which can be a function or a class.

### Return value

A wrapping higher-order component over the passed component.

## Comp.deriveStoresFromProps(props, ...stores)

### Description

Components wrapped with `view()` receive a new static `deriveStoresFromProps` lifecycle method. You can mutate the component's local stores directly inside it with data from the next props.

### Parameters

- `props`: The next props object of the component.
- `...stores`: The local stores of the component in definition order.
