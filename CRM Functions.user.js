// ==UserScript==
// @name         CRM Functions
// @version      1.1
// @description  Helpful functions for ProspectSoft CRM
// @author       Yakasov
// @updateURL    https://raw.githubusercontent.com/yakasov/Tampermonkey-Scripts/main/CRM%20Functions.user.js
// @downloadURL  https://raw.githubusercontent.com/yakasov/Tampermonkey-Scripts/main/CRM%20Functions.user.js
// @match        https://crm.prospect365.com/
// @match        https://crm.prospect365-dev.com/
// @match        https://crm.prospect365-qa.com/
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// ==/UserScript==

const functions = {
    "Copy environment token": copyToken,
    "Toggle OData Lite": toggleODataLite,
    "Run GET request": runGetRequest,
    "Change UI colour": changeColour,
};

function copyToken() {
    navigator.clipboard.writeText(environment.token);
};

function toggleODataLite() {
    Api.Query._useODataLite = !Api.Query._useODataLite;
};

function runGetRequest() {
    let url = prompt("Enter URL to send GET request to:", "https://api-v1.prospect365-dev.com/Users");
    $.ajax({
        url: url,
        headers: {"authorization":"Bearer " + environment.token, "content-type":"application/json; charset=utf-8","x-core-query":"true","x-locale":"en-gb"},
        dataType: "json",
        success: function(response) {
            GM_openInTab("data:text/json," + encodeURIComponent(JSON.stringify(response, null, "\t")), "_blank");
        }
    });
};

function changeColour() {
    __test();
};

for (const [key, val] of Object.entries(functions)) {
    GM_registerMenuCommand(key, val);
};