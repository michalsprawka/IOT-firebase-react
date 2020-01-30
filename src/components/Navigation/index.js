import React from "react";
import { Link } from "react-router-dom";

import SignOutButton from "../SignOut";
import * as ROUTES from "../../constants/routes";

import { AuthUserContext } from "../Session";

import { Container, Menu } from "semantic-ui-react";

const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? (
          <NavigationAuth authUser={authUser} />
        ) : (
          <NavigationNonAuth />
        )
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = ({ authUser }) => (
  <Menu inverted>
    <Container>
      <Menu.Item name="Landing" as={Link} to={ROUTES.LANDING} />
      <Menu.Item name="home" as={Link} to={ROUTES.HOME} />
      <Menu.Item name="Account" as={Link} to={ROUTES.ACCOUNT} />
      {authUser.isAdmin && (
        <Menu.Item name="Admin" as={Link} to={ROUTES.ADMIN} />
      )}
      <SignOutButton />
    </Container>
  </Menu>
);

const NavigationNonAuth = () => (
  <Menu inverted>
    <Container>
      <Menu.Item header>IOT Sandbox</Menu.Item>
      <Menu.Item name="home" as={Link} to={ROUTES.LANDING} />
      <Menu.Menu position="right">
        <Menu.Item name="signin" as={Link} to={ROUTES.SIGN_IN} />
      </Menu.Menu>
    </Container>
  </Menu>
);

export default Navigation;
