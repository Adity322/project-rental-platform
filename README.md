# 🏢 Property Rental Platform

A **real-time property rental, maintenance & amenity management platform** built as a full-stack web application.  
Designed to **digitalize and modernize rental operations** for both tenants and property owners.

🔗 **Live Links**
- Backend: https://project-rental-platform.onrender.com  
- Frontend: https://project-rental-platform.vercel.app  
- 🎥 Video Walkthrough:https://drive.google.com/file/d/1L951DOoBIeoniXPzKOPTy7jtsHGUZjC6/view?usp=share_link

---

## ✨ Features
 
### 👑 For Property Owners
- 🏠 Create and manage properties  
- 🔧 View and update maintenance requests in real-time  
- 🏊 Add amenities (gym, pool, parking, etc.)  
- ✅ Approve or reject booking requests  
- 📊 Monitor KPIs (resolution time, completion rate, conflicts)  
- 🔑 Share Property ID with tenants  

---

### 🧑‍💼 For Tenants
- 📝 Submit maintenance requests with category & priority  
- 📡 Track live status *(Pending → In Progress → Completed)*  
- 📅 Book amenities with time slots  
- 🚫 Prevent double bookings automatically  
- 🏢 View assigned property/building  
- 🔔 Get real-time booking updates  

---

### ⚙️ Platform Highlights
- ⚡ Real-time updates using **Socket.io**  
- 🔐 Secure authentication (**JWT + bcrypt**)  
- 👥 Role-based access (**Owner / Tenant**)  
- 🏗️ Multi-tenancy (data isolated per property)  
- 📱 Fully responsive UI  

---

## 🛠️ Tech Stack

| Layer          | Technology                  |
|----------------|----------------------------|
| Frontend       | React.js + Vite            |
| Styling        | Tailwind CSS               |
| Backend        | Node.js + Express.js       |
| Database       | MongoDB                    |
| Real-time      | Socket.io                  |
| Authentication | JWT + bcrypt               |
| Deployment FE  | Vercel                     |
| Deployment BE  | Render                     |

---

## 📁 Project Structure

```bash
project-rental-platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started

### 📌 Prerequisites
- Node.js (v18+)  
- npm  
- MongoDB Atlas  

---

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/project-rental-platform.git
cd project-rental-platform
```
## 2️⃣ Setup Backend

```bash
cd backend
npm install
```

### Create `.env` file:

```env
PORT=8000
MONGO_URI=mongodb+srv://singhaditya10311_db_user:DSF5OuHtwCGYa4fS@cluster0.mqar1kc.mongodb.net/?appName=Cluster5
JWT_SECRET=superSecretkey
```

### Run backend:

```bash
npm run dev
```

➡️ Runs on: http://localhost:8000

## 3️⃣ Setup Frontend

```bash
cd frontend
npm install
```

### Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Run frontend:

```bash
npm run dev
```

➡️ Runs on: http://localhost:5173

## 🔄 How It Works

### 👑 Owner Flow
1. Register as Property Owner  
2. Login → Open Owner Dashboard  
3. Create Property  
4. Share Property ID with tenants  
5. Add amenities (gym, parking, etc.)  
6. Manage maintenance requests  
7. Approve or reject booking requests  

---

### 🧑‍💼 Tenant Flow
1. Get Property ID from owner  
2. Register as Tenant using Property ID  
3. Login → Open Tenant Dashboard  
4. Submit maintenance requests  
5. Track real-time status updates  
6. Book amenities with time slots  
7. Wait for owner approval  

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint | Description |
|--------|----------|------------|
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login user |

---

### 🏠 Properties

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/properties | Create property (Owner) |
| GET  | /api/properties | Get all properties |
| GET  | /api/properties/:id | Get property by ID |

---

### 🔧 Maintenance Requests

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/requests | Create request (Tenant) |
| GET  | /api/requests | Get requests (role-based) |
| PUT  | /api/requests/:id | Update request status (Owner) |

---

### 🏊 Amenities

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/amenities | Create amenity (Owner) |
| GET  | /api/amenities | Get amenities |
| DELETE | /api/amenities/:id | Delete amenity |

---

### 📅 Bookings

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/bookings | Create booking (Tenant) |
| GET  | /api/bookings | Get bookings |
| PUT  | /api/bookings/:id/status | Update booking status (Owner) |
| DELETE | /api/bookings/:id | Cancel booking |

## 🔮 Future Enhancements

- 📱 Native mobile app (Android & iOS)  
- 💳 Online rental payment integration  
- 🔔 Push notifications & email alerts  
- 🤖 AI-based predictive maintenance  
- 📈 Advanced analytics dashboard  
- 🔌 IoT smart device integration  

---

## 👨‍💻 Author

**Aditya Kumar Singh**  

---

## 📄 License

This project is developed for **educational purposes** as part of an internship program.  
