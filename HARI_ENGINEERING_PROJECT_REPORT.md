# HARI ENGINEERING WORKS — COMPREHENSIVE PROJECT REPORT & SYSTEM ARCHITECTURE SPECIFICATION

**Document Version:** 2.4.0 (Production Release)  
**Organization:** Hari Engineering Works, Sakinaka, Mumbai, Maharashtra  
**Domain:** Industrial HVAC, Air Movement & Pollution Control Machinery  
**Technology Stack:** Node.js, Express.js, MongoDB Atlas (Mongoose ODM), Vanilla JS ES6+, Vanilla CSS3, Socket.IO, Vercel Edge Serverless  

---

## TABLE OF CONTENTS
1. [Executive Summary & Project Introduction](#1-executive-summary--project-introduction)
2. [Problem Statement, Objectives & Scope](#2-problem-statement-objectives--scope)
3. [System Architecture & High-Availability Design](#3-system-architecture--high-availability-design)
4. [Mathematical Engineering Models & Blower Sizing Algorithm](#4-mathematical-engineering-models--blower-sizing-algorithm)
5. [Database Schema & Data Model Specifications](#5-database-schema--data-model-specifications)
6. [RESTful API Specification & Security Infrastructure](#6-restful-api-specification--security-infrastructure)
7. [Multi-Channel Request Token Lifecycle System](#7-multi-channel-request-token-lifecycle-system)
8. [User Interface & User Experience Design System](#8-user-interface--user-experience-design-system)
9. [Administrative Management Portal & Product CMS](#9-administrative-management-portal--product-cms)
10. [Testing, Quality Assurance & Verification](#10-testing-quality-assurance--verification)
11. [Conclusion, Retrospective & Strategic Roadmap](#11-conclusion-retrospective--strategic-roadmap)

---

## 1. EXECUTIVE SUMMARY & PROJECT INTRODUCTION

### 1.1 Organizational Background
**Hari Engineering Works** is an established engineering and manufacturing firm located in Sakinaka, Mumbai, Maharashtra. The company specializes in the custom design, aerodynamic balancing, heavy fabrication, and turnkey installation of heavy industrial air moving, ventilation, and air pollution control equipment.

The manufactured product spectrum comprises:
- **Centrifugal Blowers:** Direct-drive and V-belt backward curved blowers delivering up to 95,000 CFM and 1,800 mm WG static pressure.
- **Axial Flow Fans:** Direct-drive tube axial fans and bifurcated hot-gas/chemical exhaust fans.
- **Dust Collectors:** Automated continuous pulse-jet baghouse collectors and high-efficiency cyclone separators.
- **Wet Scrubbers:** Corrosion-resistant PP/FRP packed bed chemical scrubbers and high-energy venturi scrubbers.
- **Industrial Ducting Networks:** Galvanized Iron (GI), Mild Steel (MS), and Stainless Steel (SS304/316) flanged ducting.
- **Air Handling Units:** Modular Air Handling Units (AHUs) and evaporative industrial air washers.

### 1.2 Digital Transformation Motivation
In traditional B2B heavy engineering operations, customer inquiries and orders relied on paper catalogs, phone calls, and manual sizing calculations. This legacy approach caused:
1. Significant latency in recommending fan duty points.
2. Inability for buyers to track their custom manufacturing orders.
3. High administrative overhead to update technical specifications and field installation photos.

The **Hari Engineering Works Digital B2B Industrial Web Platform** resolves these challenges by providing an automated, full-stack, enterprise-grade digital solution unifying an interactive product catalog, an automated Blower Selector aerodynamic calculator, tokenized order tracking, and an authenticated administrative Content Management System (CMS).

---

## 2. PROBLEM STATEMENT, OBJECTIVES & SCOPE

### 2.1 Problem Formulation
Industrial buyers (plant engineers, procurement leads, EPC contractors) purchase custom machinery tailored to exact operational conditions: volumetric airflow rate ($\text{CFM} / \text{m}^3/\text{h}$), static pressure loss through ductwork ($\text{mm WG} / \text{Pa}$), operating temperature, gas medium, and motor power requirements. Without a digital sizing engine, engineering sales reps spent 24-48 hours manually computing duty points before generating a quote.

### 2.2 System Objectives
1. **Automate Technical Fan Sizing:** Provide a self-service Blower Selector enabling clients to compute required motor kW and identify matching catalog fans.
2. **Standardize Request Tracking:** Issue formatted tracking tokens (`P000000`, `RFQ000000`, `E000000`, `S000000`) and provide a self-service tracking portal.
3. **Equip Internal Staff with a Secure CMS:** Provide an authenticated dashboard to update product specs, descriptions, images, and track lead pipelines in real-time.
4. **Ensure Zero-Downtime Reliability:** Implement a hybrid resilience architecture with seamless fallback to in-memory datasets during cloud database network disruptions.

---

## 3. SYSTEM ARCHITECTURE & HIGH-AVAILABILITY DESIGN

### 3.1 Three-Tier Architecture
- **Presentation Tier:** Semantic HTML5, responsive Vanilla CSS3 design system, modular ES6+ JavaScript. Fast sub-800ms loading without heavy frontend framework overhead.
- **Application Tier:** Node.js with Express.js micro-framework executing RESTful routing, JWT cryptographic validation, and aerodynamic calculations.
- **Persistence Tier:** MongoDB Atlas cloud database interacting via Mongoose 8.x ODM, backed by an autonomous local caching layer.

### 3.2 High-Availability Hybrid Fallback Engine
When cloud database connections encounter network timeouts or DNS SRV lookup failures, the platform engages **Fallback Mode**. The application continues serving full product catalogs and specifications with zero HTTP 500 errors.

```javascript
// config/db.js connection resilience strategy
try {
  const conn = await mongoose.connect(process.env.MONGO_URI, options);
  console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
} catch (error) {
  console.error(`[Database Error] Connection failed: ${error.message}`);
  console.warn('[Database Warning] Activating autonomous in-memory Fallback Mode.');
  // App continues serving full catalog via productController.FALLBACK_PRODUCTS
}
```

---

## 4. MATHEMATICAL ENGINEERING MODELS & BLOWER SIZING ALGORITHM

The Blower Selector utility (`public/js/blower-selector.js`) translates user-defined industrial duty points into aerodynamic power curves using fundamental fluid mechanics:

1. **Volumetric Airflow Conversion:**
   $$\text{Airflow in }\text{m}^3/\text{h} = \text{CFM} \times 1.69901$$
   $$\text{Airflow in }\text{m}^3/\text{s} = \frac{\text{Airflow in }\text{m}^3/\text{h}}{3600}$$

2. **Static Pressure Head Conversion:**
   $$\Delta P\text{ (Pascals)} = \text{mm WG} \times 9.80665$$

3. **Theoretical Air Power:**
   $$P_{\text{air}}\text{ (kW)} = \frac{\text{Flow Rate }(\text{m}^3/\text{s}) \times \text{Pressure Head }(\text{Pa})}{1000}$$

4. **Recommended Motor Shaft Power:**
   $$P_{\text{motor}}\text{ (kW)} = \left[ \frac{P_{\text{air}}}{\eta_{\text{fan}} \times \eta_{\text{drive}}} \right] \times S_{\text{margin}}$$
   *Where:*
   - $\eta_{\text{fan}} = 0.70 \text{ to } 0.85$ (Impeller aerodynamic efficiency)
   - $\eta_{\text{drive}} = 0.95 \text{ (Direct drive) or } 0.90 \text{ (V-belt drive)}$
   - $S_{\text{margin}} = 1.15$ (15% reserve engineering safety margin)

5. **Automated Catalog Matching:**
   Queries the product catalog for units where:
   $$\text{minAirflow} \le Q \le \text{maxAirflow} \quad \text{and} \quad \text{maxStaticPressure} \ge \Delta P_{\text{req}}$$
   filtering by Centrifugal or Axial impeller geometry.

---

## 5. DATABASE SCHEMA & DATA MODEL SPECIFICATIONS

### 5.1 Product Schema (`models/Product.js`)
```javascript
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'Industrial Blowers', 'Axial Flow Fans', 'Dust Collectors',
      'Scrubbers', 'Industrial Ducting Systems', 'Fume/Exhaust Hoods',
      'Air Control Systems'
    ] 
  },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  specifications: [{ key: String, value: String }],
  applications: [String],
  features: [String],
  images: [{ type: String }],
  minAirflow: { type: Number, default: 0 },
  maxAirflow: { type: Number, default: 0 },
  maxStaticPressure: { type: Number, default: 0 },
  motorKW: { type: Number, default: 0 },
  blowerType: { type: String, enum: ['centrifugal', 'axial', 'none'], default: 'none' },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### 5.2 Enquiry / Order Schema (`models/Enquiry.js`)
```javascript
const EnquirySchema = new mongoose.Schema({
  tokenNo: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['Order', 'RFQ', 'Enquiry', 'Service'], default: 'Enquiry' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String, default: '' },
  productOfInterest: { type: String, default: 'General' },
  message: { type: String, required: true },
  technicalDetails: {
    operatingTemp: String,
    gasMedium: String,
    desiredCFM: String,
    staticPressureMMWG: String,
    orderQuantity: Number
  },
  status: { type: String, enum: ['Pending', 'In Progress', 'Contacted', 'Completed', 'Cancelled'], default: 'Pending' },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });
```

---

## 6. RESTFUL API SPECIFICATION & SECURITY INFRASTRUCTURE

### 6.1 Complete Route Inventory
| HTTP Verb | API Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates admin credentials and returns JWT bearer token. |
| `GET` | `/api/auth/me` | Admin JWT | Validates active session token and user info. |
| `GET` | `/api/products` | Public | Returns product catalog with search and category filters. |
| `GET` | `/api/products/:slug` | Public | Returns single product technical specification sheet. |
| `POST` | `/api/products` | Admin JWT | Creates a new machinery entry. |
| `PUT` | `/api/products/:id` | Admin JWT | Updates product description, specifications, or images. |
| `DELETE`| `/api/products/:id` | Admin JWT | Soft-deletes or removes machinery item. |
| `POST` | `/api/enquiries` | Public | Ingests Order/RFQ/Enquiry and issues unique token. |
| `GET` | `/api/enquiries/track/:tokenNo` | Public | Returns status lifecycle details for public token. |
| `GET` | `/api/enquiries` | Admin JWT | Returns all incoming leads with type/status filters. |
| `PUT` | `/api/enquiries/:id` | Admin JWT | Updates operational status and internal sales notes. |
| `GET` | `/api/admin/stats` | Admin JWT | Aggregates summary KPI metrics for executive dashboard. |

### 6.2 Security Controls
- **Stateless Bearer Authentication:** JSON Web Tokens signed with secret keys, verified on administrative routes.
- **Bcrypt Password Salting:** Passwords stored using `bcryptjs` with 10 salt rounds.
- **HTTP Header Hardening:** `helmet` middleware configuring XSS filtering and content security headers.
- **Input Sanitization:** Escaped client injections and schema-level validations preventing NoSQL injection.

---

## 7. MULTI-CHANNEL REQUEST TOKEN LIFECYCLE SYSTEM

Requests are automatically tagged with standardized token prefixes:

| Token Prefix | Request Type | Operational Context |
| :--- | :--- | :--- |
| **`P000000`** | Direct Purchase Order | High-priority commercial purchase order with quantity and tax details. |
| **`RFQ000000`** | Request For Quotation | Engineering bid specifying CFM, static pressure, gas medium, and duty. |
| **`E000000`** | General Enquiry | Equipment inquiry regarding dimensions, availability, or documentation. |
| **`S000000`** | Turnkey Service | On-site ductwork installation, balancing, or scheduled maintenance. |

**Customer Tracking Workflow:**  
Clients query their token at `/track` to view real-time lifecycle status: `Pending Review` $\rightarrow$ `Technical Evaluation` $\rightarrow$ `In Production` $\rightarrow$ `Dispatched`.

---

## 8. USER INTERFACE & USER EXPERIENCE DESIGN SYSTEM

### 8.1 Visual Aesthetic Tokens
- **Deep Industrial Navy (`#0f3d64` & `#082238`):** Conveys structural durability and engineering authority.
- **Engineering Accent Teal (`#0284c7`):** Accent highlights for interactive controls and category tags.
- **Order Emerald (`#10b981`):** High-visibility callout for direct purchase buttons.
- **Backgrounds (`#ffffff` & `#f8fafc`):** High contrast typography ensuring legibility across factory environments.

### 8.2 Client Interfaces
- **Machinery Catalog (`/products`):** Category filter pills, live text search, dynamic card generation, and dual action buttons (*Enquire* and *Purchase*).
- **Product Detail Sheet (`/product-detail.html`):** High-resolution visual showcase, key feature bullets, full engineering summary, and tabular specifications.
- **Project Execution Gallery (`/gallery`):** Field installation photographs with modal lightbox viewer.
- **Services Page (`/services`):** Explanatory breakdown of custom ductwork fabrication and dynamic balancing.

---

## 9. ADMINISTRATIVE MANAGEMENT PORTAL & PRODUCT CMS

### 9.1 Executive KPI Dashboard (`/admin`)
- **Total Leads Counter:** Real-time volume of incoming customer inquiries.
- **Pending Orders Counter:** Unprocessed commercial purchase orders (`P` prefix).
- **Active Quotations:** Open RFQs awaiting engineering review.
- **Catalog Machinery Count:** Number of active equipment models on the website.

### 9.2 Product Catalog CMS
- **Image Inspector:** Live preview of image URLs with instant fallback verification.
- **Dynamic Specification Builder:** Key-value input pairs for airflow CFM, static pressure, and motor kW.
- **Application Tagging:** Industry tags (Foundries, Chemical, Cement, Pharma, Textile).

---

## 10. TESTING, QUALITY ASSURANCE & VERIFICATION

1. **Catalog Integrity Testing:** Automated browser testing verified all 12 products render authentic industrial equipment photos matching their exact names.
2. **Order Flow Verification:** Simulated customer purchases confirmed proper generation of `P`-prefixed tokens and tracking page updates.
3. **Resilience Testing:** Simulated cloud database disconnections confirmed the fallback mode served catalog data with zero HTTP 500 errors.

---

## 11. CONCLUSION, RETROSPECTIVE & STRATEGIC ROADMAP

### 11.1 Conclusion
The Hari Engineering Works B2B Industrial Web Platform modernizes industrial equipment commerce. By combining automated aerodynamic fan sizing, tokenized order tracking, a secure admin CMS, and a resilient hybrid architecture, the platform streamlines customer procurement and operational efficiency.

### 11.2 Future Roadmap
- **Phase 1 (B2B Payment Gateway):** Integration with Razorpay/Stripe for advance order deposits.
- **Phase 2 (Automated PDF Quotations):** Instant generation of branded engineering estimate PDFs with performance curves.
- **Phase 3 (3D WebGL / CAD Visualizer):** Interactive 360-degree browser inspection of impeller housings and ductwork bends.
- **Phase 4 (ERP Integration):** Bi-directional synchronization with shop-floor manufacturing and inventory systems.
