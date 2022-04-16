export class RDPUser {

  /**
   * User name
   */
  public userName: string;

  /**
   * RDP status. Indicates if the user is Active, disconnected, etc.
   */
  public state: string;

  constructor(userName: string, state: string) {
    this.userName = userName;
    this.state = state;
  }
}