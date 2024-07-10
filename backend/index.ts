import express from "express";
import cors from "cors";
import supertokens from "supertokens-node";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import { getWebsiteDomain, SuperTokensConfig } from "./config";
import Multitenancy from "supertokens-node/recipe/multitenancy";
import UserRoles from "supertokens-node/recipe/userroles";

supertokens.init(SuperTokensConfig);

const app = express();


app.use(
    cors({
        origin: getWebsiteDomain(),
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        methods: ["GET", "PUT", "POST", "DELETE"],
        credentials: true,
    })
);

// This exposes all the APIs from SuperTokens to the client.
app.use(middleware());

app.use(express.json())

// An example API that requires session verification
app.get("/sessioninfo", verifySession(), async (req: SessionRequest, res) => {
    let session = req.session;
    res.send({
        sessionHandle: session!.getHandle(),
        userId: session!.getUserId(),
        accessTokenPayload: session!.getAccessTokenPayload(),
    });
});

// This API is used by the frontend to create the tenants drop down when the app loads.
// Depending on your UX, you can remove this API.
app.get("/tenants", async (req, res) => {
    let tenants = await Multitenancy.listAllTenants();
    res.send(tenants);
});

app.post("/tenants", async (req, res) => {
    const {tenantId, emailPasswordEnabled, thirdPartyEnabled, passwordlessEnabled, MFA, TOTP, phone, email} = req.body
    let tenantBody
    let firstFactors = []
    let requiredSecondaryFactors = []
    if (MFA) {
        if (TOTP) requiredSecondaryFactors.push("totp")
        if (phone) requiredSecondaryFactors.push("otp-phone")
        if (email) requiredSecondaryFactors.push("otp-email")
        if (emailPasswordEnabled) firstFactors.push("emailpassword")
        if (thirdPartyEnabled) firstFactors.push("thirdparty")
        tenantBody = {
          emailPasswordEnabled,
          thirdPartyEnabled,
          passwordlessEnabled,
          firstFactors,
          requiredSecondaryFactors,
        }
    } else {
      tenantBody = {
        emailPasswordEnabled,
        thirdPartyEnabled,
        passwordlessEnabled,
      }
    }

    try {
        let resp = await Multitenancy.createOrUpdateTenant(tenantId, tenantBody);

        if (resp.createdNew) {
            // Tenant created successfully
            const rolesResponse = await UserRoles.createNewRoleOrAddPermissions(tenantId, ["read"])
        }
        res.send(JSON.stringify({tenantId: req.body.tenantId}))
    } catch(e) {
        res.send(e)
    }
});

app.get("/tenants/:id", verifySession(), async (req: SessionRequest, res) => {
    try {
        // should be mulitple tenant ids to loop through maybe? check this
        let userOrg = req.session!.getTenantId()
        if (req.params.id !== userOrg) {
            res.send("unauthorised")
            return
        }
        let tenant = await Multitenancy.getTenant(req.params.id)
        res.send(tenant)
    } catch(e) {
        res.send(e)
    }
})

// In case of session related errors, this error handler
// returns 401 to the client.
app.use(errorHandler());

app.listen(3001, () => console.log(`API Server listening on port 3001`));
