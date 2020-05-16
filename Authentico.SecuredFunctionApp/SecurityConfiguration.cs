using System;
using System.Globalization;
using System.Collections.Generic;

namespace Authentico.SecuredFunctionApp
{
    // demo code, usually want to pull these from key vault or config etc.
    internal static class SecurityConfiguration
    {
        internal static string audience = "https://<appname>.<tenantname>.onmicrosoft.com"; // Get this value from the exposed api, audience uri section example https://appname.tenantname.onmicrosoft.com
        internal static Guid clientId = Guid.Parse("client-id-guid"); // this is the client id, also known as AppID. This is not the ObjectID
        internal static string tenant = "<tenantname>.onmicrosoft.com"; // this is your tenant name
        internal static Guid tenantid = Guid.Parse("tenant-id-gui"); // this is your tenant id (GUID)

        // rest of the values below can be left as is in most circumstances
        internal static string aadInstance = "https://login.microsoftonline.com/{0}/v2.0";
        internal static string authority = string.Format(CultureInfo.InvariantCulture, aadInstance, tenant);
        internal static List<string> validIssuers = new List<string>()
            {
                $"https://login.microsoftonline.com/{tenant}/",
                $"https://login.microsoftonline.com/{tenant}/v2.0",
                $"https://login.windows.net/{tenant}/",
                $"https://login.microsoft.com/{tenant}/",
                $"https://sts.windows.net/{tenantid}/"
            };
    }
}