import * as functions from "firebase-functions";

export const helloWorld = functions.region("southamerica-east1").https.onCall((data, context) => {
  console.log("AAAAAAAAAAA");
});
