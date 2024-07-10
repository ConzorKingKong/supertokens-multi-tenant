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
    const [emailPassword, setEmailPassword] = useState(false)
    const [social, setSocial] = useState(false)
    const [MFA, setMFA] = useState(false)
    const [OTP, setOTP] = useState(false) 

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
            emailPassword,
            social,
            MFA,
            OTP
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
                            <input type="checkbox" id="checkbox" checked={emailPassword} onChange={() => {setEmailPassword(!emailPassword)}} />
                            Email and password login
                        </label>
                        <label>
                            <input type="checkbox" id="checkbox" checked={social} onChange={() => {setSocial(!social)}} />
                            Oauth login
                        </label>
                        <label>
                            <input type="checkbox" id="checkbox" checked={MFA} onChange={() => {setMFA(!MFA)}} />
                            MFA
                        </label>
                        <label>
                            <input type="checkbox" id="checkbox" checked={OTP} onChange={() => {setOTP(!OTP)}} />
                            One-time Password
                        </label>
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
