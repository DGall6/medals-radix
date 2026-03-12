import { jwtDecode } from "jwt-decode";
// convert string to title case
export const tc = (str) =>
  str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

export function getUser(encoded) {
  // return unencoded user / permissions
  const decoded = jwtDecode(encoded);
  return {
    name: decoded["username"],
    authenticated: true,
    canPost: decoded["roles"].indexOf("medals-post") === -1 ? false : true,
    canPatch: decoded["roles"].indexOf("medals-patch") === -1 ? false : true,
    canDelete: decoded["roles"].indexOf("medals-delete") === -1 ? false : true,
  };
}