let currentMode = 'standard';
let currentResults = null;
let comparisonScenarios = [];

// Toggle between Standard and Professional modes
function toggleMode() {
    const toggle = document.getElementById('mode-toggle');
    const badge = document.getElementById('mode-badge');
    const professionalParams = document.getElementById('professional-params');

    if (toggle.checked) {
        currentMode = 'professional';
        badge.textContent = 'PROFESSIONAL MODE';
        badge.className = 'mode-badge professional';
        professionalParams.style.display = 'block';
    } else {
        currentMode = 'standard';
        badge.textContent = 'STANDARD MODE';
        badge.className = 'mode-badge standard';
        professionalParams.style.display = 'none';
    }
}

// Update technology selection visual
function updateTechnologySelection() {
    const options = document.querySelectorAll('.tech-option');
    options.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Toggle panel collapse
function togglePanel(header) {
    header.parentElement.classList.toggle('collapsed');
}

// Load preset configurations
function loadPreset(type) {
    switch(type) {
        case 'simple':
            document.getElementById('db_size').value = 5;
            document.getElementById('num_objects').value = 2000;
            document.getElementById('num_test_cycles').value = 2;
            document.getElementById('project_complexity').value = 'low';
            document.querySelector('input[value="DTS"]').checked = true;
            break;
        case 'complex':
            document.getElementById('db_size').value = 20;
            document.getElementById('num_objects').value = 10000;
            document.getElementById('num_test_cycles').value = 5;
            document.getElementById('project_complexity').value = 'high';
            document.querySelector('input[value="TC"]').checked = true;
            break;
        case 'shell':
            document.getElementById('db_size').value = 15;
            document.getElementById('num_objects').value = 7000;
            document.getElementById('num_test_cycles').value = 4;
            document.getElementById('project_complexity').value = 'medium';
            document.querySelector('input[value="TC"]').checked = true;
            break;
    }
    updateTechnologySelection();
}

// Get input values
function getInputs() {
    const inputs = {
        migration_technology: document.querySelector('input[name="migration_technology"]:checked').value,
        daily_rate: parseFloat(document.getElementById('daily_rate').value),
        db_size: parseFloat(document.getElementById('db_size').value),
        num_objects: parseInt(document.getElementById('num_objects').value),
        num_test_cycles: parseInt(document.getElementById('num_test_cycles').value),
        target_downtime: parseFloat(document.getElementById('target_downtime').value),
        project_complexity: document.getElementById('project_complexity').value
    };

    if (currentMode === 'professional') {
        inputs.team_size = parseInt(document.getElementById('team_size').value);
        inputs.team_experience = document.getElementById('team_experience').value;
        inputs.custom_code_percentage = parseInt(document.getElementById('custom_code_percentage').value);
        inputs.data_quality = document.getElementById('data_quality').value;
        inputs.integration_complexity = parseInt(document.getElementById('integration_complexity').value);
        inputs.hardware_performance = document.getElementById('hardware_performance').value;
        inputs.defect_rate = document.getElementById('defect_rate').value;
        inputs.uat_duration = parseInt(document.getElementById('uat_duration').value);
        inputs.contingency_buffer = parseInt(document.getElementById('contingency_buffer').value);
    }

    return inputs;
}

// Main calculation function
function calculateEstimate() {
    const inputs = getInputs();

    // Base calculation factors
    const complexityMultipliers = {
        'low': 0.8,
        'medium': 1.0,
        'high': 1.3
    };

    // Technology-specific multipliers
    const techMultipliers = {
        'DTS': {
            duration: 0.80,  // 20% faster
            description: 'DTS offers faster execution with minimal overhead, reducing overall project duration by approximately 20%. Optimized for standardized migrations with near-zero downtime capability.'
        },
        'TC': {
            duration: 1.25,  // 25% slower
            description: 'TC involves additional overhead due to complex rule-based processing and program generation. This increases project duration by approximately 25% but provides flexibility for complex transformations and system harmonizations.'
        }
    };

    const complexityFactor = complexityMultipliers[inputs.project_complexity];
    const techFactor = techMultipliers[inputs.migration_technology].duration;

    // Phase calculations with technology impact
    let phases = [];

    // 1. Project Initiation & Planning
    let planningWeeks = (2 + (inputs.db_size / 10) * 0.5) * complexityFactor;
    phases.push({
        name: 'Project Initiation & Planning',
        weeks: planningWeeks,
        hours: planningWeeks * 40 * (currentMode === 'professional' ? inputs.team_size : 3),
        description: 'Project setup, requirements gathering, team onboarding'
    });

    // 2. Solution Design - TC requires more design time
    let designWeeks = (3 + (inputs.num_objects / 1000) * 0.3) * complexityFactor;
    if (inputs.migration_technology === 'TC') {
        designWeeks *= 1.15; // 15% more design time for TC
    }
    phases.push({
        name: 'Solution Design',
        weeks: designWeeks,
        hours: designWeeks * 40 * (currentMode === 'professional' ? inputs.team_size : 3),
        description: 'Architecture design, mapping rules definition, technical specifications'
    });

    // 3. Development & Configuration - Major technology impact
    let devWeeks = (4 + (inputs.num_objects / 500) * 0.5 + (inputs.db_size / 5) * 0.3) * complexityFactor * techFactor;
    phases.push({
        name: 'Development & Configuration',
        weeks: devWeeks,
        hours: devWeeks * 40 * (currentMode === 'professional' ? inputs.team_size : 4),
        description: 'Build migration programs, configure transformation rules, prepare environments'
    });

    // 4. Testing Cycles - Technology impacts each cycle
    let testCycleWeeks = inputs.num_test_cycles * (2 + (inputs.db_size / 10) * 0.4) * complexityFactor * techFactor;
    phases.push({
        name: 'Testing & Validation',
        weeks: testCycleWeeks,
        hours: testCycleWeeks * 40 * (currentMode === 'professional' ? inputs.team_size : 5),
        description: `${inputs.num_test_cycles} test cycles including data validation and reconciliation`
    });

    // 5. UAT & Business Validation
    let uatWeeks = (currentMode === 'professional' ? inputs.uat_duration / 7 : 2) * complexityFactor;
    phases.push({
        name: 'UAT & Business Validation',
        weeks: uatWeeks,
        hours: uatWeeks * 40 * (currentMode === 'professional' ? Math.ceil(inputs.team_size * 0.6) : 3),
        description: 'User acceptance testing and business process validation'
    });

    // 6. Go-Live Preparation
    let goLiveWeeks = (1.5 + (inputs.db_size / 20) * 0.2) * complexityFactor;
    phases.push({
        name: 'Go-Live Preparation',
        weeks: goLiveWeeks,
        hours: goLiveWeeks * 40 * (currentMode === 'professional' ? inputs.team_size : 4),
        description: 'Final go-live simulation, cutover planning, production readiness'
    });

    // 7. Production Cutover & Support
    let cutoverWeeks = 1.5 * complexityFactor;
    phases.push({
        name: 'Production Cutover & Support',
        weeks: cutoverWeeks,
        hours: cutoverWeeks * 40 * (currentMode === 'professional' ? inputs.team_size : 5),
        description: 'Production migration execution and hypercare support'
    });

    // Apply professional mode adjustments
    if (currentMode === 'professional') {
        // Team experience impact
        const experienceMultipliers = { 'junior': 1.3, 'mid': 1.0, 'senior': 0.85 };
        const expFactor = experienceMultipliers[inputs.team_experience];

        // Data quality impact
        const qualityMultipliers = { 'high': 0.9, 'medium': 1.0, 'low': 1.25 };
        const qualityFactor = qualityMultipliers[inputs.data_quality];

        // Apply adjustments
        phases = phases.map(phase => ({
            ...phase,
            weeks: phase.weeks * expFactor * qualityFactor,
            hours: phase.hours * expFactor * qualityFactor
        }));

        // Add contingency buffer
        const contingencyMultiplier = 1 + (inputs.contingency_buffer / 100);
        phases = phases.map(phase => ({
            ...phase,
            weeks: phase.weeks * contingencyMultiplier,
            hours: phase.hours * contingencyMultiplier
        }));
    }

    // Calculate totals
    const totalWeeks = phases.reduce((sum, phase) => sum + phase.weeks, 0);
    const totalHours = phases.reduce((sum, phase) => sum + phase.hours, 0);
    const totalDays = totalWeeks * 5;
    const totalCost = totalDays * inputs.daily_rate;

    // Downtime prediction with technology impact
    let predictedDowntime = (inputs.db_size * 0.5) + (inputs.num_objects / 1000);

    // DTS significantly reduces downtime
    if (inputs.migration_technology === 'DTS') {
        predictedDowntime *= 0.65; // 35% reduction with DTS
    } else {
        predictedDowntime *= 1.1; // 10% increase with TC
    }

    if (currentMode === 'professional') {
        const hwMultipliers = { 'low': 1.4, 'medium': 1.0, 'high': 0.8 };
        predictedDowntime *= hwMultipliers[inputs.hardware_performance];
    }

    // Store results
    currentResults = {
        inputs: inputs,
        phases: phases,
        total_weeks: totalWeeks,
        total_hours: totalHours,
        total_days: totalDays,
        total_cost: totalCost,
        total_months: (totalWeeks / 4.33).toFixed(1),
        predicted_downtime: predictedDowntime,
        technology_factor: techFactor,
        technology_description: techMultipliers[inputs.migration_technology].description
    };

    // Display results
    displayResults(currentResults);
}

// Display results
function displayResults(results) {
    // Show results section
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('results-section').classList.add('active');

    // Update subtitle
    const tech = results.inputs.migration_technology;
    document.getElementById('result-subtitle').innerHTML = `
        Generated using ${currentMode.toUpperCase()} mode with ${tech}
        <span class="tech-impact-badge ${tech.toLowerCase()}">${tech}</span>
    `;

    // Update KPIs
    document.getElementById('result-total-weeks').textContent = Math.round(results.total_weeks);
    document.getElementById('result-total-hours').textContent = Math.round(results.total_hours).toLocaleString();
    document.getElementById('result-total-cost').textContent = Math.round(results.total_cost).toLocaleString();
    document.getElementById('result-timeline').textContent = results.total_months;

    // Technology impact info
    const techInfo = document.getElementById('tech-impact-info');
    techInfo.className = results.inputs.migration_technology === 'DTS' ? 'info-box success' : 'info-box warning';
    document.getElementById('tech-impact-description').textContent = results.technology_description;

    // Phase breakdown
    displayPhaseBreakdown(results);

    // Downtime prediction
    displayDowntimePrediction(results);

    // Timeline
    displayTimeline(results.phases);

    // Risk assessment
    displayRiskAssessment(results);

    // Scroll to top
    window.scrollTo(0, 0);
}

// Display phase breakdown
function displayPhaseBreakdown(results) {
    const tbody = document.getElementById('phase-breakdown-body');
    const dailyRate = results.inputs.daily_rate;

    tbody.innerHTML = results.phases.map((phase, idx) => {
        const phaseCost = (phase.weeks * 5 * dailyRate);
        return `
            <tr>
                <td><strong>${idx + 1}. ${phase.name}</strong></td>
                <td>${phase.weeks.toFixed(1)}</td>
                <td>${Math.round(phase.hours).toLocaleString()}</td>
                <td>$${Math.round(phaseCost).toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    // Add total row
    tbody.innerHTML += `
        <tr style="background-color: #f7f7f7; font-weight: 600;">
            <td>TOTAL</td>
            <td>${results.total_weeks.toFixed(1)}</td>
            <td>${Math.round(results.total_hours).toLocaleString()}</td>
            <td>$${Math.round(results.total_cost).toLocaleString()}</td>
        </tr>
    `;
}

// Display downtime prediction
function displayDowntimePrediction(results) {
    const predicted = results.predicted_downtime;
    const target = results.inputs.target_downtime;
    const percentage = Math.min((predicted / target) * 100, 100);

    document.getElementById('downtime-hours').textContent = predicted.toFixed(1);
    document.getElementById('target-hours').textContent = target;
    document.getElementById('downtime-bar').style.width = percentage + '%';
    document.getElementById('downtime-percentage').textContent = percentage.toFixed(0) + '%';

    const statusDiv = document.getElementById('downtime-status');
    if (predicted <= target * 0.8) {
        statusDiv.innerHTML = `
            <div class="info-box success" style="margin-top: 1rem;">
                <div class="info-box-title">✅ Excellent - Well within target</div>
                <p>Predicted downtime is ${(target - predicted).toFixed(1)} hours below target. Good margin for contingency.</p>
            </div>
        `;
    } else if (predicted <= target) {
        statusDiv.innerHTML = `
            <div class="info-box" style="margin-top: 1rem;">
                <div class="info-box-title">✓ Good - Within acceptable range</div>
                <p>Predicted downtime meets target with ${(target - predicted).toFixed(1)} hours buffer.</p>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div class="info-box warning" style="margin-top: 1rem;">
                <div class="info-box-title">⚠️ Risk - Exceeds target</div>
                <p>Predicted downtime exceeds target by ${(predicted - target).toFixed(1)} hours. Consider optimization strategies or adjust expectations.</p>
            </div>
        `;
    }
}

// Display timeline
function displayTimeline(phases) {
    const timeline = document.getElementById('project-timeline');
    let cumulativeWeeks = 0;

    timeline.innerHTML = phases.map((phase, idx) => {
        cumulativeWeeks += phase.weeks;
        return `
            <div class="timeline-item ${idx === 0 ? 'active' : ''}">
                <div class="timeline-header">${phase.name}</div>
                <div class="timeline-duration">${phase.weeks.toFixed(1)} weeks (Weeks ${Math.round(cumulativeWeeks - phase.weeks + 1)}-${Math.round(cumulativeWeeks)})</div>
                <p style="font-size: 0.875rem; color: #6a6d70; margin-top: 0.25rem;">${phase.description}</p>
            </div>
        `;
    }).join('');
}

// Display risk assessment
function displayRiskAssessment(results) {
    const risks = [];

    // Technology-specific risks
    if (results.inputs.migration_technology === 'TC') {
        risks.push({
            level: 'medium',
            title: 'TC Complexity Overhead',
            description: 'Using Transformation Cockpit adds 25% overhead due to rule-based processing and program generation. Ensure adequate testing time is allocated.'
        });
    } else {
        risks.push({
            level: 'low',
            title: 'DTS Efficiency Advantage',
            description: 'DTS reduces project duration by ~20% and offers near-zero downtime capability for standardized migrations.'
        });
    }

    // Database size risks
    if (results.inputs.db_size > 20) {
        risks.push({
            level: 'high',
            title: 'Large Database Volume',
            description: 'Database exceeds 20TB. Ensure adequate test hardware and consider data archiving to reduce migration time.'
        });
    }

    // Hardware performance risks
    if (currentMode === 'professional' && results.inputs.hardware_performance === 'low') {
        risks.push({
            level: 'high',
            title: 'Under-resourced Test Environment',
            description: 'Test hardware does not match production. Downtime estimates may be inaccurate. Upgrade test systems before Go-Live Simulation.'
        });
    }

    // Defect rate risks
    if (currentMode === 'professional' && results.inputs.defect_rate === 'high') {
        risks.push({
            level: 'medium',
            title: 'High Expected Defect Rate',
            description: 'Consider additional test cycles and allocate extra time for defect resolution. Strengthen requirements gathering.'
        });
    }

    // Test cycle risks
    if (results.inputs.num_test_cycles < 3) {
        risks.push({
            level: 'medium',
            title: 'Limited Test Cycles',
            description: 'Less than 3 test cycles may not provide sufficient validation. Consider adding an additional cycle for complex migrations.'
        });
    }

    // UAT duration risks
    if (currentMode === 'professional' && results.inputs.uat_duration < 7) {
        risks.push({
            level: 'medium',
            title: 'Short UAT Duration',
            description: 'Limited time for user acceptance testing may lead to undiscovered issues. Ensure test coverage is comprehensive.'
        });
    }

    // Downtime risks
    if (results.predicted_downtime < results.inputs.target_downtime * 0.8) {
        risks.push({
            level: 'low',
            title: 'Comfortable Downtime Window',
            description: 'Predicted downtime is well within target. Good margin for contingency during production cutover.'
        });
    }

    if (risks.length === 0) {
        risks.push({
            level: 'low',
            title: 'Well-Configured Project',
            description: 'Project parameters appear well-balanced. Continue following SNP best practices for optimal outcomes.'
        });
    }

    const grid = document.getElementById('risk-grid');
    grid.innerHTML = risks.map(risk => `
        <div class="risk-item">
            <div class="risk-indicator ${risk.level}"></div>
            <div class="risk-content">
                <div class="risk-title">${risk.title}</div>
                <div class="risk-description">${risk.description}</div>
            </div>
        </div>
    `).join('');
}

// Comparison functions
function addToComparison() {
    if (!currentResults) {
        alert('Please calculate an estimate first');
        return;
    }

    const name = prompt('Enter a name for this scenario:', `Scenario ${comparisonScenarios.length + 1}`);
    if (!name) return;

    comparisonScenarios.push({
        name: name,
        results: { ...currentResults }
    });

    alert(`✅ Added to comparison (${comparisonScenarios.length} scenarios total)`);
}

function showComparison() {
    if (comparisonScenarios.length === 0) {
        alert('No scenarios to compare. Add scenarios using "Add to Comparison" button after calculating estimates.');
        return;
    }

    const container = document.getElementById('comparison-container');
    container.innerHTML = comparisonScenarios.map((scenario, idx) => {
        const r = scenario.results;
        return `
            <div class="comparison-card ${idx === 0 ? 'active' : ''}">
                <div class="comparison-header">${scenario.name}</div>
                <div class="comparison-metric">
                    <span class="comparison-label">Technology</span>
                    <span class="comparison-value">${r.inputs.migration_technology}</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Total Duration</span>
                    <span class="comparison-value">${Math.round(r.total_weeks)} weeks</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Budget Hours</span>
                    <span class="comparison-value">${Math.round(r.total_hours)} hrs</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Project Cost</span>
                    <span class="comparison-value">$${Math.round(r.total_cost).toLocaleString()}</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Timeline</span>
                    <span class="comparison-value">${r.total_months} months</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Test Cycles</span>
                    <span class="comparison-value">${r.inputs.num_test_cycles} cycles</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Complexity</span>
                    <span class="comparison-value">${r.inputs.project_complexity}</span>
                </div>
                <div class="comparison-metric">
                    <span class="comparison-label">Predicted Downtime</span>
                    <span class="comparison-value">${r.predicted_downtime.toFixed(1)} hrs</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('results-section').classList.remove('active');
    document.getElementById('comparison-section').style.display = 'block';
}

function hideComparison() {
    document.getElementById('comparison-section').style.display = 'none';
    document.getElementById('results-section').classList.add('active');
}

function clearComparison() {
    if (confirm('Clear all comparison scenarios?')) {
        comparisonScenarios = [];
        hideComparison();
        alert('✅ Comparison cleared');
    }
}

// Export functions
function resetForm() {
    if (confirm('Are you sure you want to reset all inputs to default values?')) {
        location.reload();
    }
}

function backToInput() {
    document.getElementById('results-section').classList.remove('active');
    document.getElementById('input-section').style.display = 'block';
    window.scrollTo(0, 0);
}

function exportToJSON() {
    const exportData = {
        timestamp: new Date().toISOString(),
        methodology: 'SNP Empirical Approach v2.0 Enhanced',
        mode: currentMode,
        inputs: currentResults.inputs,
        results: currentResults
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snp-migration-estimate-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportToPDF() {
    alert('📄 PDF export functionality: Use your browser\'s Print to PDF feature (Ctrl/Cmd+P) for now. Full PDF export coming in next update!');
    window.print();
}

document.addEventListener('DOMContentLoaded', () => {
    updateTechnologySelection();
});

