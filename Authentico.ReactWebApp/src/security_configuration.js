export const CLIENT_ID = "client-id-guid"; // this is your client id (GUID), also known as AppID

export const TENANT_ID = "tenant-id-guid"; // this is your tenant id (GUID)

export const AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}`; 

export const GRAPH_SCOPES = {
    OPENID: "openid",
    PROFILE: "profile",
    USER_READ: "User.Read",
};

export const GRAPH_REQUESTS = {
    LOGIN: {
        scopes: [
            GRAPH_SCOPES.OPENID,
            GRAPH_SCOPES.PROFILE,
            GRAPH_SCOPES.USER_READ
        ]
    },
};

export const APP_SCOPES = {
    APP_ID: "https://<appname>.<tenantname>.com/user_impersonation", // This is your scope for your application
};

export const APP_REQUESTS = {
    LOGIN: {
        scopes: [
            APP_SCOPES.APP_ID,
        ]
    },
};

