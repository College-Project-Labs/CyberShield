/* =========================================================
   CYBERSHIELD — REAL FRONTEND
   ========================================================= */

const API_URL = "http://127.0.0.1:8000";

console.log("CyberShield: CLEAN app.js loaded");

let transactions = [];
let lastAnalysis = null;


/* =========================================================
   DOM
   ========================================================= */

// DOM-dependent elements are initialized after DOMContentLoaded.


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


function getRiskClass(risk) {

    if (risk >= 0.75) {
        return "risk-danger";
    }

    if (risk >= 0.40) {
        return "risk-review";
    }

    return "risk-safe";
}


function getStatusClass(status) {

    if (status === "HIGH RISK") {
        return "status-danger";
    }

    if (status === "REVIEW") {
        return "status-review";
    }

    return "status-safe";
}


function normalizeTransaction(transaction) {

    const score = Number(
        transaction.risk_score ??
        transaction.risk ??
        0
    );

    const band =
        transaction.risk_band ??
        transaction.status ??
        "normal";

    let status = "SAFE";

    if (
        band === "suspicious" ||
        band === "fraud" ||
        band === "HIGH RISK"
    ) {
        status = "HIGH RISK";
    }

    else if (
        band === "review" ||
        band === "REVIEW"
    ) {
        status = "REVIEW";
    }

    return {
        id: transaction.id,

        merchant:
            transaction.merchant_id ??
            "Unknown",

        amount:
            Number(transaction.amount ?? 0),

        risk:
            score,

        status:
            status,

        type:
            transaction.raw_payload?.merchant_type ??
            transaction.raw_payload?.merchantType ??
            "Transaction",

        location:
            transaction.raw_payload?.location ??
            "Not provided",

        timestamp:
            transaction.timestamp ??
            transaction.created_at ??
            null,

        explanation:
            transaction.explanation ??
            "Transaction analyzed by CyberShield.",

        report:
            transaction.report ??
            {}
    };
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    const sections =
        document.querySelectorAll(".page-section");


    navItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const target =
                item.dataset.section;

            navItems.forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            sections.forEach(section => {
                section.classList.remove(
                    "active-section"
                );
            });

            const targetSection =
                $(target);

            if (targetSection) {
                targetSection.classList.add(
                    "active-section"
                );
            }

            if (target === "transactions") {
                renderFullTransactions();
            }

        });

    });

}


/* =========================================================
   LOAD REAL TRANSACTIONS
   ========================================================= */

async function loadTransactions() {

    try {

        const response =
            await fetch(
                `${API_URL}/transactions`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status}`
            );
        }

        const data =
            await response.json();

        transactions =
            data.map(normalizeTransaction);

        renderTransactions();
        renderFullTransactions();
        updateDashboardStats();

        console.log(
            "CyberShield transactions loaded:",
            transactions.length
        );

    }

    catch (error) {

        console.error(
            "Could not load transactions:",
            error
        );

        transactions = [];

        renderTransactions();
        renderFullTransactions();
        updateDashboardStats();
    }
}


/* =========================================================
   TRANSACTION TABLE
   ========================================================= */

function renderTransactions() {

    const container =
        $("transactionRows");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const visibleTransactions =
        transactions.slice(0, 5);

    if (visibleTransactions.length === 0) {

        container.innerHTML = `
            <div style="
                padding: 24px;
                text-align: center;
                opacity: 0.65;
            ">
                No transactions analyzed yet.
            </div>
        `;

        return;
    }


    visibleTransactions.forEach(
        transaction => {

            const row =
                document.createElement("div");

            row.className =
                "transaction-row";

            row.innerHTML = `

                <div class="merchant-cell">

                    <strong>
                        ${escapeHtml(
                            transaction.merchant
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            transaction.type
                        )}
                    </span>

                </div>

                <span>
                    $${formatMoney(
                        transaction.amount
                    )}
                </span>

                <span
                    class="risk-number
                    ${getRiskClass(
                        transaction.risk
                    )}"
                >
                    ${Math.round(
                        transaction.risk * 100
                    )}%
                </span>

                <span>

                    <span
                        class="status-pill
                        ${getStatusClass(
                            transaction.status
                        )}"
                    >
                        ${transaction.status}
                    </span>

                </span>
            `;

            container.appendChild(row);
        }
    );
}


/* =========================================================
   FULL TRANSACTION PAGE
   ========================================================= */

function renderFullTransactions() {

    const container =
        $("fullTransactions");

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="table-head">
            <span>Merchant</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Risk</span>
        </div>
    `;


    if (transactions.length === 0) {

        container.innerHTML += `
            <div style="
                padding: 30px;
                text-align: center;
                opacity: 0.65;
            ">
                No real transactions in database.
            </div>
        `;

        return;
    }


    transactions.forEach(
        transaction => {

            const row =
                document.createElement("div");

            row.className =
                "transaction-row";

            row.innerHTML = `

                <div class="merchant-cell">

                    <strong>
                        ${escapeHtml(
                            transaction.merchant
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            transaction.id ||
                            "Transaction"
                        )}
                    </span>

                </div>

                <span>
                    ${escapeHtml(
                        transaction.type
                    )}
                </span>

                <span>
                    $${formatMoney(
                        transaction.amount
                    )}
                </span>

                <span
                    class="risk-number
                    ${getRiskClass(
                        transaction.risk
                    )}"
                >
                    ${Math.round(
                        transaction.risk * 100
                    )}%
                </span>
            `;

            container.appendChild(row);
        }
    );
}


/* =========================================================
   REAL TRANSACTION ANALYSIS
   ========================================================= */

function initializeTransactionForm() {

    const form =
        document.getElementById("transactionForm");

    const amountInput =
        document.getElementById("amount");

    const merchantInput =
        document.getElementById("merchantId");

    const locationInput =
        document.getElementById("location");

    const merchantType =
        document.getElementById("merchantType");


    if (!form) {

        console.error(
            "CyberShield: transactionForm not found."
        );

        return;
    }


    /*
       IMPORTANT:
       The analyzer button is type="button", not "submit".
       This prevents the browser from navigating/reloading.

       We manually dispatch the submit event so the existing
       real FastAPI analysis handler runs.
    */

    const analyzeButton =
        form.querySelector(".analyze-button");


    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                form.dispatchEvent(
                    new Event("submit", {
                        bubbles: true,
                        cancelable: true
                    })
                );

            }
        );

    }


    form.addEventListener(
        "submit",
        async function(event) {

            /* -----------------------------------------
               STOP NORMAL FORM SUBMISSION
               ----------------------------------------- */

            event.preventDefault();
            event.stopPropagation();


            /* -----------------------------------------
               READ INPUTS
               ----------------------------------------- */

            const merchantId =
                merchantInput?.value.trim() || "";

            const amount =
                Number(
                    amountInput?.value || 0
                );

            const location =
                locationInput?.value.trim() || "";

            const type =
                merchantType?.value || "";


            /* -----------------------------------------
               VALIDATION
               ----------------------------------------- */

            if (
                !merchantId ||
                !amount ||
                amount <= 0
            ) {

                alert(
                    "Please enter a valid Merchant ID and Amount."
                );

                return;
            }


            /* -----------------------------------------
               SHOW PROCESSING
               ----------------------------------------- */

            showAnalyzingState();


            try {

                console.log(
                    "Sending transaction to CyberShield API..."
                );


                /* -------------------------------------
                   CALL FASTAPI
                   ------------------------------------- */

                const response =
                    await fetch(
                        `${API_URL}/transaction`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    merchant_id:
                                        merchantId,

                                    amount:
                                        amount,

                                    timestamp:
                                        new Date()
                                            .toISOString(),

                                    raw_payload: {

                                        location:
                                            location,

                                        merchant_type:
                                            type
                                    }
                                })
                        }
                    );


                /* -------------------------------------
                   READ RESPONSE
                   ------------------------------------- */

                const responseText =
                    await response.text();


                if (!response.ok) {

                    throw new Error(
                        `API ${response.status}: ${responseText}`
                    );
                }


                let data;

                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                }

                catch {

                    throw new Error(
                        "FastAPI returned invalid JSON."
                    );
                }


                console.log(
                    "REAL CYBERSHIELD RESPONSE:",
                    data
                );


                /* -------------------------------------
                   NORMALIZE RESULT
                   ------------------------------------- */

                const result =
                    normalizeTransaction(data);


                /* -------------------------------------
                   SAVE ANALYSIS
                   ------------------------------------- */

                lastAnalysis = {

                    ...result,

                    report:
                        data.report || {},

                    input: {

                        merchantId:
                            merchantId,

                        amount:
                            amount,

                        location:
                            location,

                        type:
                            type
                    },

                    analyzedAt:
                        new Date().toISOString()
                };


                /* -------------------------------------
                   DISPLAY RESULT
                   ------------------------------------- */

                displayResult(
                    lastAnalysis
                );


                /* -------------------------------------
                   REFRESH DATABASE DATA ONLY
                   ------------------------------------- */

                await loadTransactions();


                /* -------------------------------------
                   KEEP RESULT ON SCREEN
                   ------------------------------------- */

                displayResult(
                    lastAnalysis
                );


                console.log(
                    "CyberShield analysis displayed successfully."
                );

            }


            catch (error) {

                console.error(
                    "CyberShield analysis error:",
                    error
                );

                displayError(
                    error.message
                );
            }

        },

        false
    );

    console.log(
        "CyberShield: transaction form handler attached."
    );

}


/* =========================================================
   ANALYZING STATE
   ========================================================= */

function showAnalyzingState() {

    if ($("resultTitle")) {

        $("resultTitle").textContent =
            "Analyzing transaction";
    }


    if ($("resultBadge")) {

        $("resultBadge").className =
            "result-badge neutral";

        $("resultBadge").textContent =
            "PROCESSING";
    }


    if ($("transactionScore")) {

        $("transactionScore").textContent =
            "…";
    }


    if ($("transactionStatus")) {

        $("transactionStatus").textContent =
            "Running detection model";
    }


    if ($("explanation")) {

        $("explanation").textContent =
            "CyberShield is evaluating the transaction through the detection pipeline.";
    }
}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(result) {

    const score =
        Math.round(
            Number(
                result.risk || 0
            ) * 100
        );


    /* -----------------------------------------
       SCORE
       ----------------------------------------- */

    if ($("transactionScore")) {

        $("transactionScore").textContent =
            `${score}%`;
    }


    /* -----------------------------------------
       STATUS
       ----------------------------------------- */

    if ($("transactionStatus")) {

        $("transactionStatus").textContent =
            result.status;
    }


    /* -----------------------------------------
       TITLE
       ----------------------------------------- */

    if ($("resultTitle")) {

        $("resultTitle").textContent =

            result.status === "HIGH RISK"

                ? "Transaction flagged"

                : result.status === "REVIEW"

                    ? "Review recommended"

                    : "Transaction analyzed";
    }


    /* -----------------------------------------
       BADGE
       ----------------------------------------- */

    if ($("resultBadge")) {

        const badge =
            $("resultBadge");

        badge.className =
            "result-badge";


        if (
            result.status ===
            "HIGH RISK"
        ) {

            badge.classList.add(
                "danger"
            );

            badge.textContent =
                "HIGH RISK";
        }


        else if (
            result.status ===
            "REVIEW"
        ) {

            badge.classList.add(
                "review"
            );

            badge.textContent =
                "REVIEW";
        }


        else {

            badge.classList.add(
                "safe"
            );

            badge.textContent =
                "SAFE";
        }
    }


    /* -----------------------------------------
       EXPLANATION / AI REPORT
       ----------------------------------------- */

    if ($("explanation")) {

        const reportReason =
            result.report?.reason;

        $("explanation").textContent =

            reportReason ||

            result.explanation ||

            "Transaction analyzed by CyberShield.";
    }


    /* -----------------------------------------
       SIGNALS
       ----------------------------------------- */

    if ($("resultAmountSignal")) {

        $("resultAmountSignal").textContent =
            result.amount > 1000
                ? "Elevated"
                : "Normal";
    }


    if ($("resultMerchantSignal")) {

        $("resultMerchantSignal").textContent =
            result.type ||
            "Analyzed";
    }


    if ($("resultLocationSignal")) {

        $("resultLocationSignal").textContent =

            result.location &&
            result.location !==
                "Not provided"

                ? "Checked"

                : "Not provided";
    }


    /* -----------------------------------------
       ANALYSIS TAB CONTEXT CARDS
       ----------------------------------------- */

    if ($("amountSignal")) {
        $("amountSignal").textContent =
            result.amount > 1000 ? "Elevated" : "Normal";
    }

    if ($("merchantSignal")) {
        $("merchantSignal").textContent =
            result.type || "Analyzed";
    }

    if ($("locationSignal")) {
        $("locationSignal").textContent =
            result.location && result.location !== "Not provided"
                ? result.location
                : "Not provided";
    }

    if ($("frequencySignal")) {
        $("frequencySignal").textContent = "Pattern checked";
    }


    /* -----------------------------------------
       REPORT DOWNLOAD
       ----------------------------------------- */

    addReportButton();
}


/* =========================================================
   ERROR
   ========================================================= */

function displayError(message) {

    if ($("resultTitle")) {

        $("resultTitle").textContent =
            "Analysis failed";
    }


    if ($("resultBadge")) {

        $("resultBadge").className =
            "result-badge danger";

        $("resultBadge").textContent =
            "ERROR";
    }


    if ($("transactionScore")) {

        $("transactionScore").textContent =
            "—";
    }


    if ($("transactionStatus")) {

        $("transactionStatus").textContent =
            "Unable to analyze";
    }


    if ($("explanation")) {

        $("explanation").textContent =
            `CyberShield API error: ${message}`;
    }
}


/* =========================================================
   REAL DASHBOARD STATS
   ========================================================= */

function updateDashboardStats() {

    const total =
        transactions.length;


    const flagged =
        transactions.filter(
            transaction =>

                transaction.status ===
                    "HIGH RISK" ||

                transaction.status ===
                    "REVIEW"
        ).length;


    const highRisk =
        transactions.filter(
            transaction =>

                transaction.status ===
                "HIGH RISK"
        ).length;


    const risks =
        transactions

            .map(
                transaction =>
                    Number(
                        transaction.risk
                    )
            )

            .filter(
                value =>
                    Number.isFinite(value)
            );


    const averageRisk =
        risks.length

            ? Math.round(
                (
                    risks.reduce(
                        (a, b) =>
                            a + b,
                        0
                    ) / risks.length
                ) * 100
            )

            : 0;


    /* -----------------------------------------
       UPDATE OLD DASHBOARD NUMBERS
       ----------------------------------------- */

    updateMockupNumber(
        "1,284",
        total.toLocaleString()
    );


    updateMockupNumber(
        "42",
        flagged.toString()
    );


    updateMockupNumber(
        "08",
        String(
            highRisk
        ).padStart(2, "0")
    );


    updateMockupNumber(
        "97.8%",
        risks.length
            ? `${averageRisk}%`
            : "—"
    );


    /* -----------------------------------------
       GLOBAL RISK
       ----------------------------------------- */

    if ($("globalRisk")) {

        $("globalRisk").textContent =
            averageRisk;
    }


    if ($("globalRiskBar")) {

        $("globalRiskBar").style.width =
            `${averageRisk}%`;
    }


    if ($("riskLabel")) {

        $("riskLabel").textContent =

            averageRisk >= 75

                ? "High"

                : averageRisk >= 40

                    ? "Moderate"

                    : "Low";
    }
}


/* =========================================================
   REMOVE OLD MOCK NUMBERS
   ========================================================= */

function updateMockupNumber(
    oldValue,
    newValue
) {

    const walker =
        document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );


    const nodes = [];


    while (
        walker.nextNode()
    ) {

        nodes.push(
            walker.currentNode
        );
    }


    nodes.forEach(
        node => {

            if (
                node.nodeValue.trim() ===
                oldValue
            ) {

                node.nodeValue =
                    node.nodeValue.replace(
                        oldValue,
                        newValue
                    );
            }
        }
    );
}


/* =========================================================
   REPORT DOWNLOAD
   ========================================================= */

function addReportButton() {

    if (!lastAnalysis) {
        return;
    }


    const explanation =
        $("explanation");


    if (!explanation) {
        return;
    }


    let button =
        $("downloadReportButton");


    if (!button) {

        button =
            document.createElement(
                "button"
            );


        button.id =
            "downloadReportButton";


        button.type =
            "button";


        button.textContent =
            "Download Investigation Report";


        button.style.marginTop =
            "18px";


        button.style.padding =
            "12px 18px";


        button.style.border =
            "none";


        button.style.borderRadius =
            "10px";


        button.style.cursor =
            "pointer";


        button.style.fontWeight =
            "700";


        explanation.parentElement.appendChild(
            button
        );
    }


    button.onclick =
        downloadReport;
}


/* =========================================================
   DOWNLOAD REPORT
   ========================================================= */

function downloadReport() {

    if (!lastAnalysis) {
        return;
    }


    const report =
        lastAnalysis.report ||
        {};


    const merchantId =
        lastAnalysis.merchant ||
        "transaction";


    const score =
        Math.round(
            Number(
                lastAnalysis.risk ||
                0
            ) * 100
        );


    const reportText = `CYBERSHIELD INVESTIGATION REPORT
================================

Transaction ID:
${lastAnalysis.id || "N/A"}

Merchant ID:
${merchantId}

Amount:
₹${Number(
    lastAnalysis.amount || 0
).toLocaleString("en-IN")}

Merchant Type:
${lastAnalysis.type || "N/A"}

Location:
${lastAnalysis.location || "N/A"}

Fraud Score:
${score}%

Risk:
${lastAnalysis.status || "normal"}

ANALYSIS
--------
${
    report.reason ||
    lastAnalysis.explanation ||
    "No explanation available."
}

RECOMMENDATION
--------------
${
    report.recommendation ||
    "Continue monitoring the transaction."
}

EVIDENCE
--------
${
    report.evidence ||
    "ML fraud score and transaction context."
}

Generated:
${new Date().toLocaleString("en-IN")}

CyberShield
`;


    const blob =
        new Blob(
            [reportText],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `CyberShield_Report_${merchantId}.txt`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


/* =========================================================
   NAVIGATION HELPERS
   ========================================================= */

function scrollToAnalyzer() {

    const analyzer =
        $("analyzer");


    if (analyzer) {

        analyzer.scrollIntoView({
            behavior: "smooth"
        });
    }
}


function showAllTransactions() {

    const item =
        document.querySelector(
            '[data-section="transactions"]'
        );


    if (item) {
        item.click();
    }
}



/* =========================================================
   HERO NETWORK PARALLAX
   ========================================================= */

document.addEventListener("mousemove", event => {

    const network = document.querySelector(".cyber-network");

    if (!network || window.innerWidth < 900) {
        return;
    }

    const x = (event.clientX / window.innerWidth - 0.5) * 7;
    const y = (event.clientY / window.innerHeight - 0.5) * 7;

    network.style.transform =
        `translateY(-50%) translate(${x}px, ${y}px)`;
});


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNavigation();
        initializeTransactionForm();
        loadTransactions();

    }
);