import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import "./Cognito.css";

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const manageLogin = (e) => {
        e.preventDefault();

        const user = new CognitoUser({
            Username: username,
            Pool: UserPool
        });

        const authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        user.authenticateUser(authenticationDetails, {
            onSuccess: data => {
                console.log('authentication succeeded: ', data);
                localStorage.setItem('accessToken', data.getAccessToken().getJwtToken());
                localStorage.setItem('refreshToken', data.getRefreshToken().getToken());
                localStorage.setItem('username', username);

                user.getUserAttributes((err, attributes) => {
                    if (err) {
                        console.error('Error fetching user attributes: ', err);
                    } else {
                        const emailAttribute = attributes.find(attr => attr.Name === 'email');
                        if (emailAttribute) {
                            localStorage.setItem('email', emailAttribute.Value);
                            console.log('email: ', emailAttribute.Value);
                        }
                        window.location.reload();
                    }
                });
            },
            onFailure: err => {
                console.error('authentication failed: ', err);
                if (err.message === "User is not confirmed.") {
                    let verificationCode = "";
                    while (verificationCode.length === 0) {
                        verificationCode = prompt('User not confirmed. Please input verification code: ', '');
                        
                        if (verificationCode) {
                            user.confirmRegistration(verificationCode, false, function (err, result) {
                                if (err) {
                                    alert(err.message || JSON.stringify(err));
                                    return;
                                }
                                console.log('call result: ' + result);
                            });
                        }
                    }
                }
            }
        });
    };

    return (
        <div className="text-center" id="loginBox">
            <form className="loginForm" onSubmit={manageLogin}>
                <input
                    className="loginInput"
                    type="text"
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="loginInput"
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="loginButton" type="submit">Zaloguj się</button>
            </form>
        </div>
    );
};

export default SignIn;
