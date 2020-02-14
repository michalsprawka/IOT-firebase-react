import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import { withAuthorization } from "../Session";
import * as ROUTES from "../../constants/routes";
import { SignUpLink } from "../SignUp";

import {
  Header,
  Loader,
  Table,
  Button,
  Card,
  Form,
  Divider
} from "semantic-ui-react";

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
      sensorTypes: [],
      actuatorTypes: [],
      sensorName: "",
      sensorDescription: "",
      actuatorName: "",
      actuatorDescription: "",
      modalindex: 0
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on("value", snapshot => {
      const usersObject = snapshot.val();
      console.log("USERS OBJECT: ", usersObject);
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }));

      this.setState({
        users: usersList,
        loading: false
      });
    });

    this.props.firebase.sensorTypes().on("value", snapshot => {
      const sensorTypesObject = snapshot.val();
      if (sensorTypesObject) {
        console.log("SENSORTYPES OBJECT: ", sensorTypesObject);
        const sensorTypesList = Object.keys(sensorTypesObject).map(key => ({
          ...sensorTypesObject[key],
          uid: key
        }));

        this.setState({
          sensorTypes: sensorTypesList,
          loading: false
        });
      } else {
        this.setState({
          sensorTypes: null,
          loading: false
        });
      }
    });

    this.props.firebase.actuatorTypes().on("value", snapshot => {
      const actuatorTypesObject = snapshot.val();
      if (actuatorTypesObject) {
        console.log("ACTUATORS OBJECT: ", actuatorTypesObject);
        const actuatorTypesList = Object.keys(actuatorTypesObject).map(key => ({
          ...actuatorTypesObject[key],
          uid: key
        }));

        this.setState({
          actuatorTypes: actuatorTypesList,
          loading: false
        });
      } else {
        this.setState({
          actuatorTypes: null,
          loading: false
        });
      }
    });

  }

  componentWillUnmount() {
    this.props.firebase.users().off();
    this.props.firebase.sensorTypes().off();
    this.props.firebase.actuatorTypes().off();
  }
  // onChangeText1 = event => {
  //   this.setState({ sensorName: event.target.value });
  // };

  // onChangeText2 = event => {
  //   this.setState({ sensorDescription: event.target.value });
  // };
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onCreateSensorType = event => {
    event.preventDefault();
    this.props.firebase.sensorTypes().push({
      name: this.state.sensorName,
      description: this.state.sensorDescription
    });
  };

  onCreateActuatorType = event => {
    event.preventDefault();
    console.log(
      "in state",
      this.state.actuatorName,
      this.state.actuatorDescription
    );
    this.props.firebase.actuatorTypes().push({
      name: this.state.actuatorName,
      description: this.state.actuatorDescription,
      modalindex: this.state.modalindex
    });
  };

  render() {
    const {
      users,
      loading,
      sensorName,
      sensorDescription,
      sensorTypes,
      actuatorName,
      actuatorDescription,
      actuatorTypes,
      modalindex
    } = this.state;

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
                        state: { user }
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
        <Header as="h2">Sensor Types</Header>
        <Divider horizontal section>
          SensorTypes
        </Divider>
        <Table fixed singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Type Name</Table.HeaderCell>
              <Table.HeaderCell>Type Description</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sensorTypes && sensorTypes.map((type, i) => (
              <Table.Row key={i}>
                <Table.Cell>{type.uid}</Table.Cell>
                <Table.Cell>{type.name}</Table.Cell>
                <Table.Cell>{type.description}</Table.Cell>
                <Table.Cell>
                  <Button primary as={Link} to={{}}>
                    Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Divider horizontal section>
          New Sensor Type
        </Divider>
        <Form onSubmit={event => this.onCreateSensorType(event)}>
          <Form.Field>
            <label>Nazwa sensora</label>
            <input
              name="sensorName"
              type="text"
              value={sensorName}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Opis sensora</label>
            <textarea
              name="sensorDescription"
              type="textarea"
              value={sensorDescription}
              onChange={this.onChange}
            />
          </Form.Field>
          <Button primary type="submit">
            Submit
          </Button>
        </Form>
        
        <Header as="h2">Actuator Types</Header>
        <Divider horizontal section>
          ActuatorTypes
        </Divider>
        <Table fixed singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Type Name</Table.HeaderCell>
              <Table.HeaderCell>Type Description</Table.HeaderCell>
              <Table.HeaderCell>Modal Index</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {actuatorTypes && actuatorTypes.map((type, i) => (
              <Table.Row key={i}>
                <Table.Cell>{type.uid}</Table.Cell>
                <Table.Cell>{type.name}</Table.Cell>
                <Table.Cell>{type.description}</Table.Cell>
                <Table.Cell>{type.modalindex}</Table.Cell>

                <Table.Cell>
                  <Button primary as={Link} to={{}}>
                    Details
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Divider horizontal section>
          New Actuator Type
        </Divider>
        <Form onSubmit={this.onCreateActuatorType}>
          <Form.Field>
            <label>Nazwa aktuatora</label>
            <input
              name="actuatorName"
              type="text"
              value={actuatorName}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Modal Index</label>
            <input
              name="modalindex"
              type="number"
              value={modalindex}
              onChange={this.onChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Opis aktuatora</label>
            <textarea
              name="actuatorDescription"
              type="textarea"
              value={actuatorDescription}
              onChange={this.onChange}
            />
          </Form.Field>
          <Button primary type="submit">
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
      ...props.location.state
    };
  }

  componentDidMount() {
    if (this.state.user) {
      console.log("State user: ", this.state.user);
      return;
    }

    this.setState({ loading: true });

    this.props.firebase
      .user(this.props.match.params.id)
      .on("value", snapshot => {
        this.setState({
          user: snapshot.val(),
          loading: false
        });
      });
  }

  componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off();
  //  this.props.firebase.user().off();
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

export default compose(withAuthorization(condition))(AdminPage);
