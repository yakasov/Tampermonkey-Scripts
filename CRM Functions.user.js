// ==UserScript==
// @name         CRM Functions
// @version      1.4.1
// @description  Helpful functions for ProspectSoft CRM
// @author       Yakasov
// @updateURL    https://raw.githubusercontent.com/yakasov/Tampermonkey-Scripts/main/CRM%20Functions.user.js
// @downloadURL  https://raw.githubusercontent.com/yakasov/Tampermonkey-Scripts/main/CRM%20Functions.user.js
// @match        https://crm.prospect365.com/
// @match        https://crm.prospect365-dev.com/
// @match        https://crm.prospect365-qa.com/
// @grant        GM_registerMenuCommand
// @require      https://gist.githubusercontent.com/BrockA/2625891/raw/9c97aa67ff9c5d56be34a55ad6c18a314e5eb548/waitForKeyElements.js
// ==/UserScript==

const environments = {
    "Live": "",
    "Development": "-dev",
    "QA": "-qa",
};

const currentEnvironment = environments[environment._deploymentEnvironment];
const apiUrl = "https://api-v1.prospect365" + currentEnvironment + ".com/";
const apiLiteUrl = "https://api-lite-v1.prospect365" + currentEnvironment + ".com/";
let usingLocalOData = false;

const functions = {
    "Clear local storage": clearLocalStorage,
    "Copy environment token": copyToken,
    "Toggle OData Lite": toggleODataLite,
    "Run GET request": runGetRequest,
    "Run OData request": runODataRequest,
    "Use local OData": useLocalOData,
    "Force OData rebuild": forceODataRebuild,
    "Change UI colour": changeColour,
};

waitForKeyElements(".platform-app", changeProspectTitle);

function changeProspectTitle() {
    let prospectTitle = document.getElementsByClassName("platform-app")[0];
    const entityHtml = '<a href="/"> _useODataLite = ' + Api.Query._useODataLite + '<br> usingLocalOData = ' + usingLocalOData + ' </a>';
    prospectTitle.innerHTML = entityHtml;
};

function clearLocalStorage() {
    localStorage.clear();
};

function copyToken() {
    navigator.clipboard.writeText(environment.token);
};

function toggleODataLite() {
    Api.Query._useODataLite = !Api.Query._useODataLite;
    changeProspectTitle();
};

function runGetRequest() {
    const url = prompt("Enter URL to send GET request to:", apiUrl + "Users");
    $.ajax({
        method: "GET",
        url: url,
        synchronous: true,
        headers: {"authorization":"Bearer " + environment.token, "content-type":"application/json; charset=utf-8","x-core-query":"true","x-locale":"en-gb"},
        dataType: "json",
        success: function(response) { copyJsonUrlToClipboard(response) },
    });
};

async function runODataRequest() {
    const entity = prompt("Enter entity to query in OData:\nProspectSoft.OData.", "SalesLedger");
    const response = await new Api.Query(ProspectSoft.OData[entity]);
    await copyJsonUrlToClipboard(response);
};

async function copyJsonUrlToClipboard(response) {
    const jsonText = encodeURIComponent(JSON.stringify(response, null, "\t"));
    await navigator.clipboard.writeText("data:text/json," + jsonText);
    alert("URL copied to clipboard!");
};

function useLocalOData() {
    usingLocalOData = !usingLocalOData;
    changeProspectTitle();
    const localhostUrl = prompt("Enter localhost URL:", "https://localhost:12345/");
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        const args = [...arguments];
        const usedUrl = args[1].startsWith(apiUrl) ? apiUrl : args[1].startsWith(apiLiteUrl) ? apiLiteUrl : null;
        if (usedUrl) {
            args[1] = localhostUrl + args[1].substr(usedUrl.length);
            window.$$staging = localhostUrl;
        };
        return open.apply(this, args);
    };
};

async function forceODataRebuild() {
    const dbUpdated = confirm("Have you forced a rebuild of the OData DLL in the database?");
    if (dbUpdated) {
        while(true) {
            const res = await new Api.Query({pluralName: "Info", fields: {}});
            console.log(res.State);
            if(res.State !== "building") {
                break;
            };
            await new Promise(r => setTimeout(r, 1000));
        };
    };
};

function changeColour() {
    __test();
};

for (const [key, val] of Object.entries(functions)) {
    GM_registerMenuCommand(key, val);
};
