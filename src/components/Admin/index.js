import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
//import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';
import { SignUpLink } from '../SignUp';

import { Header, Loader, Table, Button, Card, Form, Divider } from 'semantic-ui-react';

const AdminPage = () => (
  <div>
   <Header as="h2">Admin</Header>
    <p>The Admin Page is accessible by every signed in admin user.</p>

    <Switch>
      <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
      <Route exact path={ROUTES.ADMIN} component={UserList} />
    </Switch>

    
  </div>
);

class UserListBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
      sensorName: "",
      sensorDescription: ""
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();
      console.log("USERS OBJECT: ", usersObject);
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }));

      this.setState({
        users: usersList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }
  onChangeText1 = event => {
    this.setState({ sensorName: event.target.value });
  }

  onChangeText2 = event => {
    this.setState({ sensorDescription: event.target.value });
  }

  onCreateSensorType = (event) => {
    event.preventDefault();
    console.log("in state", this.state.sensorName, this.state.sensorDescription);
  }
  
  render() {
    const { users, loading, sensorName, sensorDescription } = this.state;

    return (
      <div>
         <Header as="h2">Users</Header>
        {loading ? (
          <Loader active inline />
        ) : (
          <Table singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Username</Table.HeaderCell>
              <Table.HeaderCell>Email Address</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.map((user, i) => (
              <Table.Row key={i}>
                <Table.Cell>{user.uid}</Table.Cell>
                <Table.Cell>{user.username}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <Button
                    primary
                    as={Link}
                    to={{
                      pathname: `${ROUTES.ADMIN}/${user.uid}`,
                      state: { user },
                    }}
                  >
                    Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        )}
         <Divider horizontal section>
              New User
            </Divider>
       <SignUpLink />
       <Divider horizontal section>
              New Sensor Type
            </Divider>
       <Form onSubmit={event =>  this.onCreateSensorType(event)}>
            <Form.Field>
              <label>Nazwa sensora</label>
              <input
                type="text"
                value={sensorName}
                onChange={this.onChangeText1}
              />
              
            </Form.Field>
            <Form.Field>
              <label>Opis sensora</label>
              <textarea
                type="textarea"
                value={sensorDescription}
                onChange={this.onChangeText2}
              />
              
            </Form.Field>
            <Button primary  type="submit">
              Submit
            </Button>
          </Form>
      </div>
    );
  }
}

class UserItemBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      user: null,
      ...props.location.state,
    };
  }

  componentDidMount() {
    
    if (this.state.user) {
      
      return;
    }

    this.setState({ loading: true });

    this.props.firebase
      .user(this.props.match.params.id)
      .on('value', snapshot => {
        this.setState({
          user: snapshot.val(),
          loading: false,
        });
      });
  }

  componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off();
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email);
  };

  render() {
    const { user, loading } = this.state;

    return (
      <>
          <Card fluid={true}>
        {loading ? (
          <Loader active inline="centered" />
        ) : (
          <Card.Content>
            <Card.Header>User: {user.uid}</Card.Header>
            <Card.Description>
              {user && (
                <div>
                  <Card.Content>
                    <Card.Meta>
                      <span>Username: {user.username}</span>
                    </Card.Meta>
                    <Card.Description>{user.email}</Card.Description>
                    <br />
                    <Button
                      primary
                      type="button"
                      onClick={this.onSendPasswordResetEmail}
                    >
                      Send Password Reset
                    </Button>
                  </Card.Content>
                </div>
              )}
            </Card.Description>
          </Card.Content>
        )}
      </Card>
     
       </>
    );
  }
}

const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);

const condition = authUser =>
  // authUser && authUser.roles.includes(ROLES.ADMIN);
  authUser && authUser.isAdmin;

export default compose(
 
  withAuthorization(condition),
)(AdminPage);