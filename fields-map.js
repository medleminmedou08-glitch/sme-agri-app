(function() {
  // تحميل مكتبة الخرائط التفاعلية Leaflet
  const leafletCss = document.createElement('link');
  leafletCss.rel = 'stylesheet';
  leafletCss.href = 'https://unpkg.com';
  document.head.appendChild(leafletCss);

  const leafletScript = document.createElement('script');
  leafletScript.src = 'https://unpkg.com';
  document.head.appendChild(leafletScript);

  const initMapSystem = () => {
    if (document.getElementById('smeTopMapBtn')) return;

    // 1. وضع زر الخريطة في شريط علوي بارز ومضمون الظهور
    const topDock = document.createElement('div');
    topDock.style.cssText = 'background:#1e3a8a; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #60a5fa; direction:rtl; position:relative; z-index:9995;';
    topDock.innerHTML = `
      <span style="color:#fff; font-size:12px; font-weight:bold;">🛰️ المساحة الجغرافية وشبكة الري</span>
      <button id="smeTopMapBtn" style="background:#f59e0b; color:#0f172a; border:none; border-radius:20px; padding:6px 14px; font-weight:bold; font-size:12px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.3);">🗺️ فتح خريطة الحقول</button>
    `;
    document.body.insertBefore(topDock, document.body.firstChild);

    // 2. نافذة الخريطة الكاملة
    const modal = document.createElement('div');
    modal.style.cssText = 'display:none; position:fixed; inset:0; background:#0f172a; z-index:10050; flex-direction:column; direction:rtl;';
    modal.innerHTML = `
      <div style="background:#1a3622; color:#fff; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #d97706;">
        <div>
          <h3 style="margin:0; font-size:15px;">🛰️ خريطة الحقول وشبكة الري (كرمسين)</h3>
          <span id="mapSummaryBar" style="font-size:11px; color:#fde68a;">إجمالي المساحة: 0 هكتار | شبكة الري: 0 م</span>
        </div>
        <button id="closeMapModal" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:6px 12px; font-weight:bold; cursor:pointer;">✕ إغلاق</button>
      </div>

      <div style="background:#1e293b; padding:8px 10px; display:flex; gap:6px; overflow-x:auto; align-items:center; border-bottom:1px solid #334155;">
        <button id="btnLocateMe" style="white-space:nowrap; background:#0284c7; color:#fff; border:none; border-radius:8px; padding:7px 11px; font-size:12px; font-weight:bold; cursor:pointer;">📍 موقعي GPS</button>
        <button id="btnDrawField" style="white-space:nowrap; background:#16a34a; color:#fff; border:none; border-radius:8px; padding:7px 11px; font-size:12px; font-weight:bold; cursor:pointer;">📐 رسم حقل</button>
        <button id="btnDrawPipe" style="white-space:nowrap; background:#2563eb; color:#fff; border:none; border-radius:8px; padding:7px 11px; font-size:12px; font-weight:bold; cursor:pointer;">💧 خط ري</button>
        <button id="btnAddPump" style="white-space:nowrap; background:#d97706; color:#fff; border:none; border-radius:8px; padding:7px 11px; font-size:12px; font-weight:bold; cursor:pointer;">⚙️ مضخة</button>
      </div>

      <div id="drawControlsBar" style="display:none; background:#fef3c7; color:#92400e; padding:8px 12px; font-size:12px; justify-content:space-between; align-items:center; border-bottom:2px solid #f59e0b;">
        <span id="drawInstructionText" style="font-weight:bold;">اضغط على زوايا الحقل على الخريطة...</span>
        <div style="display:flex; gap:6px;">
          <button id="btnFinishDraw" style="background:#16a34a; color:#fff; border:none; border-radius:6px; padding:5px 10px; font-weight:bold; cursor:pointer;">✔ حفظ</button>
          <button id="btnCancelDraw" style="background:#ef4444; color:#fff; border:none; border-radius:6px; padding:5px 10px; font-weight:bold; cursor:pointer;">إلغاء</button>
        </div>
      </div>

      <div id="smeSatelliteMap" style="flex:1; width:100%; background:#0f172a;"></div>

      <div style="background:#0f172a; color:#e2e8f0; padding:6px 12px; font-size:11px; display:flex; justify-content:space-around; border-top:1px solid #334155;">
        <span><b style="color:#ef4444;">■</b> بطيخ أحمر</span>
        <span><b style="color:#f59e0b;">■</b> شمام</span>
        <span><b style="color:#22c55e;">■</b> خضروات</span>
        <span><b style="color:#38bdf8;">━</b> شبكة الري</span>
      </div>
    `;
    document.body.appendChild(modal);

    let mapInstance = null;
    let fieldsData = JSON.parse(localStorage.getItem('sme_map_fields') || '[]');
    let pipesData = JSON.parse(localStorage.getItem('sme_map_pipes') || '[]');
    let pumpsData = JSON.parse(localStorage.getItem('sme_map_pumps') || '[]');
    let drawnLayersGroup = null;

    let drawMode = null;
    let tempPoints = [];
    let tempLayer = null;

    const calcPolygonAreaHa = (latlngs) => {
      if (latlngs.length < 3) return 0;
      const R = 6378137;
      let area = 0;
      for (let i = 0; i < latlngs.length; i++) {
        const p1 = latlngs[i];
        const p2 = latlngs[(i + 1) % latlngs.length];
        const x1 = (p1[1] * Math.PI / 180) * R * Math.cos(p1[0] * Math.PI / 180);
        const y1 = (p1[0] * Math.PI / 180) * R;
        const x2 = (p2[1] * Math.PI / 180) * R * Math.cos(p2[0] * Math.PI / 180);
        const y2 = (p2[0] * Math.PI / 180) * R;
        area += (x1 * y2 - x2 * y1);
      }
      return +(Math.abs(area / 2) / 10000).toFixed(2);
    };

    const calcPolylineLengthM = (latlngs) => {
      if (latlngs.length < 2 || !window.L) return 0;
      let total = 0;
      for (let i = 0; i < latlngs.length - 1; i++) {
        total += window.L.latLng(latlngs[i]).distanceTo(window.L.latLng(latlngs[i + 1]));
      }
      return Math.round(total);
    };

    const getCropStyle = (cropType) => {
      if (cropType === 'watermelon') return { color: '#ef4444', label: '🍉 بطيخ أحمر' };
      if (cropType === 'melon') return { color: '#f59e0b', label: '🍈 شمام' };
      return { color: '#22c55e', label: '🍅 خضروات' };
    };

    const saveMapStorage = () => {
      localStorage.setItem('sme_map_fields', JSON.stringify(fieldsData));
      localStorage.setItem('sme_map_pipes', JSON.stringify(pipesData));
      localStorage.setItem('sme_map_pumps', JSON.stringify(pumpsData));
    };

    const renderSavedLayers = () => {
      if (!mapInstance || !drawnLayersGroup) return;
      drawnLayersGroup.clearLayers();
      let totalHa = 0;
      let totalPipeM = 0;

      fieldsData.forEach((f, idx) => {
        totalHa += f.areaHa;
        const st = getCropStyle(f.crop);
        const poly = window.L.polygon(f.coords, { color: st.color, fillColor: st.color, fillOpacity: 0.4, weight: 2.5 }).addTo(drawnLayersGroup);
        poly.bindTooltip(`<b>${f.name}</b><br>${st.label} | ${f.areaHa} هكتار`, { permanent: true, direction: 'center' });
        poly.bindPopup(`<div style="direction:rtl; text-align:right;"><b>🌱 ${f.name}</b><br>المحصول: ${st.label}<br>المساحة: <b>${f.areaHa} هكتار</b> (${Math.round(f.areaHa * 10000).toLocaleString()} م²)<br><button onclick="window.deleteSmeField(${idx})" style="margin-top:6px; background:#ef4444; color:#fff; border:none; border-radius:4px; padding:4px 8px; width:100%;">حذف</button></div>`);
      });

      pipesData.forEach((p, idx) => {
        totalPipeM += p.lengthM;
        const isMain = p.type === 'main';
        const line = window.L.polyline(p.coords, { color: isMain ? '#2563eb' : '#38bdf8', weight: isMain ? 5 : 3, dashArray: isMain ? null : '8, 6' }).addTo(drawnLayersGroup);
        line.bindPopup(`<div style="direction:rtl; text-align:right;"><b>💧 ${isMain ? 'خط ري رئيسي' : 'خط فرعي'}</b><br>الطول: <b>${p.lengthM} متر</b><br><button onclick="window.deleteSmePipe(${idx})" style="margin-top:6px; background:#ef4444; color:#fff; border:none; border-radius:4px; padding:4px 8px; width:100%;">حذف</button></div>`);
      });

      pumpsData.forEach((pm, idx) => {
        const marker = window.L.circleMarker(pm.coord, { radius: 8, fillColor: '#f59e0b', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(drawnLayersGroup);
        marker.bindPopup(`<div style="direction:rtl; text-align:right;"><b>⚙️ ${pm.name}</b><br><button onclick="window.deleteSmePump(${idx})" style="margin-top:6px; background:#ef4444; color:#fff; border:none; border-radius:4px; padding:4px 8px;">حذف</button></div>`);
      });

      document.getElementById('mapSummaryBar').innerText = `إجمالي المساحة: ${totalHa.toFixed(2)} هكتار | شبكة الري: ${totalPipeM.toLocaleString()} م`;
    };

    window.deleteSmeField = (idx) => { fieldsData.splice(idx, 1); saveMapStorage(); renderSavedLayers(); };
    window.deleteSmePipe = (idx) => { pipesData.splice(idx, 1); saveMapStorage(); renderSavedLayers(); };
    window.deleteSmePump = (idx) => { pumpsData.splice(idx, 1); saveMapStorage(); renderSavedLayers(); };

    const resetDrawState = () => {
      drawMode = null;
      tempPoints = [];
      if (tempLayer && mapInstance) { mapInstance.removeLayer(tempLayer); tempLayer = null; }
      document.getElementById('drawControlsBar').style.display = 'none';
    };

    const initMap = () => {
      if (!window.L) {
        alert('⏳ جاري تحميل خرائط الأقمار الصناعية، انتظر ثانيتين واضغط مرة أخرى...');
        return;
      }
      if (!mapInstance) {
        mapInstance = window.L.map('smeSatelliteMap').setView([16.545, -16.235], 14);
        window.L.tileLayer('https://arcgisonline.com{z}/{y}/{x}', { maxZoom: 19 }).addTo(mapInstance);
        drawnLayersGroup = window.L.layerGroup().addTo(mapInstance);

        mapInstance.on('click', (e) => {
          if (!drawMode) return;
          const pt = [e.latlng.lat, e.latlng.lng];
          if (drawMode === 'pump') {
            const pumpName = prompt('اسم المضخة أو المحبس:') || 'محبس ري';
            pumpsData.push({ name: pumpName, coord: pt });
