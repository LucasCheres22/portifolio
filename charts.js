/* ========================================================
   CHARTS & SIMULATION ENGINE — IA SOBERANA SECTION
   Cost projections: Cloud API vs. Own Infrastructure
   Supports Small, Medium (Sercompe), and Large Enterprises
   ======================================================== */

// ---- CONFIGURATIONS & MODELS ----
const SIM_CONFIGS = {
    small: {
        months: 36,
        cloudBase: 3500,
        cloudGrowth: 0.010, // 1.0% growth/month
        ownCapex: 35000,
        ownOpex: 800,
        assumptions: `
            <span>📌 Empresa-referência: Pequeno Porte (~30 colaboradores)</span>
            <span>📌 Hardware: 1× NVIDIA RTX Spark 16GB (GPU otimizada)</span>
            <span>📌 Investimento inicial: R$ 35.000</span>
            <span>📌 Custo mensal próprio: R$ 800 (energia + refrigeração)</span>
        `,
        hardware: [
            { comp: "🎮 GPU", spec: "1× NVIDIA RTX Spark 16GB (baixo custo, excelente desempenho)", cost: "R$ 11.000" },
            { comp: "🖥️ Servidor Base", spec: "AMD Ryzen 9 / Intel Core i9 + 64GB RAM", cost: "R$ 12.000" },
            { comp: "💾 Armazenamento", spec: "2TB NVMe RAID", cost: "R$ 3.000" },
            { comp: "🔌 Infraestrutura", spec: "Nobreak + gabinete refrigerado", cost: "R$ 3.000" },
            { comp: "⚙️ Setup & Deploy", spec: "Configuração do modelo (Ollama/vLLM) e orquestração local", cost: "R$ 6.000" },
            { comp: "💰 Total", spec: "Infraestrutura completa de baixo custo instalada", cost: "R$ 35.000", total: true }
        ]
    },
    medium: {
        months: 36,
        cloudBase: 18000,
        cloudGrowth: 0.015, // 1.5% growth/month
        ownCapex: 194000,
        ownOpex: 4200,
        assumptions: `
            <span>📌 Empresa-referência: porte Sercompe</span>
            <span>📌 Hardware: 2× NVIDIA RTX 4090 ou 4× RTX Spark (cluster de baixo custo)</span>
            <span>📌 Investimento inicial: R$ 194.000 (com RTX Spark) ou R$ 220.000 (com RTX 4090)</span>
            <span>📌 Custo mensal próprio: R$ 4.200 (energia + manutenção + climatização)</span>
        `,
        hardware: [
            { comp: "🎮 GPUs", spec: "2× NVIDIA RTX 4090 24GB ou as novas RTX Spark 16GB (baixo custo)", cost: "R$ 70.000 / R$ 44.000" },
            { comp: "🖥️ Servidor", spec: "AMD EPYC / Threadripper PRO + 256GB RAM", cost: "R$ 55.000" },
            { comp: "💾 Armazenamento", spec: "4TB NVMe RAID + 20TB HDD backup", cost: "R$ 18.000" },
            { comp: "🔌 Infraestrutura", spec: "UPS, rack, rede 10Gbps, refrigeração", cost: "R$ 35.000" },
            { comp: "⚙️ Setup & Deploy", spec: "Configuração, Ollama/vLLM, integração corporativa", cost: "R$ 42.000" },
            { comp: "💰 Total", spec: "Infraestrutura completa e otimizada (Custo com RTX Spark / RTX 4090)", cost: "R$ 194.000 / R$ 220.000", total: true }
        ]
    },
    enterprise: {
        months: 36,
        cloudBase: 90000,
        cloudGrowth: 0.020, // 2.0% growth/month
        ownCapex: 850000,
        ownOpex: 18000,
        assumptions: `
            <span>📌 Empresa-referência: Grande Porte / Multinacional (~1500+ colaboradores)</span>
            <span>📌 Hardware: Cluster Enterprise dedicado (8× NVIDIA RTX 5090 ou similar)</span>
            <span>📌 Investimento inicial: R$ 850.000</span>
            <span>📌 Custo mensal próprio: R$ 18.000 (climatização + energia + manutenção industrial)</span>
        `,
        hardware: [
            { comp: "🎮 GPUs", spec: "8× NVIDIA RTX 5090 32GB (alto paralelismo para múltiplos modelos)", cost: "R$ 450.000" },
            { comp: "🖥️ Servidores", spec: "Dual AMD EPYC + 1TB RAM + chassis de rack corporativo", cost: "R$ 180.000" },
            { comp: "💾 Armazenamento", spec: "16TB NVMe Gen5 RAID + 100TB SAS storage backup", cost: "R$ 60.000" },
            { comp: "🔌 Infraestrutura", spec: "UPS Trifásico modular, rede 40Gbps, refrigeração industrial", cost: "R$ 90.000" },
            { comp: "⚙️ Setup & Deploy", spec: "Clustering, alta disponibilidade, balanceamento, LLMOps e deploy", cost: "R$ 70.000" },
            { comp: "💰 Total", spec: "Data Center local de IA redundante, alta performance", cost: "R$ 850.000", total: true }
        ]
    }
};

// ---- GLOBAL CHART INSTANCES ----
let costChartInstance = null;
let roiChartInstance = null;
let currentSize = 'medium'; // Default selection

// ---- HELPERS & MATHS ----
function generateLabels(months) {
    const labels = [];
    const start = new Date(2026, 5); // Jun 2026
    for (let i = 0; i <= months; i++) {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        labels.push(d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }
    return labels;
}

function calculateCloudCumulative(base, growth, months) {
    const cumulative = [];
    let total = 0;
    for (let i = 0; i <= months; i++) {
        const monthly = base * Math.pow(1 + growth, i);
        total += monthly;
        cumulative.push(Math.round(total));
    }
    return cumulative;
}

function calculateOwnCumulative(capex, opex, months) {
    const cumulative = [];
    let total = capex; // Month 0 investment
    cumulative.push(Math.round(total));
    for (let i = 1; i <= months; i++) {
        total += opex;
        cumulative.push(Math.round(total));
    }
    return cumulative;
}

function calculateROI(cloud, own) {
    return cloud.map((c, i) => Math.round(c - own[i]));
}

function formatBRL(val) {
    if (val >= 1000000) return 'R$ ' + (val / 1000000).toFixed(2) + 'M';
    if (val >= 1000) return 'R$ ' + (val / 1000).toFixed(0) + 'k';
    return 'R$ ' + val.toLocaleString('pt-BR');
}

// ---- CHART LOOK & FEEL ----
Chart.defaults.color = 'rgba(240, 236, 228, 0.5)';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;

const commonTooltip = {
    backgroundColor: 'rgba(10,10,15,0.95)',
    borderColor: 'rgba(212,168,83,0.3)',
    borderWidth: 1,
    titleColor: '#f0ece4',
    bodyColor: 'rgba(240,236,228,0.75)',
    padding: 12,
    cornerRadius: 8,
    callbacks: {
        label: ctx => ' ' + ctx.dataset.label + ': ' + formatBRL(ctx.raw)
    }
};

// ---- SIMULATION CONTROLLER ----
function runSimulation(size) {
    const cfg = SIM_CONFIGS[size];
    if (!cfg) return;

    // 1. Math calculations
    const labels = generateLabels(cfg.months);
    const cloud = calculateCloudCumulative(cfg.cloudBase, cfg.cloudGrowth, cfg.months);
    const own = calculateOwnCumulative(cfg.ownCapex, cfg.ownOpex, cfg.months);
    const roi = calculateROI(cloud, own);

    // 2. Update Assumptions text
    const assumptionsEl = document.getElementById('aistackAssumptions');
    if (assumptionsEl) {
        assumptionsEl.innerHTML = cfg.assumptions;
    }

    // 3. Update Savings cards values
    const val24El = document.getElementById('savingsMonth24');
    const val36El = document.getElementById('savingsMonth36');
    const breakEl = document.getElementById('savingsBreakeven');

    const savings24 = roi[24];
    const savings36 = roi[36];

    // Find break-even month index
    const breakevenIdx = roi.findIndex(v => v > 0);
    const breakevenLabel = breakevenIdx > 0 ? `~${breakevenIdx} meses` : 'Sob consulta';

    if (val24El) val24El.innerText = formatBRL(savings24);
    if (val36El) val36El.innerText = formatBRL(savings36);
    if (breakEl) breakEl.innerText = breakevenLabel;

    // Highlight card logic (always highlight 36m savings or adjust highlight)
    
    // 4. Update Hardware Table
    const tableBodyEl = document.getElementById('hardwareTableBody');
    if (tableBodyEl) {
        let html = '';
        cfg.hardware.forEach(row => {
            const rowClass = row.total ? "hardware-row total" : "hardware-row";
            html += `
                <div class="${rowClass}">
                    <span>${row.comp}</span>
                    <span>${row.spec}</span>
                    <span>${row.cost}</span>
                </div>
            `;
        });
        tableBodyEl.innerHTML = html;
    }

    // 5. Update/Render Cost Projections Chart
    const ctxCost = document.getElementById('costChart');
    if (ctxCost) {
        if (costChartInstance) costChartInstance.destroy();

        costChartInstance = new Chart(ctxCost, {
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
                    tooltip: commonTooltip
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
                            callback: v => formatBRL(v)
                        }
                    }
                }
            }
        });
    }

    // 6. Update/Render ROI Chart
    const ctxROI = document.getElementById('roiChart');
    if (ctxROI) {
        if (roiChartInstance) roiChartInstance.destroy();

        const bgColors = roi.map(v => v < 0 ? 'rgba(224,92,92,0.35)' : 'rgba(212,168,83,0.45)');
        const borderColors = roi.map(v => v < 0 ? '#e05c5c' : '#d4a853');

        roiChartInstance = new Chart(ctxROI, {
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
                        hoverBackgroundColor: roi.map(v => v < 0 ? 'rgba(224,92,92,0.6)' : 'rgba(212,168,83,0.7)')
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
                                return prefix + formatBRL(Math.abs(val));
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
                            callback: v => formatBRL(v)
                        }
                    }
                }
            }
        });
    }
}

// ---- INTERACTION INITIALIZATION ----
document.addEventListener('DOMContentLoaded', () => {
    const selectorEl = document.getElementById('companySizeSelector');
    if (selectorEl) {
        selectorEl.addEventListener('change', (e) => {
            currentSize = e.target.value;
            runSimulation(currentSize);
        });
    }
});

// ---- INTERSECTION OBSERVER LAZY LOAD ----
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            runSimulation(currentSize);
            chartObserver.disconnect();
        }
    });
}, { threshold: 0.15 });

const aistackSection = document.getElementById('aistack');
if (aistackSection) chartObserver.observe(aistackSection);
