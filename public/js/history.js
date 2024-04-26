
document.addEventListener('DOMContentLoaded', function() {
    // Fetch history data when the page loads
    fetchHistoryData();
});

function fetchHistoryData() {
    fetch('/api/history')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch history data');
        }
        return response.json();
    })
    .then(data => {
        displayHistoryData(data);
    })
    .catch(error => {
        console.error('Error fetching history data:', error.message, error.stack);
        document.getElementById('historyTableBody').innerHTML = '<tr><td colspan="6">An error occurred while fetching your history. Please try again.</td></tr>';
    });
}

function displayHistoryData(historyData) {
    if (!historyData.length) {
        document.getElementById('historyTableBody').innerHTML = '<tr><td colspan="6">No history found</td></tr>';
        return;
    }

    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = ''; // Clear existing entries

    historyData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
            <td>${entry.sessionLabel || 'N/A'}</td>
            <td>${entry.instruments.map(instrument => instrument.name).join(', ')}</td>
            <td>${entry.instruments.map(instrument => instrument.section).join(', ')}</td>
            <td>${entry.instruments.map(instrument => instrument.row).join(', ')}</td>
            <td>${entry.instruments.map(instrument => instrument.position).join(', ')}</td>
            <td>${entry.instruments.map(instrument => instrument.transcriptionOfNotes.join(", ")).join('; ')}</td>
        `;
        tableBody.appendChild(row);
    });
}