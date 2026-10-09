require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Enquiry = require('./models/Enquiry');
const Counter = require('./models/Counter');

const seedProducts = [
  {
    name: "Modular Air Handling Unit (AHU) & Air Control System",
    slug: "modular-air-handling-unit-ahu-system",
    category: "Air Control Systems",
    shortDescription: "Custom modular AHU for precise temperature, humidity control, and high CFM clean air circulation in industrial facilities.",
    fullDescription: "Hari Engineering Works manufactures heavy-duty double-skin Modular Air Handling Units (AHU) for industrial plant air control, cleanrooms, pharma facilities, and textile plants. Equipped with thermal-break aluminum profiles, high-efficiency centrifugal blowers, multi-stage EU4 to HEPA filters, and cooling/heating coils.",
    specifications: [
      { key: "Airflow Capacity", value: "2,000 CFM to 50,000 CFM (3,400 to 85,000 m³/h)" },
      { key: "Static Pressure Rating", value: "25 mm WG to 150 mm WG" },
      { key: "Drive Transmission", value: "Direct Drive / V-Belt Drive with VFD" },
      { key: "Casing Construction", value: "Double Skin 25mm/50mm PUF Injected Panel" }
    ],
    applications: [
      "Pharmaceutical Cleanroom Ventilation",
      "Textile Mill Humidity Control",
      "Automotive Paint Shop Air Conditioning"
    ],
    features: [
      "Modular extruded aluminum profile with thermal breaks",
      "Direct drive plug fan or belt drive backward curved blower options"
    ],
    images: ["/images/products/modular-air-handling-unit-ahu-system.png"],
    isFeatured: true,
    isActive: true,
    minAirflow: 3400,
    maxAirflow: 85000,
    maxStaticPressure: 150,
    motorKW: 30,
    blowerType: "none"
  },
  {
    name: "Industrial Evaporative Air Washer & Fresh Air System",
    slug: "industrial-evaporative-air-washer-system",
    category: "Air Control Systems",
    shortDescription: "High CFM evaporative cooling air washer delivering fresh, dust-free cool air for large industrial shop floors.",
    fullDescription: "Designed for massive airflow displacement in hot industrial environments. Features high-density cross-fluted cellulose Celdek media pads, high-volume axial/centrifugal blowers, and automatic water recirculation pump.",
    specifications: [
      { key: "Airflow Capacity", value: "5,000 CFM to 80,000 CFM (8,500 to 136,000 m³/h)" },
      { key: "Static Pressure", value: "20 mm WG to 80 mm WG" }
    ],
    applications: ["Foundry & Forging Shop Floor Ventilation", "Plastic Injection Molding Plants"],
    features: ["Delivers 100% fresh, filtered cool air continuous exchange"],
    images: ["/images/products/industrial-evaporative-air-washer-system.svg"],
    isFeatured: false,
    isActive: true,
    minAirflow: 8500,
    maxAirflow: 136000,
    maxStaticPressure: 80,
    motorKW: 45,
    blowerType: "none"
  },
  {
    name: "High-Pressure Direct-Drive Centrifugal Blower",
    slug: "high-pressure-direct-drive-centrifugal-blower",
    category: "Industrial Blowers",
    shortDescription: "Heavy-duty direct drive centrifugal blower for furnace combustion, pneumatic conveying, and high pressure process airflow.",
    fullDescription: "Hari Engineering Works manufactures direct-drive High-Pressure Centrifugal Blowers built with dynamically balanced narrow-width radial impellers. Designed for zero-slippage high static pressure performance up to 1800 mm WG.",
    specifications: [
      { key: "Airflow Capacity", value: "500 CFM to 25,000 CFM (850 to 42,500 m³/h)" },
      { key: "Static Pressure Rating", value: "300 mm WG to 1800 mm WG (High Pressure)" },
      { key: "Drive Mechanism", value: "Direct Drive" }
    ],
    applications: ["Furnace & Boiler Combustion Air Supply", "Pneumatic Grain & Fly Ash Conveying"],
    features: ["Direct drive configuration eliminates belt maintenance & power slip"],
    images: ["/images/products/high-pressure-direct-drive-centrifugal-blower.png"],
    isFeatured: true,
    isActive: true,
    minAirflow: 850,
    maxAirflow: 42500,
    maxStaticPressure: 1800,
    motorKW: 37,
    blowerType: "centrifugal"
  },
  {
    name: "Backward Curved High-CFM V-Belt Drive Centrifugal Blower",
    slug: "backward-curved-high-cfm-v-belt-drive-blower",
    category: "Industrial Blowers",
    shortDescription: "Non-overloading high volume centrifugal blower delivering up to 95,000 CFM for heavy plant exhaust & AHU systems.",
    fullDescription: "Built with high-efficiency backward curved aerofoil impellers offering peak mechanical efficiency up to 86%. V-belt drive arrangement allows flexible speed adjustment.",
    specifications: [
      { key: "Airflow Capacity", value: "3,000 CFM to 95,000 CFM (5,100 to 161,500 m³/h)" },
      { key: "Static Pressure Rating", value: "50 mm WG to 650 mm WG" }
    ],
    applications: ["Industrial Plant Main Exhaust Trunking", "Baghouse Dust Collector Exhaust Fans"],
    features: ["Non-overloading horsepower curve prevents motor damage"],
    images: ["/images/products/backward-curved-high-cfm-v-belt-drive-blower.svg"],
    isFeatured: true,
    isActive: true,
    minAirflow: 5100,
    maxAirflow: 161500,
    maxStaticPressure: 650,
    motorKW: 75,
    blowerType: "centrifugal"
  },
  {
    name: "Direct-Drive Industrial Tube Axial Flow Fan",
    slug: "direct-drive-industrial-tube-axial-flow-fan",
    category: "Axial Flow Fans",
    shortDescription: "High-volume direct drive tube axial fans engineered for factory space ventilation, fume exhaust, and cooling.",
    fullDescription: "Engineered for maximum air volume movement with minimum power consumption. Features aerofoil pressure-die-cast aluminum impellers directly mounted onto weatherproof IP55 motor shafts.",
    specifications: [
      { key: "Airflow Capacity", value: "1,500 CFM to 75,000 CFM (2,550 to 127,500 m³/h)" },
      { key: "Static Pressure Rating", value: "10 mm WG to 60 mm WG" }
    ],
    applications: ["Textile Mill Humidification & Exhaust", "Warehouse & Factory Roof Ventilation"],
    features: ["Adjustable pitch angle blades for customized airflow setup"],
    images: ["/images/products/direct-drive-industrial-tube-axial-flow-fan.svg"],
    isFeatured: true,
    isActive: true,
    minAirflow: 2550,
    maxAirflow: 127500,
    maxStaticPressure: 60,
    motorKW: 15,
    blowerType: "axial"
  },
  {
    name: "V-Belt Drive Bifurcated Tube Axial Exhaust Fan",
    slug: "v-belt-drive-bifurcated-tube-axial-fan",
    category: "Axial Flow Fans",
    shortDescription: "Belt driven tube axial fan with isolated motor compartment for high temperature hot air & corrosive gas exhaust.",
    fullDescription: "Specially engineered for corrosive fumes, steam, and high temperature gases up to 200°C. The motor is housed in a bifurcated tunnel isolated completely from the process airstream.",
    specifications: [
      { key: "Airflow Capacity", value: "2,500 CFM to 60,000 CFM (4,250 to 102,000 m³/h)" }
    ],
    applications: ["Hot Air Drying Oven Exhaust", "Chemical Pickling & Plating Vents"],
    features: ["Motor protected completely from steam and corrosive fumes"],
    images: ["/images/products/v-belt-drive-bifurcated-tube-axial-fan.svg"],
    isFeatured: false,
    isActive: true,
    minAirflow: 4250,
    maxAirflow: 102000,
    maxStaticPressure: 75,
    motorKW: 22,
    blowerType: "axial"
  },
  {
    name: "Automatic Pulse-Jet Bag Filter Dust Collector",
    slug: "automatic-pulse-jet-bag-filter-dust-collector",
    category: "Dust Collectors",
    shortDescription: "Continuous cleaning pulse-jet baghouse collector delivering 99.9% emission control for industrial process dust.",
    fullDescription: "Our Pulse-Jet Baghouse Dust Collectors deliver heavy-duty air pollution control for particulate-laden industrial exhaust streams.",
    specifications: [
      { key: "Air Handling Capacity", value: "1,000 CFM to 85,000 CFM (1,700 to 144,500 m³/h)" }
    ],
    applications: ["Cement & Gypsum Handling Plants", "Pharma Bulk Drug & Granulation Rooms"],
    features: ["Online continuous filter bag cleaning without stopping process airflow"],
    images: ["/images/products/automatic-pulse-jet-bag-filter-dust-collector.svg"],
    isFeatured: true,
    isActive: true,
    minAirflow: 1700,
    maxAirflow: 144500,
    maxStaticPressure: 250,
    motorKW: 45,
    blowerType: "none"
  },
  {
    name: "High-Efficiency Cyclone Dust Collector & Separator",
    slug: "high-efficiency-cyclone-dust-collector",
    category: "Dust Collectors",
    shortDescription: "Centrifugal force pre-cleaner separator engineered to trap heavy coarse dust, chips, and sawdust.",
    fullDescription: "Serves as a robust pre-filter unit before baghouse collectors or direct collection for high dust load industries.",
    specifications: [
      { key: "Airflow Capacity", value: "1,500 CFM to 45,000 CFM" }
    ],
    applications: ["Wood Sawmills & Carpenter Workshops", "Grain Processing Silos"],
    features: ["Zero moving internal parts for maintenance-free operation"],
    images: ["/images/products/high-efficiency-cyclone-dust-collector.svg"],
    isFeatured: false,
    isActive: true,
    minAirflow: 2550,
    maxAirflow: 76500,
    maxStaticPressure: 150,
    motorKW: 22,
    blowerType: "none"
  },
  {
    name: "Packed Bed Wet Chemical Fume Scrubber",
    slug: "packed-bed-wet-chemical-fume-scrubber",
    category: "Scrubbers",
    shortDescription: "PP/FRP anti-corrosive packed bed wet scrubber for neutralizing acid gases, chemical fumes, and process odors.",
    fullDescription: "Hari Engineering Works manufactures heavy PP/FRP dual laminate Packed Bed Wet Scrubbers engineered to neutralize toxic chemical fumes.",
    specifications: [
      { key: "Airflow Capacity", value: "800 CFM to 50,000 CFM" }
    ],
    applications: ["Electroplating & Anodizing Lines", "Chemical Manufacturing Reactors"],
    features: ["Complete corrosion immunity using premium PP/FRP composites"],
    images: ["/images/products/packed-bed-wet-chemical-fume-scrubber.svg"],
    isFeatured: true,
    isActive: true,
    minAirflow: 1360,
    maxAirflow: 85000,
    maxStaticPressure: 180,
    motorKW: 30,
    blowerType: "none"
  },
  {
    name: "High-Energy Venturi Wet Scrubber System",
    slug: "high-energy-venturi-wet-scrubber",
    category: "Scrubbers",
    shortDescription: "High-velocity water atomizing venturi scrubber ideal for sticky dust, hot fumes, and sub-micron mist wash.",
    fullDescription: "Utilizes high gas velocity in a constricted throat section to break scrubbing liquid into fine mist droplets.",
    specifications: [
      { key: "Airflow Capacity", value: "1,200 CFM to 40,000 CFM" }
    ],
    applications: ["Chemical Incinerator Exhaust Gases", "Aluminum & Die Casting Foundries"],
    features: ["Adjustable throat damper regulating pressure drop & droplet size"],
    images: ["/images/products/high-energy-venturi-wet-scrubber.svg"],
    isFeatured: false,
    isActive: true,
    minAirflow: 2040,
    maxAirflow: 68000,
    maxStaticPressure: 350,
    motorKW: 55,
    blowerType: "none"
  },
  {
    name: "Industrial Heavy-Duty GI / MS / SS Ducting Systems",
    slug: "industrial-heavy-duty-gi-ms-ss-ducting-systems",
    category: "Industrial Ducting Systems",
    shortDescription: "Precision fabricated round and rectangular ductwork with airtight angle flanges for high pressure air lines.",
    fullDescription: "Custom manufactured industrial ducting systems engineered from Mild Steel (MS), Galvanized Iron (GI), and Stainless Steel (SS304/316).",
    specifications: [
      { key: "Airflow Handling Capacity", value: "Up to 120,000 CFM" }
    ],
    applications: ["Central Factory Exhaust Trunk Lines", "Dust Collector Interconnecting Ducting"],
    features: ["Leak-proof flanged construction eliminating pressure drop losses"],
    images: ["/images/products/industrial-heavy-duty-gi-ms-ss-ducting-systems.svg"],
    isFeatured: true,
    isActive: true,
    minAirflow: 5000,
    maxAirflow: 204000,
    maxStaticPressure: 600,
    motorKW: 0,
    blowerType: "none"
  },
  {
    name: "Custom Fume Capture & Suction Hood System",
    slug: "custom-fume-capture-suction-hood-system",
    category: "Fume/Exhaust Hoods",
    shortDescription: "Source capture suction hoods for localized containment of toxic chemical fumes, weld smoke, and heat.",
    fullDescription: "Engineered in accordance with ACGIH capture velocity standards. Our custom suction hoods isolate emissions at source.",
    specifications: [
      { key: "Capture Airflow Range", value: "500 CFM to 20,000 CFM" }
    ],
    applications: ["Industrial Welding & Brazing Stations", "Laboratory Fume Exhaust"],
    features: ["High capture efficiency minimizing total exhaust CFM required"],
    images: ["/images/products/custom-fume-capture-suction-hood-system.svg"],
    isFeatured: true,
    isActive: true,
    minAirflow: 850,
    maxAirflow: 34000,
    maxStaticPressure: 100,
    motorKW: 0,
    blowerType: "none"
  }
];

const sampleEnquiries = [
  {
    token: "RFQ-20261009-0001",
    type: "RFQ",
    name: "Rajesh Kumar",
    company: "Apex Textile Mills Ltd",
    email: "rajesh@apextextiles.com",
    phone: "+91 98765 12345",
    productInterested: "Backward Curved High-CFM Centrifugal Blower",
    message: "We need a 35,000 CFM exhaust blower for our dyeing unit trunk ducting. Please send technical datasheet and formal price quotation.",
    status: "New"
  },
  {
    token: "ORD-20261009-0002",
    type: "Order",
    name: "Anand Verma",
    company: "Precision Forging Corp",
    email: "anand.v@precisionforging.in",
    phone: "+91 98200 98765",
    productInterested: "High-Pressure Direct-Drive Centrifugal Blower",
    message: "Purchase order ref # PFC/PO/2026/884 for 2 units of 15 HP High-Pressure Blower.",
    status: "Confirmed"
  },
  {
    token: "SRV-20261009-0003",
    type: "Service Request",
    name: "Sanjay Patel",
    company: "Gujarat Pharma Chemical Works",
    email: "spatel@gujaratchim.com",
    phone: "+91 94260 11223",
    productInterested: "Packed Bed Wet Chemical Fume Scrubber",
    message: "Annual Maintenance Contract and impeller dynamic balancing service request for 25,000 CFM PP FRP Scrubber.",
    status: "In Review"
  }
];

const runSeed = async () => {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('MongoDB connection standby. Seed script created product definitions.');
      process.exit(0);
    }

    await Product.deleteMany({});
    await Enquiry.deleteMany({});
    await Counter.deleteMany({});

    console.log('Cleared existing products, enquiries, and counters.');

    const createdProds = await Product.insertMany(seedProducts);
    console.log(`Seeded ${createdProds.length} products with local images & blower calculation specs.`);

    const createdEnqs = await Enquiry.insertMany(sampleEnquiries);
    console.log(`Seeded ${createdEnqs.length} sample tokenized enquiries (RFQ, Order, Service Request).`);

    process.exit(0);
  } catch (err) {
    console.error('Error during database seed:', err);
    process.exit(1);
  }
};

runSeed();
