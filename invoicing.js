// invoicing.js - نظام الفوترة والأرشيف لتطبيق SME Agri
class InvoicingManager {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('sme_invoices')) || [];
        this.init();
    }

    init() {
        this.renderModal();
    }

    renderModal() {
        let modal = document.getElementById('invoicing-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'invoicing-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div class="flex justify-between items-center border-b pb-4 mb-4">
                        <h2 class="text-xl font-bold text-green-800 flex items-center gap-2">
                            <span>🧾</span> نظام الفوترة والأرشيف الزراعي
                        </h2>
                        <button id="close-invoicing" class="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
                    </div>
                    
                    <div class="mb-6 bg-green-50 p-4 rounded-xl border border-green-200">
                        <h3 class="font-semibold text-green-900 mb-3">إصدار فاتورة جديدة</h3>
                        <form id="invoice-form" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" id="inv-client" placeholder="اسم العميل / المشتري" required class="p-2 border rounded-lg text-sm">
                            <input type="date" id="inv-date" required class="p-2 border rounded-lg text-sm">
                            <input type="text" id="inv-item" placeholder="اسم المحصول / المنتج" required class="p-2 border rounded-lg text-sm">
                            <input type="number" id="inv-amount" placeholder="المبلغ الإجمالي (MRU)" required class="p-2 border rounded-lg text-sm">
                            <select id="inv-status" class="p-2 border rounded-lg text-sm">
                                <option value="مدفوعة">مدفوعة</option>
                                <option value="معلقة">معلقة</option>
                            </select>
                            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-semibold text-sm transition">حفظ وإصدار الفاتورة</button>
                        </form>
                    </div>

                    <div>
                        <h3 class="font-semibold text-gray-800 mb-3">أرشيف الفواتير السابقة</h3>
                        <div id="invoices-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('close-invoicing').addEventListener('click', () => modal.remove());
            document.getElementById('invoice-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.addInvoice();
            });
        }
        this.renderInvoicesList();
    }

    addInvoice() {
        const client = document.getElementById('inv-client').value;
        const date = document.getElementById('inv-date').value;
        const item = document.getElementById('inv-item').value;
        const amount = document.getElementById('inv-amount').value;
        const status = document.getElementById('inv-status').value;

        const newInvoice = { id: Date.now(), client, date, item, amount, status };
        this.invoices.unshift(newInvoice);
        localStorage.setItem('sme_invoices', JSON.stringify(this.invoices));
        document.getElementById('invoice-form').reset();
        this.renderInvoicesList();
        alert('تم حفظ الفاتورة بنجاح في أرشيف النظام!');
    }

    renderInvoicesList() {
        const listContainer = document.getElementById('invoices-list');
        if (!listContainer) return;

        if (this.invoices.length === 0) {
            listContainer.innerHTML = `<p class="text-gray-500 text-center py-4 text-sm">لا توجد فواتير مسجلة حتى الآن.</p>`;
            return;
        }

        listContainer.innerHTML = this.invoices.map(inv => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border text-sm">
                <div>
                    <span class="font-bold text-gray-800">${inv.client}</span> - <span class="text-green-700">${inv.item}</span>
                    <div class="text-xs text-gray-500">${inv.date} | الحالة: <span class="${inv.status === 'مدفوعة' ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}">${inv.status}</span></div>
                </div>
                <div class="text-right">
                    <span class="font-bold text-gray-900">${inv.amount} MRU</span>
                    <button onclick="window.invoicingManager.deleteInvoice(${inv.id})" class="text-red-500 hover:text-red-700 ml-2 text-xs">حذف</button>
                </div>
            </div>
        `).join('');
    }

    deleteInvoice(id) {
        this.invoices = this.invoices.filter(inv => inv.id !== id);
        localStorage.setItem('sme_invoices', JSON.stringify(this.invoices));
        this.renderInvoicesList();
    }
}

window.invoicingManager = null;
export function openInvoicing() {
    if (!window.invoicingManager) {
        window.invoicingManager = new InvoicingManager();
    } else {
        window.invoicingManager.renderModal();
    }
}
