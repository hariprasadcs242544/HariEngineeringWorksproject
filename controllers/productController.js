const Product = require('../models/Product');
const mongoose = require('mongoose');

// Fallback seed data in case database is offline during preview
const FALLBACK_PRODUCTS = [
  {
    _id: "66b1a1000000000000000001",
    name: "Modular Air Handling Unit (AHU) & Air Control System",
    slug: "modular-air-handling-unit-ahu-system",
    category: "Air Control Systems",
    shortDescription: "Custom modular AHU for precise temperature, humidity control, and high CFM clean air circulation in industrial facilities.",
    fullDescription: "Hari Engineering Works manufactures heavy-duty double-skin Modular Air Handling Units (AHU) for industrial plant air control, cleanrooms, pharma facilities, and textile plants. Equipped with thermal-break aluminum profiles, high-efficiency centrifugal blowers, multi-stage EU4 to HEPA filters, and cooling/heating coils.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "2,000 CFM to 50,000 CFM (3,400 CMH to 85,000 CMH)" },
      { key: "Static Pressure Rating", value: "25 mm WG to 150 mm WG" },
      { key: "Drive Transmission", value: "Direct Drive / V-Belt Drive with VFD" },
      { key: "Casing Construction", value: "Double Skin 25mm/50mm PUF Injected Panel" },
      { key: "Filtration Efficiency", value: "Pre-filter (EU4), Fine-filter (EU7/EU9), Optional HEPA" },
      { key: "Pressure Profile", value: "Medium to High Pressure Air Delivery" }
    ],
    applications: [
      "Pharmaceutical Cleanroom Ventilation",
      "Textile Mill Humidity Control",
      "Automotive Paint Shop Air Conditioning",
      "Electronics Manufacturing Plants"
    ],
    features: [
      "Modular extruded aluminum profile with thermal breaks",
      "Direct drive plug fan or belt drive backward curved blower options",
      "Integrated chilled water / DX evaporator coil",
      "Low noise double-skin insulated casing"
    ],
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000002",
    name: "Industrial Evaporative Air Washer & Fresh Air System",
    slug: "industrial-evaporative-air-washer-system",
    category: "Air Control Systems",
    shortDescription: "High CFM evaporative cooling air washer delivering fresh, dust-free cool air for large industrial shop floors.",
    fullDescription: "Designed for massive airflow displacement in hot industrial environments. Features high-density cross-fluted cellulose Celdek media pads, high-volume axial/centrifugal blowers, and automatic water recirculation pump.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "5,000 CFM to 80,000 CFM (8,500 CMH to 136,000 CMH)" },
      { key: "Static Pressure", value: "20 mm WG to 80 mm WG" },
      { key: "Drive Type", value: "Direct Drive / V-Belt Drive options" },
      { key: "Cooling Media", value: "Cellulose Celdek / Rigid PVC Honeycomb Pads" }
    ],
    applications: [
      "Foundry & Forging Shop Floor Ventilation",
      "Plastic Injection Molding Plants",
      "Garment & Textile Factory Cooling"
    ],
    features: [
      "Delivers 100% fresh, filtered cool air continuous exchange",
      "Heavy GI sheet housing with epoxy protective coating",
      "Energy efficient alternative to traditional AC units"
    ],
    images: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false
  },
  {
    _id: "66b1a1000000000000000003",
    name: "High-Pressure Direct-Drive Centrifugal Blower",
    slug: "high-pressure-direct-drive-centrifugal-blower",
    category: "Industrial Blowers",
    shortDescription: "Heavy-duty direct drive centrifugal blower for furnace combustion, pneumatic conveying, and high pressure process airflow.",
    fullDescription: "Hari Engineering Works manufactures direct-drive High-Pressure Centrifugal Blowers built with dynamically balanced narrow-width radial impellers. Designed for zero-slippage high static pressure performance up to 1800 mm WG.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "500 CFM to 25,000 CFM (850 CMH to 42,500 CMH)" },
      { key: "Static Pressure Rating", value: "300 mm WG to 1800 mm WG (High Pressure)" },
      { key: "Drive Mechanism", value: "Direct Drive (Motor shaft coupled to impeller)" },
      { key: "Motor Power", value: "3 HP to 120 HP (IE3 / IE4 Flameproof Motor)" },
      { key: "Impeller Material", value: "Heavy Carbon Steel / SS316 / Hardox" }
    ],
    applications: [
      "Furnace & Boiler Combustion Air Supply",
      "Pneumatic Material Conveying Lines",
      "Fluidized Bed Combustion (FBC) Draft"
    ],
    features: [
      "Direct drive configuration eliminates belt maintenance",
      "Dynamically balanced according to ISO 1940 Grade G2.5",
      "Heavy rigid channel base frame with anti-vibration mounts"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000004",
    name: "Backward Curved High-CFM V-Belt Drive Centrifugal Blower",
    slug: "backward-curved-high-cfm-v-belt-drive-blower",
    category: "Industrial Blowers",
    shortDescription: "Non-overloading high volume centrifugal blower delivering up to 95,000 CFM for heavy plant exhaust & AHU systems.",
    fullDescription: "Built with high-efficiency backward curved aerofoil impellers offering peak mechanical efficiency up to 86%. V-belt drive arrangement allows flexible speed adjustment.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "3,000 CFM to 95,000 CFM (5,100 CMH to 161,500 CMH)" },
      { key: "Static Pressure Rating", value: "50 mm WG to 650 mm WG (High CFM Volume)" },
      { key: "Drive Mechanism", value: "V-Belt Drive with Taper-Lock Pulleys" },
      { key: "Bearings", value: "Heavy-Duty Self-Aligning Pillow Block Bearings" }
    ],
    applications: [
      "Industrial Plant Main Exhaust Trunking",
      "Baghouse Dust Collector Exhaust Fans",
      "Chemical Fume Scrubber Main Draft"
    ],
    features: [
      "Non-overloading horsepower curve prevents motor damage",
      "Split casing housing for easy site inspection & maintenance"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000005",
    name: "Direct-Drive Industrial Tube Axial Flow Fan",
    slug: "direct-drive-industrial-tube-axial-flow-fan",
    category: "Axial Flow Fans",
    shortDescription: "High-volume direct drive tube axial fans engineered for factory space ventilation, fume exhaust, and cooling.",
    fullDescription: "Engineered for maximum air volume movement with minimum power consumption. Features aerofoil pressure-die-cast aluminum impellers directly mounted onto weatherproof IP55 motor shafts inside a flanged heavy cylindrical casing.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "1,500 CFM to 75,000 CFM (2,550 CMH to 127,500 CMH)" },
      { key: "Static Pressure Rating", value: "10 mm WG to 60 mm WG (High CFM)" },
      { key: "Fan Diameter", value: "300 mm to 1600 mm (12 inch to 64 inch)" },
      { key: "Drive Arrangement", value: "Direct Drive (Flange mounted motor)" }
    ],
    applications: [
      "Textile Mill Humidification & Exhaust",
      "Warehouse & Factory Roof Ventilation",
      "Spray Paint Booth Air Exhaust"
    ],
    features: [
      "Adjustable pitch angle blades for customized airflow setup",
      "Low noise aerofoil aerodynamic design",
      "Hot-dip galvanized heavy steel casing"
    ],
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000006",
    name: "V-Belt Drive Bifurcated Tube Axial Exhaust Fan",
    slug: "v-belt-drive-bifurcated-tube-axial-fan",
    category: "Axial Flow Fans",
    shortDescription: "Belt driven tube axial fan with isolated motor compartment for high temperature hot air & corrosive gas exhaust.",
    fullDescription: "Specially engineered for corrosive fumes, steam, and high temperature gases up to 200°C. The motor is housed in a bifurcated tunnel isolated completely from the process airstream, driven via heavy duty V-belts.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "2,500 CFM to 60,000 CFM (4,250 CMH to 102,000 CMH)" },
      { key: "Operating Temperature", value: "Continuous up to 200°C" },
      { key: "Drive Mechanism", value: "V-Belt Drive (Isolated Motor Chamber)" }
    ],
    applications: [
      "Hot Air Drying Oven Exhaust",
      "Chemical Pickling & Plating Vents",
      "Boiler House Steam Exhaust Hoods"
    ],
    features: [
      "Motor protected completely from steam, corrosive fumes, and heat",
      "External belt tensioning mechanism without opening duct line"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false
  },
  {
    _id: "66b1a1000000000000000007",
    name: "Automatic Pulse-Jet Bag Filter Dust Collector",
    slug: "automatic-pulse-jet-bag-filter-dust-collector",
    category: "Dust Collectors",
    shortDescription: "Continuous cleaning pulse-jet baghouse collector delivering 99.9% emission control for industrial process dust.",
    fullDescription: "Our Pulse-Jet Baghouse Dust Collectors deliver heavy-duty air pollution control for particulate-laden industrial exhaust streams. Features high-grade non-woven polyester filter bags, automated solid-state sequence pulse timer, and heavy rotary airlock discharge.",
    specifications: [
      { key: "Air Handling Capacity (CFM / CMH)", value: "1,000 CFM to 85,000 CFM (1,700 CMH to 144,500 CMH)" },
      { key: "Filtration Efficiency", value: "99.9% filtration down to 1 Micron" },
      { key: "Cleaning Mechanism", value: "Automated Compressed Air Reverse Pulse Jet" },
      { key: "Discharge Valve", value: "Motorized Rotary Airlock Valve" }
    ],
    applications: [
      "Cement & Gypsum Handling Plants",
      "Pharma Bulk Drug Granulation",
      "Woodworking, Furniture & CNC Router Dust",
      "Metal Shot Blasting & Sand Blasting"
    ],
    features: [
      "Online continuous filter bag cleaning without stopping airflow",
      "Differential pressure gauge for real-time monitoring",
      "Tool-free top-removal snap-ring filter bag replacement"
    ],
    images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000008",
    name: "High-Efficiency Cyclone Dust Collector & Separator",
    slug: "high-efficiency-cyclone-dust-collector",
    category: "Dust Collectors",
    shortDescription: "Centrifugal force pre-cleaner separator engineered to trap heavy coarse dust, chips, and sawdust.",
    fullDescription: "Serves as a robust pre-filter unit before baghouse collectors or direct collection for high dust load industries. Converts incoming high CFM dust airstream into a high-velocity vortex.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "1,500 CFM to 45,000 CFM (2,550 CMH to 76,500 CMH)" },
      { key: "Particle Separation Efficiency", value: "95% for particles > 10 microns" },
      { key: "Steel Construction", value: "3.0 mm to 6.0 mm Heavy Mild Steel" }
    ],
    applications: [
      "Wood Sawmills & Carpenter Workshops",
      "Grain Processing Silos & Rice Mills",
      "Coal Fired Boiler Fly Ash Pre-collection"
    ],
    features: [
      "Zero moving internal parts for maintenance-free operation",
      "Handles high temperature ash and coarse abrasive dust effortlessly"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false
  },
  {
    _id: "66b1a1000000000000000009",
    name: "Packed Bed Wet Chemical Fume Scrubber",
    slug: "packed-bed-wet-chemical-fume-scrubber",
    category: "Scrubbers",
    shortDescription: "PP/FRP anti-corrosive packed bed wet scrubber for neutralizing acid gases, chemical fumes, and process odors.",
    fullDescription: "Hari Engineering Works manufactures heavy PP/FRP dual laminate Packed Bed Wet Scrubbers engineered to neutralize toxic chemical fumes (HCl, H2SO4, HNO3, NH3, Cl2, SO2). Employs high surface area PP Pall Ring packings.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "800 CFM to 50,000 CFM (1,360 CMH to 85,000 CMH)" },
      { key: "Fume Absorption Efficiency", value: "Up to 98.5% Chemical Neutralization" },
      { key: "Construction Material", value: "Polypropylene (PP) / FRP Dual Laminate / SS316L" },
      { key: "Dosing & Recirculation Pump", value: "PP Glandless Chemical Pump with pH Controller" }
    ],
    applications: [
      "Electroplating & Anodizing Lines",
      "Chemical Manufacturing Reactors",
      "Steel Acid Pickling Tanks",
      "Pharma Bulk Drug API Production"
    ],
    features: [
      "Complete corrosion immunity using premium PP/FRP composites",
      "Integrated automated pH monitoring & chemical dosing system",
      "Compliant with Indian Pollution Control Board standards"
    ],
    images: [
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000010",
    name: "High-Energy Venturi Wet Scrubber System",
    slug: "high-energy-venturi-wet-scrubber",
    category: "Scrubbers",
    shortDescription: "High-velocity water atomizing venturi scrubber ideal for sticky dust, hot fumes, and sub-micron mist wash.",
    fullDescription: "Utilizes high gas velocity in a constricted throat section to break scrubbing liquid into fine mist droplets, capturing sticky particles, hot metal dust, and sub-micron fumes with zero clogging risk.",
    specifications: [
      { key: "Airflow Capacity (CFM / CMH)", value: "1,200 CFM to 40,000 CFM (2,040 CMH to 68,000 CMH)" },
      { key: "Throat Pressure Drop", value: "150 mm WG to 1000 mm WG" },
      { key: "Efficiency Rating", value: "99% for particulates down to 1 Micron" }
    ],
    applications: [
      "Chemical Incinerator Exhaust Gases",
      "Aluminum & Die Casting Foundries",
      "Hot Metal Smelting & Refining"
    ],
    features: [
      "Adjustable throat damper regulating pressure drop",
      "Handles sticky, hot, and highly flammable dust safely"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false
  },
  {
    _id: "66b1a1000000000000000011",
    name: "Industrial Heavy-Duty GI / MS / SS Ducting Systems",
    slug: "industrial-heavy-duty-gi-ms-ss-ducting-systems",
    category: "Industrial Ducting Systems",
    shortDescription: "Precision fabricated round and rectangular ductwork with airtight angle flanges for high pressure air lines.",
    fullDescription: "Custom manufactured industrial ducting systems engineered from Mild Steel (MS), Galvanized Iron (GI), Stainless Steel (SS304/316), and FRP. Built with laser-cut flanges, airtight neoprene gaskets, and stiffener angles.",
    specifications: [
      { key: "Airflow Handling Capacity", value: "Up to 120,000 CFM (204,000 CMH)" },
      { key: "Duct Dimensions / Diameter", value: "150 mm to 3000 mm (Round / Rectangular)" },
      { key: "Sheet Thickness", value: "1.6 mm to 6.0 mm Heavy Industrial Gauge" },
      { key: "Flange Joint Type", value: "Laser-cut Companion Angle Flanges" }
    ],
    applications: [
      "Central Factory Exhaust Trunk Lines",
      "Dust Collector & Scrubber Interconnecting Ducting",
      "Boiler Flue Gas Exhaust Chimney Ducts"
    ],
    features: [
      "Leak-proof flanged construction eliminating pressure drop losses",
      "Structural angle stiffeners preventing duct collapse under high vacuum",
      "Custom elbows, Y-branches, reducers, and volume control dampers"
    ],
    images: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  },
  {
    _id: "66b1a1000000000000000012",
    name: "Custom Fume Capture & Suction Hood System",
    slug: "custom-fume-capture-suction-hood-system",
    category: "Fume/Exhaust Hoods",
    shortDescription: "Source capture suction hoods for localized containment of toxic chemical fumes, weld smoke, and heat.",
    fullDescription: "Engineered in accordance with ACGIH capture velocity standards. Our custom suction hoods isolate and capture hazardous emissions right at the generation source before contaminating ambient workspace air.",
    specifications: [
      { key: "Capture Airflow Range", value: "500 CFM to 20,000 CFM (850 CMH to 34,000 CMH)" },
      { key: "Hood Configuration", value: "Canopy Hood, Side-Draft Slot Hood, Articulated Suction Arm" },
      { key: "Material Construction", value: "Stainless Steel 304, SS316, Powder Coated MS" }
    ],
    applications: [
      "Industrial Welding & Brazing Stations",
      "Laboratory Chemical Benchtop Fume Exhaust",
      "Induction Furnace Crucible Top Suction"
    ],
    features: [
      "High capture efficiency minimizing total exhaust CFM required",
      "Integrated manual/pneumatic airflow damper"
    ],
    images: [
      "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true
  }
];

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (mongoose.connection.readyState === 1) {
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } else {
      // Return filtered fallback data
      let filtered = [...FALLBACK_PRODUCTS];
      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (featured === 'true') {
        filtered = filtered.filter(p => p.isFeatured);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.shortDescription.toLowerCase().includes(q) || 
          p.category.toLowerCase().includes(q)
        );
      }
      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
        note: 'Serving local product data (database connection standing by)'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const param = req.params.id;

    if (mongoose.connection.readyState === 1) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(param)) {
        product = await Product.findById(param);
      }
      if (!product) {
        product = await Product.findOne({ slug: param });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } else {
      const product = FALLBACK_PRODUCTS.find(p => p._id === param || p.slug === param);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      return res.status(200).json({
        success: true,
        data: product
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST /api/products (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, category, shortDescription, fullDescription, specifications, applications, features, images, isFeatured } = req.body;

    if (!name || !category || !shortDescription || !fullDescription) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required product details (Name, Category, Short Description, Full Description)'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.create({
        name,
        category,
        shortDescription,
        fullDescription,
        specifications: specifications || [],
        applications: applications || [],
        features: features || [],
        images: images || [],
        isFeatured: Boolean(isFeatured)
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } else {
      const newProduct = {
        _id: "prod_" + Date.now(),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        shortDescription,
        fullDescription,
        specifications: specifications || [],
        applications: applications || [],
        features: features || [],
        images: images && images.length ? images : ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"],
        isFeatured: Boolean(isFeatured)
      };
      FALLBACK_PRODUCTS.unshift(newProduct);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully (Memory storage)',
        data: newProduct
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// PUT /api/products/:id (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
    } else {
      const index = FALLBACK_PRODUCTS.findIndex(p => p._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      FALLBACK_PRODUCTS[index] = { ...FALLBACK_PRODUCTS[index], ...req.body };
      return res.status(200).json({ success: true, message: 'Product updated successfully', data: FALLBACK_PRODUCTS[index] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/products/:id (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } else {
      const index = FALLBACK_PRODUCTS.findIndex(p => p._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      FALLBACK_PRODUCTS.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
