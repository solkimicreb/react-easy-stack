import React from "react";
import { view } from "react-easy-state";
import Contact from "./Contact";
import ContactCreator from "./ContactCreator";
import appStore from "./appStore";

// this rerenders whenever the appStore.contacts array changes (elements pushed or deleted)
function App() {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {appStore.contacts.map(contact => (
          <Contact contact={contact} key={contact.email} />
        ))}
        <ContactCreator />
      </tbody>
    </table>
  );
}

// wrap the component with view() before exporting it
export default view(App);
