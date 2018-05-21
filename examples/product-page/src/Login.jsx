import React, { Component, Fragment } from "react";
import { view, store, route } from "react-easy-stack";
import FormGroup from "@material-ui/core/FormGroup";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import * as app from "./appStore";

const pageStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  padding: "inherit"
};

const buttonStyle = {
  marginTop: 15
};

class Login extends Component {
  store = store();

  onChange = ev => {
    this.store[ev.target.name] = ev.target.value;
  };

  onLogin = async () => {
    await app.login(this.store);
    route({ to: "/products" });
  };

  onRegister = async () => {
    await app.register(this.store);
    route({ to: "/products" });
  };

  render() {
    return (
      <form style={pageStyle}>
        <FormGroup>
          <TextField
            type="email"
            name="email"
            label="Email"
            autoComplete="email"
            margin="dense"
            onChange={this.onChange}
          />
          <TextField
            type="password"
            name="pass"
            label="Password"
            autoComplete="current-password"
            margin="dense"
            onChange={this.onChange}
          />
          <TextField
            name="username"
            label="Username"
            autoComplete="username"
            margin="dense"
          />
          <Button
            onClick={this.onLogin}
            variant="raised"
            color="primary"
            style={buttonStyle}
          >
            Login
          </Button>
          <Button
            onClick={this.onRegister}
            variant="raised"
            style={buttonStyle}
          >
            Register
          </Button>
        </FormGroup>
      </form>
    );
  }
}

export default view(Login);
