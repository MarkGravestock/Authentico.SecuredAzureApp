import React from "react";
import PropTypes from "prop-types";
import AuthProvider from "./AuthProvider";

import "./App.css";
import {BASE_SERVICE_URI} from "./service_configuration";

const Json = ({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>;

class App extends React.Component {
    static propTypes = {
        account: PropTypes.object,
        error: PropTypes.string,
        onSignIn: PropTypes.func.isRequired,
        onSignOut: PropTypes.func.isRequired,
        onSessionToken: PropTypes.func.isRequired,
        authenticatedFetch: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            fruit: null,
        };
    }

    async callAzureFunction() {
        this.setState({ fruit: await this.props.authenticatedFetch(`${BASE_SERVICE_URI}/Fruit`) });
    }

    async callPlatformSecuredAzureFunction() {
        this.setState({ fruit: await this.props.authenticatedFetch(`${BASE_SERVICE_URI}/FruitPlatform`) });
    }
    
    callOnSessionToken() {
        this.props.onSessionToken(BASE_SERVICE_URI);
    }

    render() {
        return (
            <div>
                <section>
                    <h1>
                        Welcome to the Microsoft Authentication Library For
                        Javascript - React Quickstart
                    </h1>
                    {!this.props.account ? (
                        <button onClick={this.props.onSignIn}>Sign In</button>
                    ) : (
                        <>
                            <button onClick={this.props.onSignOut}>
                                Sign Out
                            </button>
                            <button onClick={this.callOnSessionToken.bind(this)}>
                                Session Token
                            </button>
                            <button onClick={this.callAzureFunction.bind(this)}>
                                Fruit Data (Imperative)
                            </button>
                            <button onClick={this.callPlatformSecuredAzureFunction.bind(this)}>
                                Fruit Data (Platform)
                            </button>
                        </>
                    )}
                    {this.props.error && (
                        <p className="error">Error: {this.props.error}</p>
                    )}
                </section>
                <section className="data">
                    {this.props.account && (
                        <div className="data-account">
                            <h2>Session Account Data</h2>
                            <Json data={this.props.account} />
                        </div>
                    )}
                </section>
                <section className="data">
                    {this.state.fruit && (
                        <div className="data-account">
                            <h2>Fruit Data</h2>
                            <Json data={this.state.fruit} />
                        </div>
                    )}
                </section>
            </div>
        );
    }
}

export default AuthProvider(App);
