/**
 * From the QWINSTA standard output this function build the Propel Runtime info object.
 * @param {string} stdErr Content of the standard error console output. 
 * @param {*} stdOut Content of the standard output. This must be QWINSTA execution output.
 * @returns A Propel runtime info object including the user that s running the app.
 */
exports.processQWINSTAOutput = function(stdOut) {

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
