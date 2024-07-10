import ThirdParty from "supertokens-node/recipe/thirdparty";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import { TypeInput } from "supertokens-node/types";
import Dashboard from "supertokens-node/recipe/dashboard";
import UserRoles from "supertokens-node/recipe/userroles";
import Passwordless from "supertokens-node/recipe/passwordless";
import AccountLinking from "supertokens-node/recipe/accountlinking";
import { AccountInfoWithRecipeId } from "supertokens-node/recipe/accountlinking/types";
import { RecipeUserId, User } from "supertokens-node";
import { SessionContainerInterface } from "supertokens-node/recipe/session/types";
import { UserContext } from "supertokens-node/types";
import MultiFactorAuth from "supertokens-node/recipe/multifactorauth"
import totp from "supertokens-node/recipe/totp"


export function getApiDomain() {
    const apiPort = process.env.REACT_APP_API_PORT || 3001;
    const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;
    return apiUrl;
}

export function getWebsiteDomain() {
    const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3000;
    const websiteUrl = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;
    return websiteUrl;
}

export const SuperTokensConfig: TypeInput = {
    supertokens: {
        // this is the location of the SuperTokens core.
        connectionURI: "http://localhost:3567"
    },
    appInfo: {
        appName: "org",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    // recipeList contains all the modules that you want to
    // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
    recipeList: [
        AccountLinking.init({
            shouldDoAutomaticAccountLinking: async (newAccountInfo: AccountInfoWithRecipeId & { recipeUserId?: RecipeUserId }, user: User | undefined, session: SessionContainerInterface | undefined, tenantId: string, userContext: UserContext) => {
                if (session === undefined) {
                    // we do not want to do first factor account linking by default. To enable that,
                    // please see the automatic account linking docs in the recipe docs for your first factor.
                    return {
                        shouldAutomaticallyLink: false
                    };
                }
                if (user === undefined || session.getUserId() === user.id) {
                    // if it comes here, it means that a session exists, and we are trying to link the 
                    // newAccountInfo to the session user, which means it's an MFA flow, so we enable 
                    // linking here.
                    return {
                        shouldAutomaticallyLink: true,
                        shouldRequireVerification: false
                    }
                }
                return {
                    shouldAutomaticallyLink: false
                };
            }
        }),
        Passwordless.init({
            contactMethod: "EMAIL_OR_PHONE",
            flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
        }),
        EmailPassword.init({
            override: {
                functions: (originalImplementation) => {
                    return {
                        ...originalImplementation,

                        // override the email password sign up function
                        signUp: async function (input) {
                            // TODO: some pre sign up logic

                            let response = await originalImplementation.signUp(input);

                            if (response.status === "OK" && response.user.loginMethods.length === 1 && input.session === undefined) {
                                // TODO: some post sign up logic
                                const roleResponse = await UserRoles.addRoleToUser(response.user.tenantIds[0], response.user.id, response.user.tenantIds[0])
                                console.log(roleResponse)
                            }

                            return response;
                        }
                    }
                }
            }
        }),
        ThirdParty.init({
            override: {
                functions: (originalImplementation) => {
                    return {
                        ...originalImplementation,

                        // override the thirdparty sign in / up function
                        signInUp: async function (input) {
                            // TODO: Some pre sign in / up logic

                            let response = await originalImplementation.signInUp(input);

                            if (response.status === "OK") {

                                let accessToken = response.oAuthTokens["access_token"];

                                let firstName = response.rawUserInfoFromProvider.fromUserInfoAPI!["first_name"];

                                if (input.session === undefined) {
                                    if (response.createdNewRecipeUser && response.user.loginMethods.length === 1) {
                                        // TODO: some post sign up logic
                                        const roleResponse = await UserRoles.addRoleToUser(response.user.tenantIds[0], response.user.id, response.user.tenantIds[0])
                                        console.log(roleResponse)
                                    } else {
                                        // TODO: some post sign in logic
                                    }
                                }
                            }

                            return response;
                        }
                    }
                }
            },
            signInAndUpFeature: {
                providers: [
                    // We have provided you with development keys which you can use for testing.
                    // IMPORTANT: Please replace them with your own OAuth keys for production use.
                    {
                        config: {
                            thirdPartyId: "google",
                            clients: [
                                {
                                    clientId:
                                        "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
                                    clientSecret: "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",
                                },
                            ],
                        },
                    }],
            },
        }),
        Session.init(),
        Dashboard.init(),
        UserRoles.init(),
        MultiFactorAuth.init(),
        totp.init(),
    ],
};