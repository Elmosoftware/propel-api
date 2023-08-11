const fs = require("fs");
const crypto = require("crypto");

/**
 * From the QWINSTA standard output this function build the Propel Runtime info object.
 * @param {*} stdOut Content of the standard output. This must be QWINSTA execution output.
 * @returns A RDPUsers info object including the user that is running the app.
 */
function processQWINSTAOutput(stdOut) {

  const USER_NAME_HEADER = "USER NAME";
  const SESSION_ID_HEADER = "SESSION ID";
  const STATE_HEADER = "STATE";
  const HOST_NAME_HEADER = "HOST NAME";
  
  let RDPUsers = [];

  //Separate in lines:
  let lines = stdOut.split(`\r\n`);
  //Getting headers position:
  let userNameHeaderStart = String(lines[0]).indexOf(USER_NAME_HEADER)
  let userNameHeaderEnds = String(lines[0]).indexOf(SESSION_ID_HEADER)
  let stateHeaderStart = String(lines[0]).indexOf(STATE_HEADER)
  let stateHeaderEnds = String(lines[0]).indexOf(HOST_NAME_HEADER)

  //Starting on 2nd line, (first one is the header):
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];

    if (line.length > 0) {
      let RDPUser = {
        userName: String(line)
          .slice(userNameHeaderStart, userNameHeaderEnds)
          .trim(),
        state: String(line)
          .slice(stateHeaderStart, stateHeaderEnds)
          .trim()
      }

      if (RDPUser.userName) {
        RDPUsers.push(RDPUser)
      }
    }
  }

  return RDPUsers;
}

/**
 * Validates the encryption key included in the configuration.
 */
function validateEncryptionKey() {
  if (!process.env?.ENCRYPTION_KEY) {
    throw new Error("Propel Configuration is missing or incorrect. Variable ENCRYPTION_KEY must be present.")
  }
  else if (process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error("Propel Configuration error. ENCRYPTION_KEY need to be at least 32 bytes long.")
  }
}

/**
 * Return the encryption keys to use.
 * @returns An object with the key and initialization vector to be used in the encryption algorithm.
 */

function getEncryptionKeys() {
  return {
    key: process.env.ENCRYPTION_KEY.slice(0, 32),
    iv: process.env.ENCRYPTION_KEY.slice(-16)
  }
}

/**
 * ENcrypt the provided text/object.
 * @param {*} message Message to encrypt. If the message is not a string object instance, the message will be stringified.
 * @returns The encripted message.
 */
function encrypt(message) {

  let keys = getEncryptionKeys();

  if (typeof message != "string") {
    message = JSON.stringify(message);
  }

  let cipher = crypto.createCipheriv("aes-256-cbc", keys.key, keys.iv);

  return cipher.update(message, "utf-8", "hex") + cipher.final("hex");
}

module.exports = {processQWINSTAOutput, validateEncryptionKey, encrypt}
