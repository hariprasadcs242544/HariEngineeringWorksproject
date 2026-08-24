# Hari Engineering Works — Industrial Manufacturing Website & B2B Portal

Production-quality full-stack B2B website and industrial catalog built for **Hari Engineering Works**, a premier manufacturer of:
- **Industrial Blowers** (Centrifugal / High Pressure / FD & ID Fans)
- **Axial Flow Fans** (Wall Mounted / Tube Axial / Aerofoil Blades)
- **Dust Collectors** (Automated Pulse-Jet Bag Filters / Cyclones)
- **Scrubbers** (PP/FRP Packed Bed Wet Chemical Scrubbers / Venturi Scrubbers)
- **Industrial Ducting Systems** (Heavy Gauge MS, SS304 & GI Flanged Ductwork)
- **Fume / Exhaust Hoods** (Source Capture Suction Hoods)

---

## 🚀 Tech Stack

- **Frontend:** HTML5, CSS3 (Vanilla CSS Design System with Light Blue & Deep Industrial Blue theme), Vanilla JavaScript (No Framework)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas / Local MongoDB (Mongoose Schema & Models)
- **Environment Variables:** `dotenv`
- **Validation & Security:** `express-validator`, `cors`, REST API architecture

---

## 📁 Project Folder Structure

```
d:\Hari\HariEngineeringWorks Project/
├── config/
│   └── db.js                 # Mongoose MongoDB Atlas Connection
├── models/
│   ├── Product.js            # Mongoose Product Schema
│   └── Enquiry.js            # Mongoose Enquiry RFQ Schema
├── routes/
│   ├── productRoutes.js      # REST API Product Endpoints
│   └── enquiryRoutes.js      # REST API Customer Enquiry Endpoints
├── controllers/
│   ├── productController.js  # Product Controller Logic & Fallback
│   └── enquiryController.js  # Enquiry Controller Logic
├── public/
│   ├── css/
│   │   └── style.css         # Complete Industrial Design System
│   ├── js/
│   │   ├── main.js           # Nav toggle, Counter, Scroll Animations
│   │   ├── products.js       # Dynamic Catalog, Client Filtering & Search
│   │   ├── gallery.js        # Interactive Lightbox Modal
│   │   ├── contact.js        # Form Validation & RFQ Submissions
│   │   └── admin.js          # Admin Dashboard & Product CRUD
│   ├── index.html            # Homepage
│   ├── about.html            # About Us & Manufacturing Infrastructure
│   ├── products.html         # Product Catalog Page
│   ├── product-detail.html   # Dynamic Product Specification Detail Page
│   ├── industries.html       # Industries We Serve
│   ├── gallery.html          # Installation & Project Gallery
│   ├── contact.html          # Contact & Custom Quote Request Form
│   └── admin.html            # Admin Management Portal
├── seed.js                   # Database Seed Script for 10 Industrial Products
├── server.js                 # Main Express Web Server
├── .env                      # Environment Variables Config
├── package.json              # Project Dependencies
└── README.md                 # Documentation
```

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisite
Ensure [Node.js](https://nodejs.org/) (v16 or higher) is installed on your system.

### 2. Install Dependencies
Open a terminal in the project directory and run:
```bash
npm install
```

### 3. Configure Environment Variables (`.env`)
Create or edit `.env` in the root folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hari_engineering_db
ADMIN_KEY=admin123
```
*Note: For production, replace `MONGODB_URI` with your MongoDB Atlas cloud string.*

### 4. Seed Database (Optional but Recommended)
Populate your MongoDB database with sample industrial products (Blowers, Fans, Scrubbers, etc.):
```bash
npm run seed
```

### 5. Start Application Server
To run the server:
```bash
npm start
```
Or for development mode with auto-reload:
```bash
npm run dev
```

Visit the website in your browser at:  
👉 **`http://localhost:5000`**

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Fetch all products (supports `?category=` & `?search=`) | Public |
| `GET` | `/api/products/:id` | Fetch single product detail by ID or Slug | Public |
| `POST` | `/api/products` | Create new industrial product | Admin |
| `PUT` | `/api/products/:id` | Update product details | Admin |
| `DELETE` | `/api/products/:id` | Delete product from database | Admin |
| `POST` | `/api/enquiries` | Submit customer quote request or contact enquiry | Public |
| `GET` | `/api/enquiries` | Fetch all submitted RFQs and contact records | Admin |
| `PUT` | `/api/enquiries/:id` | Update enquiry status (`New`, `In Review`, `Contacted`, `Closed`) | Admin |
| `DELETE` | `/api/enquiries/:id` | Delete customer enquiry record | Admin |

---

## 🔒 Admin Dashboard Portal

Navigate to `/admin` on the website or click **Staff Admin Portal** in the footer:
- **Default Access Passkey:** `admin123`
- **Features:**
  - View real-time customer RFQ submissions.
  - Change status of enquiries (`New` → `In Review` → `Contacted` → `Closed`).
  - Full CRUD operations: Add new products with image URLs, short descriptions, and categories; edit existing records; delete entries from MongoDB.

---

## 🏢 Business Contact Information

**Hari Engineering Works**  
- **Address:** Plot No. 45/B, Industrial Area Phase II, G.I.D.C., Gujarat - 390010, India  
- **Phone:** +91 98765 43210 / +91 98123 45678  
- **Email:** sales@hariengineeringworks.com  
- **Quality Standard:** ISO 9001:2015 Certified  
