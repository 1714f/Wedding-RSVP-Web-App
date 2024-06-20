import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

export type host = {name: string, numGuest: number, numGuestUp: number, numFam: number};
export type guest = {name: string, guestOf: guestOf, isFamily: boolean, 
                      dietary: string, additionalGuest: addGuest};
type guestOf = "husb"|"wife"|undefined;                   
type addGuest = {kind: addKind, name: string, dietary: string};
type addKind = "0"|"1"|"unknown";

let guestArray: guest[] = [];
let husb: host = {name: "James", numGuest: 0, numGuestUp: 0, numFam: 0};
let wife: host = {name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0};

/**
 * Handles saving a guest and updating the guest list and hosts accordingly.
 * Lastly, send the updated guest list and hosts information back.
 * Send a 400 status response if the guest is invalid.
 * @param req - The request object containing the guest to be saved or updated.
 * @param res - The response object to send the updated guest list and hosts information.
 */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (typeof name !== 'string') {
    res.status(400).send("Invalid or missing 'name' parameter");
    return;
  }

  const guestOf = req.body.guestOf;
  if (guestOf !== 'husb' && guestOf !== 'wife' && guestOf !== undefined) {
    res.status(400).send('Invalid or missing argument "guestOf"');
    return;
  }

  const isFamily = req.body.isFamily;
  if (typeof isFamily !== 'boolean') {
    res.status(400).send("Invalid or missing 'isFamily' parameter");
    return;
  }

  const dietary = req.body.dietary;
  if (typeof dietary !== 'string') {
    res.status(400).send('Invalid "dietary" parameter');
    return;
  }
  
  const additionalGuest = req.body.additionalGuest;
  if (!isRecord(additionalGuest) || (additionalGuest.kind !== "0" && additionalGuest.kind !== "1" && additionalGuest.kind !== "unknown") 
    || typeof additionalGuest.name !== 'string' || typeof additionalGuest.dietary !== 'string') {
    res.status(400).send('Invalid or missing "additionalGuest" parameter');
    return;
  }

  const currGuest: guest = {name: name, guestOf: guestOf, isFamily: isFamily, dietary: dietary, additionalGuest: {kind: additionalGuest.kind, name: additionalGuest.name, dietary: additionalGuest.dietary}};
  const index = findGuestIndex(currGuest, guestArray);
  if (index >= guestArray.length) {
    guestArray.push(currGuest)
  } else {
    guestArray[index] = currGuest;
  }

  if (currGuest.guestOf === "husb") {
    husb = {name: husb.name, 
      numGuest: updateGuestNum(guestArray, "husb"),
      numGuestUp: updateGuestNumUp(guestArray, "husb"),
      numFam: updateFamNum(guestArray, "husb")} 
  } else {
    wife = {name: wife.name, 
      numGuest: updateGuestNum(guestArray, "wife"),
      numGuestUp: updateGuestNumUp(guestArray, "wife"),
      numFam: updateFamNum(guestArray, "wife")} 
  }

  res.send({husb: husb, wife: wife, guestArray: guestArray});
};

/**
 * Retrieves guest list and hosts information, then sends them in the response.
 * @param _req - The request object.
 * @param res - The response object to send the guest list and hosts information.
 */
export const load = (_req: SafeRequest, res: SafeResponse): void => {
  res.send({husb: husb, wife: wife, guestArray: guestArray});
};


/**
 * Determines whether the given value is a record.
 * @param val the value in question
 * @return true if the value is a record and false otherwise
 */
export const isRecord = (val: unknown): val is Record<string, unknown> => {
  return val !== null && typeof val === "object";
};

/**
 * Helper method to calculate the guest number.
 * @param guestArray - Array of guest objects.
 * @param guestOf - The guestOf kind to match against.
 * @returns the calculated number of guests.
 * @throws Error if the guestArray is empty, which should be impossible.
 */
export const updateGuestNum = (guestArray: guest[], guestOf: guestOf): number => {
  if (guestArray.length <= 0) {
    throw new Error("Impossible, the guestArray is guaranteed to have a size greater than or equal to one");
  }
  
  const currGuest = guestArray[0];
  if (guestArray.length === 1) {
    if (currGuest.guestOf !== guestOf) {
      return 0;
    } else if (currGuest.additionalGuest.kind === "1") {
      return 2;
    } else {
      return 1;
    }
  }

  if (currGuest.guestOf !== guestOf) {
    return updateGuestNum(guestArray.slice(1), guestOf) + 0;
  } else if (currGuest.additionalGuest.kind === "1") {
    return updateGuestNum(guestArray.slice(1), guestOf) + 2;
  } else {
    return updateGuestNum(guestArray.slice(1), guestOf) + 1;
  }
};

/**
 * Helper method to calculate the upper limit of the guest number.
 * @param guestArray - Array of guest objects.
 * @param guestOf - The guestOf kind to match against.
 * @returns the calculated number of the upper limit of guests .
 * @throws Error if the guestArray is empty, which should be impossible.
 */
export const updateGuestNumUp = (guestArray: guest[], guestOf: guestOf): number => {
  if (guestArray.length <= 0) {
    throw new Error("Impossible, the guestArray is guaranteed to have a size greater than or equal to one");
  }

  const currGuest = guestArray[0];
  if (guestArray.length === 1) {
    if (currGuest.guestOf !== guestOf) {
      return 0;
    } else if (currGuest.additionalGuest.kind === "0") {
      return 1;
    } else {
      return 2;
    }
  }

  if (currGuest.guestOf !== guestOf) {
    return updateGuestNumUp(guestArray.slice(1), guestOf) + 0;
  } else if (currGuest.additionalGuest.kind === "0") {
    return updateGuestNumUp(guestArray.slice(1), guestOf) + 1;
  } else {
    return updateGuestNumUp(guestArray.slice(1), guestOf) + 2;
  }
};

/**
 * Helper method to calculate the number of family.
 * @param guestArray - Array of guest objects.
 * @param guestOf - The guestOf kind to match against.
 * @returns the calculated number of family members.
 * @throws Error if the guestArray is empty, which should be impossible.
 */
export const updateFamNum = (guestArray: guest[], guestOf: guestOf): number => {
  if (guestArray.length <= 0) {
    throw new Error("Impossible, the guestArray is guaranteed to have a size greater than or equal to one");
  }
  
  const currGuest = guestArray[0];
  if (guestArray.length === 1) {
    if (currGuest.guestOf !== guestOf) {
      return 0;
    } else if (currGuest.isFamily === true) {
      return 1;
    } else {
      return 0;
    }
  }

  if (currGuest.guestOf !== guestOf) {
    return updateFamNum(guestArray.slice(1), guestOf) + 0;
  } else if (currGuest.isFamily === true) {
    return updateFamNum(guestArray.slice(1), guestOf) + 1;
  } else {
    return updateFamNum(guestArray.slice(1), guestOf) + 0;
  }
};

/**
 * Helper method to find the guest index from the guest array.
 * If the element is not in the array, return a number greater than the length of the array.
 * @param currGuest - The guest to be found in the array.
 * @param guestArray - Array of guest objects.
 * @return index of the guest in the array, or a number greater than the length of the array if not found.
 */
export const findGuestIndex = (currGuest: guest, guestArray: guest[]): number => {
  // If the element is not in the array, return a number greater than the length of the array.
  if (guestArray.length <= 0) {
    return 1;
  }

  if (currGuest.name === guestArray[0].name) {
    return 0;
  } else {
    return findGuestIndex(currGuest, guestArray.slice(1)) + 1;
  }
};

/**
 * Resets the guest array and hosts for testing purposes.
 */
export const resetForTesting = (): void => {
  guestArray = [];
  husb = {name: "James", numGuest: 0, numGuestUp: 0, numFam: 0};
  wife = {name: "Molly", numGuest: 0, numGuestUp: 0, numFam: 0};
};
