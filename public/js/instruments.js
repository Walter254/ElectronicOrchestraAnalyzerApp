document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/instruments')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const grid = document.getElementById('instrumentsGrid');
        data.forEach(instrument => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4 instrument-card';
            col.innerHTML = `
                <div class="card">
                    <img src="${instrument.photo}" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${instrument.name}</h5>
                        <p class="card-text">Section: ${instrument.spatialLocalization.section}, Row: ${instrument.spatialLocalization.row}, Position: ${instrument.spatialLocalization.position}</p>
                        <button class="btn btn-primary view-details-btn" data-id="${instrument._id}">View Details</button>
                        <div class="instrument-details d-none">
                            <p><strong>Transcription of Notes:</strong> Loading...</p>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(col);
        });
        attachClickEventToCards();
    })
    .catch(error => {
        console.error('Error loading instruments:', error.message, error.stack);
        alert('Failed to load instruments. Please try again later.');
    });

    document.getElementById('saveHistoryBtn').addEventListener('click', function() {
        const sessionLabel = document.getElementById('sessionLabelInput').value.trim();
        if (sessionLabel === '') {
          alert('Please enter a session label.');
          return;
        }
        
        const instrumentCards = document.querySelectorAll('.instrument-card .card');
        const instruments = Array.from(instrumentCards).map(card => {
            const detailsDiv = card.querySelector('.instrument-details');
            const transcriptionOfNotes = detailsDiv.textContent.replace('Transcription of Notes: ', '').split(', ');
            return {
                id: card.querySelector('.view-details-btn').getAttribute('data-id'),
                name: card.querySelector('.card-title').textContent,
                section: card.querySelector('.card-text').textContent.match(/Section: (\w+)/)[1],
                row: card.querySelector('.card-text').textContent.match(/Row: (\d+)/)[1],
                position: card.querySelector('.card-text').textContent.match(/Position: (\d+)/)[1],
                transcriptionOfNotes: transcriptionOfNotes
            };
        });

        console.log("Instruments to send:", instruments);

        fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include credentials for session cookie
          body: JSON.stringify({sessionLabel: sessionLabel, instruments: instruments}),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to save history');
          }
          return response.json();
        })
        .then(data => {
          console.log('Session saved successfully:', data);
          alert('Session saved successfully.');
          window.location.href = '/history';
        })
        .catch(error => {
          console.error('Error saving session history:', error.message, error.stack);
          alert('An error occurred while saving your session. Please try again.');
        });
    });
});

function attachClickEventToCards() {
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.instrument-card').querySelector('.card');
            const allCards = document.querySelectorAll('.instrument-card .card');

            let isExpanded = card.classList.contains('expanded');
            allCards.forEach(otherCard => {
                if (otherCard !== card) {
                    if (!isExpanded) {
                        otherCard.classList.add('blur');
                    } else {
                        otherCard.classList.remove('blur');
                    }
                }
            });

            card.classList.toggle('expanded');

            const detailsDiv = card.querySelector('.instrument-details');
            const instrumentId = button.getAttribute('data-id');
            
            if (detailsDiv.classList.contains('d-none')) {
                fetch(`/api/instruments/${instrumentId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch instrument details');
                    }
                    return response.json();
                })
                .then(data => {
                    detailsDiv.innerHTML = `<p><strong>Transcription of Notes:</strong> ${data.transcriptionOfNotes.join(', ')}</p>`;
                    detailsDiv.classList.remove('d-none');
                    button.textContent = 'Hide Details';
                })
                .catch(error => {
                    console.error('Error fetching instrument details:', error.message, error.stack);
                    alert('Failed to load instrument details. Please try again later.');
                });
            } else {
                detailsDiv.classList.add('d-none');
                button.textContent = 'View Details';
                allCards.forEach(otherCard => {
                    otherCard.classList.remove('blur');
                });
                if (!isExpanded) {
                    card.classList.remove('expanded');
                }
            }
        });
    });
}