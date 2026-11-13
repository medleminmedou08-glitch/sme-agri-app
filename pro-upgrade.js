(function() {
  window.addEventListener('DOMContentLoaded', () => {
    // 1. شريط الحالة الذكي العلوي (الطقس الحي لكرمسين + نصيحة الري)
    const weatherBar = document.createElement('div');
    weatherBar.style.cssText = 'background:linear-gradient(90deg, #1a3622 0%, #244a30 100%); color:#fff; padding:8px 14px; font-size:12px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #d97706; direction:rtl; position:sticky; top:0; z-index:9990;';
    weatherBar.innerHTML = `
      <div>📍 <strong>كرمسين:</strong> <span id="kmTemp">جاري جلب الطقس...</span></div>
      <div id="kmAdvice" style="color:#fde68a; font-weight:bold;">🌱 تحليل الري...</div>
    `;
    document.body.insertBefore(weatherBar, document.body.firstChild);

    // جلب الطقس الحقيقي لإحداثيات كرمسين (16.54, -16.23)
    fetch('https://open-meteo.com')
      .then(r => r.json())
      .then(data => {
        if (data && data.current_weather) {
          const temp = data.current_weather.temperature;
          const wind = data.current_weather.windspeed;
          document.getElementById('kmTemp').innerText = `${temp}°C | رياح ${wind} كم/س`;
          let advice = '💧 ري اعتيادي صباحاً';
          if (temp >= 36) advice = '🔥 حرارة عالية: زد وقت الري بالتنقيط';
          else if (wind >= 25) advice = '💨 رياح نشطة: تجنب الرش الورقي اليوم';
          document.getElementById('kmAdvice').innerText = advice;
        }
      })
      .catch(() => {
        document.getElementById('kmTemp').innerText = 'مناخ زراعي معتدل';
        document.getElementById('kmAdvice').innerText = '💧 الري الصباحي مفضل';
      });

    // 2. زر مركز القيادة والأرشيف (Pro Dashboard)
    const proBtn = document.createElement('button');
    proBtn.innerHTML = '📊 الإدارة الذكية';
    proBtn.style.cssText = 'position:fixed; bottom:126px; left:16px; z-index:9998; background:#0f172a; color:#fde68a; border:2px solid #d97706; border-radius:25px; padding:9px 16px; font-weight:bold; font-size:13px; box-shadow:0 4px 12px rgba(0,0,0,0.3); cursor:pointer; font-family:inherit;';
    document.body.appendChild(proBtn);

    // 3. نافذة مركز القيادة (الإحصائيات + أرشيف الفواتير + مشاركة واتساب + النسخ الاحتياطي)
    const proModal = document.createElement('div');
    proModal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:10000; overflow-y:auto; padding:16px; direction:rtl;';
    document.body.appendChild(proModal);

    // اعتراض وحفظ الفواتير تلقائياً في الأرشيف عند تصديرها
    const origSaveFile = window.saveNativeBase64File;
    if (origSaveFile) {
      window.saveNativeBase64File = async function(base64Data, cleanName) {
        if (cleanName && cleanName.startsWith('INV-')) {
          const archive = JSON.parse(localStorage.getItem('sme_invoices_archive') || '[]');
          const clientEl = document.getElementById('invClient');
          const totalEl = document.getElementById('invTotal');
          archive.unshift({
            id: cleanName.replace('.pdf', ''),
            client: clientEl ? (clientEl.value || 'عميل نقدي') : 'عميل',
            total: totalEl ? totalEl.innerText : '0',
            date: new Date().toLocaleDateString('ar-EG'),
            base64: base64Data
          });
          localStorage.setItem('sme_invoices_archive', JSON.stringify(archive.slice(0, 50)));
        }
        return await origSaveFile.apply(this, arguments);
      };
    }

    const renderProDashboard = () => {
      const archive = JSON.parse(localStorage.getItem('sme_invoices_archive') || '[]');
      let totalSales = 0;
      archive.forEach(inv => {
        const num = parseFloat(String(inv.total).replace(/,/g, ''));
        if (!isNaN(num)) totalSales += num;
      });

      proModal.innerHTML = `
        <div style="background:#fff; border-radius:16px; max-width:520px; margin:15px auto; padding:20px; box-shadow:0 15px 35px rgba(0,0,0,0.4); color:#1e293b;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #1a3622; padding-bottom:12px; margin-bottom:16px;">
            <div>
              <h3 style="margin:0; color:#1a3622; font-size:18px;">📊 مركز القيادة والأرشيف (SME Pro)</h3>
              <span style="font-size:11px; color:#64748b;">تحليلات المبيعات، الأرشيف، والنسخ الاحتياطي</span>
            </div>
            <button id="closeProModal" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:6px 12px; font-weight:bold; cursor:pointer;">✕</button>
          </div>

          <!-- بطاقات الأداء المالي KPIs -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px;">
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:12px; border-radius:12px; text-align:center;">
              <div style="font-size:12px; color:#065f46; font-weight:bold;">إجمالي مبيعات الفواتير</div>
              <div style="font-size:20px; font-weight:bold; color:#1a3622; margin-top:4px;">${totalSales.toLocaleString()} <span style="font-size:12px;">MRU</span></div>
            </div>
            <div style="background:#fef3c7; border:1px solid #fde68a; padding:12px; border-radius:12px; text-align:center;">
              <div style="font-size:12px; color:#92400e; font-weight:bold;">عدد الفواتير المؤرشفة</div>
              <div style="font-size:20px; font-weight:bold; color:#d97706; margin-top:4px;">${archive.length} <span style="font-size:12px;">فاتورة</span></div>
            </div>
          </div>

          <!-- قسم أرشيف الفواتير -->
          <div style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#1a3622; font-size:14px;">🗂️ سجل الفواتير المحفوظة:</strong>
              <button id="shareSummaryWa" style="background:#16a34a; color:#fff; border:none; border-radius:8px; padding:5px 10px; font-size:12px; font-weight:bold; cursor:pointer;">📲 إرسال ملخص واتساب</button>
            </div>
            <div style="max-height:220px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:10px; padding:8px; background:#f8fafc;">
              ${archive.length === 0 ? '<div style="text-align:center; color:#94a3b8; padding:20px; font-size:13px;">لا توجد فواتير مصدرة بعد. عند تصدير أي فاتورة ستظهر هنا تلقائياً!</div>' : 
                archive.map((inv, idx) => `
                  <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <div style="font-weight:bold; color:#1a3622; font-size:13px;">${inv.id} - ${inv.client}</div>
                      <div style="font-size:11px; color:#64748b;">📅 ${inv.date} | 💰 <strong>${inv.total} MRU</strong></div>
                    </div>
                    <div style="display:flex; gap:5px;">
                      <button class="re-export-btn" data-idx="${idx}" style="background:#d97706; color:#fff; border:none; border-radius:6px; padding:5px 8px; font-size:11px; font-weight:bold; cursor:pointer;">📄 PDF</button>
                      <button class="wa-inv-btn" data-idx="${idx}" style="background:#16a34a; color:#fff; border:none; border-radius:6px; padding:5px 8px; font-size:11px; font-weight:bold; cursor:pointer;">واتساب</button>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>

          <!-- أدوات النسخ الاحتياطي للبيانات -->
          <div style="background:#f1f5f9; padding:12px; border-radius:10px; border:1px solid #cbd5e1;">
            <div style="font-weight:bold; font-size:13px; color:#1e293b; margin-bottom:8px;">🛡️ حماية البيانات والنسخ الاحتياطي:</div>
            <button id="exportBackupBtn" style="width:100%; background:#1a3622; color:#fff; border:none; border-radius:8px; padding:10px; font-size:13px; font-weight:bold; cursor:pointer;">💾 تصدير نسخة احتياطية كاملة لبيانات التطبيق</button>
          </div>
        </div>
      `;

      document.getElementById('closeProModal').onclick = () => { proModal.style.display = 'none'; };

      // مشاركة ملخص المبيعات عبر واتساب
      document.getElementById('shareSummaryWa').onclick = () => {
        const msg = `📊 *تقرير مبيعات SME Agri*\nعدد الفواتير: ${archive.length}\nإجمالي المبيعات: ${totalSales.toLocaleString()} MRU\n📍 موقع المزرعة: كرمسين، موريتانيا`;
        window.open(`https://wa.me{encodeURIComponent(msg)}`, '_blank');
      };

      // إعادة حفظ PDF من الأرشيف
      document.querySelectorAll('.re-export-btn').forEach(btn => {
        btn.onclick = async () => {
          const item = archive[btn.getAttribute('data-idx')];
          if (item && item.base64 && origSaveFile) {
            await origSaveFile(item.base64, item.id + '.pdf');
          }
        };
      });

      // مشاركة تفاصيل فاتورة محددة عبر واتساب
      document.querySelectorAll('.wa-inv-btn').forEach(btn => {
        btn.onclick = () => {
          const item = archive[btn.getAttribute('data-idx')];
          if (item) {
            const msg = `🧾 *فاتورة مبيعات - SME Agri*\nSociété Moulay Ely Pour Agricol\nرقم الفاتورة: ${item.id}\nالعميل: ${item.client}\nالتاريخ: ${item.date}\nالمبلغ الإجمالي: *${item.total} MRU*`;
            window.open(`https://wa.me{encodeURIComponent(msg)}`, '_blank');
          }
        };
      });

      // تصدير نسخة احتياطية شاملة لكل بيانات التطبيق
      document.getElementById('exportBackupBtn').onclick = async () => {
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          allData[k] = localStorage.getItem(k);
        }
        const jsonStr = JSON.stringify(allData, null, 2);
