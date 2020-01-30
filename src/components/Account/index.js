import React from 'react';

import { AuthUserContext, withAuthorization } from '../Session';
import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';

import {
  Grid,
  Card,
  Header,
 
} from 'semantic-ui-react';

// const AccountPage = () => (
//   <AuthUserContext.Consumer>
//     {authUser => (
//       <div>
//         <h1>Account: {authUser.email}</h1>
//         <PasswordForgetForm />
//         <PasswordChangeForm />
//       </div>
//     )}
//   </AuthUserContext.Consumer>
// );

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <Header as="h2">Account: {authUser.email}</Header>
        <Grid columns={2}>
          <Grid.Column>
            <Card fluid={true}>
              <Card.Content>
                <Card.Header>Reset Password</Card.Header>
                <Card.Description>
                  <PasswordForgetForm />
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
          <Grid.Column>
            <Card fluid={true}>
              <Card.Content>
                <Card.Header>New Password</Card.Header>
                <Card.Description>
                  <PasswordChangeForm />
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
       
      </div>
    )}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);