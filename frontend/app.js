/* =========================================================
   CYBERSHIELD FRONTEND
   ========================================================= */


/* =========================================================
   SAMPLE TRANSACTIONS
   ========================================================= */

const transactions = [
    {
        merchant: "MER-1048",
        type: "Retail",
        amount: 250.00,
        risk: 0.08,
        status: "SAFE"
    },

    {
        merchant: "MER-7731",
        type: "Electronics",
        amount: 1840.50,
        risk: 0.71,
        status: "REVIEW"
    },

    {
        merchant: "MER-2904",
        type: "Food & Dining",
        amount: 74.25,
        risk: 0.03,
        status: "SAFE"
    },

    {
        merchant: "MER-5518",
        type: "Digital Services",
        amount: 2190.00,
        risk: 0.91,
        status: "HIGH RISK"
    },

    {
        merchant: "MER-6112",
        type: "Travel",
        amount: 485.90,
        risk: 0.19,
        status: "SAFE"
    }
];


/* =========================================================
   DOM
   ========================================================= */

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


/* =========================================================
   NAVIGATION
   ========================================================= */

const navItems =
    document.querySelectorAll(".nav-item");

const sections =
    document.querySelectorAll(".page-section");


navItems.forEach(item => {

    item.addEventListener("click", () => {

        const target =
            item.dataset.section;

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        sections.forEach(section => {
            section.classList.remove("active-section");
        });

        const targetSection =
            document.getElementById(target);

        if (targetSection) {
            targetSection.classList.add("active-section");
        }

        if (target === "transactions") {
            renderFullTransactions();
        }

    });

});


/* =========================================================
   TRANSACTION TABLE
   ========================================================= */

function getRiskClass(risk) {

    if (risk >= 0.75) {
        return "risk-danger";
    }

    if (risk >= 0.4) {
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


function renderTransactions() {

    const container =
        document.getElementById("transactionRows");

    container.innerHTML = "";

    transactions
        .slice(0, 5)
        .forEach(transaction => {

            const row =
                document.createElement("div");

            row.className =
                "transaction-row";

            row.innerHTML = `

                <div class="merchant-cell">

                    <strong>
                        ${transaction.merchant}
                    </strong>

                    <span>
                        ${transaction.type}
                    </span>

                </div>

                <span>
                    $${transaction.amount.toLocaleString(
                        "en-US",
                        {
                            minimumFractionDigits: 2
                        }
                    )}
                </span>

                <span
                    class="risk-number
                    ${getRiskClass(transaction.risk)}"
                >
                    ${Math.round(transaction.risk * 100)}%
                </span>

                <span>
                    <span
                        class="status-pill
                        ${getStatusClass(transaction.status)}"
                    >
                        ${transaction.status}
                    </span>
                </span>

            `;

            container.appendChild(row);

        });

}


/* =========================================================
   FULL TRANSACTION PAGE
   ========================================================= */

function renderFullTransactions() {

    const container =
        document.getElementById("fullTransactions");

    container.innerHTML = `

        <div class="table-head">
            <span>Merchant</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Risk</span>
        </div>

    `;

    transactions.forEach(transaction => {

        const row =
            document.createElement("div");

        row.className =
            "transaction-row";

        row.innerHTML = `

            <div class="merchant-cell">

                <strong>
                    ${transaction.merchant}
                </strong>

                <span>
                    Transaction ID
                </span>

            </div>

            <span>
                ${transaction.type}
            </span>

            <span>
                $${transaction.amount.toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2
                    }
                )}
            </span>

            <span
                class="risk-number
                ${getRiskClass(transaction.risk)}"
            >
                ${Math.round(transaction.risk * 100)}%
            </span>

        `;

        container.appendChild(row);

    });

}


/* =========================================================
   TRANSACTION ANALYSIS
   ========================================================= */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const merchantId =
            merchantInput.value.trim();

        const amount =
            Number(amountInput.value);

        const location =
            locationInput.value.trim();

        const type =
            merchantType.value;


        if (!merchantId || !amount) {
            return;
        }


        /*
         * -----------------------------------------------
         * BACKEND CONNECTION
         * -----------------------------------------------
         *
         * When your FastAPI endpoint is ready, replace
         * the simulated result below with:
         *
         * fetch("http://127.0.0.1:8000/predict", ...)
         *
         * or whichever endpoint your backend exposes.
         */

        showAnalyzingState();


        try {

            /*
             * SIMULATION
             *
             * This keeps the frontend working before the
             * FastAPI backend is connected.
             */

            await delay(850);

            const result =
                simulateFraudDetection(
                    amount,
                    type,
                    location
                );

            displayResult(result);


        } catch (error) {

            console.error(error);

            displayError();

        }

    }
);


/* =========================================================
   SIMULATED MODEL
   ========================================================= */

function simulateFraudDetection(
    amount,
    type,
    location
) {

    let score = 0.04;


    /*
     * Amount signal
     */

    if (amount > 2000) {
        score += 0.55;
    }

    else if (amount > 1000) {
        score += 0.28;
    }

    else if (amount > 500) {
        score += 0.12;
    }


    /*
     * Merchant signal
     */

    if (type === "electronics") {
        score += 0.12;
    }

    if (type === "digital") {
        score += 0.10;
    }


    /*
     * Location signal
     */

    if (
        location.toLowerCase().includes("unknown") ||
        location.toLowerCase().includes("international")
    ) {
        score += 0.20;
    }


    /*
     * Keep between 0 and 1
     */

    score =
        Math.min(
            Math.max(score, 0.01),
            0.99
        );


    let status;

    if (score >= 0.75) {
        status = "HIGH RISK";
    }

    else if (score >= 0.40) {
        status = "REVIEW";
    }

    else {
        status = "SAFE";
    }


    let explanation;

    if (status === "HIGH RISK") {

        explanation =
            "The transaction shows a combination of elevated amount and behavioral signals that differ from the expected transaction pattern.";

    }

    else if (status === "REVIEW") {

        explanation =
            "Some transaction characteristics are unusual. The transaction should be reviewed before being cleared.";

    }

    else {

        explanation =
            "The transaction falls within the expected behavioral range and no major fraud indicators were detected.";

    }


    return {

        score,
        status,
        explanation,

        signals: {

            amount:
                amount > 1000
                    ? "Elevated"
                    : "Normal",

            merchant:
                type === "electronics" ||
                type === "digital"
                    ? "Watch"
                    : "Normal",

            location:
                location.toLowerCase().includes("unknown")
                    ? "Unusual"
                    : "Normal"

        }

    };

}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(result) {

    const score =
        Math.round(result.score * 100);


    const scoreElement =
        document.getElementById(
            "transactionScore"
        );

    const statusElement =
        document.getElementById(
            "transactionStatus"
        );

    const titleElement =
        document.getElementById(
            "resultTitle"
        );

    const badgeElement =
        document.getElementById(
            "resultBadge"
        );

    const explanationElement =
        document.getElementById(
            "explanation"
        );


    scoreElement.textContent =
        `${score}%`;

    statusElement.textContent =
        result.status;

    titleElement.textContent =
        result.status === "HIGH RISK"
            ? "Transaction flagged"
            : result.status === "REVIEW"
                ? "Review recommended"
                : "Transaction looks safe";

    explanationElement.textContent =
        result.explanation;


    /*
     * Badge
     */

    badgeElement.className =
        "result-badge";


    if (result.status === "HIGH RISK") {

        badgeElement.classList.add("danger");

        badgeElement.textContent =
            "HIGH RISK";

    }

    else if (result.status === "REVIEW") {

        badgeElement.classList.add("review");

        badgeElement.textContent =
            "REVIEW";

    }

    else {

        badgeElement.classList.add("safe");

        badgeElement.textContent =
            "SAFE";

    }


    /*
     * Signals
     */

    document.getElementById(
        "amountSignal"
    ).textContent =
        result.signals.amount;


    document.getElementById(
        "merchantSignal"
    ).textContent =
        result.signals.merchant;


    document.getElementById(
        "locationSignal"
    ).textContent =
        result.signals.location;


    /*
     * Add to recent transactions
     */

    transactions.unshift({

        merchant:
            merchantInput.value,

        type:
            merchantType.options[
                merchantType.selectedIndex
            ].text,

        amount:
            Number(amountInput.value),

        risk:
            result.score,

        status:
            result.status

    });


    renderTransactions();


    /*
     * Update dashboard counters
     */

    updateDashboard(result);

}


/* =========================================================
   DASHBOARD UPDATE
   ========================================================= */

function updateDashboard(result) {

    const score =
        Math.round(result.score * 100);


    const globalRisk =
        document.getElementById(
            "globalRisk"
        );

    const globalRiskBar =
        document.getElementById(
            "globalRiskBar"
        );

    const riskLabel =
        document.getElementById(
            "riskLabel"
        );


    globalRisk.textContent =
        score;


    globalRiskBar.style.width =
        `${score}%`;


    if (score >= 75) {

        riskLabel.textContent =
            "High";

        globalRiskBar.style.background =
            "var(--coral)";

        riskLabel.style.color =
            "var(--coral)";

    }

    else if (score >= 40) {

        riskLabel.textContent =
            "Moderate";

        globalRiskBar.style.background =
            "var(--blue)";

        riskLabel.style.color =
            "var(--blue)";

    }

    else {

        riskLabel.textContent =
            "Low";

        globalRiskBar.style.background =
            "var(--lime)";

        riskLabel.style.color =
            "var(--lime)";

    }

}


/* =========================================================
   ANALYZING STATE
   ========================================================= */

function showAnalyzingState() {

    document.getElementById(
        "resultTitle"
    ).textContent =
        "Analyzing transaction";


    document.getElementById(
        "resultBadge"
    ).className =
        "result-badge neutral";


    document.getElementById(
        "resultBadge"
    ).textContent =
        "PROCESSING";


    document.getElementById(
        "transactionScore"
    ).textContent =
        "…";


    document.getElementById(
        "transactionStatus"
    ).textContent =
        "Running detection model";


    document.getElementById(
        "explanation"
    ).textContent =
        "CyberShield is evaluating the transaction against its detection signals.";

}


/* =========================================================
   ERROR STATE
   ========================================================= */

function displayError() {

    document.getElementById(
        "resultTitle"
    ).textContent =
        "Analysis failed";


    document.getElementById(
        "resultBadge"
    ).textContent =
        "ERROR";


    document.getElementById(
        "transactionScore"
    ).textContent =
        "—";


    document.getElementById(
        "transactionStatus"
    ).textContent =
        "Unable to analyze";


    document.getElementById(
        "explanation"
    ).textContent =
        "The detection service could not process this transaction. Check that the CyberShield API is running.";

}


/* =========================================================
   HELPERS
   ========================================================= */

function delay(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


function scrollToAnalyzer() {

    document.getElementById(
        "analyzer"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


function showAllTransactions() {

    document
        .querySelector(
            '[data-section="transactions"]'
        )
        .click();

}


/* =========================================================
   INITIALIZE
   ========================================================= */

renderTransactions();

renderFullTransactions();