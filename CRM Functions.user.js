// ==UserScript==
// @name         CRM Functions
// @version      1.2
// @description  Helpful functions for ProspectSoft CRM
// @author       Yakasov
// @updateURL    https://raw.githubusercontent.com/yakasov/Tampermonkey-Scripts/main/CRM%20Functions.user.js
// @downloadURL  https://raw.githubusercontent.com/yakasov/Tampermonkey-Scripts/main/CRM%20Functions.user.js
// @match        https://crm.prospect365.com/
// @match        https://crm.prospect365-dev.com/
// @match        https://crm.prospect365-qa.com/
// @grant        GM_registerMenuCommand
// ==/UserScript==

const functions = {
    "Clear local storage": clearLocalStorage,
    "Copy environment token": copyToken,
    "Toggle OData Lite": toggleODataLite,
    "Run GET request": runGetRequest,
    "Run OData request": runODataRequest,
    "Change UI colour": changeColour,
};

function clearLocalStorage() {
    localStorage.clear();
};

function copyToken() {
    navigator.clipboard.writeText(environment.token);
};

function toggleODataLite() {
    Api.Query._useODataLite = !Api.Query._useODataLite;
};

function runGetRequest() {
    const url = prompt("Enter URL to send GET request to:", "https://api-v1.prospect365-dev.com/Users");
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

function changeColour() {
    __test();
};

for (const [key, val] of Object.entries(functions)) {
    GM_registerMenuCommand(key, val);
};

