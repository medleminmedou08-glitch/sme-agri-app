(function() {
  window.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'ar';
    const texts = {
      ar: {
        dir: 'rtl',
        btnFloat: '🧾 الفوترة',
        title: '🧾 إنشاء وتصدير فاتورة',
        langSwitch: 'Français 🇫🇷',
        compAddrPh: 'العنوان (كرمسين، ولاية اترارزة، موريتانيا)',
        compPhonePh: 'هاتف الشركة / السجل التجاري',
        defaultAddr: 'كرمسين، ولاية اترارزة - موريتانيا',
        clientLabel: 'اسم العميل / المشتري:',
        clientPh: 'مثال: شركة التوريد الزراعي',
        defaultClient: 'عميل نقدي',
        invNumLabel: 'رقم الفاتورة:',
        dateLabel: 'التاريخ:',
        addItemTitle: 'إضافة صنف / محصول:',
        itemNamePh: 'اسم المحصول (مثال: بطيخ أحمر)',
        itemQtyPh: 'الكمية',
        itemPricePh: 'السعر',
        addBtn: '+ إضافة',
        thItem: 'الصنف',
        thQty: 'الكمية',
        thPrice: 'السعر',
        thSub: 'المجموع',
        totalLabel: 'الإجمالي الكلي:',
        exportBtn: '📄 تصدير وحفظ الفاتورة (PDF)',
        errInput: 'يرجى إدخال اسم الصنف والكمية والسعر بشكل صحيح',
        errEmpty: 'أضف صنفاً واحداً على الأقل قبل التصدير',
        pdfSubtitle: 'الإنتاج الزراعي والتسويق - كرمسين، موريتانيا',
        pdfBillTo: 'فاتورة إلى:',
        pdfInvNo: 'رقم الفاتورة:',
        pdfDate: 'التاريخ:',
        pdfThDesc: 'البيان / الصنف',
        pdfThUnit: 'سعر الوحدة',
        pdfTotalDue: 'المبلغ الإجمالي المستحق:',
        pdfSign: 'توقيع وختم الإدارة',
        pdfFooter: 'SME Agri - Société Moulay Ely Pour Agricol | شكراً لتعاملكم معنا'
      },
      fr: {
        dir: 'ltr',
        btnFloat: '🧾 Facturation',
        title: '🧾 Créer et Exporter Facture',
        langSwitch: 'العربية 🇸🇦',
        compAddrPh: 'Adresse (Keur Macène, Trarza, Mauritanie)',
        compPhonePh: 'Téléphone / NIF / RC',
        defaultAddr: 'Keur Macène, Wilaya du Trarza - Mauritanie',
        clientLabel: 'Nom du Client / Acheteur :',
        clientPh: 'Ex: Société Agro Distribution',
        defaultClient: 'Client Comptant',
        invNumLabel: 'N° de Facture :',
        dateLabel: 'Date :',
        addItemTitle: 'Ajouter un Produit / Récolte :',
        itemNamePh: 'Nom du produit (Ex: Pastèque)',
        itemQtyPh: 'Quantité',
        itemPricePh: 'Prix Unitaire',
        addBtn: '+ Ajouter',
        thItem: 'Désignation',
        thQty: 'Qté',
        thPrice: 'P.U',
        thSub: 'Total',
        totalLabel: 'Total Général :',
        exportBtn: '📄 Exporter la Facture (PDF)',
        errInput: 'Veuillez saisir le produit, la quantité et le prix',
        errEmpty: 'Veuillez ajouter au moins un article avant d’exporter',
        pdfSubtitle: 'Production et Commercialisation Agricole - Keur Macène, Mauritanie',
        pdfBillTo: 'Facturé à :',
        pdfInvNo: 'Facture N° :',
        pdfDate: 'Date :',
        pdfThDesc: 'Désignation / Produit',
        pdfThUnit: 'Prix Unitaire',
        pdfTotalDue: 'Montant Total à Payer :',
        pdfSign: 'Cachet et Signature de la Direction',
        pdfFooter: 'SME Agri - Société Moulay Ely Pour Agricol | Merci de votre confiance'
      }
    };

    const invBtn = document.createElement('button');
    invBtn.innerHTML = texts.ar.btnFloat;
    invBtn.style.cssText = 'position:fixed; bottom:78px; left:16px; z-index:9998; background:#d97706; color:#fff; border:none; border-radius:25px; padding:10px 18px; font-weight:bold; font-size:14px; box-shadow:0 4px 12px rgba(0,0,0,0.25); cursor:pointer; font-family:inherit;';
    document.body.appendChild(invBtn);

    const modal = document.createElement('div');
    modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:9999; overflow-y:auto; padding:16px;';
    document.body.appendChild(modal);

    let items = [];
    let savedClient = '';
    let savedCompAddr = localStorage.getItem('sme_comp_addr') || '';
    let savedCompPhone = localStorage.getItem('sme_comp_phone') || '';
    let savedInvNum = 'INV-' + Math.floor(1000 + Math.random()*9000);
    let savedDate = new Date().toISOString().split('T')[0];

    const renderModal = () => {
      const t = texts[currentLang];
      const alignStart = t.dir === 'rtl' ? 'right' : 'left';
      const alignEnd = t.dir === 'rtl' ? 'left' : 'right';

      modal.style.direction = t.dir;
      modal.innerHTML = `
        <div style="background:#fff; border-radius:16px; max-width:500px; margin:20px auto; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.3); color:#1e293b;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #1a3622; padding-bottom:10px; margin-bottom:12px;">
            <h3 style="margin:0; color:#1a3622; font-size:17px;">${t.title}</h3>
            <div style="display:flex; gap:6px;">
              <button id="toggleInvLang" style="background:#1a3622; color:#fff; border:none; border-radius:8px; padding:5px 10px; font-size:12px; font-weight:bold; cursor:pointer;">${t.langSwitch}</button>
              <button id="closeInvModal" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:5px 10px; font-weight:bold; cursor:pointer;">✕</button>
            </div>
          </div>

          <div style="background:#ecfdf5; padding:10px; border-radius:10px; border:1px solid #a7f3d0; margin-bottom:12px;">
            <div style="font-weight:bold; font-size:12px; color:#1a3622; margin-bottom:6px;">🏢 SME Agri - Société Moulay Ely Pour Agricol</div>
            <input id="compAddr" type="text" value="${savedCompAddr}" placeholder="${t.compAddrPh}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:6px; font-size:12px; box-sizing:border-box;">
            <input id="compPhone" type="text" value="${savedCompPhone}" placeholder="${t.compPhonePh}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:12px;">
            <label style="display:block; font-size:13px; font-weight:bold; margin-bottom:4px;">${t.clientLabel}</label>
            <input id="invClient" type="text" value="${savedClient}" placeholder="${t.clientPh}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;">
          </div>

          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <div style="flex:1;">
              <label style="display:block; font-size:13px; font-weight:bold; margin-bottom:4px;">${t.invNumLabel}</label>
              <input id="invNum" type="text" value="${savedInvNum}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;">
            </div>
            <div style="flex:1;">
              <label style="display:block; font-size:13px; font-weight:bold; margin-bottom:4px;">${t.dateLabel}</label>
              <input id="invDate" type="date" value="${savedDate}" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px; box-sizing:border-box;">
            </div>
          </div>

          <div style="background:#f8fafc; padding:10px; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:12px;">
            <div style="font-weight:bold; font-size:13px; color:#1a3622; margin-bottom:8px;">${t.addItemTitle}</div>
            <input id="itemName" type="text" placeholder="${t.itemNamePh}" style="width:100%; padding:7px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:6px; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
              <input id="itemQty" type="number" placeholder="${t.itemQtyPh}" style="flex:1; padding:7px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
              <input id="itemPrice" type="number" placeholder="${t.itemPricePh}" style="flex:1; padding:7px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
              <button id="addItemBtn" style="background:#1a3622; color:#fff; border:none; border-radius:6px; padding:0 12px; font-weight:bold; cursor:pointer;">${t.addBtn}</button>
            </div>
          </div>

          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:12px;">
            <thead>
              <tr style="background:#1a3622; color:#fff;">
                <th style="padding:6px; text-align:${alignStart};">${t.thItem}</th>
                <th style="padding:6px; text-align:center;">${t.thQty}</th>
                <th style="padding:6px; text-align:center;">${t.thPrice}</th>
                <th style="padding:6px; text-align:${alignEnd};">${t.thSub}</th>
              </tr>
            </thead>
            <tbody id="invItemsBody"></tbody>
          </table>

          <div style="background:#fef3c7; padding:10px; border-radius:8px; text-align:${alignEnd}; font-weight:bold; font-size:16px; color:#92400e; margin-bottom:15px;">
            ${t.totalLabel} <span id="invTotal">0</span> MRU
          </div>

          <button id="exportInvPdfBtn" style="width:100%; background:#16a34a; color:#fff; border:none; border-radius:10px; padding:12px; font-size:15px; font-weight:bold; cursor:pointer;">${t.exportBtn}</button>
        </div>
      `;

      const renderItems = () => {
        const tbody = document.getElementById('invItemsBody');
        tbody.innerHTML = '';
        let total = 0;
        items.forEach((it) => {
          const sub = it.qty * it.price;
          total += sub;
          tbody.innerHTML += `<tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:6px; text-align:${alignStart};">${it.name}</td>
            <td style="padding:6px; text-align:center;">${it.qty}</td>
            <td style="padding:6px; text-align:center;">${it.price}</td>
            <td style="padding:6px; text-align:${alignEnd}; font-weight:bold;">${sub.toLocaleString()}</td>
          </tr>`;
        });
