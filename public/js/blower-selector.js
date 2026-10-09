document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('blower-calculator-form');
  const resultContainer = document.getElementById('calculator-result-container');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const numHoods = document.getElementById('numHoods').value;
      const airflowPerHood = document.getElementById('airflowPerHood').value;
      const ductLengthMeters = document.getElementById('ductLengthMeters').value;
      const numBends = document.getElementById('numBends').value;
      const application = document.getElementById('application').value;
      const name = document.getElementById('cust-name').value;
      const phone = document.getElementById('cust-phone').value;
      const email = document.getElementById('cust-email').value;

      const submitBtn = form.querySelector('button[type="submit"]');
      const origBtn = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Computing Fluid Dynamics...`;

      try {
        const payload = {
          numHoods: parseInt(numHoods, 10),
          airflowPerHood: airflowPerHood ? parseFloat(airflowPerHood) : undefined,
          ductLengthMeters: parseFloat(ductLengthMeters),
          numBends: parseInt(numBends || 0, 10),
          application,
          name,
          phone,
          email
        };

        const res = await fetch('/api/suggest-blower', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          renderResults(data.data, data.token);
        } else {
          showToast(data.error || 'Calculation failed. Please verify inputs.', false);
        }
      } catch (err) {
        console.error('[Blower Selector Error]', err);
        showToast('Server connection error. Please try again.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtn;
      }
    });
  }

  function renderResults(data, token) {
    const dp = data.dutyPoint;
    const top3 = data.top3 || [];
    const hasFit = data.hasFit;

    let html = `
      <div style="background: #ffffff; border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-lg); border: 1px solid var(--border-light);">
        
        <!-- Duty Point Summary Box -->
        <div style="background: linear-gradient(135deg, #052a4a, #0b5fa5); color: #ffffff; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <div>
              <span style="background: rgba(255,255,255,0.2); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">Calculated Duty Point</span>
              <h3 style="margin: 0.4rem 0 0 0; color: #ffffff; font-size: 1.3rem;">System Airflow & Pressure Requirements</h3>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: #93c5fd; display: block;">Generated Reference Token</span>
              <span style="font-family: monospace; font-weight: bold; color: #38bdf8; font-size: 1.1rem;">${token}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; text-align: center;">
            <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 6px;">
              <div style="font-size: 0.75rem; color: #93c5fd;">Required Airflow (Q)</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">${dp.requiredAirflow} <span style="font-size:0.75rem;">m³/h</span></div>
              <div style="font-size: 0.75rem; color: #cbd5e1;">(${dp.requiredCFM} CFM)</div>
            </div>

            <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 6px;">
              <div style="font-size: 0.75rem; color: #93c5fd;">Static Pressure (P)</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">${dp.requiredStaticPressure} <span style="font-size:0.75rem;">mmWG</span></div>
              <div style="font-size: 0.75rem; color: #cbd5e1;">(incl. 15% margin)</div>
            </div>

            <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 6px;">
              <div style="font-size: 0.75rem; color: #93c5fd;">Rec. Duct Diameter</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin-top: 0.2rem;">Ø ${dp.ductDiameterMM} <span style="font-size:0.75rem;">mm</span></div>
              <div style="font-size: 0.75rem; color: #cbd5e1;">(@ ${dp.velocity} m/s)</div>
            </div>
          </div>
        </div>
    `;

    if (!hasFit) {
      html += `
        <div style="background: #fffbebf; border: 1px dashed #f59e0b; padding: 1.5rem; border-radius: 8px; text-align: center; margin-bottom: 2rem;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #d97706; margin-bottom: 0.5rem;"></i>
          <h4 style="color: #92400e; margin-bottom: 0.5rem;">Custom Engineering Required</h4>
          <p style="color: #b45309; font-size: 0.95rem; max-width: 500px; margin: 0 auto 1rem auto;">
            Your required duty point (${dp.requiredCFM} CFM @ ${dp.requiredStaticPressure} mmWG) exceeds our standard catalog models. Our custom design engineering team can build a specialized heavy-duty blower tailored specifically for your plant.
          </p>
          <a href="/contact?product=Custom%20Engineered%20Blower%20(${dp.requiredCFM}%20CFM)" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-paper-plane"></i> Request Custom Quote
          </a>
        </div>
      `;
    }

    html += `<h4 style="margin-bottom: 1.25rem; color: var(--text-main);"><i class="fa-solid fa-trophy" style="color: var(--primary);"></i> Recommended Equipment Matches</h4>`;

    top3.forEach((item, index) => {
      const p = item.product;
      const rankLabels = ['1st Choice (Best Match)', '2nd Alternative Option', '3rd Alternative Option'];
      const rankColors = ['#10b981', '#0284c7', '#64748b'];

      html += `
        <div style="border: 1px solid ${index === 0 ? '#0284c7' : '#e2e8f0'}; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; background: ${index === 0 ? '#f0f9ff' : '#ffffff'};">
          <div style="display: flex; gap: 1.25rem; flex-wrap: wrap; align-items: center;">
            
            <img src="${p.image}" alt="${p.name}" loading="lazy" style="width: 110px; height: 110px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;">
            
            <div style="flex: 1; min-width: 240px;">
              <span style="background: ${rankColors[index]}; color: #ffffff; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">
                ${rankLabels[index]}
              </span>
              <h4 style="margin: 0.4rem 0 0.25rem 0; color: var(--primary-dark); font-size: 1.15rem;">${p.name}</h4>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0 0 0.5rem 0;">${p.shortDescription}</p>
              
              <div style="font-size: 0.82rem; color: #475569;">
                ${item.reasons.map(r => `<div><i class="fa-solid fa-check" style="color:#10b981; margin-right:4px;"></i> ${r}</div>`).join('')}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px;">
              <a href="/contact?product=${encodeURIComponent(p.name)}&token=${encodeURIComponent(token)}" class="btn btn-primary btn-sm" style="text-align: center;">
                <i class="fa-solid fa-paper-plane"></i> Request Quote
              </a>
              <a href="tel:+919876543210" class="btn btn-secondary btn-sm" style="text-align: center;">
                <i class="fa-solid fa-headset"></i> Talk to Engineer
              </a>
            </div>

          </div>
        </div>
      `;
    });

    // Disclaimer
    html += `
        <div style="margin-top: 1.5rem; font-size: 0.82rem; color: var(--text-muted); text-align: center; background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0;">
          <i class="fa-solid fa-circle-info" style="color: var(--primary);"></i> 
          Note: This sizing calculation is an initial engineering estimate. Final selection and motor sizing will be confirmed by our technical sales engineers.
        </div>
      </div>
    `;

    resultContainer.innerHTML = html;
  }
});
