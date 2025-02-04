import { useState } from "react";
import * as reactRouterDom from "react-router-dom";
import { Routes } from "react-router-dom";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { ThirdPartyPreBuiltUI } from 'supertokens-auth-react/recipe/thirdparty/prebuiltui';
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { TOTPPreBuiltUI } from "supertokens-auth-react/recipe/totp/prebuiltui";
import { MultiFactorAuthPreBuiltUI } from "supertokens-auth-react/recipe/multifactorauth/prebuiltui";

export default function Auth() {
    const location = reactRouterDom.useLocation();
    const [inputTenantId, setInputTenantId] = useState("");
    const tenantId = localStorage.getItem("tenantId") ?? undefined;
    const session = useSessionContext();

    if (session.loading) {
        return null;
    }

    if (
        tenantId !== undefined || // if we have a tenantId stored
        session.doesSessionExist === true || // or an active session (it'll contain the tenantId)
        new URLSearchParams(location.search).has("tenantId") // or we are on a link (e.g.: email verification) that contains the tenantId
    ) {
        // Since this component (AuthPage) is rendered in the /auth route in the main Routes component,
        // and we are rendering this in a sub route as shown below, the third arg to getSuperTokensRoutesForReactRouterDom
        // tells SuperTokens to create Routes without /auth prefix to them, otherwise they would
        // render on /auth/auth path.
        return (
            <Routes>
                {getSuperTokensRoutesForReactRouterDom(
                    reactRouterDom,
                    [ThirdPartyPreBuiltUI, EmailPasswordPreBuiltUI, PasswordlessPreBuiltUI, MultiFactorAuthPreBuiltUI, TOTPPreBuiltUI],
                    "/auth"
                )}
            </Routes>
        );
    } else {
        return (
            <form
                onSubmit={() => {
                    // this value will be read by SuperTokens as shown in the next steps.
                    localStorage.setItem("tenantId", inputTenantId);
                }} style={{margin: "auto"}}>
                <h2>Enter your organisation's name:</h2>
                <input type="text" value={inputTenantId} onChange={(e) => setInputTenantId(e.target.value)} />
                <br />
                <button type="submit">Next</button>
            </form>
        );
    }
};