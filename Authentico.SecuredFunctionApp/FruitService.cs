using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

//  Code based on:  https://github.com/Azure-Samples/ms-identity-dotnet-webapi-azurefunctions

namespace Authentico.SecuredFunctionApp
{
    public class FruitService
    {
        [FunctionName("Fruit")]
        public async Task<IActionResult> Fruit([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]
            HttpRequest req, ILogger log)
        {
            var accessToken = GetAccessToken(req);
            var claimsPrincipal = await ValidateAccessToken(accessToken, log);

            if (claimsPrincipal != null)
            {
                return new OkObjectResult(new {User = claimsPrincipal.Identity.Name, Fruit = new [] { new {Name = "Orange"}, new {Name = "Apple"}}});
            }

            return new UnauthorizedResult();
        }

        [FunctionName("FruitPlatform")]
        public IActionResult FruitPlatform([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]
            HttpRequest req, ClaimsPrincipal claimsPrincipal, ILogger log)
        {
            if (claimsPrincipal != null)
            {
                return new OkObjectResult(new {User = claimsPrincipal.Identity.Name, Fruit = new [] { new {Name = "Banana"}, new {Name = "Strawberry"}}});
            }

            return new UnauthorizedResult();
        }

        private static string GetAccessToken(HttpRequest req)
        {
            var authorizationHeader = req.Headers?["Authorization"];
            string[] parts = authorizationHeader?.ToString().Split(null) ?? new string[0];
            if (parts.Length == 2 && parts[0].Equals("Bearer"))
                return parts[1];
            return null;
        }

        private static async Task<ClaimsPrincipal> ValidateAccessToken(string accessToken, ILogger log)
        {
            var audience = SecurityConfiguration.audience;
            var clientId = SecurityConfiguration.clientId.ToString();
            var authority = SecurityConfiguration.authority;
            var validIssuers = SecurityConfiguration.validIssuers;

            // Debugging purposes only, set this to false for production
            Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;

            ConfigurationManager<OpenIdConnectConfiguration> configManager =
                new ConfigurationManager<OpenIdConnectConfiguration>(
                    $"{authority}/.well-known/openid-configuration",
                    new OpenIdConnectConfigurationRetriever());

            OpenIdConnectConfiguration config = null;
            config = await configManager.GetConfigurationAsync();

            ISecurityTokenValidator tokenValidator = new JwtSecurityTokenHandler();

            // Initialize the token validation parameters
            TokenValidationParameters validationParameters = new TokenValidationParameters
            {
                // App Id URI and AppId of this service application are both valid audiences.
                ValidAudiences = new[] { audience , clientId },

                // Support Azure AD V1 and V2 endpoints.
                ValidIssuers = validIssuers,
                IssuerSigningKeys = config.SigningKeys
            };

            try
            {
                SecurityToken securityToken;
                var claimsPrincipal = tokenValidator.ValidateToken(accessToken, validationParameters, out securityToken);
                return claimsPrincipal;
            }
            catch (Exception ex)
            {
                log.LogError(ex.ToString());
            }
            return null;
        }
    }
}