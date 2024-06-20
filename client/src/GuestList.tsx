import React, { Component, MouseEvent } from "react";
import { host, guest } from "./WeddingApp";

type GuestListProps = {
  onAddGuest: () => void;
  onDetails: (guest: guest) => void;
  husb: host;
  wife: host;
  guestArray: guest[];
};


export class GuestList extends Component<GuestListProps> {

    constructor(props: GuestListProps) {
      super(props);
    }
  
    render = (): JSX.Element => {
      return (<div>
          <h1>Guest List</h1>
          <br></br>
          <this.renderGuestLinks/>
          <h3>Summary:</h3>
          <this.renderWifeDetails/>
          <this.renderHusbDetails/>
          <button type="button" className="btn btn-link"
                onClick={this.doAddGuestClick}>Create</button>
        </div>);
    };
  
    renderGuestLinks = (): JSX.Element => {
      if (this.props.guestArray.length === 0) {
        // console.log("Add a guest to start")
        return <div></div>
      } else {
        const names: JSX.Element[] = []
        for (const guest of this.props.guestArray) {
          names.push(
            <li key={guest.name}>
              <a href="#" onClick={(evt) => this.doLinkClick(evt, guest)}>{guest.name}</a> 
              <span> {this.renderGuestOf(guest)} </span>
            </li>
          )
        }
        return <div>{names}</div>
      }
    };

    renderGuestOf = (guest: guest): string => {
      if (guest.guestOf === "husb") {
        return "Guest of " + this.props.husb.name + "    " + this.renderGuestNum(guest);
      } else {
        return "Guest of " + this.props.wife.name + "    " + this.renderGuestNum(guest);
      }
    };

    renderGuestNum = (guest: guest): string => {
      if (guest.additionalGuest.kind === "unknown") {
        return "+1?";
      } else if (guest.additionalGuest.kind === "0") {
        return "+0";
      } else {
        return "+1";
      }
    };

    renderWifeDetails = (): JSX.Element => {
      if (this.props.wife.numGuest === this.props.wife.numGuestUp) {
        return <p>{this.props.wife.numGuest} guest(s) of {this.props.wife.name} ({this.props.wife.numFam} family)</p>;
      } else {
        return <p>{this.props.wife.numGuest} - {this.props.wife.numGuestUp} guest(s) of {this.props.wife.name} ({this.props.wife.numFam} family)</p>;
      }
    }

    renderHusbDetails = (): JSX.Element => {
      if (this.props.husb.numGuest === this.props.husb.numGuestUp) {
        return <p>{this.props.husb.numGuest} guest(s) of {this.props.husb.name} ({this.props.husb.numFam} family)</p>;
      } else {
        return <p>{this.props.husb.numGuest} - {this.props.husb.numGuestUp} guest(s) of {this.props.husb.name} ({this.props.husb.numFam} family)</p>;
      }
    }

    // Go to the adding new guest page by triggering the onAddGuest prop function.
    doAddGuestClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onAddGuest();
    };
  
    // Go to the editing guest page for the given guest, by triggering the doLinkClick prop function.
    doLinkClick=(_evt: MouseEvent<HTMLAnchorElement>, guest: guest): void => {
      this.props.onDetails(guest);
    };
  }
  