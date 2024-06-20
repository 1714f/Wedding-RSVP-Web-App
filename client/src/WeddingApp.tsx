import React, { Component } from "react";
import { isRecord } from './record';
import { AddGuest } from './AddGuest';
import { GuestList } from "./GuestList";
import { GuestDetail } from "./GuestDetail";
import { parseGuest } from './Guest';


type Page = {kind: "listingGuests"|"addingGuest"|"editingDetail"};
export type host = {name: string, numGuest: number, numGuestUp: number, numFam: number};
export type guest = {name: string, guestOf: guestOf, isFamily: boolean, 
                      dietary: string, additionalGuest: addGuest};
export type guestOf = "husb"|"wife"|undefined;                   
export type addGuest = {kind: addKind, name: string, dietary: string};
export type addKind = "0"|"1"|"unknown";

type WeddingAppState = {
  show: Page;   // Stores state for the current page of the app to show
  husb: host;
  wife: host;
  loading: boolean;
  guestArray: guest[];
  currGuest?: guest;
}


/** Displays the UI of the Wedding rsvp application. */
export class WeddingApp extends Component<{}, WeddingAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {show: {kind: "listingGuests"}, husb: {name: "James", numGuest: 0, numGuestUp: 0, numFam: 0},
                  wife: {name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0}, loading: false, guestArray: []};
  }

  /**
   * Sets the loading state to true and fetches data from the "/api/load" endpoint.
   * On success, processes the response. On failure, handles the error.
   */
  componentDidMount = (): void => {
    this.setState({loading: true});
    fetch("/api/load")
      .then((res) => this.doLoadResp(res))
      .catch(() => this.doLoadError("failed to connect to server"));
  };
  
  render = (): JSX.Element => {
    if (this.state.loading === true) {
      return <p>Loading......</p>;
    } else if (this.state.show.kind === "listingGuests") {
      return <GuestList husb={this.state.husb} wife={this.state.wife} guestArray={this.state.guestArray}
                          onAddGuest={this.doAddClick}
                          onDetails={(guest) => this.doLoadClick(guest)}/>
    } else if (this.state.show.kind === "addingGuest"){
      return <AddGuest husb={this.state.husb} wife={this.state.wife} guestArray={this.state.guestArray} 
                        onSaveGuest={(currGuest) => this.doSaveClick(currGuest)}
                        onBack={this.doBackClick}/>
    } else {
      if (this.state.currGuest === undefined) {
        throw new Error("Impossible. currGuest should not be undefined.")
      }
      return <GuestDetail currGuest={this.state.currGuest} 
                        onSaveGuest={(currGuest) => this.doSaveClick(currGuest)}
                        onBack={this.doBackClick}/>
    }
  };

  /**
   * Handles the add button click event by setting the state to render the page for adding new guest.
   */
  doAddClick = (): void => {
    this.setState({show: {kind: "addingGuest"}});
  }

  /**
   * Handles the load button click event by initiating the guest detail editing process.
   */
  doLoadClick = (guest: guest): void => {
    this.setState({show: {kind: "editingDetail"}, currGuest: guest});
  }

  /** 
   * Handles the save button click event.
   * 
   * Sets the loading state to true and sends a POST request to the "/api/save" endpoint with the current guest data.
   * On success, processes the response and save the guest information. On failure, handles the error.
   * @param currGuest the current guest to be saved.
   */
  doSaveClick = (currGuest: guest): void => {
    this.setState({ loading: true });
    fetch("/api/save", {
      method: "POST", body: JSON.stringify(currGuest),
      headers: {"Content-Type": "application/json"} })
    .then((res) => this.doSaveResp(res))
    .catch(() => this.doSaveError("failed to connect to server"));
  }

  // Called when the server responds to a request to save
  doSaveResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then((res) => this.doSaveJson(res))
        .catch(() => this.doSaveError("200 response is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doSaveError)
        .catch(() => this.doSaveError("400 response is not text"));
    } else {
      this.doSaveError(`bad status code: ${res.status}`);
    }
  };

  // Called when the save response JSON has been parsed
  doSaveJson = (res: unknown): void => {
    if (!isRecord(res) || (!isRecord(res.husb) || !isRecord(res.wife) || !isRecord(res.guestArray))||
      (typeof res.husb.name !== 'string' || typeof res.husb.numGuest !== 'number' || typeof res.husb.numGuestUp !== 'number' || typeof res.husb.numFam !== 'number') ||
      (typeof res.wife.name !== 'string' || typeof res.wife.numGuest !== 'number' || typeof res.wife.numGuestUp !== 'number' || typeof res.wife.numFam !== 'number') || 
      !Array.isArray(res.guestArray)) {
      console.error('Invalid JSON from /api/save', res);
      return;
    }
  
    const updatedHusb: host = {name: res.husb.name, numGuest: res.husb.numGuest, numGuestUp: res.husb.numGuestUp, numFam: res.husb.numFam};
    const updatedWife: host = {name: res.wife.name, numGuest: res.wife.numGuest, numGuestUp: res.wife.numGuestUp, numFam: res.wife.numFam};
    const updatedGuestArray: guest[] = [];
    for (const updatedGuest of res.guestArray) {
      const guest = parseGuest(updatedGuest);
      if (guest === undefined) {
        console.error('Invalid JSON from /api/save', res);
        return;
      } 
      updatedGuestArray.push(guest);
    }

    this.setState({show: {kind: "listingGuests"}, guestArray: updatedGuestArray, husb: updatedHusb, wife: updatedWife, loading: false });
  };

  // Handles errors that occur during the save operation. It will log a given error message to the console.
  doSaveError = (msg: string): void => {
    console.error(`Error fetching /api/save: ${msg}`);
  };

  // Called when the server responds to a request to load
  doLoadResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then((res) => this.doLoadJson(res))
        .catch(() => this.doLoadError("200 response is not JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doLoadError)
        .catch(() => this.doLoadError("400 response is not text"));
    } else {
      this.doLoadError(`bad status code: ${res.status}`);
    }
  };

  // Called when the load response JSON has been parsed
  doLoadJson = (res: unknown): void => {
    if (!isRecord(res) || (!isRecord(res.husb) || !isRecord(res.wife) || !isRecord(res.guestArray))||
      (typeof res.husb.name !== 'string' || typeof res.husb.numGuest !== 'number' || typeof res.husb.numGuestUp !== 'number' || typeof res.husb.numFam !== 'number') ||
      (typeof res.wife.name !== 'string' || typeof res.wife.numGuest !== 'number' || typeof res.wife.numGuestUp !== 'number' || typeof res.wife.numFam !== 'number') || 
      !Array.isArray(res.guestArray)) {
      console.error('Invalid JSON from /api/load', res);
      return;
    }
  
    const updatedHusb: host = {name: res.husb.name, numGuest: res.husb.numGuest, numGuestUp: res.husb.numGuestUp, numFam: res.husb.numFam};
    const updatedWife: host = {name: res.wife.name, numGuest: res.wife.numGuest, numGuestUp: res.wife.numGuestUp, numFam: res.wife.numFam};
    const updatedGuestArray: guest[] = [];
    for (const updatedGuest of res.guestArray) {
      const guest = parseGuest(updatedGuest);
      if (guest === undefined) {
        console.error('Invalid JSON from /api/load', res);
        return;
      } 
      updatedGuestArray.push(guest);
    }

    this.setState({show: {kind: "listingGuests"}, guestArray: updatedGuestArray, husb: updatedHusb, wife: updatedWife, loading: false })
  };

  // Handles errors that occur during the load operation. It will log a given error message to the console.
  doLoadError = (msg: string): void => {
    console.error(`Error fetching /api/load: ${msg}`);
  };

  // Handles the back button click event by setting the state to render the page for listing summary of guests and hosts.
  doBackClick = (): void => {
    this.setState({show: {kind: "listingGuests"}});
  };
}