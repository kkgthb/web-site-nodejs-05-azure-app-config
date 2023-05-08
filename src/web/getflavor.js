const { parseKeyVaultSecretIdentifier, SecretClient } = require("@azure/keyvault-secrets");
const { AppConfigurationClient, parseSecretReference } = require("@azure/app-configuration");
const { DefaultAzureCredential } = require("@azure/identity");

async function getFlavor() {
    const azureCredential = new DefaultAzureCredential();
    const appConfigName = "INSERT-YOUR-APP-CONFIG-RESOURCE-NAME-HERE";
    const appConfigUrl = `https://${appConfigName}.azconfig.io`;
    const appConfigClient = new AppConfigurationClient(appConfigUrl, azureCredential);

    // const pizzaFlavor = await keyVaultClient.getSecret("pizzaflavor");
    const pizzaFlavorNonsecret = await appConfigClient.getConfigurationSetting({key: "pizzatopping"}); // .value // Per https://github.com/Azure/azure-sdk-for-js/issues/12330#issuecomment-728823175, this 403's out unless the login context has "App Configuration Data Owner" permission.  "Owner" isn't enough.
    const tempResponse = await appConfigClient.getConfigurationSetting({ key: "pizzaflavorkv" });
    const parsedSecretReference = parseSecretReference(tempResponse);
    // const keyVaultName = "INSERT-YOUR-KEY-VAULT-RESOURCE-NAME-HERE"; // This is how you would have used Key Vault in the past without App Configuration.
    // const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`; // This is how you would have used Key Vault in the past without App Configuration.
    const { name: kvSecretName, vaultUrl: kvVaultUrl } = parseKeyVaultSecretIdentifier(parsedSecretReference.value.secretId);
    // const keyVaultClient = new SecretClient(keyVaultUrl, azureCredential); // This is how you would have used Key Vault in the past without App Configuration.
    const kvClient = new SecretClient(kvVaultUrl, azureCredential);
    const pizzaFlavorSecret = await kvClient.getSecret(kvSecretName); // .value  // You would have to hardcode the Key Vault key name inside .getSecret() in the past without querying it out of App Configuration.
    return { pizzaFlavorNonsecret, pizzaFlavorSecret };
}

module.exports = getFlavor;