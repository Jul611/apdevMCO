document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('dateInput');
    const timeFromDropdown = document.getElementById('timeFromDropdown');
    const timeToDropdown = document.getElementById('timeToDropdown');
    const labNumberDropdown = document.getElementById('labNumber');
    const seatsGrid = document.querySelector('.seats-grid');

    // Event listener for when date, time, or lab number changes
    dateInput.addEventListener('change', updateSeatsAvailability);
    timeFromDropdown.addEventListener('change', updateSeatsAvailability);
    timeToDropdown.addEventListener('change', updateSeatsAvailability);
    labNumberDropdown.addEventListener('change', updateSeatsAvailability);

    async function updateSeatsAvailability() {
        const date = dateInput.value;
        const startTime = timeFromDropdown.value;
        const endTime = timeToDropdown.value;
        const labNumber = labNumberDropdown.value;

        try {
            const response = await fetch(`/api/reservations?date=${date}&startTime=${startTime}&endTime=${endTime}&labNumber=${labNumber}`);
            const reservations = await response.json();

            // Reset all seats to selectable
            const allSeats = seatsGrid.querySelectorAll('.seat');
            allSeats.forEach(seat => {
                seat.disabled = false;
                seat.classList.remove('reserved');
            });

            // Disable seats that are reserved
            reservations.forEach(reservation => {
                const seatNum = reservation.seatNum;
                const reservedSeat = seatsGrid.querySelector(`#seat${seatNum}`);
                if (reservedSeat) {
                    reservedSeat.disabled = true;
                    reservedSeat.classList.add('reserved');
                }
            });
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    }
});