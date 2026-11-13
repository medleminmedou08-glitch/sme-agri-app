(function() {
  window.addEventListener('DOMContentLoaded', () => {
    // 1. زر المساعد الذكي العائم في أسفل يمين الشاشة
    const aiBtn = document.createElement('button');
    aiBtn.innerHTML = '🤖 المساعد الذكي';
    aiBtn.style.cssText = 'position:fixed; bottom:78px; right:16px; z-index:9998; background:#1a3622; color:#fff; border:2px solid #d97706; border-radius:25px; padding:10px 18px; font-weight:bold; font-size:14px; box-shadow:0 4px 12px rgba(0,0,0,0.25); cursor:pointer; font-family:inherit;';
    document.body.appendChild(aiBtn);

    // 2. نافذة المحادثة الذكية
    const modal = document.createElement('div');
    modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:9999; padding:16px; direction:rtl;';
    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; max-width:500px; height:82vh; margin:15px auto; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.3); color:#1e293b;">
        
        <div style="background:#1a3622; color:#fff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #d97706;">
          <div>
            <h3 style="margin:0; font-size:16px;">🤖 مستشار SME Agri الذكي</h3>
            <span style="font-size:11px; color:#fde68a;">خبير الزراعة وإدارة المزارع (عربي / Français)</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button id="toggleApiKeyBtn" title="إعداد مفتاح الذكاء الاصطناعي" style="background:#d97706; color:#fff; border:none; border-radius:8px; padding:5px 8px; font-size:12px; cursor:pointer;">🔑 API</button>
            <button id="closeAiModal" style="background:#ef4444; color:#fff; border:none; border-radius:8px; padding:5px 10px; font-weight:bold; cursor:pointer;">✕</button>
          </div>
        </div>

        <div id="apiKeyBox" style="display:none; background:#fef3c7; padding:10px; border-bottom:1px solid #fcd34d; font-size:12px;">
          <div style="font-weight:bold; color:#92400e; margin-bottom:4px;">مفتاح Google Gemini API (اختياري للذكاء المتقدم):</div>
          <div style="display:flex; gap:6px;">
            <input id="geminiApiInput" type="password" placeholder="ألصق مفتاح AIzaSy... هنا" style="flex:1; padding:6px; border:1px solid #cbd5e1; border-radius:6px;">
            <button id="saveApiKeyBtn" style="background:#1a3622; color:#fff; border:none; border-radius:6px; padding:0 12px; font-weight:bold; cursor:pointer;">حفظ</button>
          </div>
        </div>

        <div id="aiChatBox" style="flex:1; padding:14px; overflow-y:auto; background:#f8fafc; display:flex; flex-direction:column; gap:10px;">
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#1a3622; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.5; align-self:flex-start; max-width:85%;">
            مرحباً بك في <strong>SME Agri</strong>! 🌱<br>
            أنا مساعدك الزراعي والإداري. يمكنك سؤالي عن:<br>
            • أمراض وآفات البطيخ الأحمر والشمام.<br>
            • برامج الري والتسميد المناسبة.<br>
            • حساب تكاليف العمالة أو تحليل الإنتاج.
          </div>
        </div>

        <div style="padding:8px 12px; background:#f1f5f9; display:flex; gap:6px; overflow-x:auto; border-top:1px solid #e2e8f0;">
          <button class="quick-q" style="white-space:nowrap; background:#fff; border:1px solid #cbd5e1; border-radius:15px; padding:5px 10px; font-size:11px; color:#1a3622; cursor:pointer;">🍉 تسميد البطيخ</button>
          <button class="quick-q" style="white-space:nowrap; background:#fff; border:1px solid #cbd5e1; border-radius:15px; padding:5px 10px; font-size:11px; color:#1a3622; cursor:pointer;">💧 برنامج الري</button>
          <button class="quick-q" style="white-space:nowrap; background:#fff; border:1px solid #cbd5e1; border-radius:15px; padding:5px 10px; font-size:11px; color:#1a3622; cursor:pointer;">🐛 مكافحة الآفات</button>
          <button class="quick-q" style="white-space:nowrap; background:#fff; border:1px solid #cbd5e1; border-radius:15px; padding:5px 10px; font-size:11px; color:#1a3622; cursor:pointer;">📊 نصيحة إدارية</button>
        </div>

        <div style="padding:10px; background:#fff; border-top:1px solid #e2e8f0; display:flex; gap:8px;">
          <input id="aiUserInput" type="text" placeholder="اكتب سؤالك هنا بالعربية أو الفرنسية..." style="flex:1; padding:10px; border:1px solid #cbd5e1; border-radius:10px; font-size:13px;">
          <button id="aiSendBtn" style="background:#d97706; color:#fff; border:none; border-radius:10px; padding:0 16px; font-weight:bold; font-size:14px; cursor:pointer;">إرسال</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const chatBox = document.getElementById('aiChatBox');
    const userInput = document.getElementById('aiUserInput');
    const apiBox = document.getElementById('apiKeyBox');
    const apiInput = document.getElementById('geminiApiInput');
    apiInput.value = localStorage.getItem('sme_gemini_key') || '';

    aiBtn.onclick = () => { modal.style.display = 'block'; };
    document.getElementById('closeAiModal').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('toggleApiKeyBtn').onclick = () => {
      apiBox.style.display = apiBox.style.display === 'none' ? 'block' : 'none';
    };
    document.getElementById('saveApiKeyBtn').onclick = () => {
      localStorage.setItem('sme_gemini_key', apiInput.value.trim());
      alert('✅ تم حفظ مفتاح الذكاء الاصطناعي بنجاح!');
      apiBox.style.display = 'none';
    };

    const addMessage = (text, isUser) => {
      const msg = document.createElement('div');
      msg.style.cssText = isUser
        ? 'background:#1a3622; color:#fff; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.5; align-self:flex-end; max-width:85%;'
        : 'background:#fff; border:1px solid #e2e8f0; color:#1e293b; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.6; align-self:flex-start; max-width:85%; white-space:pre-line;';
      msg.innerHTML = text;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
      return msg;
    };

    // مستشار زراعي مدمج يعمل فوراً حتى بدون مفتاح API
    const getBuiltInAdvice = (q) => {
      const text = q.toLowerCase();
      if (text.includes('تسميد') || text.includes('سماد') || text.includes('fertilis')) {
        return '🌱 <strong>برنامج تسميد البطيخ والشمام:</strong>\n1. <strong>مرحلة النمو الخضري:</strong> التركيز على النيتروجين والفوسفور (مثل NPK 20-20-20) لتقوية الجذور والأوراق.\n2. <strong>مرحلة التزهير والعقد:</strong> زيادة الفوسفور وعنصر البورون والكالسيوم لمنع تساقط الأزهار.\n3. <strong>مرحلة تحجيم الثمار:</strong> التركيز على البوتاسيوم (مثل سلفات البوتاسيوم) لزيادة حلاوة الثمار وصلابتها.';
      }
      if (text.includes('ري') || text.includes('ماء') || text.includes('سقي') || text.includes('arrosage')) {
        return '💧 <strong>توصيات الري في المناطق الحارة (كرمسين):</strong>\n• يُفضل الري بالتنقيط في الصباح الباكر أو قبل الغروب لتقليل التبخر.\n• تقليل كمية المياه تدريجياً عند بدء نضج ثمار البطيخ والشمام لزيادة تركيز السكر ومنع تشقق الثمار.';
      }
      if (text.includes('آفات') || text.includes('مرض') || text.includes('حشرات') || text.includes('دودة') || text.includes('maladie')) {
        return '🐛 <strong>الوقاية من الآفات الشائعة:</strong>\n• <strong>الذبابة البيضاء والمنّ:</strong> المراقبة الدورية أسفل الأوراق واستخدام المصائد الصفراء والمبيدات الجهازية المناسبة.\n• <strong>البياض الدقيقي:</strong> تجنب بلل الأوراق ليلاً واستخدام الكبريت الميكروني كإجراء وقائي.';
      }
      if (text.includes('إدار') || text.includes('نصيحة') || text.includes('عمال') || text.includes('ربح')) {
        return '📊 <strong>نصيحة إدارية لمزارع SME Agri:</strong>\n• تأكد من تسجيل حضور العمالة اليومية بالبصمة وربطها بموقع الحقل (GPS) لضبط التكاليف التشغيلية بدقة.\n• أصدر فواتير المبيعات فور خروج الشحنات من الحقل للحفاظ على تطابق المخزون مع الحسابات.';
      }
      return '🤖 لإجابات مفصلة ومخصصة لأي سؤال زراعي أو مالي، يمكنك إضافة مفتاح <strong>Google Gemini API</strong> المجاني عبر زر (🔑 API) في الأعلى، أو اختيار أحد المواضيع السريعة في الأسفل.';
    };

    const askAI = async (question) => {
      if (!question.trim()) return;
      addMessage(question, true);
      userInput.value = '';
      const loadingMsg = addMessage('⏳ جاري التفكير...', false);

      const apiKey = localStorage.getItem('sme_gemini_key');
      if (!apiKey) {
        setTimeout(() => {
          loadingMsg.innerHTML = getBuiltInAdvice(question);
        }, 500);
        return;
      }

      try {
        const prompt = `أنت مستشار زراعي وإداري خبير لشركة SME Agri (Société Moulay Ely Pour Agricol) المتخصصة في إنتاج البطيخ الأحمر والشمام والمحاصيل الزراعية في منطقة كرمسين بولاية اترارزة في موريتانيا. أجب باختصار واحترافية وبنفس لغة السؤال (العربية أو الفرنسية). السؤال: ${question}`;
        const response = await fetch(`https://googleapis.com{apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        if (data && data.candidates && data.candidates[0]) {
          loadingMsg.innerText = data.candidates[0].content.parts[0].text;
        } else {
          loadingMsg.innerHTML = getBuiltInAdvice(question);
        }
      } catch (err) {
        loadingMsg.innerHTML = getBuiltInAdvice(question);
      }
    };

    document.getElementById('aiSendBtn').onclick = () => askAI(userInput.value);
    userInput.onkeypress = (e) => { if (e.key === 'Enter') askAI(userInput.value); };
    document.querySelectorAll('.quick-q').forEach(btn => {
      btn.onclick = () => askAI(btn.innerText);
    });
  });
})();
