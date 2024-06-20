import { isRecord } from "./record";
import { guest } from "./WeddingApp";

/**
 * Parses unknown data into a guest. Will log an error and return undefined
 * if it is not a valid guest.
 * @param val unknown data to parse into an guest
 * @return guest if val is a valid guest and undefined otherwise
 */
export const parseGuest = (val: unknown): undefined | guest => {
  if (!isRecord(val)) {
    console.error("not a record", val)
    return undefined;
  }

  if (typeof val.name !== "string") {
    console.error("not a guest: missing 'name'", val)
    return undefined;
  }

  const guestOf = val.guestOf;
  if (guestOf !== 'husb' && guestOf !== 'wife') {
    console.error("not a guest: missing 'guestOf'", val)
    return undefined;
  }

  if (typeof val.isFamily !== "boolean") {
    console.error("not a guest: missing 'isFamily'", val)
    return undefined;
  }

  if (typeof val.dietary !== 'string') {
    console.error("not a guest: missing 'dietary'", val)
    return undefined;
  }

  const additionalGuest = val.additionalGuest;
  if (!isRecord(additionalGuest) || (additionalGuest.kind !== "0" && additionalGuest.kind !== "1" && additionalGuest.kind !== "unknown") 
    || typeof additionalGuest.name !== 'string' || typeof additionalGuest.dietary !== 'string') {
    console.error("not a guest: missing or invalid 'additionalGuest'", val)
    return undefined;
  }


  return {
    name: val.name, guestOf: guestOf, isFamily: val.isFamily, dietary: val.dietary,
    additionalGuest: {kind: additionalGuest.kind, name: additionalGuest.name, dietary: additionalGuest.dietary}
  };
};