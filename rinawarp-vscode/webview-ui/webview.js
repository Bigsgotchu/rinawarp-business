// VS Code webview script for RinaWarp Brain Client
// This script runs in the webview context

(function() {
    const vscode = acquireVsCodeApi();

    // Current plan state
    let currentPlan = null;

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'planResult':
                showPlanResult(message.plan);
                break;
            case 'executionResult':
                showExecutionResult(message.result);
                break;
            case 'statusResult':
                showStatusResult(message.status);
                break;
            case 'error':
                showError(message.error);
                break;
        }
    });

    // UI Functions
    function planAction() {
        const intent = document.getElementById('intent').value.trim();
        if (!intent) {
            alert('Please describe what you want to do');
            return;
        }

        // Hide previous results
        hideResults();

        // Send message to extension
        vscode.postMessage({
            type: 'planAction',
            intent: intent
        });

        // Show loading state
        showLoading('Planning action...');
    }

    function executePlan() {
        if (!currentPlan) {
            alert('No plan to execute');
            return;
        }

        // Send message to extension
        vscode.postMessage({
            type: 'executePlan',
            planId: currentPlan.planId
        });

        // Show loading state
        showLoading('Executing plan...');
    }

    function getStatus() {
        // Send message to extension
        vscode.postMessage({
            type: 'getStatus'
        });

        // Show loading state
        showLoading('Checking status...');
    }

    function showPlanResult(plan) {
        currentPlan = plan;
        hideLoading();

        const resultsDiv = document.getElementById('results');
        const planDisplay = document.getElementById('planDisplay');
        const executeBtn = document.getElementById('executeBtn');

        // Clear previous results
        planDisplay.innerHTML = '';

        // Build plan display
        const planHtml = `
            <div class="plan-header">
                <h3>${plan.summary}</h3>
                <div class="risk-badge risk-${plan.risk.toLowerCase()}">Risk: ${plan.risk}</div>
            </div>
            <div class="plan-id">Plan ID: ${plan.planId}</div>
            <div class="steps">
                <h4>Steps:</h4>
                <ol>
                    ${plan.steps.map(step => `
                        <li>
                            <strong>${step.type.toUpperCase()}:</strong> ${step.description}
                        </li>
                    `).join('')}
                </ol>
            </div>
            ${plan.requiresConfirmation ? '<div class="confirmation-notice">This plan requires confirmation before execution</div>' : ''}
        `;

        planDisplay.innerHTML = planHtml;
        resultsDiv.style.display = 'block';
        executeBtn.style.display = 'inline-block';
    }

    function showExecutionResult(result) {
        hideLoading();

        const executionDiv = document.getElementById('executionResults');
        const executionDisplay = document.getElementById('executionDisplay');

        // Clear previous results
        executionDisplay.innerHTML = '';

        // Build execution result display
        const resultHtml = `
            <div class="execution-header">
                <h3>Status: ${result.status}</h3>
                <div class="confidence-badge confidence-${result.confidence.toLowerCase()}">Confidence: ${result.confidence}</div>
            </div>
            <div class="checks">
                <h4>Validation Checks:</h4>
                <ul>
                    ${result.checks.map(check => `<li>${check}</li>`).join('')}
                </ul>
            </div>
            <div class="output">
                <h4>Output:</h4>
                <pre>${result.output}</pre>
            </div>
        `;

        executionDisplay.innerHTML = resultHtml;
        executionDiv.style.display = 'block';
    }

    function showStatusResult(status) {
        hideLoading();

        const statusIndicator = document.getElementById('status');
        statusIndicator.textContent = `Build: ${status.build} | License: ${status.license} | Uptime: ${status.uptime}`;
        statusIndicator.className = `status-indicator status-${status.license.toLowerCase()}`;
    }

    function showError(error) {
        hideLoading();

        const errorDiv = document.getElementById('error');
        const errorDisplay = document.getElementById('errorDisplay');
        errorDisplay.textContent = error;
        errorDiv.style.display = 'block';
    }

    function showLoading(message) {
        const statusIndicator = document.getElementById('status');
        statusIndicator.textContent = message;
        statusIndicator.className = 'status-indicator loading';
    }

    function hideLoading() {
        const statusIndicator = document.getElementById('status');
        statusIndicator.textContent = 'Ready';
        statusIndicator.className = 'status-indicator';
    }

    function hideResults() {
        document.getElementById('results').style.display = 'none';
        document.getElementById('executionResults').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }

    // Initialize
    hideResults();
    hideLoading();
})();