document.getElementById('health-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const entry = document.getElementById('entry').value;

    const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entry })
    });

    if (response.ok) {
        document.getElementById('entry').value = '';
        loadEntries();
    }
});

async function loadEntries() {
    const response = await fetch('/api/entries');
    const entries = await response.json();
    const entriesDiv = document.getElementById('entries');
    entriesDiv.innerHTML = '';
    entries.forEach(e => {
        const div = document.createElement('div');
        div.textContent = e.entry;
        entriesDiv.appendChild(div);
    });
}

loadEntries();