(function() {
  // تحميل مكتبة الخرائط التفاعلية Leaflet تلقائياً
  const leafletCss = document.createElement('link');
  leafletCss.rel = 'stylesheet';
  leafletCss.href = 'https://unpkg.com';
  document.head.appendChild(leafletCss);

  const leafletScript = document.createElement('script');
  leafletScript.src = 'https://unpkg.com';
  document.head.appendChild(leafletScript);

  window.addEventListener('DOMContentLoaded', () => {
    // 1. زر فتح خريطة الحقول العائم
    const mapBtn = document.createElement('button');
    mapBtn.innerHTML = '🗺️ خريطة الحقول';
    mapBtn.style.cssText = 'position:fixed; bottom:174px; left:16px; z-index:9998; background:#1e3a8a; color:#fff; border:2px solid #60a5fa; border-radius:25px; padding:9px 16px; font-weight:bold; font-size:13px; box-shadow:0 4px 12px rgba(0,0,0,0.3); cursor:pointer; font-family:inherit;';
    document.body.appendChild(mapBtn);

    // 2. نافذة الخريطة الكاملة
    const modal = document.createElement('div');
    modal.style.cssText = 'display:none; position:fixed; inset:0; background:#0f172a; z-index:10005; flex-direction:column; direction:rtl;';
    modal.innerHTML = `
      <div style="background:#1a3622; color:#fff; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #d97706;">
        <div>
          <h3 style="margin:0; font-size:15px;">🛰️ خريطة الحقول وشبكة الري (كرمسين)</h3>
          <span id="mapSummaryBar" style="font-size:11px; color:#fde68a;">إجمالي المساحة: 0 هكتار | شبكة الري: 0 م</span>
        </div>
        <button id="closeMapModal" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:5px 11px; font-weight:bold; cursor:pointer;">✕ إغلاق</button>
      </div>

      <!-- شريط أدوات الرسم والتحكم -->
      <div style="background:#1e293b; padding:8px 10px; display:flex; gap:6px; overflow-x:auto; align-items:center; border-bottom:1px solid #334155;">
        <button id="btnLocateMe" style="white-space:nowrap; background:#0284c7; color:#fff; border:none; border-radius:8px; padding:6px 10px; font-size:12px; font-weight:bold; cursor:pointer;">📍 موقعي GPS</button>
        <button id="btnDrawField" style="white-space:nowrap; background:#16a34a; color:#fff; border:none; border-radius:8px; padding:6px 10px; font-size:12px; font-weight:bold; cursor:pointer;">📐 رسم حقل جديد</button>
        <button id="btnDrawPipe" style="white-space:nowrap; background:#2563eb; color:#fff; border:none; border-radius:8px; padding:6px 10px; font-size:12px; font-weight:bold; cursor:pointer;">💧 رسم خط ري</button>
        <button id="btnAddPump" style="white-space:nowrap; background:#d97706; color:#fff; border:none; border-radius:8px; padding:6px 10px; font-size:12px; font-weight:bold; cursor:pointer;">⚙️ مضخة / محبس</button>
      </div>

      <!-- شريط التعليمات التفاعلي أثناء الرسم -->
      <div id="drawControlsBar" style="display:none; background:#fef3c7; color:#92400e; padding:8px 12px; font-size:12px; justify-content:space-between; align-items:center; border-bottom:2px solid #f59e0b;">
        <span id="drawInstructionText" style="font-weight:bold;">اضغط على زوايا الحقل على الخريطة...</span>
        <div style="display:flex; gap:6px;">
          <button id="btnFinishDraw" style="background:#16a34a; color:#fff; border:none; border-radius:6px; padding:5px 10px; font-weight:bold; cursor:pointer;">✔ حفظ</button>
          <button id="btnCancelDraw" style="background:#ef4444; color:#fff; border:none; border-radius:6px; padding:5px 10px; font-weight:bold; cursor:pointer;">إلغاء</button>
        </div>
      </div>

      <!-- حاوية الخريطة -->
      <div id="smeSatelliteMap" style="flex:1; width:100%; background:#0f172a;"></div>

      <!-- مفتاح الألوان السفلي -->
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

    let drawMode = null; // 'field' | 'pipe' | 'pump'
    let tempPoints = [];
    let tempLayer = null;

    // دالة حساب المساحة بالمتر المربع والهكتار بدقة جغرافية (Spherical Polygon Area)
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
      const sqMeters = Math.abs(area / 2);
      return +(sqMeters / 10000).toFixed(2); // تحويل إلى هكتار
    };

    // دالة حساب طول أنابيب الري بالمتر
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
      return { color: '#22c55e', label: '🍅 خضروات / أخرى' };
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

      // رسم الحقول المحفوظة
      fieldsData.forEach((f, idx) => {
        totalHa += f.areaHa;
        const st = getCropStyle(f.crop);
        const poly = window.L.polygon(f.coords, {
          color: st.color,
          fillColor: st.color,
          fillOpacity: 0.38,
          weight: 2.5
        }).addTo(drawnLayersGroup);

        // ملصق دائم في منتصف الحقل يظهر الاسم والمحصول والمساحة
        poly.bindTooltip(`<strong>${f.name}</strong><br>${st.label} | <b>${f.areaHa} هكتار</b>`, {
          permanent: true,
          direction: 'center',
          className: 'sme-field-label'
        });

        poly.bindPopup(`
          <div style="direction:rtl; text-align:right; font-family:inherit; min-width:160px;">
            <strong style="color:#1a3622; font-size:14px;">🌱 ${f.name}</strong><br>
            <span>المحصول: <b>${st.label}</b></span><br>
            <span>المساحة: <b>${f.areaHa} هكتار</b> (${Math.round(f.areaHa * 10000).toLocaleString()} م²)</span><br>
            <button onclick="window.deleteSmeField(${idx})" style="margin-top:8px; background:#ef4444; color:#fff; border:none; border-radius:5px; padding:4px 8px; font-size:11px; cursor:pointer; width:100%;">🗑️ حذف الحقل</button>
          </div>
        `);
      });

      // رسم خطوط شبكة الري
      pipesData.forEach((p, idx) => {
        totalPipeM += p.lengthM;
        const isMain = p.type === 'main';
        const line = window.L.polyline(p.coords, {
          color: isMain ? '#2563eb' : '#38bdf8',
          weight: isMain ? 5 : 3,
          dashArray: isMain ? null : '8, 6'
        }).addTo(drawnLayersGroup);

        line.bindPopup(`
          <div style="direction:rtl; text-align:right; font-family:inherit;">
            <strong>💧 ${isMain ? 'خط ري رئيسي' : 'خط ري فرعي / تنقيط'}</strong><br>
            <span>الطول: <b>${p.lengthM} متر</b></span><br>
            <button onclick="window.deleteSmePipe(${idx})" style="margin-top:6px; background:#ef4444; color:#fff; border:none; border-radius:5px; padding:3px 8px; font-size:11px; cursor:pointer; width:100%;">🗑️ حذف الخط</button>
          </div>
        `);
      });

      // رسم المضخات والمحابس
      pumpsData.forEach((pm, idx) => {
        const marker = window.L.circleMarker(pm.coord, {
          radius: 8,
          fillColor: '#f59e0b',
          color: '#fff',
          weight: 2,
          fillOpacity: 1
        }).addTo(drawnLayersGroup);

        marker.bindTooltip(`⚙️ ${pm.name}`, { permanent: false });
        marker.bindPopup(`
          <div style="direction:rtl; text-align:right; font-family:inherit;">
            <strong>⚙️ ${pm.name}</strong><br>
            <button onclick="window.deleteSmePump(${idx})" style="margin-top:6px; background:#ef4444; color:#fff; border:none; border-radius:5px; padding:3px 8px; font-size:11px; cursor:pointer;">🗑️ حذف</button>
          </div>
        `);
      });

      document.getElementById('mapSummaryBar').innerText = `إجمالي المساحة: ${totalHa.toFixed(2)} هكتار | شبكة الري: ${totalPipeM.toLocaleString()} م`;
    };

    window.deleteSmeField = (idx) => { fieldsData.splice(idx, 1); saveMapStorage(); renderSavedLayers(); };
    window.deleteSmePipe = (idx) => { pipesData.splice(idx, 1); saveMapStorage(); renderSavedLayers(); };
    window.deleteSmePump = (idx) => { pumpsData.splice(idx, 1); saveMapStorage(); renderSavedLayers(); };

    const resetDrawState = () => {
      drawMode = null;
