// Dashboard functionality for Amplexo HEALTH
class Dashboard {
  constructor() {
    this.currentPage = 'dashboard';
    this.guests = [];
    this.appointments = [];
    this.doctors = [];
    this.init();
  }

  async init() {
    this.setupNavigation();
    this.setupModals();
    this.setupForms();
    await this.loadData();
    this.updateDashboard();
  }

  // Navigation
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateToPage(page);
      });
    });
  }

  navigateToPage(page) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Show page
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
    });
    document.getElementById(`${page}-page`).classList.add('active');

    this.currentPage = page;
    
    // Load page-specific data
    if (page === 'dashboard') {
      this.updateDashboard();
    } else if (page === 'guests') {
      this.loadGuests();
    } else if (page === 'appointments') {
      this.loadAppointments();
    }
  }

  // Modal Management
  setupModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Form Setup
  setupForms() {
    // Guest Form
    const guestForm = document.getElementById('guest-form');
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addGuest();
    });

    // Appointment Form
    const appointmentForm = document.getElementById('appointment-form');
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addAppointment();
    });
  }

  // Data Loading
  async loadData() {
    try {
      await Promise.all([
        this.loadGuests(),
        this.loadAppointments(),
        this.loadDoctors()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadGuests() {
    try {
      const response = await fetch('/api/guests');
      this.guests = await response.json();
      this.updateGuestsTable();
      this.updateGuestSelect();
    } catch (error) {
      console.error('Error loading guests:', error);
    }
  }

  async loadAppointments() {
    try {
      const response = await fetch('/api/appointments');
      this.appointments = await response.json();
      this.updateAppointmentsTable();
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  async loadDoctors() {
    try {
      const response = await fetch('/api/doctors');
      this.doctors = await response.json();
      this.updateDoctorSelect();
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  }

  // Guest Management
  async addGuest() {
    const formData = new FormData(document.getElementById('guest-form'));
    const guestData = {
      firstName: document.getElementById('guestFirstName').value,
      lastName: document.getElementById('guestLastName').value,
      contactNumber: document.getElementById('guestContact').value,
      email: document.getElementById('guestEmail').value,
      roomNumber: document.getElementById('guestRoom').value,
      country: document.getElementById('guestCountry').value,
      passportNumber: document.getElementById('guestPassport').value,
      dateOfBirth: document.getElementById('guestDOB').value,
      gender: document.getElementById('guestGender').value,
      emergencyContact: {
        firstName: document.getElementById('emergencyFirstName').value,
        lastName: document.getElementById('emergencyLastName').value,
        contactNumber: document.getElementById('emergencyContact').value,
        email: document.getElementById('emergencyEmail').value
      }
    };

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guestData)
      });

      if (response.ok) {
        const newGuest = await response.json();
        this.guests.push(newGuest);
        this.updateGuestsTable();
        this.updateGuestSelect();
        this.closeModal('add-guest-modal');
        document.getElementById('guest-form').reset();
        this.showNotification('Guest added successfully!', 'success');
      } else {
        throw new Error('Failed to add guest');
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      this.showNotification('Failed to add guest', 'error');
    }
  }

  updateGuestsTable() {
    const tbody = document.getElementById('guests-table-body');
    tbody.innerHTML = '';

    this.guests.forEach(guest => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${guest.firstName} ${guest.lastName}</td>
        <td>${guest.roomNumber}</td>
        <td>${guest.contactNumber}</td>
        <td>${guest.email}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="dashboard.editGuest('${guest.id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="dashboard.deleteGuest('${guest.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  updateGuestSelect() {
    const select = document.getElementById('appointmentGuest');
    select.innerHTML = '<option value="">Select a guest</option>';
    
    this.guests.forEach(guest => {
      const option = document.createElement('option');
      option.value = guest.id;
      option.textContent = `${guest.firstName} ${guest.lastName} (Room ${guest.roomNumber})`;
      select.appendChild(option);
    });
  }

  // Appointment Management
  async addAppointment() {
    const appointmentData = {
      guestId: document.getElementById('appointmentGuest').value,
      doctorId: document.getElementById('appointmentDoctor').value,
      appointmentType: document.querySelector('input[name="appointmentType"]:checked').value,
      appointmentDate: document.getElementById('appointmentDate').value,
      appointmentTime: document.getElementById('appointmentTime').value,
      paymentBy: document.getElementById('paymentBy').value
    };

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const newAppointment = await response.json();
        this.appointments.push(newAppointment);
        this.updateAppointmentsTable();
        this.closeModal('add-appointment-modal');
        document.getElementById('appointment-form').reset();
        this.showNotification('Appointment scheduled successfully!', 'success');
      } else {
        throw new Error('Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      this.showNotification('Failed to schedule appointment', 'error');
    }
  }

  updateAppointmentsTable() {
    const tbody = document.getElementById('appointments-table-body');
    const allTbody = document.getElementById('all-appointments-table-body');
    
    // Update dashboard appointments (today's appointments)
    tbody.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = this.appointments.filter(apt => 
      apt.appointmentDate.startsWith(today)
    );
    
    todayAppointments.forEach(appointment => {
      const guest = this.guests.find(g => g.id === appointment.guestId);
      const doctor = this.doctors.find(d => d.id === appointment.doctorId);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'}</td>
        <td>${guest ? guest.contactNumber : 'N/A'}</td>
        <td>${this.formatAppointmentType(appointment.appointmentType)}</td>
        <td>${this.formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}</td>
        <td>
          <span class="status-badge status-${appointment.paymentStatus}">
            ${appointment.paymentStatus}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-success" onclick="dashboard.startVideoCall('${appointment.id}')">
            <i class="fas fa-video"></i> Start Call
          </button>
          <button class="btn btn-sm btn-danger" onclick="dashboard.cancelAppointment('${appointment.id}')">
            <i class="fas fa-times"></i> Cancel
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Update all appointments table
    if (allTbody) {
      allTbody.innerHTML = '';
      this.appointments.forEach(appointment => {
        const guest = this.guests.find(g => g.id === appointment.guestId);
        const doctor = this.doctors.find(d => d.id === appointment.doctorId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'}</td>
          <td>${guest ? guest.contactNumber : 'N/A'}</td>
          <td>${this.formatAppointmentType(appointment.appointmentType)}</td>
          <td>${this.formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}</td>
          <td>
            <span class="status-badge status-${appointment.paymentStatus}">
              ${appointment.paymentStatus}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-success" onclick="dashboard.startVideoCall('${appointment.id}')">
              <i class="fas fa-video"></i> Start Call
            </button>
            <button class="btn btn-sm btn-danger" onclick="dashboard.cancelAppointment('${appointment.id}')">
              <i class="fas fa-times"></i> Cancel
            </button>
          </td>
        `;
        allTbody.appendChild(row);
      });
    }
  }

  updateDoctorSelect() {
    const select = document.getElementById('appointmentDoctor');
    select.innerHTML = '<option value="">Select a doctor</option>';
    
    this.doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor.id;
      option.textContent = `${doctor.name} - ${doctor.specialty}`;
      select.appendChild(option);
    });
  }

  // Dashboard Updates
  async updateDashboard() {
    try {
      const response = await fetch('/api/dashboard/stats');
      const stats = await response.json();
      
      document.getElementById('total-guests').textContent = stats.totalGuests;
      document.getElementById('today-appointments').textContent = stats.todayAppointments;
      document.getElementById('pending-payments').textContent = stats.pendingPayments;
      document.getElementById('completed-appointments').textContent = stats.completedAppointments;
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }

  // Video Call Integration
  startVideoCall(appointmentId) {
    const appointment = this.appointments.find(a => a.id === appointmentId);
    const guest = this.guests.find(g => g.id === appointment.guestId);
    
    if (appointment && guest) {
      // Navigate to video call page
      this.navigateToPage('video-call');
      
      // Set call information
      document.getElementById('call-guest-name').textContent = `${guest.firstName} ${guest.lastName}`;
      document.getElementById('call-appointment-time').textContent = 
        this.formatDateTime(appointment.appointmentDate, appointment.appointmentTime);
      
      // Pre-fill video call IDs
      document.getElementById('callUserId').value = appointment.doctorId;
      document.getElementById('callPeerId').value = guest.id;
      
      // Update appointment status
      this.updateAppointmentStatus(appointmentId, 'in-progress');
    }
  }

  async updateAppointmentStatus(appointmentId, status) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const updatedAppointment = await response.json();
        const index = this.appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
          this.appointments[index] = updatedAppointment;
          this.updateAppointmentsTable();
        }
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  }

  async cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (response.ok) {
          const updatedAppointment = await response.json();
          const index = this.appointments.findIndex(a => a.id === appointmentId);
          if (index !== -1) {
            this.appointments[index] = updatedAppointment;
            this.updateAppointmentsTable();
            this.showNotification('Appointment cancelled successfully', 'success');
          }
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        this.showNotification('Failed to cancel appointment', 'error');
      }
    }
  }

  // Utility Functions
  formatAppointmentType(type) {
    const types = {
      'tele-consultancy': 'Tele Consultancy',
      'house-call': 'House Call',
      'emergency-room': 'Emergency Room / OPD'
    };
    return types[type] || type;
  }

  formatDateTime(date, time) {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString() + ' | ' + dateObj.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) + ' Hrs';
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  refreshAppointments() {
    this.loadAppointments();
    this.updateDashboard();
  }
}

// Global functions for HTML onclick handlers
function showAddGuestModal() {
  dashboard.showModal('add-guest-modal');
}

function showAddAppointmentModal() {
  dashboard.showModal('add-appointment-modal');
}

function closeModal(modalId) {
  dashboard.closeModal(modalId);
}

function refreshAppointments() {
  dashboard.refreshAppointments();
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new Dashboard();
});

// Add notification styles
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    padding: 1rem 1.5rem;
    z-index: 3000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .notification-success {
    border-left: 4px solid #28a745;
  }
  
  .notification-error {
    border-left: 4px solid #dc3545;
  }
  
  .notification-info {
    border-left: 4px solid #17a2b8;
  }
  
  .notification i {
    font-size: 1.1rem;
  }
  
  .notification-success i {
    color: #28a745;
  }
  
  .notification-error i {
    color: #dc3545;
  }
  
  .notification-info i {
    color: #17a2b8;
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet); 