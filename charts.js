/* ========================================================
   CHARTS — IA SOBERANA SECTION
   Cost projections: Cloud API vs. Own Infrastructure
   Reference: Sercompe-scale company (~300 employees)
   ======================================================== */

// ---- ASSUMPTIONS (BRL, 2026) ----
// Cloud AI (Claude/OpenAI APIs) for medium enterprise:
//   - Baseline: R$ 18,000/month (dev tooling + ops + data workflows)
//   - Growth: +1.5% per month (gradual subsidy phase-out)
// Own infra:
//   - CAPEX: R$ 220,000 (one-time, month 0)
//   - OPEX: R$ 4,200/month (energy, maintenance, sysadmin fraction)

const MONTHS = 36;
const CLOUD_BASE = 18000;
const CLOUD_GROWTH = 0.015; // 1.5% per month
const OWN_CAPEX = 220000;
const OWN_OPEX = 4200;

function generateLabels() {
    const labels = [];
    const start = new Date(2026, 5); // Jun 2026
    for (let i = 0; i <= MONTHS; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        labels.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }
    return labels;
}

function generateCloudCumulative() {
    let cumulative = [];
    let total = 0;
    for (let i = 0; i <= MONTHS; i++) {
        const monthly = CLOUD_BASE * Math.pow(1 + CLOUD_GROWTH, i);
        total += monthly;
        cumulative.push(Math.round(total));
    }
    return cumulative;
}

function generateOwnCumulative() {
    let cumulative = [];
    let total = OWN_CAPEX; // month 0 = hardware investment
    cumulative.push(Math.round(total));
    for (let i = 1; i <= MONTHS; i++) {
        total += OWN_OPEX;
        cumulative.push(Math.round(total));
    }
    return cumulative;
}

function generateROI(cloud, own) {
    return cloud.map((c, i) => Math.round(c - own[i]));
}

// ---- CHART DEFAULTS ----
Chart.defaults.color = 'rgba(240, 236, 228, 0.5)';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;

function tooltipBRL(val) {
    if (val >= 1000000) return 'R$ ' + (val / 1000000).toFixed(2) + 'M';
    if (val >= 1000) return 'R$ ' + (val / 1000).toFixed(0) + 'k';
    return 'R$ ' + val.toLocaleString('pt-BR');
}

const commonTooltip = {
    backgroundColor: 'rgba(10,10,15,0.95)',
    borderColor: 'rgba(212,168,83,0.3)',
    borderWidth: 1,
    titleColor: '#f0ece4',
    bodyColor: 'rgba(240,236,228,0.75)',
    padding: 12,
    cornerRadius: 8,
    callbacks: {
        label: ctx => ' ' + ctx.dataset.label + ': ' + tooltipBRL(ctx.raw)
    }
};

// ---- INIT CHARTS ----
function initCharts() {
    const labels = generateLabels();
    const cloud = generateCloudCumulative();
    const own = generateOwnCumulative();
    const roi = generateROI(cloud, own);

    // ---- CHART 1: Accumulated Cost Comparison ----
    const ctxCost = document.getElementById('costChart');
    if (!ctxCost) return;

    new Chart(ctxCost, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cloud API (Anthropic / OpenAI)',
                    data: cloud,
                    borderColor: '#e05c5c',
                    backgroundColor: 'rgba(224, 92, 92, 0.08)',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#e05c5c',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Infraestrutura Própria (on-premise)',
                    data: own,
                    borderColor: '#d4a853',
                    backgroundColor: 'rgba(212, 168, 83, 0.08)',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#d4a853',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 16,
                        color: 'rgba(240,236,228,0.7)',
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: commonTooltip,
                annotation: {}
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: {
                        maxTicksLimit: 12,
                        color: 'rgba(240,236,228,0.4)',
                        maxRotation: 0
                    }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: {
                        color: 'rgba(240,236,228,0.4)',
                        callback: v => tooltipBRL(v)
                    }
                }
            }
        }
    });

    // ---- CHART 2: ROI / Net Savings ----
    const ctxROI = document.getElementById('roiChart');
    if (!ctxROI) return;

    // Find break-even month
    const breakevenIdx = roi.findIndex(v => v > 0);

    const bgColors = roi.map((v, i) =>
        v < 0 ? 'rgba(224,92,92,0.35)' : 'rgba(212,168,83,0.45)'
    );
    const borderColors = roi.map((v, i) =>
        v < 0 ? '#e05c5c' : '#d4a853'
    );

    new Chart(ctxROI, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Economia acumulada (Cloud - Próprio)',
                    data: roi,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    borderRadius: 3,
                    hoverBackgroundColor: roi.map(v =>
                        v < 0 ? 'rgba(224,92,92,0.6)' : 'rgba(212,168,83,0.7)'
                    )
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 16,
                        color: 'rgba(240,236,228,0.7)',
                        usePointStyle: true
                    }
                },
                tooltip: {
                    ...commonTooltip,
                    callbacks: {
                        label: ctx => {
                            const val = ctx.raw;
                            const prefix = val >= 0 ? ' ✅ Economia: ' : ' ⏳ Amortizando: ';
                            return prefix + tooltipBRL(Math.abs(val));
                        },
                        afterLabel: ctx => {
                            const idx = ctx.dataIndex;
                            if (breakevenIdx > 0 && idx === breakevenIdx) {
                                return '  🎯 Break-even atingido!';
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: {
                        maxTicksLimit: 12,
                        color: 'rgba(240,236,228,0.4)',
                        maxRotation: 0
                    }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: {
                        color: 'rgba(240,236,228,0.4)',
                        callback: v => tooltipBRL(v)
                    }
                }
            }
        }
    });
}

// ---- TRIGGER WHEN SECTION IS VISIBLE ----
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initCharts();
            chartObserver.disconnect();
        }
    });
}, { threshold: 0.15 });

const aistackSection = document.getElementById('aistack');
if (aistackSection) chartObserver.observe(aistackSection);
