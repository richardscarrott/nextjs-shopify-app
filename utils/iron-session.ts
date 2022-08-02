import { IronSession } from "iron-session";

// Unfortunately this isn't exported from the package :(
// https://github.com/vvo/iron-session/blob/a6c767d425c52575f743e86b64b8b4a4ce64add6/src/getPropertyDescriptorForReqSession.ts
export default function getPropertyDescriptorForReqSession(
  session: IronSession
): PropertyDescriptor {
  return {
    enumerable: true,
    get() {
      console.log("GET");
      return session;
    },
    set(value) {
      console.log("SET", value);
      const keys = Object.keys(value);
      const currentKeys = Object.keys(session);

      currentKeys.forEach((key) => {
        if (!keys.includes(key)) {
          // @ts-ignore See comment in IronSessionData interface
          delete session[key];
        }
      });

      keys.forEach((key) => {
        // @ts-ignore See comment in IronSessionData interface
        session[key] = value[key];
      });
    },
  };
}
