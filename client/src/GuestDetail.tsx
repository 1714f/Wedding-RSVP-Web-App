import React, { Component, MouseEvent, ChangeEvent } from "react";
import { guest, addKind } from "./WeddingApp";

type GuestDetailProps = {
  currGuest: guest;
  onSaveGuest: (currGuest: guest) => void;
  onBack: () => void;
};

type GuestDetailState = {
    currGuest: guest;
    errorMessage: string;
};

export class GuestDetail extends Component<GuestDetailProps, GuestDetailState> {

    constructor(props: GuestDetailProps) {
      super(props);
      this.state = {currGuest: this.props.currGuest, errorMessage: ""};
    }
  
    render = (): JSX.Element => {
      if (this.state.currGuest.additionalGuest.kind === "1") {
        return (<div> 
          <this.renderDetails/>
          <this.renderAdditionalDetails/>
          <this.renderReturning/>
        </div>)
      } else {
        return (<div> 
          <this.renderDetails/>
          <this.renderReturning/>
        </div>)
      }
    };

    renderDetails = (): JSX.Element => {
      return (<div>
        <h1>Guest Details</h1>
        <br></br>
        <p>{this.state.currGuest.name}, guest of {this.state.currGuest.guestOf}{this.renderFam()}</p>
        
        <br></br>

        <label htmlFor="dietary">Dietary Restrictions: (Specify "none" if none)</label>
        <br></br>
        <input type="text" id="dietary" value={this.state.currGuest.dietary}
                onChange={this.doDietaryChange} />
        <br></br>

        <label htmlFor="addGuest">Additional Guest?</label>
        <select value={this.state.currGuest.additionalGuest.kind} onChange={this.doAddGuestChange}>
        <option value="unknown">unknown</option>
        <option value="0">0</option>
        <option value="1">1</option>
        </select>
      </div>);
    };

    renderFam = (): string => {
      if (this.state.currGuest.isFamily === true) {
        return ", family";
      } else {
        return "";
      }
    }

    renderAdditionalDetails = (): JSX.Element => {
      return (<div>
        <br></br>
        <label htmlFor="addName">Guest Name: </label>
        <input type="text" id="addName" value={this.state.currGuest.additionalGuest.name}
               onChange={this.doNameChange} />
        <br></br>
        <label htmlFor="addDietary">Guest Dietary Restrictions: (Specify "none" if none)</label>
        <input type="text" id="addDietary" value={this.state.currGuest.additionalGuest.dietary}
               onChange={this.doAddDietaryChange} />
      </div>)
    };

    renderReturning = (): JSX.Element => {
      return (<div>
        <br></br>
        <button type="button" onClick={this.doSaveClick}>Save</button>
        <button type="button" onClick={this.doBackClick}>Back</button>
        <p>{this.state.errorMessage}</p>
      </div>)
    };

    // Updates the current guest's dietary information in the component state.
    doDietaryChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({currGuest: {dietary: evt.target.value, name: this.state.currGuest.name, 
                        guestOf: this.state.currGuest.guestOf, isFamily: this.state.currGuest.isFamily, 
                        additionalGuest: this.state.currGuest.additionalGuest}});
    };

    // Updates the current guest's additional guest kind in the component state.
    doAddGuestChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
        this.setState({currGuest: {dietary: this.state.currGuest.dietary, name: this.state.currGuest.name,
            guestOf: this.state.currGuest.guestOf, isFamily: this.state.currGuest.isFamily, 
            additionalGuest: {kind: toValidKind(evt.target.value), name: "", dietary: ""}}});
    };

    // Updates the name of the additional guest in the component state.
    doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
      this.setState({currGuest: {dietary: this.state.currGuest.dietary, name: this.state.currGuest.name, 
        guestOf: this.state.currGuest.guestOf, isFamily: this.state.currGuest.isFamily, 
        additionalGuest: {name: evt.target.value, kind: this.state.currGuest.additionalGuest.kind, dietary: this.state.currGuest.additionalGuest.dietary}}});
    };

    // Updates the dietary information of the additional guest in the component state.
    doAddDietaryChange = (evt: ChangeEvent<HTMLInputElement>): void => {
      this.setState({currGuest: {dietary: this.state.currGuest.dietary, name: this.state.currGuest.name,
                      guestOf: this.state.currGuest.guestOf, isFamily: this.state.currGuest.isFamily, 
                      additionalGuest: {name: this.state.currGuest.additionalGuest.name, kind: this.state.currGuest.additionalGuest.kind, dietary: evt.target.value}}});
    };

    /**
     * Handles the save button click event.
     * Validates the current guest's information and return to the previous page by triggering the onSaveGuest prop function if valid.
     * @throws Error if dietary restrictions for the current guest are not specified or if a name or dietary is not provided for the additional guest when required.
     */
    doSaveClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        if (this.state.currGuest.additionalGuest.kind === "1") {
          if (this.state.currGuest.dietary === "") {
            this.setState({errorMessage: "Error: Must specify any dietary restrictions or 'none'."});
            throw new Error("Invalid dietary restrictions.");
          } else if (this.state.currGuest.additionalGuest.name === "") {
            this.setState({errorMessage: "Error: name is required"});
            throw new Error("Input a valid name.");
          } else if (this.state.currGuest.additionalGuest.dietary === "") {
            this.setState({errorMessage: "Error: Must specify any dietary restrictions of additional guest or 'none'."});
            throw new Error("Invalid dietary restrictions for the additional guest.");
          } 

          this.props.onSaveGuest(this.state.currGuest);
        } else {
          if (this.state.currGuest.dietary === "") {
            this.setState({errorMessage: "Error: Must specify any dietary restrictions or 'none'."});
            throw new Error("Invalid dietary restrictions.");
          } 
            
          this.props.onSaveGuest(this.state.currGuest);
        }
    };
  
    // Return to the previous page by triggering the onBack prop function without saving anything.
    doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onBack();
    }
  }

  /**
   * Converts a string to a valid addKind type.
   * @param s - The string to be converted.
   * @returns The valid addKind type.
   * @throws Error if the input string is not a valid kind.
   */
  export const toValidKind = (s: string): addKind => {
    switch (s) {
      case "0": case "1": case "unknown":
        return s;
  
      default:
        throw new Error(`Impossible. Invalid kind "${s}"`);
    }
  };
  