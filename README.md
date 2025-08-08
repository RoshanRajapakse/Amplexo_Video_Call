# Amplexo HEALTH - Hotel Video Consultation System

A comprehensive hotel health consultation system that allows hotels to manage guest information and schedule video consultations with doctors. Built with modern web technologies and WebRTC for secure video calling.

## 🏥 Features

### Guest Management
- **Add Guest Information**: Complete guest profiles with personal details, room numbers, and emergency contacts
- **Guest Database**: View and manage all registered guests
- **Guest Search**: Quick access to guest information for appointment scheduling

### Appointment Scheduling
- **Multiple Appointment Types**:
  - Tele Consultancy (Video Call)
  - House Call
  - Emergency Room / OPD
- **Doctor Selection**: Choose from available doctors with specialties
- **Payment Tracking**: Track payment status (Paid, Pending, Cancelled)
- **Date & Time Management**: Flexible scheduling with date and time selection

### Video Consultation
- **Secure WebRTC Calls**: High-quality video consultations
- **Call Controls**: Mute, video toggle, and call management
- **Real-time Status**: Live connection status and call information
- **Professional Interface**: Clean, medical-grade video interface

### Dashboard & Analytics
- **Real-time Statistics**: Total guests, appointments, pending payments
- **Today's Appointments**: Quick view of scheduled consultations
- **Payment Status**: Track payment status across all appointments
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Amplexo_Video_Call
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   STREAM_API_KEY=your_getstream_api_key
   STREAM_API_SECRET=your_getstream_api_secret
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 📋 Usage Guide

### For Hotel Staff

1. **Adding Guests**
   - Navigate to "Add Guests" in the sidebar
   - Click "Add" button to open the guest registration form
   - Fill in all required guest information including emergency contacts
   - Submit to add the guest to the system

2. **Scheduling Appointments**
   - Go to "Schedule Appointment" or use the "New Appointment" button
   - Select appointment type (Tele Consultancy, House Call, Emergency Room)
   - Choose guest and doctor from dropdown menus
   - Set appointment date and time
   - Select payment method (Partner or Guest)
   - Confirm appointment

3. **Managing Video Calls**
   - View today's appointments on the dashboard
   - Click "Start Call" for scheduled video consultations
   - Use the video interface for secure doctor-patient communication
   - End calls and update appointment status

### For Doctors

1. **Accessing Video Calls**
   - Use the provided doctor ID for video call authentication
   - Enter patient ID to connect to the consultation
   - Use call controls for mute, video toggle, and call management

2. **Managing Appointments**
   - View scheduled appointments in the appointments table
   - Update appointment status after consultations
   - Track payment status and patient information

## 🏗️ System Architecture

### Frontend
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Professional styling with responsive design
- **JavaScript**: ES6+ with modular architecture
- **Font Awesome**: Professional icons and UI elements

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **WebSocket**: Real-time communication for video signaling
- **GetStream**: Video calling infrastructure

### Data Management
- **In-Memory Storage**: For development (can be replaced with database)
- **RESTful APIs**: Clean API design for data operations
- **Real-time Updates**: Live data synchronization

## 🔧 API Endpoints

### Guest Management
- `GET /api/guests` - Get all guests
- `POST /api/guests` - Add new guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

### Appointment Management
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Schedule new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/doctors` - Get available doctors

### Video Calling
- `POST /get-token` - Get GetStream token for video calls
- WebSocket connection for real-time signaling

## 🎨 Design System

### Color Palette
- **Primary**: Teal (#20c997) - Professional medical theme
- **Secondary**: Blue (#17a2b8) - Trust and reliability
- **Success**: Green (#28a745) - Positive actions
- **Danger**: Red (#dc3545) - Warnings and cancellations
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Inter - Modern, readable font family
- **Weights**: 300, 400, 500, 600, 700 for hierarchy
- **Responsive**: Scales appropriately across devices

### Components
- **Cards**: Clean, elevated design for content sections
- **Tables**: Professional data presentation
- **Modals**: Focused interaction for forms
- **Buttons**: Clear call-to-action with hover effects
- **Forms**: Accessible input fields with validation

## 🔒 Security Features

- **HTTPS Support**: Secure communication (configure in production)
- **Input Validation**: Server-side data validation
- **CORS Configuration**: Controlled cross-origin requests
- **WebRTC Security**: Encrypted video communication
- **Session Management**: Secure user sessions

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Streamlined interface for on-the-go use

## 🚀 Deployment

### Production Setup
1. Set up a production database (MongoDB, PostgreSQL, etc.)
2. Configure environment variables for production
3. Set up HTTPS certificates
4. Use a process manager like PM2
5. Configure reverse proxy (Nginx, Apache)

### Environment Variables
```env
NODE_ENV=production
PORT=5000
STREAM_API_KEY=your_production_api_key
STREAM_API_SECRET=your_production_api_secret
DATABASE_URL=your_database_connection_string
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@amplexo-health.com
- Documentation: [docs.amplexo-health.com](https://docs.amplexo-health.com)
- Issues: [GitHub Issues](https://github.com/amplexo/health-system/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Guest management system
  - Appointment scheduling
  - Video consultation interface
  - Dashboard with statistics
  - Responsive design

---

**Amplexo HEALTH** - Transforming hotel healthcare with modern technology. 