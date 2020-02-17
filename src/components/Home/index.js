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
  Divider,
  Modal,
  Icon
} from "semantic-ui-react";

import { AuthUserContext, withAuthorization } from "../Session";

import { withFirebase } from "../Firebase";

import * as ROUTES from "../../constants/routes";

class HomeBaseComponent extends Component {
  state = {
    loading: false,
    sensors: [],
    sensorTypes: [],
    actuatorTypes: [],
    actuators: [],
    sensorName: "",
    sensorTypeID: "",
    sensorCheck: false,
    actuatorName: "",
    actuatorTypeID: "",
    open: false,
    addSensorVisible: false,
    addSensorLoading: false,
    addActuatorVisible: false,
    addActuatorLoading: false,

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
    this.onListenActuators();
   // this.onListenSensorTypes();
  //  this.onListenActuatorTypes();
  }

  componentWillUnmount() {
    this.props.firebase.sensors(this.props.authUser.uid).off();
    this.props.firebase.actuators(this.props.authUser.uid).off();
    this.props.firebase.sensorTypes().off();
    this.props.firebase.actuatorTypes().off();

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

  onListenActuators = () => {
    this.setState({ loading: true });
    this.props.firebase
      .actuators(this.props.authUser.uid)
      .on("value", snapshot => {
        const actuatorsObject = snapshot.val();
        if (actuatorsObject) {
          const actuatorsList = Object.keys(actuatorsObject).map(key => ({
            ...actuatorsObject[key],
            uid: key
          }));
          console.log("actuatorsList:  ", actuatorsList);
          this.setState({
            actuators: actuatorsList,
            loading: false
          });
        } else {
          this.setState({ actuators: null, loading: false });
        }
      });
  };
  onListenSensorTypes = () => {
    this.setState({ addSensorLoading: true });
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
          addSensorLoading: false
        });
      } else {
        this.setState({
          sensorTypes: null,
          addSensorLoading: false
        });
      }
    });
  };


  onListenActuatorTypes = () => {
    this.setState({ addActuatorLoading: true });
    this.props.firebase.actuatorTypes().on("value", snapshot => {
      const actuatorTypesObject = snapshot.val();
      if (actuatorTypesObject) {
        console.log("ACTUATORTYPES OBJECT: ", actuatorTypesObject);
        const actuatorTypesList = Object.keys(actuatorTypesObject).map(key => ({
          ...actuatorTypesObject[key],
          key: key,
          value: key,
          // name: "sensorTypeID",
          text: actuatorTypesObject[key].name
        }));

        this.setState({
          actuatorTypes: actuatorTypesList,
          addActuatorLoading: false
        });
      } else {
        this.setState({
          actuatorTypes: null,
          addActuatorLoading: false
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

  onAddActuator = event => {
    event.preventDefault();
   const actuatorTypeModalindex = this.state.actuatorTypes.find(type => 
     type.key === this.state.actuatorTypeID
    ).modalindex;
    this.props.firebase
      .actuators(this.props.authUser.uid)
      .push({
        state: 0,
        changingDate: this.props.firebase.serverValue.TIMESTAMP,
        name: this.state.actuatorName,
        type: this.state.actuatorTypeID,
        typeModalIndex: actuatorTypeModalindex

        
      });
    console.log("NEW ACTUATORS: ", this.state.actuatorName, this.state.actuatorTypeID)
   console.log("find modalindex", actuatorTypeModalindex);
    console.log( "actuatortypes:", this.state.actuatorTypes);
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

  close = () => {
    this.setState({open: false});
  }

  open = () => {
    this.setState({open: true});
  }

  toggleState = (uid, state) => {
    console.log("modal uid: ",uid, "state: ", state )
    if(state===0){
      this.props.firebase.actuator(this.props.authUser.uid,uid).update({state: 1})
    } else {
      this.props.firebase.actuator(this.props.authUser.uid,uid).update({state: 0})
    }

  }

  onAddSensorVisible = () => {
    this.onListenSensorTypes();
    this.setState({ addSensorVisible : true });
  }
  onAddActuatorVisible = () => {
    this.onListenActuatorTypes();
    this.setState({ addActuatorVisible : true });
  }

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
      actuators,
      sensorName,
      actuatorName,
      loading,
      sensorTypes,
      sensorTypeID,
      actuatorTypeID,
      actuatorTypes,
      open,
      addSensorVisible,
      addSensorLoading,
      addActuatorVisible,
      addActuatorLoading
      
    } = this.state;
   // console.log("sensor type ID", sensorTypeID);

  const getModal = (index, state, uid)=>{
    const ModalArray = [
      <Modal
       open = {open} 
       closeOnDimmerClick={true}
        onClose={this.close}
      
      trigger={<Button onClick={this.open}>Change!</Button>} basic size='small'>
      <Header icon='lightbulb outline' content='Change state of actuator' />
        <Modal.Content>
          <p>
            Your current state is {state}, would you like change it?
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='red' inverted onClick={this.close}>
            <Icon name='remove' /> No
          </Button>
          <Button color='green' inverted  onClick={()=>this.toggleState(uid, state)}>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
     ];
     return ModalArray[index]
    }
  
    return (
      <div style={{ margin: "30px" }}>
        <Header as="h2" textAlign="center">
          Home Page Jesteś zalogowany jako {this.props.authUser.username}
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
                  <Table.HeaderCell>name</Table.HeaderCell>
                  <Table.HeaderCell>data</Table.HeaderCell>
                  <Table.HeaderCell>date of read</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sensors && sensors.map((sensor, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>{sensor.uid}</Table.Cell>
                    <Table.Cell>{sensor.name}</Table.Cell>
                    <Table.Cell>{sensor.data}</Table.Cell>
                    <Table.Cell>
                      {new Date(sensor.readingDate).toLocaleString()}
                    </Table.Cell>

                    <Table.Cell>
                      <Button primary as={Link}
                      to={{
                        pathname: `${ROUTES.SENSOR_DETAILS}/${sensor.uid}`,
                        state: { sensor, sensorTypes }
                      }}>
                        Detail
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
                
            <Divider horizontal section>
              Your actuators
            </Divider>
            <Table singleLine>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>name
                  </Table.HeaderCell>
                  <Table.HeaderCell>Current state
                  </Table.HeaderCell>
                  <Table.HeaderCell>date of changing</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {actuators && actuators.map((actuator, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>{actuator.uid}</Table.Cell>
                    <Table.Cell>{actuator.name}</Table.Cell>
                    <Table.Cell>{actuator.state}</Table.Cell>
                    <Table.Cell>
                      {new Date(actuator.changingDate).toLocaleString()}
                    </Table.Cell>

                    <Table.Cell>
                        {getModal(parseInt(actuator.typeModalIndex),actuator.state, actuator.uid)}
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
              {addSensorLoading ? (
          <Loader active inline />
            ) : (
                <>
                {!addSensorVisible && <Button primary onClick={this.onAddSensorVisible}>Add Sensor</Button>}
                <div>
                  {addSensorVisible && <Form onSubmit={event => this.onAddSensor(event)}>
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
                  
                    }

                </div>
                </>
                )}
              </Grid.Column>
            </Grid>


            <Divider horizontal section>
              Add new actuator
            </Divider>
            <Grid centered columns={2}>
              <Grid.Column>
              {addActuatorLoading ? (
          <Loader active inline />
            ) : (
                <>
                {!addActuatorVisible && <Button primary onClick={this.onAddActuatorVisible}>Add Actuator</Button>}
                <div>
                  {addActuatorVisible &&  <Form onSubmit={event => this.onAddActuator(event)}>
                    <Form.Field>
                      <label>Nazwa actuatora</label>
                      <input
                        name="actuatorName"
                        type="text"
                        value={actuatorName}
                        onChange={this.onChange}
                        placeholder="think about name of your actuator.."
                      />
                    </Form.Field>
                    <Form.Select
                      fluid
                      label="Type"
                      name="actuatorTypeID"
                      options={actuatorTypes}
                      value={actuatorTypeID}
                      onChange={this.onChange}
                      placeholder="choose actuator type"
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
                  
                    }

                </div>
                </>
                )}
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
