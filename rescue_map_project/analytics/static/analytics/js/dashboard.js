document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard loaded. Fetching Mock APIs...");
    
    // Call API
    fetchSummary();
    fetchTimeline();
    fetchDistributions();
    fetchResources();
});

// --- 1. API Summary (KPIs) ---
function fetchSummary() {
    fetch('/static/analytics/data/api_summary.json')
        .then(res => res.json())
        .then(data => {
            // Update Number
            document.getElementById('kpi-total').textContent = data.total_requests;
            document.getElementById('kpi-active').textContent = data.active_requests;
            document.getElementById('kpi-processing').textContent = data.processing_requests;
            document.getElementById('kpi-resolved').textContent = data.resolved_today;

            // Update Trends (Helper function)
            updateTrend('trend-total', data.trends.total);
            updateTrend('trend-active', data.trends.active);
            updateTrend('trend-processing', data.trends.processing);
            updateTrend('trend-resolved', data.trends.resolved);
        });
}

function updateTrend(elementId, value) {
    const el = document.getElementById(elementId);
    const icon = value > 0 ? '↑' : (value < 0 ? '↓' : '-');
    const color = value > 0 ? 'text-white' : (value < 0 ? 'text-light' : 'text-white');
    el.innerHTML = `<span class="${color}">${icon} ${Math.abs(value)}% vs yesterday</span>`;
}

// --- 2. API Timeline ---
function fetchTimeline() {
    fetch('/static/analytics/data/api_timeline.json')
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('timelineChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Requests',
                        data: data.values,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        });
}

// --- 3. API Distributions (Status & Priority) ---
function fetchDistributions() {
    fetch('/static/analytics/data/api_distributions.json')
        .then(res => res.json())
        .then(data => {
            // Status Chart (Doughnut)
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: data.status.labels,
                    datasets: [{
                        data: data.status.values,
                        backgroundColor: data.status.colors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });

            // Priority Chart (Bar)
            const priorityCtx = document.getElementById('priorityChart').getContext('2d');
            new Chart(priorityCtx, {
                type: 'bar',
                data: {
                    labels: data.priority.labels,
                    datasets: [{
                        label: 'Count',
                        data: data.priority.values,
                        backgroundColor: data.priority.colors,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y', // Horizontal bars
                    plugins: { legend: { display: false } }
                }
            });
        });
}

// --- 4. API Resources ---
function fetchResources() {
    fetch('/static/analytics/data/api_resources.json')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#resourceTable tbody');
            tbody.innerHTML = '';
            
            data.forEach(item => {
                // Color coding based on utilization
                let badgeClass = 'bg-success';
                if(item.utilization > 80) badgeClass = 'bg-danger';
                else if(item.utilization > 50) badgeClass = 'bg-warning text-dark';

                const row = `
                    <tr>
                        <td><strong>${item.type}</strong></td>
                        <td>${item.total}</td>
                        <td>${item.available}</td>
                        <td class="align-middle">
                            <div class="d-flex align-items-center">
                                <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                    <div class="progress-bar ${badgeClass}" role="progressbar" 
                                         style="width: ${item.utilization}%"></div>
                                </div>
                                <span class="badge ${badgeClass}">${item.utilization}%</span>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}