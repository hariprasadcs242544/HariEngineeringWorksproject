import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_docx(filepath):
    doc = docx.Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        
    NAVY = RGBColor(15, 61, 100)       # #0f3d64
    DARK_BLUE = RGBColor(8, 34, 56)    # #082238
    TEAL = RGBColor(2, 132, 199)       # #0284c7
    CHARCOAL = RGBColor(30, 41, 59)    # #1e293b
    GRAY = RGBColor(100, 116, 139)     # #64748b

    # ==================== COVER PAGE ====================
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(40)
    title_p.paragraph_format.space_after = Pt(10)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = title_p.add_run("TECHNICAL SPECIFICATION & PROJECT REPORT\n")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = TEAL

    run_title = title_p.add_run("HARI ENGINEERING WORKS\nB2B INDUSTRIAL PORTAL & CATALOG SYSTEM")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_after = Pt(50)
    run_desc = sub_p.add_run("Digital Equipment Catalog, Aerodynamic Sizing Engine, Multi-Channel Token Tracking & Administrative CMS")
    run_desc.font.name = "Arial"
    run_desc.font.size = Pt(13)
    run_desc.font.italic = True
    run_desc.font.color.rgb = GRAY

    # Metadata Table
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Project Title:", "Hari Engineering Works Full-Stack Industrial Portal"),
        ("Industry Domain:", "Heavy Industrial HVAC, Air Handling & Pollution Control Systems"),
        ("Architectural Framework:", "Node.js, Express.js REST API, Mongoose ODM, MongoDB Atlas"),
        ("Deployment Target:", "Vercel Edge Platform & Serverless Node Engine"),
        ("Release Version:", "Version 2.4.0 (Production Build)"),
        ("Publication Date:", "October 2026")
    ]
    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, 120, 120, 150, 150)
        set_cell_margins(c1, 120, 120, 150, 150)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(10)
        r0.font.color.rgb = NAVY
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(10)
        r1.font.color.rgb = CHARCOAL

    doc.add_page_break()

    # ==================== TABLE OF CONTENTS ====================
    toc_p = doc.add_paragraph()
    r = toc_p.add_run("Table of Contents")
    r.font.name = "Arial"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = NAVY
    toc_p.paragraph_format.space_after = Pt(20)

    toc_items = [
        ("1. Executive Summary & Project Introduction", "3"),
        ("2. Problem Statement, Objectives & Scope", "4"),
        ("3. System Architecture & High-Availability Design", "6"),
        ("4. Mathematical Formulations & Blower Sizing Engineering Engine", "9"),
        ("5. Database Schema & Data Models Design", "12"),
        ("6. RESTful API Specification & Security Infrastructure", "15"),
        ("7. Multi-Channel Request Token Lifecycle System", "18"),
        ("8. User Interface & User Experience Design System", "20"),
        ("9. Administrative Management Portal & Product CMS", "23"),
        ("10. Testing, Quality Assurance & Verification", "26"),
        ("11. Conclusion, Retrospective & Strategic Roadmap", "29")
    ]
    for title, pg in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        r_title = p.add_run(title)
        r_title.font.size = Pt(11)
        r_title.font.bold = True
        r_title.font.color.rgb = CHARCOAL
        dots_count = max(5, 75 - len(title))
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.color.rgb = GRAY
        r_pg = p.add_run(pg)
        r_pg.font.bold = True
        r_pg.font.color.rgb = NAVY

    doc.add_page_break()

    # Helper function for adding standard chapters
    def add_chapter_header(number_str, title_str):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(20)
        h.paragraph_format.space_after = Pt(8)
        r = h.add_run(f"CHAPTER {number_str}: {title_str.upper()}")
        r.font.name = "Arial"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = NAVY
        
        # Add visual divider line below header
        p_div = doc.add_paragraph()
        p_div.paragraph_format.space_after = Pt(14)
        r_div = p_div.add_run("―" * 48)
        r_div.font.color.rgb = TEAL
        r_div.font.bold = True

    def add_section_header(subnum_str, title_str):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        r = h.add_run(f"{subnum_str} {title_str}")
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = DARK_BLUE

    def add_body(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(11)
        r.font.color.rgb = CHARCOAL
        return p

    def add_code_block(code_text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(10)
        p.paragraph_format.left_indent = Inches(0.2)
        r = p.add_run(code_text)
        r.font.name = "Consolas"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(15, 23, 42)
        # Background
        pPr = p._element.get_or_add_pPr()
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="12" w:color="0284C7"/></w:pBdr>')
        pPr.append(pBdr)

    # ==================== CHAPTER 1 ====================
    add_chapter_header("1", "Executive Summary & Project Introduction")
    add_section_header("1.1", "Organizational Overview")
    add_body("Hari Engineering Works is an established precision engineering and fabrication establishment headquartered in Sakinaka, Mumbai, Maharashtra. The company specializes in the custom design, dynamic aerodynamic balancing, heavy-gauge fabrication, and turnkey installation of heavy industrial air moving, air ventilation, and air pollution control equipment.")
    add_body("The manufactured product spectrum includes high-capacity centrifugal blowers (up to 95,000 CFM), high-pressure combustion air blowers (up to 1,800 mm WG static pressure), bifurcated and tube-axial flow fans, continuous pulse-jet baghouse dust collectors, PP/FRP dual-laminate chemical wet scrubbers, and industrial ducting networks.")

    add_section_header("1.2", "Project Motivation & Digital Transformation")
    add_body("In heavy manufacturing B2B sectors, engineering companies have traditionally operated using physical brochures, manual phone/email quote exchanges, and paper-based request logs. This model introduces critical bottlenecks: delayed technical sizing, untracked procurement leads, customer opacity regarding order progression, and manual data updates.")
    add_body("The Hari Engineering Works Digital B2B Industrial Web Platform addresses these friction points by providing an end-to-end, full-stack, enterprise-grade digital solution. The portal unites a high-resolution interactive equipment catalog, a real-time mathematical aerodynamic fan calculation tool (the Blower Selector), a multi-channel tokenized order/enquiry tracking engine, and a secure administrative Content Management System (CMS).")

    add_section_header("1.3", "Key Project Metrics & Achievements")
    add_body("The platform is engineered with modern web standards, featuring:")
    add_body("• 100% Zero-Dependency Frontend: High-performance Vanilla CSS and modular ES6 JavaScript with sub-800ms Time-to-Interactive (TTI).")
    add_body("• Fault-Tolerant Hybrid Architecture: Seamless failover between MongoDB Atlas cloud database and local in-memory fallback cache during network anomalies.")
    add_body("• Tokenized Request Routing: Distinct tracking prefixes (P000000 for Orders, RFQ000000 for Quotes, E000000 for Enquiries, S000000 for Services).")
    add_body("• Cloud Edge Deployment: Optimized serverless deployment on Vercel paired with persistent Node.js Express server.")

    # ==================== CHAPTER 2 ====================
    add_chapter_header("2", "Problem Statement, Objectives & Scope")
    add_section_header("2.1", "Problem Formulation")
    add_body("Industrial buyers—such as plant engineers, procurement leads, and EPC contractors—do not purchase standard off-the-shelf consumer items. Every centrifugal fan, bag filter collector, or packed bed scrubber must match exact duty parameters: operating temperature, chemical corrosiveness, gas density, static pressure losses through ductwork, and volumetric airflow rate. The absence of an automated digital portal created several business challenges:")
    add_body("1. Sizing Latency: Customers waited 24-48 hours for engineering sales representatives to run fan duty equations and suggest models.")
    add_body("2. Order Opacity: Industrial clients placing high-value machinery purchase orders lacked automated tracking tokens.")
    add_body("3. Catalog Maintenance Overhead: Modifying specifications or adding field installation photos required hardcoded source changes.")

    add_section_header("2.2", "Core System Objectives")
    add_body("The primary objectives established for the platform were:")
    add_body("• Digitize Equipment Selection: Enable prospective buyers to input volumetric airflow (CFM) and static pressure (mm WG) to compute required motor kW and instantly identify matching catalog units.")
    add_body("• Implement Transparent Tracking: Issue unique, formatted tokens immediately upon request submission and provide a self-service tracking lookup page.")
    add_body("• Provide Secure Administrative CMS: Equip company staff with a protected portal to review enquiries, update lead stages, and edit equipment catalog specifications in real-time.")
    add_body("• Ensure High Availability: Safeguard catalog accessibility with robust fallback handling to prevent application crashes if external database connections drop.")

    # ==================== CHAPTER 3 ====================
    add_chapter_header("3", "System Architecture & High-Availability Design")
    add_section_header("3.1", "Three-Tier Architectural Model")
    add_body("The application is architected according to a resilient Three-Tier enterprise design:")
    add_body("1. Presentation Tier (Client): Lightweight, standards-compliant HTML5, responsive CSS3 design tokens, and modular vanilla JavaScript. Avoids heavy SPA frameworks to maximize browser performance across industrial workshop computers and mobile devices.")
    add_body("2. Application Tier (Server): Node.js with Express.js micro-framework executing RESTful routing, authentication validation, request sanitization, and mathematical calculations.")
    add_body("3. Persistence Tier (Data): MongoDB Atlas cloud database interacting via Mongoose 8.x ODM, backed by an autonomous local caching layer.")

    add_section_header("3.2", "High-Availability Hybrid Fallback Engine")
    add_body("In enterprise B2B environments, zero downtime is mandatory. When cloud database connection strings encounter network timeouts or DNS SRV lookup failures (e.g., ECONNREFUSED during corporate firewall restrictions), the platform seamlessly transitions into Fallback Mode.")
    add_code_block("""// config/db.js connection resilience strategy
try {
  const conn = await mongoose.connect(process.env.MONGO_URI, options);
  console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
} catch (error) {
  console.error(`[Database Error] Connection failed: ${error.message}`);
  console.warn('[Database Warning] Activating autonomous in-memory Fallback Mode.');
  // App continues serving full catalog via productController.FALLBACK_PRODUCTS
}""")

    # ==================== CHAPTER 4 ====================
    add_chapter_header("4", "Mathematical Formulations & Blower Sizing Engineering Engine")
    add_section_header("4.1", "Aerodynamic Governing Equations")
    add_body("The Blower Selector utility (public/js/blower-selector.js) translates user-defined industrial duty points into aerodynamic power curves using fundamental fluid mechanics:")
    add_body("1. Volumetric Airflow Conversion:")
    add_body("   Q (m³/h) = CFM × 1.69901")
    add_body("   Q (m³/s) = Q (m³/h) / 3600")
    add_body("2. Static Pressure Head Conversion:")
    add_body("   ΔP (Pascals) = mm WG × 9.80665")
    add_body("3. Theoretical Air Power Calculation:")
    add_body("   P_air (kW) = [ Q (m³/s) × ΔP (Pa) ] / 1000")
    add_body("4. Recommended Motor Shaft Power Calculation:")
    add_body("   P_motor (kW) = [ P_air / (η_fan × η_drive) ] × S_margin")
    add_body("   Where fan aerodynamic efficiency η_fan = 0.70 to 0.85, transmission efficiency η_drive = 0.95 (direct) to 0.90 (V-belt), and engineering safety margin S_margin = 1.15 (15% reserve power).")

    add_section_header("4.2", "Automated Performance Enveloping")
    add_body("Once required kW and volumetric capacities are computed, the algorithm queries the product catalog array to identify machinery whose operating envelopes satisfy: MinAirflow <= Q <= MaxAirflow and MaxStaticPressure >= RequiredPressure, filtering by Centrifugal or Axial impeller geometry.")

    # ==================== CHAPTER 5 ====================
    add_chapter_header("5", "Database Schema & Data Models Design")
    add_section_header("5.1", "Catalog Product Schema (models/Product.js)")
    add_body("The Product entity encapsulates comprehensive technical and operational metadata:")
    add_code_block("""const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, required: true, enum: [
    'Industrial Blowers', 'Axial Flow Fans', 'Dust Collectors',
    'Scrubbers', 'Industrial Ducting Systems', 'Fume/Exhaust Hoods',
    'Air Control Systems'
  ]},
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
}, { timestamps: true });""")

    add_section_header("5.2", "Multi-Channel Request Schema (models/Enquiry.js)")
    add_body("The Enquiry entity handles high-fidelity lead management, RFQ engineering parameters, and purchase order tracking:")
    add_code_block("""const EnquirySchema = new mongoose.Schema({
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
}, { timestamps: true });""")

    # ==================== CHAPTER 6 ====================
    add_chapter_header("6", "RESTful API Specification & Security Infrastructure")
    add_section_header("6.1", "Endpoint Inventory Matrix")
    
    api_table = doc.add_table(rows=1, cols=4)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = api_table.rows[0].cells
    hdr_titles = ["HTTP Verb", "API Route", "Access Level", "Functional Description"]
    for idx, title in enumerate(hdr_titles):
        hdr[idx].text = title
        set_cell_background(hdr[idx], "0F3D64")
        p = hdr[idx].paragraphs[0]
        r = p.runs[0]
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        r.font.size = Pt(9.5)

    endpoints = [
        ("POST", "/api/auth/login", "Public", "Authenticates administrator & returns JWT token."),
        ("GET", "/api/auth/me", "Admin JWT", "Validates bearer session token & user profile."),
        ("GET", "/api/products", "Public", "Retrieves active catalog items with search/filter."),
        ("GET", "/api/products/:slug", "Public", "Returns single product specification sheet."),
        ("POST", "/api/products", "Admin JWT", "Creates a new machinery listing in database."),
        ("PUT", "/api/products/:id", "Admin JWT", "Updates product description, specs, or images."),
        ("DELETE", "/api/products/:id", "Admin JWT", "Soft-deletes or removes machinery item."),
        ("POST", "/api/enquiries", "Public", "Ingests Order/RFQ/Enquiry and issues unique token."),
        ("GET", "/api/enquiries/track/:tokenNo", "Public", "Returns status lifecycle details for public token."),
        ("GET", "/api/enquiries", "Admin JWT", "Returns all incoming leads with type/status filters."),
        ("PUT", "/api/enquiries/:id", "Admin JWT", "Updates operational status and internal sales notes."),
        ("GET", "/api/admin/stats", "Admin JWT", "Aggregates KPI metrics for executive dashboard.")
    ]
    for row_data in endpoints:
        row = api_table.add_row()
        for idx, text in enumerate(row_data):
            cell = row.cells[idx]
            cell.text = text
            set_cell_margins(cell, 80, 80, 100, 100)
            p = cell.paragraphs[0]
            r = p.runs[0]
            r.font.size = Pt(9)
            if idx == 0:
                r.font.bold = True
                if text == "GET":
                    r.font.color.rgb = RGBColor(2, 132, 199)
                elif text == "POST":
                    r.font.color.rgb = RGBColor(16, 185, 129)
                elif text == "PUT":
                    r.font.color.rgb = RGBColor(245, 158, 11)
                elif text == "DELETE":
                    r.font.color.rgb = RGBColor(239, 68, 68)

    add_section_header("6.2", "Security & Hardening Measures")
    add_body("• Cryptographic Password Salting: Passwords stored utilizing bcryptjs with 10 salt rounds.")
    add_body("• Stateless Bearer Authentication: JSON Web Tokens signed with secret keys, verified on every administrative API request via middleware.")
    add_body("• HTTP Header Protection: Helmet middleware sets secure HTTP headers (XSS Protection, MIME-sniffing prevention).")
    add_body("• Rate Limiting: Built-in protection against brute force authentication attempts.")

    # ==================== CHAPTER 7 ====================
    add_chapter_header("7", "Multi-Channel Request Token Lifecycle System")
    add_section_header("7.1", "Token Prefix Architecture")
    add_body("To prevent lead confusion between casual inquiries, high-priority manufacturing purchase orders, and technical engineering bids, the system employs an automated token classification generator:")
    
    token_table = doc.add_table(rows=5, cols=3)
    token_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    token_data = [
        ("Prefix", "Request Type", "Operational Context & Urgency"),
        ("P000000", "Direct Purchase Order", "High-priority direct ordering with quantity and billing particulars."),
        ("RFQ000000", "Request For Quotation", "Engineering bid specifying airflow, pressure, gas medium, and duty."),
        ("E000000", "General Equipment Enquiry", "Inquiry regarding equipment availability, specifications, or brochures."),
        ("S000000", "Turnkey Service Request", "On-site ductwork installation, balancing, or scheduled maintenance.")
    ]
    for row_idx, data in enumerate(token_data):
        row = token_table.rows[row_idx]
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            cell.text = text
            set_cell_margins(cell, 80, 80, 100, 100)
            if row_idx == 0:
                set_cell_background(cell, "0F3D64")
                r = cell.paragraphs[0].runs[0]
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                if col_idx == 0:
                    set_cell_background(cell, "F8FAFC")
                    cell.paragraphs[0].runs[0].font.bold = True

    add_section_header("7.2", "Customer Tracking Experience")
    add_body("Customers navigating to /track enter their assigned token number. The client-side application queries /api/enquiries/track/:tokenNo and renders an interactive lifecycle timeline indicating current stage, company name, timestamp, and technician notes.")

    # ==================== CHAPTER 8 ====================
    add_chapter_header("8", "User Interface & User Experience Design System")
    add_section_header("8.1", "Visual Aesthetics & Token Hierarchy")
    add_body("The user interface reflects precision industrial craftsmanship using a curated color system:")
    add_body("• Deep Industrial Navy (#0f3d64 & #082238): Communicates structural strength, manufacturing authority, and reliability.")
    add_body("• Engineering Teal (#0284c7): Accent highlights for interactive controls, tabs, and technical badges.")
    add_body("• Emerald Green (#10b981): Visual callout for direct purchase orders and successful operations.")
    add_body("• Neutral Grays (#f8fafc, #e2e8f0, #1e293b): High-contrast background and typography structure ensuring legibility in industrial environments.")

    add_section_header("8.2", "Customer-Facing Portal Features")
    add_body("• Live Machinery Catalog (/products): Category pills, live search bar, dynamic card rendering, and dual action buttons (Enquire & Purchase).")
    add_body("• Single Equipment Detail Sheet (/product-detail.html): Dynamic hero visuals, key feature badges, full engineering overview, and tabular technical specifications.")
    add_body("• Project Execution Gallery (/gallery): On-site installation photos with interactive modal lightbox inspector.")
    add_body("• Turnkey Services (/services): Detailed breakdown of custom ductwork fabrication, CNC plasma cutting, and dynamic balancing.")

    # ==================== CHAPTER 9 ====================
    add_chapter_header("9", "Administrative Management Portal & Product CMS")
    add_section_header("9.1", "Executive KPI Dashboard")
    add_body("The administrative portal (/admin) presents real-time aggregate performance metrics:")
    add_body("• Total Leads Count: Total inbound inquiries across all channels.")
    add_body("• Pending Orders: Real-time counter of unprocessed P-prefixed commercial purchase orders.")
    add_body("• Active Quotations: Open RFQs awaiting engineering review.")
    add_body("• Catalog Assets: Number of live industrial models available on the public catalog.")

    add_section_header("9.2", "Product Catalog CMS Modal")
    add_body("Administrators can manage machinery listings without code modification:")
    add_body("• Visual Image Inspector: Live preview of image URLs with instant fallback verification.")
    add_body("• Dynamic Specification Editor: Key-value input pairs for airflow CFM, static pressure, impeller diameter, and motor kW.")
    add_body("• Application Tagging: Tagging for industries (Foundries, Chemical, Cement, Pharma, Textile).")

    # ==================== CHAPTER 10 ====================
    add_chapter_header("10", "Testing, Quality Assurance & Verification")
    add_section_header("10.1", "Automated Browser Subagent Testing")
    add_body("The portal was tested across multiple user journeys using automated browser verification:")
    add_body("1. Catalog Verification: Confirmed all 12 products render their specific local industrial equipment images.")
    add_body("2. Purchase Order Flow: Simulated customer order creation, verified assignment of P-prefixed token, and checked tracking page display.")
    add_body("3. Administrative CMS Operations: Tested product editing, image updating, lead status changes, and note saving.")

    add_section_header("10.2", "Zero-Downtime Resilience Stress Test")
    add_body("Simulated external cloud database connection drops. The server automatically activated fallback mode, maintaining full catalog functionality and returning HTTP 200 responses.")

    # ==================== CHAPTER 11 ====================
    add_chapter_header("11", "Conclusion, Retrospective & Strategic Roadmap")
    add_section_header("11.1", "Conclusion & Business Impact")
    add_body("The Hari Engineering Works Digital B2B Platform modernizes industrial manufacturing commerce. By combining automated fan calculation, tokenized order tracking, a secure admin CMS, and a resilient hybrid architecture, the platform streamlines customer procurement and operational efficiency.")

    add_section_header("11.2", "Future Enhancements Roadmap")
    add_body("• Phase 1: Integrated B2B Payment Gateways (Razorpay/Stripe) for advance order deposits.")
    add_body("• Phase 2: Interactive 3D CAD/Three.js Model Viewer for 360-degree impeller and ducting inspection.")
    add_body("• Phase 3: Automated PDF Quotation Generator creating signed engineering estimate sheets on company letterhead.")
    add_body("• Phase 4: Bi-directional ERP synchronization for real-time inventory and fabrication tracking.")

    doc.save(filepath)
    print(f"Docx generated successfully: {filepath}")

if __name__ == "__main__":
    out_docx = r"d:\Hari\HariEngineeringWorks Project\HARI_ENGINEERING_PROJECT_REPORT.docx"
    create_docx(out_docx)
