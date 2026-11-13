(function() {
  const callNativeBiometric = async (reasonText) => {
    if (!window.Capacitor) throw new Error('بيئة التطبيق غير جاهزة');
    const plugins = window.Capacitor.Plugins || {};
    const bioKey = Object.keys(plugins).find(k => k.toLowerCase().includes('biometric'));
    const plugin = bioKey ? plugins[bioKey] : (window.Capacitor.registerPlugin ? window.Capacitor.registerPlugin('NativeBiometric') : null);
    if (!plugin) throw new Error('الإضافات المتاحة: ' + Object.keys(plugins).join(', '));
    if (plugin.verifyIdentity) {
      return await plugin.verifyIdentity({ reason: reasonText, title: 'التحقق بالبصمة', subtitle: 'SME Agri', description: reasonText });
    } else if (plugin.authenticate) {
      return await plugin.authenticate({ reason: reasonText, cancelTitle: 'إلغاء' });
    }
    throw new Error('دالة التحقق غير موجودة');
  };

  const bridge = {
    create: async (opts) => {
      await callNativeBiometric('تسجيل بصمة العامل');
      const fakeId = new Uint8Array();
      return { id: 'cap-bio-' + Date.now(), rawId: fakeId.buffer, type: 'public-key', response: { clientDataJSON: fakeId.buffer, attestationObject: fakeId.buffer }, getClientExtensionResults: () => ({}) };
    },
    get: async (opts) => {
      await callNativeBiometric('تأكيد الحضور والانصراف بالبصمة');
      const fakeId = new Uint8Array();
      return { id: 'cap-bio-auth', rawId: fakeId.buffer, type: 'public-key', response: { clientDataJSON: fakeId.buffer, authenticatorData: fakeId.buffer, signature: fakeId.buffer }, getClientExtensionResults: () => ({}) };
    }
  };

  if (!window.PublicKeyCredential) { window.PublicKeyCredential = function(){}; }
  window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => true;
  try { Object.defineProperty(navigator, 'credentials', { value: bridge, configurable: true }); } catch(e) { navigator.credentials = bridge; }

  window.saveNativeBase64File = async (base64Data, cleanName) => {
    try {
      const fs = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem;
      if (!fs) return false;
      await fs.writeFile({ path: cleanName, data: base64Data, directory: 'DOCUMENTS', recursive: true });
      alert('✅ تم حفظ الملف بنجاح في مجلد المستندات:\n' + cleanName);
      return true;
    } catch (err) {
      alert('⚠️ تعذر حفظ الملف: ' + err.message);
      return false;
    }
  };

  const saveNativeFile = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      const cleanName = filename || ('SME-Agri-' + Date.now() + '.pdf');
      return await window.saveNativeBase64File(base64Data, cleanName);
    } catch (err) {
      return false;
    }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.href && (a.hasAttribute('download') || a.href.startsWith('blob:') || a.href.startsWith('data:'))) {
      e.preventDefault();
      saveNativeFile(a.href, a.getAttribute('download'));
    }
  }, true);
})();
