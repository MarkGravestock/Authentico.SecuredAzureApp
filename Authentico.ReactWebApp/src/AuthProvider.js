import React, { Component } from "react";
import {
    msalApp,
    requiresInteraction,
    fetchFromUrl,
    isIE
} from "./auth-utils";
import { WindowUtils } from "msal";
import {APP_REQUESTS, GRAPH_REQUESTS} from "./security_configuration";

// If you support IE, our recommendation is that you sign-in using Redirect APIs
const useRedirectFlow = isIE();
// const useRedirectFlow = true;

export default C =>
    class AuthProvider extends Component {
        constructor(props) {
            super(props);

            this.state = {
                account: null,
                error: null,
                tokenResponse: null
            };
        }

        async acquireToken(request, redirect) {
            return msalApp.acquireTokenSilent(request).catch(error => {
                // Call acquireTokenPopup (popup window) in case of acquireTokenSilent failure
                // due to consent or interaction required ONLY
                if (requiresInteraction(error.errorCode)) {
                    return redirect
                        ? msalApp.acquireTokenRedirect(request)
                        : msalApp.acquireTokenPopup(request);
                } else {
                    console.error('Non-interactive error:', error.errorCode)
                }
            });
        }

        async onSignIn(redirect) {
            if (redirect) {
                return msalApp.loginRedirect(GRAPH_REQUESTS.LOGIN);
            }

            const loginResponse = await msalApp
                .loginPopup(GRAPH_REQUESTS.LOGIN)
                .catch(error => {
                    this.setState({
                        error: error.message
                    });
                });

            if (loginResponse) {
                this.setState({
                    account: loginResponse.account,
                    error: null
                });

                const tokenResponse = await this.acquireToken(
                    APP_REQUESTS.LOGIN
                ).catch(error => {
                    this.setState({
                        error: error.message
                    });
                });

                this.setState({
                    tokenResponse: tokenResponse
                });
            }
        }

        onSignOut() {
            msalApp.logout();
        }

        async onSessionToken(uri) {
            if (this.state.tokenResponse == null) {
                console.log('No access token');
                return;
            }
            
            const sessionUri = `${uri}/.auth/login/aad`;
            await fetch(sessionUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: `{ 'access_token', ${this.state.tokenResponse.accessToken} }`
            });
        }
        
        async componentDidMount() {
            msalApp.handleRedirectCallback(error => {
                if (error) {
                    const errorMessage = error.errorMessage ? error.errorMessage : "Unable to acquire access token.";
                    // setState works as long as navigateToLoginRequestUrl: false
                    this.setState({
                        error: errorMessage
                    });
                }
            });

            const account = msalApp.getAccount();

            this.setState({
                account
            });

            if (account && !WindowUtils.isInIframe()) {
                const tokenResponse = await this.acquireToken(
                    APP_REQUESTS.LOGIN,
                    useRedirectFlow
                ).catch(error => {
                    this.setState({
                        error: error.message
                    });
                });

                this.setState({
                    tokenResponse: tokenResponse
                });
            }
        }

        render() {
            const authenticatedFetch = (url) => fetchFromUrl(url, this.state.tokenResponse.accessToken);

            return (
                <C
                    {...this.props}
                    account={this.state.account}
                    error={this.state.error}
                    onSignIn={() => this.onSignIn(useRedirectFlow)}
                    onSignOut={() => this.onSignOut()}
                    onSessionToken={(uri) => this.onSessionToken(uri)}
                    authenticatedFetch={authenticatedFetch}
                />
            );
        }
    };
