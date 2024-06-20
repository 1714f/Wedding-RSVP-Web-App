import React, { Component, MouseEvent, ChangeEvent } from "react";
import { host, guest } from "./WeddingApp";

type AddGuestProps = {
  husb: host;
  wife: host;
  guestArray: guest[];
  onSaveGuest: (currGuest: guest) => void;
  onBack: () => void;
};

type AddGuestState = {
    currGuest: guest;
    errorMessage: string;
};

export class AddGuest extends Component<AddGuestProps, AddGuestState> {

    constructor(props: AddGuestProps) {
      super(props);
      this.state = {currGuest: {name: "", guestOf: undefined, 
                    isFamily: false, dietary: "", additionalGuest: {kind: "unknown", name: "", dietary: ""}}, errorMessage: ""};
    }
  
    render = (): JSX.Element => {
      return (<div>
          <h1>Add Guest</h1>
          <br></br>
          <label htmlFor="name">Name: </label>
          <input type="text" id="name" value={this.state.currGuest.name}
                 onChange={this.doNameChange} />
          <p>Guest of:</p>
          <input type="radio" id="wife" name="host" value={this.props.wife.name} 
          checked={this.state.currGuest.guestOf === "wife"}  onChange={this.doHostWifeChange}></input>
          <label htmlFor="wife">{this.props.wife.name}</label>
          <input type="radio" id="husb" name="host" value={this.props.husb.name}
          checked={this.state.currGuest.guestOf === "husb"}  onChange={this.doHostHusbChange}></input>
          <label htmlFor="husb">{this.props.husb.name}</label>
          <br></br> <br></br> 
          <input type="checkbox" id="family" checked={this.state.currGuest.isFamily} onChange={this.doFamilyChange}></input>
          <label htmlFor="family"> Family? </label>
          <br></br> <br></br> 
          <button type="button" onClick={this.doAddCompleteClick}>Add</button>
          <button type="button" onClick={this.doBackClick}>Back</button>
          <p>{this.state.errorMessage}</p>
        </div>);
    };
  
    // Updates the name of the current guest in the component state.
    doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({currGuest: { name: evt.target.value, 
                                    guestOf: this.state.currGuest.guestOf, 
                                    isFamily: this.state.currGuest.isFamily,
                                    dietary: this.state.currGuest.dietary,
                                    additionalGuest: this.state.currGuest.additionalGuest}});
    };

    // Updates the guestOf property of the current guest to "wife" in the component state.
    doHostWifeChange = (_evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({currGuest: {name: this.state.currGuest.name,
                                    guestOf: "wife", isFamily: this.state.currGuest.isFamily,
                                    dietary: this.state.currGuest.dietary,
                                    additionalGuest: this.state.currGuest.additionalGuest}});
    };

    // Updates the guestOf property of the current guest to "husb" in the component state.
    doHostHusbChange = (_evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({currGuest: {name: this.state.currGuest.name,
                                    guestOf: "husb", isFamily: this.state.currGuest.isFamily,
                                    dietary: this.state.currGuest.dietary,
                                    additionalGuest: this.state.currGuest.additionalGuest}});
    };

    // Updates the isFamily property of the current guest in the component state.
    doFamilyChange = (_evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({currGuest: {name: this.state.currGuest.name,
                                    guestOf: this.state.currGuest.guestOf, 
                                    isFamily: !(this.state.currGuest.isFamily),
                                    dietary: this.state.currGuest.dietary,
                                    additionalGuest: this.state.currGuest.additionalGuest}});
    };

    /**
     * Handles the completion of adding a new guest.
     * Checks for duplicate names and validates the current guest's information before triggering the onSaveGuest prop function.
     * @throws Error if a duplicate name already exists, if a name is not provided, or if a host is not selected.
     */  
    doAddCompleteClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        for (const guest of this.props.guestArray) {
            if (this.state.currGuest.name === guest.name) {
                this.setState({errorMessage: "Error: duplicate name already existed"});
                throw new Error("Duplicate name already existed.");
            }
        }

        if (this.state.currGuest.name === "") {
            this.setState({errorMessage: "Error: name is required"});
            throw new Error("Input a valid name.");
        } else if (this.state.currGuest.guestOf === undefined) {
            this.setState({errorMessage: "Error: host is required"});
            throw new Error("Select a host.");
        } else {
            this.props.onSaveGuest(this.state.currGuest);
        }
    };
    
    // Return to the previous page by triggering the onBack prop function without saving anything.
    doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onBack();
    }
  }
  