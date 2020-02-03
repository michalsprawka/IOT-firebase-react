import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import {
  Grid,
  Form,
  Button,
  Header,
  Table,
  Loader,
  Divider
} from "semantic-ui-react";

import { AuthUserContext, withAuthorization } from "../Session";

import { withFirebase } from "../Firebase";

class HomeBaseComponent extends Component {
  state = {
    loading: false,
    sensors: [],
    sensorTypes: [],
    sensorName: "",
    sensorTypeID: "",
    sensorCheck: false
  };

  componentDidMount() {
    // console.log("PROPS", this.props);
    // this.props.firebase.sensors(this.props.authUser.uid)
    // .on('value', snapshot => {
    //   if(snapshot.val()) {
    //     console.log("snapshot:  ", snapshot.val())
    //      }
    //      else{
    //        console.log("there is no sensors");
    //      }
    //     }
    //   )
    //console.log("item: ", JSON.parse(localStorage.getItem('authUser')));
    this.onListenSensors();
    this.onListenSensorTypes();
  }

  componentWillUnmount() {
    this.props.firebase.sensors(this.props.authUser.uid).off();
    this.props.firebase.sensorTypes().off();
  }

  onListenSensors = () => {
    this.setState({ loading: true });
    this.props.firebase
      .sensors(this.props.authUser.uid)
      .on("value", snapshot => {
        const sensorsObject = snapshot.val();
        if (sensorsObject) {
          const sensorsList = Object.keys(sensorsObject).map(key => ({
            ...sensorsObject[key],
            uid: key
          }));
          console.log("sensorsList:  ", sensorsList);
          this.setState({
            sensors: sensorsList,
            loading: false
          });
        } else {
          this.setState({ sensors: null, loading: false });
        }
      });
  };
  onListenSensorTypes = () => {
    this.setState({ loading: true });
    this.props.firebase.sensorTypes().on("value", snapshot => {
      const sensorTypesObject = snapshot.val();
      if (sensorTypesObject) {
        console.log("SENSORTYPES OBJECT: ", sensorTypesObject);
        const sensorTypesList = Object.keys(sensorTypesObject).map(key => ({
          ...sensorTypesObject[key],
          key: key,
          value: key,
          // name: "sensorTypeID",
          text: sensorTypesObject[key].name
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
  };

  onAddSensor = event => {
    event.preventDefault();
    const newKey = this.props.firebase
      .sensors(this.props.authUser.uid)
      .push({
        data: 0,
        readingDate: this.props.firebase.serverValue.TIMESTAMP,
        name: this.state.sensorName,
        type: this.state.sensorTypeID
      }).key;
    console.log("New key", newKey);
    console.log("CLICKED");
  };

  // onCreateSensor = event => {
  //   event.preventDefault();
  //   console.log("Clicked", this.state.sensorName);
  // };

  // onChangeText = event => {
  //   this.setState({ sensorName: event.target.value });
  // };

  // onChangeSensorType = (event, {value}) => {
  //   console.log("EVENT", value);
  //  this.setState({sensorTypeID: value})
  // }

  onChange = (event, result) => {
    const { name, value } = result || event.target;
    console.log("NAME", name);
    console.log("Value", value);
    this.setState({ [name]: value });
  };

  // onChangeSensorCheck = (event, {checked}) => {
  //   console.log("EVENT", checked);
  //  this.setState({sensorCheck: checked})
  // }

  // onTest = uid => {
  //   console.log("UID", uid);
  //   this.props.firebase.user(uid).update({ isAdmin: true });
  //   //this.props.firebase.sensor(uid,"-LzWWsU5VSAjKdRagP6w").update( {data : 2} );
  // };

  render() {
    const {
      sensors,
      sensorName,
      loading,
      sensorTypes,
      sensorTypeID
    } = this.state;
    console.log("sensor type ID", sensorTypeID);
    return (
      <div style={{ margin: "30px" }}>
        <Header as="h2" textAlign="center">
          Home Page Jesteś zalogowany jako {this.props.authUser.uid}
        </Header>
        {loading ? (
          <Loader active inline />
        ) : (
          <>
            <Divider horizontal section>
              Your sensors
            </Divider>
            <Table singleLine>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>data</Table.HeaderCell>
                  <Table.HeaderCell>date of read</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sensors.map((sensor, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>{sensor.uid}</Table.Cell>
                    <Table.Cell>{sensor.data}</Table.Cell>
                    <Table.Cell>
                      {new Date(sensor.readingDate).toLocaleString()}
                    </Table.Cell>

                    <Table.Cell>
                      <Button primary as={Link} to={{}}>
                        Detail
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <Divider horizontal section>
              Add new sensor
            </Divider>

            <Grid centered columns={2}>
              <Grid.Column>
                <div>
                  <Form onSubmit={event => this.onAddSensor(event)}>
                    <Form.Field>
                      <label>Nazwa sensora</label>
                      <input
                        name="sensorName"
                        type="text"
                        value={sensorName}
                        onChange={this.onChange}
                        placeholder="think about name of your sensor..."
                      />
                    </Form.Field>
                    <Form.Select
                      fluid
                      label="Type"
                      name="sensorTypeID"
                      options={sensorTypes}
                      value={sensorTypeID}
                      onChange={this.onChange}
                      placeholder="choose sensor type"
                    />
                    {/* <Form.Checkbox label='I agree to the Terms and Conditions' 
                          onChange={this.onChangeSensorCheck}
                          //value={sensorCheck}
                          checked={sensorCheck }

                      /> */}
                    <Button primary type="submit">
                      Submit
                    </Button>
                  </Form>
                </div>
              </Grid.Column>
            </Grid>
          </>
        )}
      </div>
    );
  }
}
const HomePage = props => (
  <AuthUserContext.Consumer>
    {authUser => <HomeBaseComponent authUser={authUser} {...props} />}
  </AuthUserContext.Consumer>
);

const condition = authUser => !!authUser;

export default compose(withFirebase, withAuthorization(condition))(HomePage);
