document.addEventListener('DOMContentLoaded', () => {
  const trackForm = document.getElementById('track-form');
  const tokenInput = document.getElementById('token-input');
  const trackError = document.getElementById('track-error');
  const trackResult = document.getElementById('track-result');

  const resultToken = document.getElementById('result-token');
  const resultTypeBadge = document.getElementById('result-type-badge');
  const resultStatusBadge = document.getElementById('result-status-badge');
  const resultCreated = document.getElementById('result-created');
  const resultProduct = document.getElementById('result-product');
  const timelineContainer = document.getElementById('status-timeline');
  const adminReplyBox = document.getElementById('admin-reply-box');
  const adminReplyText = document.getElementById('admin-reply-text');
  const liveNotice = document.getElementById('live-update-notice');

  let activeSocket = null;
  let currentToken = '';

  const ALL_STEPS = ['New', 'In Review', 'Quoted', 'Confirmed', 'In Progress', 'Completed'];

  // Check URL query parameters (e.g. /track?token=RFQ-20261009-0001)
  const urlParams = new URLSearchParams(window.location.search);
  const queryToken = urlParams.get('token');
  if (queryToken) {
    tokenInput.value = queryToken;
    fetchStatus(queryToken);
  }

  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = tokenInput.value.trim().toUpperCase();
      if (val) {
        fetchStatus(val);
      }
    });
  }

  async function fetchStatus(token) {
    hideError();
    trackResult.style.display = 'none';

    try {
      const res = await fetch(`/api/enquiries/track/${encodeURIComponent(token)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        showError(data.error || 'Request token not found.');
        return;
      }

      renderTrackResult(data.data);
      setupSocketTracking(data.data.token);

    } catch (err) {
      console.error('[Track Error]', err);
      showError('Failed to connect to server. Please try again.');
    }
  }

  function renderTrackResult(data) {
    currentToken = data.token;
    resultToken.textContent = data.token;
    resultTypeBadge.textContent = data.type || 'RFQ';
    resultCreated.textContent = data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A';
    resultProduct.textContent = data.productInterested || 'Industrial Request';

    // Status badge styling
    const status = data.status || 'New';
    resultStatusBadge.textContent = status.toUpperCase();

    if (status === 'Completed') {
      resultStatusBadge.style.background = '#dcfce7';
      resultStatusBadge.style.color = '#15803d';
    } else if (status === 'Cancelled') {
      resultStatusBadge.style.background = '#fee2e2';
      resultStatusBadge.style.color = '#b91c1c';
    } else if (status === 'In Progress' || status === 'Quoted' || status === 'Confirmed') {
      resultStatusBadge.style.background = '#e0f2fe';
      resultStatusBadge.style.color = '#0369a1';
    } else {
      resultStatusBadge.style.background = '#fef3c7';
      resultStatusBadge.style.color = '#b45309';
    }

    // Render Timeline steps
    renderTimeline(status);

    // Render Admin Response / Notes
    if (data.adminReply && data.adminReply.trim()) {
      adminReplyText.textContent = data.adminReply;
      adminReplyBox.style.display = 'block';
    } else {
      adminReplyBox.style.display = 'none';
    }

    trackResult.style.display = 'block';
  }

  function renderTimeline(currentStatus) {
    timelineContainer.innerHTML = '';
    
    if (currentStatus === 'Cancelled') {
      timelineContainer.innerHTML = `
        <div style="width: 100%; text-align: center; padding: 1.5rem; background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 8px; color: #991b1b; font-weight: 600;">
          <i class="fa-solid fa-circle-xmark" style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem;"></i>
          This request has been marked as Cancelled by management.
        </div>
      `;
      return;
    }

    const currentIndex = ALL_STEPS.indexOf(currentStatus);

    ALL_STEPS.forEach((stepName, idx) => {
      const stepEl = document.createElement('div');
      stepEl.style.flex = '1';
      stepEl.style.textAlign = 'center';
      stepEl.style.minWidth = '100px';

      const isDone = idx <= currentIndex;
      const isCurrent = idx === currentIndex;

      const circleBg = isDone ? (isCurrent ? '#0284c7' : '#16a34a') : '#cbd5e1';
      const textColor = isDone ? '#0f172a' : '#94a3b8';

      stepEl.innerHTML = `
        <div style="width: 36px; height: 36px; border-radius: 50%; background: ${circleBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem auto; font-weight: bold; font-size: 0.9rem; box-shadow: ${isCurrent ? '0 0 0 4px rgba(2,132,199,0.2)' : 'none'};">
          ${isDone && !isCurrent ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
        </div>
        <div style="font-size: 0.85rem; font-weight: ${isCurrent ? '700' : '500'}; color: ${textColor};">
          ${stepName}
        </div>
      `;
      timelineContainer.appendChild(stepEl);
    });
  }

  function setupSocketTracking(token) {
    if (typeof io === 'undefined') return;
    try {
      if (!activeSocket) {
        activeSocket = io();
      }
      activeSocket.emit('join-tracking', token);

      if (liveNotice) liveNotice.style.display = 'block';

      activeSocket.off('status-update');
      activeSocket.on('status-update', (data) => {
        if (data.token === currentToken) {
          resultStatusBadge.textContent = (data.status || '').toUpperCase();
          renderTimeline(data.status);
          if (data.adminReply) {
            adminReplyText.textContent = data.adminReply;
            adminReplyBox.style.display = 'block';
          }
        }
      });
    } catch (err) {
      console.log('[Socket Tracking Warning]', err);
    }
  }

  function showError(msg) {
    trackError.textContent = msg;
    trackError.style.display = 'block';
  }

  function hideError() {
    trackError.style.display = 'none';
  }
});
