import { openInvoicing } from './invoicing.js';
import { openProUpgrade } from './pro-upgrade.js';
import { openFieldsMap } from './fields-map.js';
import { openAiAssistant } from './ai-assistant.js';

// ربط أزرار أدوات SME Pro بالوظائف الفعلية
document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-invoicing')) {
        openInvoicing();
    } else if (e.target.closest('#btn-installments-api')) {
        openProUpgrade();
    } else if (e.target.closest('#btn-fields-map')) {
        openFieldsMap();
    } else if (e.target.closest('#btn-ai-assistant')) {
        openAiAssistant();
    }
});
