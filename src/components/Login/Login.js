import React, {useState} from 'react';
import PropTypes from 'prop-types';
import ReCaptchaV2 from 'react-google-recaptcha'

import './Login.css';
import {wait} from "@testing-library/user-event/dist/utils";

async function loginUser(credentials) {
    let agent = await getAgent()
    console.log(agent)
    await wait(1000)
    return fetch('https://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        httpsAgent: agent
    })
        .then(ans => {
            if (ans.ok === false) {
                return "WRONG CRED"
            } else {
                return ans.json()
            }
        })
}

async function validCaptcha(token) {
    let agent = await getAgent()
    await wait(1000)
    return fetch('https://localhost:8080/validatecaptcha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: token}),
        httpsAgent: agent
    }).then(ans => {
        return ans.json()
    })
}

async function getAgent() {
    return fetch('https://localhost:8080/getagent', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(ans => {
        return ans.json()
    })
}

export default function Login({setToken}) {
    const [username, setUserName] = useState();
    const [password, setPassword] = useState();
    const [errMsg, setErrMsg] = useState();
    const [currentForm, setForm] = useState();

    const handleSubmit = async e => {
        e.preventDefault();

        const ans = await loginUser({
            username,
            password
        });

        if (ans !== "WRONG CRED" && currentForm !== undefined && currentForm !== null) {
            setToken(ans);
        } else {
            setErrMsg(true)
        }
        handleExpire()
    }

    const handleToken = async (token) => {

        await validCaptcha(token).then(valid => {
            if (valid) {
                setForm(token)
            } else {
                console.log("INVALID - " + valid)
            }
        })
    }

    const handleExpire = () => {
        setForm(null)
    }

    return (
        <div className="login-wrapper">
            <h1>Welcome</h1>
            <h3>Please log in</h3>
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Username</p>
                    <input type="text" onChange={e => setUserName(e.target.value)}/>
                </label>
                <label>
                    <p>Password</p>
                    <input type="password" onChange={e => setPassword(e.target.value)}/>
                </label>
                <ReCaptchaV2

                    sitekey={"6Lebr74eAAAAAGnj2PdTLgxgIex9I-351HWuvgPV"}
                    onChange={handleToken}
                    onExpired={handleExpire}
                    style={{marginTop: "20px"}}

                />
                <div style={{marginTop: "10px"}}>
                    <button type="submit">Submit</button>
                </div>
                {errMsg ? <h3 style={{color: 'red'}}>Wrong Credentials or CAPTCHA expired!</h3> : null}
            </form>
        </div>
    )
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
};
