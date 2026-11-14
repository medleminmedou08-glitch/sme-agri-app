// pro-upgrade.js - إدارة الأقساط وواجهة البرمجيات (API)
class ProUpgradeManager {
    constructor() {
        this.installments = JSON.parse(localStorage.getItem('sme_installments')) || [];
        this.init();
    }

    init() {
        this.renderModal();
    }

    renderModal() {
        let modal = document.getElementById('pro-upgrade-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pro-upgrade-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div class="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 class="text-xl font-bold text-amber-800 flex items-center gap-2">
                            <span>💳</span> إدارة الأقساط وواجهة البرمجيات (API)
                        </h2>
                        <button id="close-pro" class="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                    </div>

                    <div class="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <h3 class="font-semibold text-amber-900 mb-3">تسجيل قسط زراعي جديد</h3>
                        <form id="installment-form" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" id="ins-debtor" placeholder="اسم المورد / المقترض" required class="p-2 border rounded-lg text-sm">
                            <input type="date" id="ins-duedate" required class="p-2 border rounded-lg text-sm">
                            <input type="number" id="ins-amount" placeholder="مبلغ القسط (MRU)" required class="p-2 border rounded-lg text-sm">
                            <select id="ins-status" class="p-2 border rounded-lg text-sm">
                                <option value="معلق">قسط معلق</option>
                                <option value="مسدد">تم السداد</option>
                            </select>
                            <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg font-semibold text-sm transition">حفظ القسط</button>
                        </form>
                    </div>

                    <div class="mb-6">
                        <h3 class="font-semibold text-gray-800 mb-3">متابعة الأقساط المستحقة</h3>
                        <div id="installments-list" class="space-y-2 max-h-40 overflow-y-auto"></div>
                    </div>

                    <div class="border-t pt-4">
                        <h3 class="font-semibold text-gray-800 mb-2">إعدادات واجهة البرمجيات (API / Webhook)</h3>
                        <div class="flex gap-2">
                            <input type="text" readonly value="https://api.sme-agri.mr/v1/sync" class="p-2 border rounded-lg text-xs bg-gray-100 flex-1">
                            <button onclick="alert('تم نسخ مفتاح الربط وتحديث حالة الـ API بنجاح!')" class="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-semibold">نسخ الرمز</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('close-pro').addEventListener('click', () => modal.remove());
            document.getElementById('installment-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.addInstallment();
            });
        }
        this.renderInstallmentsList();
    }

    addInstallment() {
        const debtor = document.getElementById('ins-debtor').value;
        const duedate = document.getElementById('ins-duedate').value;
        const amount = document.getElementById('ins-amount').value;
        const status = document.getElementById('ins-status').value;

        const newIns = { id: Date.now(), debtor, duedate, amount, status };
        this.installments.unshift(newIns);
        localStorage.setItem('sme_installments', JSON.stringify(this.installments));
        document.getElementById('installment-form').reset();
        this.renderInstallmentsList();
        alert('تم إضافة القسط بنجاح!');
    }

    renderInstallmentsList() {
        const listContainer = document.getElementById('installments-list');
        if (!listContainer) return;

        if (this.installments.length === 0) {
            listContainer.innerHTML = `<p class="text-gray-500 text-center py-2 text-sm">لا توجد أقساط مسجلة.</p>`;
            return;
        }

        listContainer.innerHTML = this.installments.map(ins => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border text-sm">
                <div>
                    <span class="font-bold text-gray-800">${ins.debtor}</span>
                    <div class="text-xs text-gray-500">استحقاق: ${ins.duedate} | الحالة: <span class="${ins.status === 'مسدد' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}">${ins.status}</span></div>
                </div>
                <div class="text-right">
                    <span class="font-bold text-gray-900">${ins.amount} MRU</span>
                    <button onclick="window.proUpgradeManager.deleteInstallment(${ins.id})" class="text-red-500 hover:text-red-700 ml-2 text-xs">حذف</button>
                </div>
            </div>
        `).join('');
    }

    deleteInstallment(id) {
        this.installments = this.installments.filter(ins => ins.id !== id);
        localStorage.setItem('sme_installments', JSON.stringify(this.installments));
        this.renderInstallmentsList();
    }
}

window.proUpgradeManager = null;
export function openProUpgrade() {
    if (!window.proUpgradeManager) {
        window.proUpgradeManager = new ProUpgradeManager();
    } else {
        window.proUpgradeManager.renderModal();
    }
}
