
export class TokenRefreshRequest {

    /**
     * Refresh token.
     */
    refreshToken: string = "";

    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
}
