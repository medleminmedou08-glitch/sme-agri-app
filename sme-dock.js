(function() {
  const createProDock = () => {
    if (document.getElementById('smeMasterDockBtn')) return;

    // 1. زر الأدوات المتقدمة الموحد (يظهر فوق كل طبقات التطبيق)
    const masterBtn = document.createElement('button');
    masterBtn.id = 'smeMasterDockBtn';
    masterBtn.innerHTML = '⚡ أدوات SME Pro';
    masterBtn.style.cssText = 'position:fixed; bottom:74px; left:14px; z-index:999999; background:linear-gradient(135deg, #1a3622 0%, #d97706 100%); color:#fff; border:2px solid #fff; border-radius:30px; padding:10px 18px; font-weight:bold; font-size:13px; box-shadow:0 6px 20px rgba(0,0,0,0.45); cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px;';
    document.documentElement.appendChild(masterBtn);

    // 2. القائمة المنبثقة للأدوات
    const menuBox = document.createElement('div');
    menuBox.id = 'smeMasterMenu';
    menuBox.style.cssText = 'display:none; position:fixed; bottom:125px; left:14px; z-index:999999; background:#ffffff; border:2px solid #1a3622; border-radius:16px; padding:12px; width:240px; box-shadow:0 15px 35px rgba(0,0,0,0.4); direction:rtl; font-family:inherit;';
    menuBox.innerHTML = `
      <div style="font-weight:bold; color:#1a3622; font-size:13px; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>🌟 الأدوات المتقدمة</span>
        <span id="closeMasterMenu" style="color:#ef4444; cursor:pointer;">✕</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:7px;">
        <button id="dockOpenMap" style="background:#1e3a8a; color:#fff; border:none; border-radius:8px; padding:9px 10px; font-size:12px; font-weight:bold; text-align:right; cursor:pointer;">🗺️ خريطة الحقول وشبكة الري</button>
        <button id="dockOpenFert" style="background:#065f46; color:#fff; border:none; border-radius:8px; padding:9px 10px; font-size:12px; font-weight:bold; text-align:right; cursor:pointer;">🧪 الأسمدة وحاسبة الجرعات</button>
        <button id="dockOpenInv" style="background:#d97706; color:#fff; border:none; border-radius:8px; padding:9px 10px; font-size:12px; font-weight:bold; text-align:right; cursor:pointer;">🧾 الفوترة (عربي / Français)</button>
        <button id="dockOpenPro" style="background:#0f172a; color:#fde68a; border:none; border-radius:8px; padding:9px 10px; font-size:12px; font-weight:bold; text-align:right; cursor:pointer;">📊 الإدارة الذكية والأرشيف</button>
        <button id="dockOpenAi" style="background:#1a3622; color:#fff; border:none; border-radius:8px; padding:9px 10px; font-size:12px; font-weight:bold; text-align:right; cursor:pointer;">🤖 مستشار SME Agri الذكي</button>
      </div>
    `;
    document.documentElement.appendChild(menuBox);

    masterBtn.onclick = () => {
      menuBox.style.display = menuBox.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('closeMasterMenu').onclick = () => {
      menuBox.style.display = 'none';
    };

    // ربط أزرار القائمة بالوحدات البرمجية
    const triggerByText = (txt, fallbackMsg) => {
      menuBox.style.display = 'none';
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.id !== 'smeMasterDockBtn' && b.innerText.includes(txt));
      if (target) {
        target.click();
      } else {
        alert(fallbackMsg);
      }
    };

    document.getElementById('dockOpenMap').onclick = () => triggerByText('خريطة الحقول', 'يرجى التأكد من وجود ملف fields-map.js في المستودع');
    document.getElementById('dockOpenFert').onclick = () => triggerByText('الأسمدة', 'يرجى التأكد من وجود ملف fertilizer-pro.js في المستودع');
    document.getElementById('dockOpenInv').onclick = () => triggerByText('الفوترة', 'يرجى التأكد من وجود ملف invoicing.js في المستودع');
    document.getElementById('dockOpenPro').onclick = () => triggerByText('الإدارة الذكية', 'يرجى التأكد من وجود ملف pro-upgrade.js في المستودع');
    document.getElementById('dockOpenAi').onclick = () => triggerByText('المساعد الذكي', 'يرجى التأكد من وجود ملف ai-assistant.js في المستودع');
  };

  setTimeout(createProDock, 1000);
})();
