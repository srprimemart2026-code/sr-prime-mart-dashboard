let products = JSON.parse(localStorage.getItem('sr_products')) || [
    { id: 101, name: "Men's Bar Bracelet (Black/Silver)", price: 650, stock: 25 },
    { id: 102, name: "Premium Leather Wallet", price: 850, stock: 15 }
];

let orders = JSON.parse(localStorage.getItem('sr_orders_v2')) || [
    { id: 1, name: "রাকিব হাসান", phone: "01711000000", address: "মিরপুর-১০, ঢাকা", product: "Men's Bar Bracelet (Black/Silver)", qty: 1, total: 650, courier: "Pathao Courier", source: "Facebook Page", status: "Delivered" },
    { id: 2, name: "তানভীর আহমেদ", phone: "01812000000", address: "আগ্রাবাদ, চট্টগ্রাম", product: "Premium Leather Wallet", qty: 1, total: 850, courier: "Steadfast Courier", source: "Website", status: "Pending" }
];

window.onload = function() {
    const savedKey = localStorage.getItem('sr_gemini_key');
    if (!savedKey) {
        document.getElementById('apiModal').style.display = 'flex';
    } else {
        updateKeyStatus(true);
        document.getElementById('geminiApiKey').value = savedKey;
    }
    renderAll();
};

function activateAI() {
    const key = document.getElementById('initialApiKey').value.trim();
    if (!key) return alert('দয়া করে আপনার API Key পেস্ট করুন!');
    localStorage.setItem('sr_gemini_key', key);
    document.getElementById('geminiApiKey').value = key;
    document.getElementById('apiModal').style.display = 'none';
    updateKeyStatus(true);
    alert('অভিনন্দন! আপনার AI অটো-রিপ্লাই বট সক্রিয় হয়েছে।');
}

function openModal() { document.getElementById('apiModal').style.display = 'flex'; }
function closeModal() { document.getElementById('apiModal').style.display = 'none'; }

function updateKeyStatus(isConnected) {
    const badge = document.getElementById('aiStatusBadge');
    if (isConnected) {
        badge.className = 'badge badge-delivered';
        badge.innerText = '● Gemini AI কানেক্টেড';
    }
}

function switchTab(tabId, element) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

function renderAll() {
    const prodSelect = document.getElementById('prodSelect');
    const productsTable = document.getElementById('productsTable');
    prodSelect.innerHTML = '';
    productsTable.innerHTML = '';
    let totalStock = 0;

    products.forEach((p, idx) => {
        totalStock += Number(p.stock);
        prodSelect.innerHTML += `<option value="${idx}">${p.name} - ৳${p.price} (স্টক: ${p.stock})</option>`;
        
        const stockBadge = p.stock > 5 
            ? `<span class="badge badge-delivered">${p.stock} টি আছে</span>` 
            : `<span class="badge badge-danger">লো স্টক (${p.stock} টি)</span>`;
            
        productsTable.innerHTML += `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>৳ ${p.price}</td>
                <td>${stockBadge}</td>
                <td>
                    <button style="padding:4px 8px; font-size:12px;" onclick="restockProduct(${idx})">+৫ স্টক</button>
                    <button style="padding:4px 8px; font-size:12px; background:var(--danger);" onclick="deleteProduct(${idx})">মুছুন</button>
                </td>
            </tr>
        `;
    });

    const allTable = document.getElementById('allOrdersTable');
    allTable.innerHTML = '';
    let totalSales = 0;
    let pendingCount = 0;

    orders.forEach((o, index) => {
        totalSales += Number(o.total);
        if (o.status === 'Pending') pendingCount++;
        let badgeClass = o.status === 'Delivered' ? 'badge-delivered' : (o.status === 'Shipped' ? 'badge-shipped' : 'badge-pending');

        allTable.innerHTML += `
            <tr>
                <td><strong>${o.name}</strong><br><small style="color:var(--primary)">${o.source}</small></td>
                <td>${o.phone}<br><small>${o.address}</small></td>
                <td>${o.product} (x${o.qty})</td>
                <td>৳ ${o.total}</td>
                <td>${o.courier}</td>
                <td><span class="badge ${badgeClass}">${o.status}</span></td>
                <td>
                    <button style="padding: 4px 8px; font-size: 12px; background: var(--success);" onclick="updateStatus(${index})">স্ট্যাটাস</button>
                    <button style="padding: 4px 8px; font-size: 12px; background: var(--danger);" onclick="deleteOrder(${index})">মুছুন</button>
                </td>
            </tr>
        `;
    });

    document.getElementById('totalOrders').innerText = orders.length;
    document.getElementById('totalSales').innerText = '৳ ' + totalSales;
    document.getElementById('pendingOrders').innerText = pendingCount;
    document.getElementById('totalStock').innerText = totalStock;

    localStorage.setItem('sr_products', JSON.stringify(products));
    localStorage.setItem('sr_orders_v2', JSON.stringify(orders));
}

function addProduct() {
    const name = document.getElementById('newProdName').value.trim();
    const price = Number(document.getElementById('newProdPrice').value);
    const stock = Number(document.getElementById('newProdStock').value);
    if (!name || !price) return alert('প্রোডাক্টের নাম ও দাম দিন!');
    products.push({ id: Date.now(), name, price, stock: stock || 0 });
    document.getElementById('newProdName').value = '';
    document.getElementById('newProdPrice').value = '';
    document.getElementById('newProdStock').value = '';
    renderAll();
}

function restockProduct(idx) { products[idx].stock += 5; renderAll(); }
function deleteProduct(idx) { if (confirm('মুছে ফেলবেন?')) { products.splice(idx, 1); renderAll(); } }

function addOrder() {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const prodIdx = document.getElementById('prodSelect').value;
    const qty = Number(document.getElementById('prodQty').value) || 1;
    const courier = document.getElementById('courierName').value;
    const source = document.getElementById('orderSource').value;
    const status = document.getElementById('orderStatus').value;

    if (!name || !phone || !address) return alert('সব তথ্য পূরণ করুন!');
    const selectedProd = products[prodIdx];
    if (selectedProd.stock >= qty) selectedProd.stock -= qty;

    orders.unshift({
        id: Date.now(), name, phone, address,
        product: selectedProd.name, qty,
        total: selectedProd.price * qty, courier, source, status
    });

    document.getElementById('custName').value = '';
    document.getElementById('custPhone').value = '';
    document.getElementById('custAddress').value = '';
    renderAll();
    alert('অর্ডার সেভ হয়েছে!');
}

function updateStatus(index) {
    const statuses = ['Pending', 'Shipped', 'Delivered'];
    orders[index].status = statuses[(statuses.indexOf(orders[index].status) + 1) % statuses.length];
    renderAll();
}

function deleteOrder(index) { if (confirm('মুছে ফেলবেন?')) { orders.splice(index, 1); renderAll(); } }

function copyText(id) {
    const el = document.getElementById(id);
    el.select();
    navigator.clipboard.writeText(el.value);
    alert('কপি হয়েছে!');
}

function saveApiKey() {
    const key = document.getElementById('geminiApiKey').value.trim();
    localStorage.setItem('sr_gemini_key', key);
    updateKeyStatus(true);
    alert('API Key আপডেট হয়েছে!');
}

function exportData() {
    const blob = new Blob([JSON.stringify({ orders, products }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'SR_PRIME_MART_Backup.json';
    a.click();
}

function appendMsg(boxId, text, isUser = false) {
    const box = document.getElementById(boxId);
    const div = document.createElement('div');
    div.className = isUser ? 'msg msg-user' : 'msg msg-ai';
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function quickCommand(cmd) {
    document.getElementById('aiInput').value = cmd;
    sendToAI();
}

// AI Assistant Chat Handler
async function sendToAI() {
    const input = document.getElementById('aiInput');
    const prompt = input.value.trim();
    if (!prompt) return;

    appendMsg('chatBox', prompt, true);
    input.value = '';

    const apiKey = localStorage.getItem('sr_gemini_key');
    if (!apiKey) {
        openModal();
        return appendMsg('chatBox', 'দয়া করে পপআপ বক্সে আপনার Gemini API Key পেস্ট করুন।', false);
    }

    try {
        const businessContext = `You are the AI Business Manager for 'S.R. PRIME MART', an e-commerce business in Bangladesh owned by Shakib Ahmad. Logistics: Pathao & Steadfast Courier. Currency: BDT. Products: ${JSON.stringify(products)}. Orders: ${JSON.stringify(orders)}. Answer in helpful, natural Bengali. Command: ${prompt}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: businessContext }] }] })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'কোনো উত্তর পাওয়া যায়নি।';
        appendMsg('chatBox', reply, false);
    } catch (err) {
        appendMsg('chatBox', 'নেটওয়ার্ক সমস্যা হয়েছে।', false);
    }
}

// Customer Auto-Reply Bot Handler
function clearBotChat() {
    document.getElementById('botChatBox').innerHTML = '<div class="msg msg-ai">🤖 অটো-রিপ্লাই বট চ্যাট রিসেট করা হয়েছে। কাস্টমারের মেসেজ লিখে টেস্ট করুন।</div>';
}

async function testAutoReply() {
    const input = document.getElementById('customerMsgInput');
    const customerMsg = input.value.trim();
    if (!customerMsg) return;

    appendMsg('botChatBox', customerMsg, true);
    input.value = '';

    const apiKey = localStorage.getItem('sr_gemini_key');
    if (!apiKey) {
        openModal();
        return appendMsg('botChatBox', 'দয়া করে প্রথমে আপনার Gemini API Key সেট করুন।', false);
    }

    try {
        const botPrompt = `You are the automated customer service chatbot for 'S.R. PRIME MART' (an e-commerce store in Bangladesh owned by Shakib Ahmad). 
        Current product catalog & prices: ${JSON.stringify(products)}. 
        Delivery Info: Inside Dhaka delivery charge 70 BDT (24-48 hours), Outside Dhaka 130 BDT (48-72 hours) via Pathao and Steadfast Courier. Cash on delivery available.
        A customer just sent this message in inbox: "${customerMsg}".
        Act as a polite, professional e-commerce auto-reply chatbot. Give a direct, friendly, and helpful reply in natural Bengali, asking for their name, address, and phone number to confirm the order if they want to buy.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: botPrompt }] }] })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'আসসালামু আলাইকুম! S.R. PRIME MART-এ আপনাকে স্বাগতম। আপনার অর্ডারটি কনফার্ম করতে আপনার নাম, ঠিকানা ও ফোন নম্বর দিন।';
        appendMsg('botChatBox', reply, false);
    } catch (err) {
        appendMsg('botChatBox', 'অটো-রিপ্লাই দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', false);
    }
}
