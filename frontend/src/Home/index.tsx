import SuccessView from "./SuccessView";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import "./Home.css";
import { signOut } from "supertokens-auth-react/recipe/session";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getApiDomain } from "../config";

export default function Home() {
    const sessionContext = useSessionContext();
    const [org, setOrg] = useState("")
    const [thirdPartyEnabled, setThirdPartyEnabled] = useState(false)
    const [emailPasswordEnabled, setEmailPasswordEnabled] = useState(false)
    const [passwordlessEnabled, setPasswordlessEnabled] = useState(false) 
    const [MFA, setMFA] = useState(false)
    const [TOTP, setTOTP] = useState(false)
    const [phone, setPhone] = useState(false)
    const [email, setEmail] = useState(false)

    if (sessionContext.loading === true) {
        return null;
    }

    function handleOnChange(e: any) {
        setOrg(e.target.value)
    }
    
    async function createOrg(e: React.SyntheticEvent) {
        e.preventDefault()
        axios.post(getApiDomain() + "/tenants", {
            tenantId: org,
            emailPasswordEnabled,
            thirdPartyEnabled,
            MFA,
            passwordlessEnabled,
            TOTP,
            phone,
            email
        })
        .then(res => {
            localStorage.setItem("tenantId", org)
            window.location.href = "/auth"
        })
    }

    async function onLogout() {
        await signOut();
        localStorage.removeItem("tenantId")
        window.location.href = "/";
      }

      if (sessionContext.loading === false && sessionContext.doesSessionExist === false) {
        return (
            <div>
                <Link to="/auth" style={{position: "absolute", top: 0, left: 0}}>Sign in</Link>
                <div style={{display: "flex", flexDirection: "column", width: "50%", margin: "auto"}}>
                    <p>Create an organisation</p>
                    <form onSubmit={(e) => {createOrg(e)}} style={{display: "flex", flexDirection: "column"}}>
                        <input value={org} onChange={handleOnChange} name="organisation"/>
                        <label>
                            <input type="checkbox" id="checkbox" checked={thirdPartyEnabled} onChange={() => {setThirdPartyEnabled(!thirdPartyEnabled)}} />
                            Oauth login
                        </label>
                        <label>
                            <input type="checkbox" id="checkbox" checked={emailPasswordEnabled} onChange={() => {setEmailPasswordEnabled(!emailPasswordEnabled)}} />
                            Email and password login
                        </label>
                        <label>
                            <input type="checkbox" id="checkbox" checked={passwordlessEnabled || MFA} disabled={MFA} onChange={() => {setPasswordlessEnabled(!passwordlessEnabled)}} />
                            One-time Password
                        </label>
                        <label>
                            <input type="checkbox" id="checkbox" checked={MFA} onChange={() => {setMFA(!MFA); setPasswordlessEnabled(true)}} />
                            MFA
                        </label>
                        {MFA && (
                            <>
                                <label>
                                    <input type="checkbox" id="checkbox" checked={TOTP} onChange={() => {setTOTP(!TOTP)}} />
                                    TOTP
                                </label>
                                <label>
                                    <input type="checkbox" id="checkbox" checked={phone} onChange={() => {setPhone(!phone)}} />
                                    OTP Phone
                                </label>
                                <label>
                                    <input type="checkbox" id="checkbox" checked={email} onChange={() => {setEmail(!email)}} />
                                    OTP Email
                                </label>
                            </>
                        )}
                        <button type="submit">Create org</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="fill" id="home-container">
            {sessionContext.doesSessionExist && <button onClick={onLogout} style={{position: "absolute", top: 0, right: 0, border: "none", fontSize: "2em", backgroundColor: "inherit"}}>Logout</button>}
            {sessionContext.doesSessionExist && <SuccessView userId={sessionContext.userId} />}
        </div>
    );
}
