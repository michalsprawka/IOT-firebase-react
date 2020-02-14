// TODO
// Dodać on listensensortypes na wypadek niepobrania ze location
// Uzupełnić onEditSensor
// Dodać remove sensor i przekierowanie
// implementacja archiwum odczytów

// Dalej dodać sensorTypedetails

import { compose } from "recompose";
import React, { Component } from "react";

import { AuthUserContext, withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import { Header, Divider, Grid, Form, Button, Modal, Icon } from "semantic-ui-react";
import * as ROUTES from "../../constants/routes";
class SensorDetailBaseComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      sensor: null,
      ...props.location.state,
      sensorName: "",
      sensorTypeID: "",
      resetCheck: true,
      open: false
    };
  }

  componentDidMount() {
    if (this.state.sensor) {
      console.log("State sensor: ", this.state.sensor);
      console.log("State sensorTypes: ", this.state.sensorTypes);
      console.log("Props in detail : ", this.props);
      const sensorName = this.state.sensor.name;
      this.setState({ sensorName });
      const sensorTypeID = this.state.sensor.type;
      this.setState({ sensorTypeID });
      return;
    }
    this.setState({ loading: true });

    this.props.firebase
      .sensor(this.props.authUser.uid, this.props.match.params.id)
      .on("value", snapshot => {
        this.setState({
          sensor: snapshot.val(),
          sensorName: snapshot.val().name,
          loading: false
        });
      });

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
  }

  onEditSensor = event => {
    event.preventDefault();
    console.log("STATE: ", this.state);
    this.props.firebase
      .sensor(this.props.authUser.uid, this.state.sensor.uid)
      .update({
        name: this.state.sensorName,
        type: this.state.sensorTypeID,
        data: this.state.resetCheck ? 0 : this.state.sensor.data
      });
  };

  onChange = (event, result) => {
    const { name, value } = result || event.target;
    console.log("NAME", name);
    console.log("Value", value);
    this.setState({ [name]: value });
  };
  onChangeCheck = (event, { name, checked }) => {
    console.log("EVENT", checked);
    this.setState({ [name]: checked });
  };

  onRemoveSensor = () => {
   console.log("Remove");
    this.props.firebase
    .sensor(this.props.authUser.uid, this.state.sensor.uid)
    .remove();
    this.props.history.push(ROUTES.HOME)
  }
  close = () => {
    this.setState({open: false});
  }

  open = () => {
    this.setState({open: true});
  }
  render() {
    const {
      sensor,
      sensorName,
      sensorTypes,
      sensorTypeID,
      resetCheck,
      open
    } = this.state;
    return (
      <div>
        <Header as="h2">Sensor: {sensor.name}</Header>

        <Divider horizontal section>
          Edit sensor
        </Divider>
        <Grid centered columns={2}>
          <Grid.Column>
            <div>
              <Form onSubmit={event => this.onEditSensor(event)}>
                <Form.Field>
                  <label>Nazwa sensora</label>
                  <input
                    name="sensorName"
                    type="text"
                    value={sensorName}
                    onChange={this.onChange}
                    // placeholder="think about name of your sensor..."
                  />
                </Form.Field>
                <Form.Select
                  fluid
                  label="Type"
                  name="sensorTypeID"
                  options={sensorTypes}
                  value={sensorTypeID}
                  onChange={this.onChange}
                  // placeholder="choose sensor type"
                />
                <Form.Checkbox
                  label="Reset reading data ?"
                  name="resetCheck"
                  onChange={this.onChangeCheck}
                  //value={sensorCheck}
                  checked={resetCheck}
                />
                <Button primary type="submit">
                  Submit
                </Button>
              </Form>
            </div>
            <Divider horizontal section>
          Remove sensor
        </Divider>
            <Modal 
           open = {open} 
           closeOnDimmerClick={true}
            onClose={this.close} 
            trigger={<Button onClick={this.open} negative>Remove Sensor ?</Button>} basic size="small">
              <Header icon="archive" content="Archive Old Messages" />
              <Modal.Content>
                <p>
                  Would You like to remove sensor ?
                </p>
              </Modal.Content>
              <Modal.Actions>
                <Button basic color="red" inverted onClick={this.close}>
                  <Icon name="remove" /> No
                </Button>
                <Button color="green" inverted onClick= {this.onRemoveSensor}>
                  <Icon name="checkmark" /> Yes
                </Button>
              </Modal.Actions>
            </Modal>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

const SensorDetailPage = props => (
  <AuthUserContext.Consumer>
    {authUser => <SensorDetailBaseComponent authUser={authUser} {...props} />}
  </AuthUserContext.Consumer>
);
const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withAuthorization(condition)
)(SensorDetailPage);
