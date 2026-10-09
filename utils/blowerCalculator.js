/**
 * Blower Duty Point Calculation & Equipment Selection Module
 * Hari Engineering Works
 */

// Application Default Airflow Values (m3/h per hood)
const APPLICATION_DEFAULTS = {
  welding_fumes: { label: 'Welding Fumes & Smoke', airflow: 1200, velocity: 14, material: 'fumes' },
  dust_collection: { label: 'Wood & Dry Powder Dust', airflow: 2500, velocity: 19, material: 'dust' },
  grinding_chips: { label: 'Metal Grinding & Heavy Chips', airflow: 3200, velocity: 22, material: 'heavy' },
  general_ventilation: { label: 'General Plant Ventilation', airflow: 4500, velocity: 12, material: 'light' },
  chemical_fumes: { label: 'Corrosive Chemical Scrubbing Fumes', airflow: 1800, velocity: 15, material: 'fumes' }
};

/**
 * Calculates duty point (Airflow Q in m3/h and Static Pressure P in mmWG)
 * and recommended duct diameter.
 */
function calculateDutyPoint(input) {
  const numHoods = Math.max(1, parseInt(input.numHoods || 1, 10));
  const appKey = input.application || 'dust_collection';
  const appConfig = APPLICATION_DEFAULTS[appKey] || APPLICATION_DEFAULTS.dust_collection;

  const airflowPerHood = parseFloat(input.airflowPerHood) || appConfig.airflow;
  const ductLength = Math.max(1, parseFloat(input.ductLengthMeters || 10));
  const numBends = Math.max(0, parseInt(input.numBends || 0, 10));

  // 1. Total airflow Q with 12% leakage margin
  const baseAirflow = numHoods * airflowPerHood;
  const designAirflow = Math.round(baseAirflow * 1.12);

  // 2. Transport Velocity (m/s)
  const velocity = appConfig.velocity;

  // 3. Compute Duct Diameter (mm)
  const airflowQSec = designAirflow / 3600; // m3/s
  const ductAreaM2 = airflowQSec / velocity; // m2
  const ductDiameterM = Math.sqrt((4 * ductAreaM2) / Math.PI);
  const ductDiameterMM = Math.round(ductDiameterM * 1000);

  // 4. Compute Static Pressure Losses (mmWG)
  // Velocity pressure Pv = 0.5 * rho * v^2 / 9.81 (mmWG) (rho approx 1.2 kg/m3)
  const velocityPressure = (0.5 * 1.2 * Math.pow(velocity, 2)) / 9.81; // mmWG

  // Straight duct friction loss (~ 0.85 mmWG per meter of duct)
  const frictionLoss = ductLength * 0.85;

  // Bend losses (K_bend approx 0.25 per 90-degree elbow)
  const bendLoss = numBends * 0.25 * velocityPressure;

  // Hood entry loss (K_entry approx 0.45)
  const hoodLoss = numHoods * 0.45 * velocityPressure;

  // Filter / Scrubber pressure drop margin (if dust or chemical application)
  let equipmentLoss = 0;
  if (appKey === 'dust_collection' || appKey === 'grinding_chips') {
    equipmentLoss = 75; // mmWG for bag filter / cyclone drop
  } else if (appKey === 'chemical_fumes') {
    equipmentLoss = 60; // mmWG for wet scrubber drop
  } else {
    equipmentLoss = 25;
  }

  const rawStaticPressure = frictionLoss + bendLoss + hoodLoss + equipmentLoss;

  // 5. Apply 15% Duty Point Safety Margin
  const requiredAirflow = Math.round(designAirflow * 1.15); // m3/h
  const requiredStaticPressure = Math.round(rawStaticPressure * 1.15); // mmWG
  const requiredCFM = Math.round(requiredAirflow / 1.699); // CFM conversion

  return {
    numHoods,
    appLabel: appConfig.label,
    baseAirflow,
    designAirflow,
    requiredAirflow,
    requiredCFM,
    velocity,
    ductDiameterMM,
    frictionLoss: Math.round(frictionLoss),
    bendLoss: Math.round(bendLoss),
    equipmentLoss: Math.round(equipmentLoss),
    rawStaticPressure: Math.round(rawStaticPressure),
    requiredStaticPressure
  };
}

/**
 * Matches database blowers against calculated duty point
 */
function matchBlowers(dutyPoint, productCatalog) {
  const reqQ = dutyPoint.requiredAirflow;
  const reqP = dutyPoint.requiredStaticPressure;

  // Filter candidate blowers (Category = Industrial Blowers or Axial Flow Fans)
  const candidateBlowers = productCatalog.filter(p => {
    const isBlowerCategory = p.category === 'Industrial Blowers' || p.category === 'Axial Flow Fans';
    const isActive = p.isActive !== false;
    return isBlowerCategory && isActive;
  });

  const matches = candidateBlowers.map(b => {
    const minQ = b.minAirflow || 500;
    const maxQ = b.maxAirflow || 50000;
    const maxP = b.maxStaticPressure || 400;

    // Check performance coverage score
    let score = 0;
    let matchReasons = [];

    if (maxQ >= reqQ) {
      score += 40;
      matchReasons.push(`Handles required airflow (${reqQ} m³/h ≤ Max ${maxQ} m³/h)`);
    } else {
      matchReasons.push(`Airflow limited to ${maxQ} m³/h`);
    }

    if (maxP >= reqP) {
      score += 40;
      matchReasons.push(`Sufficient static pressure (${reqP} mmWG ≤ Rating ${maxP} mmWG)`);
    } else {
      matchReasons.push(`Pressure rating (${maxP} mmWG) is below required ${reqP} mmWG`);
    }

    // Smallest suitable motor size bonus
    if (b.motorKW) {
      score += Math.max(0, 20 - b.motorKW);
      matchReasons.push(`Engineered with ${b.motorKW} kW energy efficient motor`);
    }

    return {
      product: b,
      score,
      isFit: maxQ >= reqQ && maxP >= reqP,
      reasons: matchReasons
    };
  });

  // Sort by score descending (highest suitability first)
  const sortedMatches = matches.sort((a, b) => b.score - a.score);
  const top3 = sortedMatches.slice(0, 3);

  const bestFit = top3.find(m => m.isFit);

  return {
    dutyPoint,
    top3,
    hasFit: Boolean(bestFit)
  };
}

module.exports = {
  APPLICATION_DEFAULTS,
  calculateDutyPoint,
  matchBlowers
};
