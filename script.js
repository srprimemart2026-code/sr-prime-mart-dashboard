let currentTab = "product-report";
let uploadedImageBase64 = null;
let uploadedImageMime = null;

const tabsGrid = document.getElementById("tabsGrid");
const dynamicFormArea = document.getElementById("dynamicFormArea");
const generateBtn = document.getElementById("generateBtn");
const resultBox = document.getElementById("resultBox");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const listenBtn = document.getElementById("listenBtn");
const savedCountEl = document.getElementById("savedCount");

// API Key Drawer Logic
const apiKeyToggleBtn = document.getElementById("apiKeyToggleBtn");
const apiKeyBox = document.getElementById("apiKeyBox");
const geminiApiKeyInput = document.getElementById("geminiApiKey");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const statusText = document.getElementById("statusText");

function updateStatus() {
  const key = localStorage.getItem("sr_gemini_key");
  if (key && key.trim().length > 10) {
    statusText.textContent = "Online – Live Vision AI Active (Auto-Model Ready)";
    geminiApiKeyInput.value = key;
  } else {
    statusText.textContent = "Online – Add Gemini API Key in '⚙️ AI Key' to analyze uploaded photos";
  }
}

apiKeyToggleBtn.addEventListener("click", () => {
  apiKeyBox.classList.toggle("hidden");
});

saveApiKeyBtn.addEventListener("click", () => {
  const val = geminiApiKeyInput.value.trim();
  localStorage.removeItem("sr_cached_gemini_model");
  if (val) {
    localStorage.setItem("sr_gemini_key", val);
  } else {
    localStorage.removeItem("sr_gemini_key");
  }
  updateStatus();
  apiKeyBox.classList.add("hidden");
});

// Saved Items Logic
function getSavedItems() {
  return JSON.parse(localStorage.getItem("sr_saved_items") || "[]");
}

function updateSavedCount() {
  savedCountEl.textContent = getSavedItems().length;
}

// Form Templates for All 10 Tabs
const tabForms = {
  "product-report": `
    <div class="form-group">
      <label>Upload a product photo (AI will analyze the photo & compare market prices)</label>
      <div class="file-wrapper">
        <input type="file" id="productPhoto" accept="image/*" />
      </div>
      <img id="photoPreview" class="preview-thumb" alt="Preview" />
    </div>
    <div class="form-group">
      <label>Extra hint (optional)</label>
      <input type="text" id="extraHint" class="input-control" placeholder="e.g. men’s, silver, stainless steel bracelet, about 20 cm" />
    </div>
    <div class="form-group">
      <label>Your selling price in BDT (optional)</label>
      <input type="number" id="sellingPrice" class="input-control" placeholder="e.g. 350" />
    </div>
  `,
  "market-analysis": `
    <div class="form-group">
      <label>Upload product photo for platform price comparison (optional)</label>
      <div class="file-wrapper">
        <input type="file" id="marketPhoto" accept="image/*" />
      </div>
      <img id="marketPhotoPreview" class="preview-thumb" alt="Preview" />
    </div>
    <div class="form-group">
      <label>Select Accessory Category or Product Name</label>
      <input type="text" id="categorySelect" class="input-control" placeholder="e.g. Men's Stainless Steel Chain Bracelet / Chronograph Watch" value="Men's Stainless Steel Bracelet" />
    </div>
    <div class="form-group">
      <label>Your Buying / Sourcing Cost in BDT (optional)</label>
      <input type="number" id="budgetRange" class="input-control" placeholder="e.g. 180" />
    </div>
  `,
  "which-first": `
    <div class="form-group">
      <label>Available Products in Your Stock (comma separated)</label>
      <input type="text" id="stockList" class="input-control" placeholder="e.g. Black steel bracelet, Silver ring, Leather watch" value="Black steel bracelet, Titanium ring, Casual leather watch" />
    </div>
    <div class="form-group">
      <label>Your Current Ad / Marketing Budget (BDT)</label>
      <input type="number" id="adBudget" class="input-control" placeholder="e.g. 1500" value="1500" />
    </div>
  `,
  "find-customers": `
    <div class="form-group">
      <label>Product Name</label>
      <input type="text" id="custProduct" class="input-control" placeholder="e.g. Men's Matte Black Stainless Steel Bracelet" />
    </div>
    <div class="form-group">
      <label>Where do you want to sell?</label>
      <select id="sellChannel" class="select-control">
        <option value="Facebook Marketplace + Page">Facebook Marketplace + Page</option>
        <option value="Facebook Boost / Paid Ads">Facebook Boost / Paid Ads</option>
        <option value="University & Office Young Men">University & Office Young Men</option>
        <option value="Gift Buyers (Girls buying for Boyfriend/Brother)">Gift Buyers (Girls buying for Boyfriend/Brother)</option>
      </select>
    </div>
  `,
  "post-script": `
    <div class="form-group">
      <label>Product Name & Key Feature</label>
      <input type="text" id="postProduct" class="input-control" placeholder="e.g. Anti-rust Black Chain Bracelet, Waterproof" />
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Price (BDT)</label>
        <input type="number" id="postPrice" class="input-control" placeholder="e.g. 350" />
      </div>
      <div class="form-group">
        <label>Content Format</label>
        <select id="postFormat" class="select-control">
          <option value="Facebook Page / Marketplace Post">Facebook Page / Marketplace Post</option>
          <option value="15-Second Reels / TikTok Video Script">15-Second Reels / TikTok Video Script</option>
          <option value="Offer / Combo Deal Caption">Offer / Combo Deal Caption</option>
        </select>
      </div>
    </div>
  `,
  "price-calculator": `
    <div class="grid-2">
      <div class="form-group">
        <label>Product Buying Cost (BDT)</label>
        <input type="number" id="buyCost" class="input-control" placeholder="e.g. 160" value="160" />
      </div>
      <div class="form-group">
        <label>Packaging + Box Cost (BDT)</label>
        <input type="number" id="packCost" class="input-control" placeholder="e.g. 25" value="25" />
      </div>
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Avg. Ad / Marketing Cost per Order (BDT)</label>
        <input type="number" id="mktCost" class="input-control" placeholder="e.g. 45" value="45" />
      </div>
      <div class="form-group">
        <label>Desired Net Profit per Piece (BDT)</label>
        <input type="number" id="targetProfit" class="input-control" placeholder="e.g. 120" value="120" />
      </div>
    </div>
  `,
  "inbox-replies": `
    <div class="form-group">
      <label>Select Customer Question / Situation</label>
      <select id="inboxScenario" class="select-control">
        <option value="price">Customer asks: "Dam koto?" / "Price please?"</option>
        <option value="delivery">Customer asks: "Delivery charge koto? Koidin lagbe?"</option>
        <option value="quality">Customer asks: "Color uthe jabe na to? Original picture?"</option>
        <option value="discount">Customer asks: "Kichu kom rakha jabe? Discount hobe?"</option>
        <option value="followup">Customer seen message but didn't confirm order (Follow-up)</option>
      </select>
    </div>
    <div class="form-group">
      <label>Product Price to Mention (BDT)</label>
      <input type="number" id="inboxPrice" class="input-control" placeholder="e.g. 350" value="350" />
    </div>
  `,
  "reseller-kit": `
    <div class="form-group">
      <label>Product Category for Resellers</label>
      <input type="text" id="resellerProduct" class="input-control" placeholder="e.g. Men's Bracelets & Rings Collection" value="Men's Bracelets & Rings Collection" />
    </div>
    <div class="form-group">
      <label>Wholesale / Reseller Commission Rate (%)</label>
      <input type="number" id="resellerMargin" class="input-control" placeholder="e.g. 20" value="20" />
    </div>
  `,
  "weekly-plan": `
    <div class="form-group">
      <label>Main Focus This Week</label>
      <select id="weeklyGoal" class="select-control">
        <option value="Increase Daily Orders from Facebook Marketplace">Increase Daily Orders from Facebook Marketplace</option>
        <option value="Launch New Men's Accessories Stock">Launch New Men's Accessories Stock</option>
        <option value="Clear Old Stock with Combo Offers">Clear Old Stock with Combo Offers</option>
      </select>
    </div>
    <div class="form-group">
      <label>Daily Time You Can Give (Hours)</label>
      <input type="number" id="dailyHours" class="input-control" placeholder="e.g. 2" value="2" />
    </div>
  `,
  "saved": `
    <div id="savedListContainer"></div>
  `
};

// Render Tab Form & Clear Previous Output
function renderTab(tabId) {
  currentTab = tabId;
  uploadedImageBase64 = null;
  uploadedImageMime = null;

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  dynamicFormArea.innerHTML = tabForms[tabId] || "";
  resultBox.textContent = "Your result will appear here.";

  if (tabId === "saved") {
    generateBtn.style.display = "none";
    resultBox.style.display = "none";
    document.querySelector(".action-row").style.display = "none";
    renderSavedList();
  } else {
    generateBtn.style.display = "block";
    resultBox.style.display = "block";
    document.querySelector(".action-row").style.display = "grid";
  }

  const photoInput = document.getElementById("productPhoto") || document.getElementById("marketPhoto");
  const previewImg = document.getElementById("photoPreview") || document.getElementById("marketPhotoPreview");
  if (photoInput) {
    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      uploadedImageMime = file.type;
      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        uploadedImageBase64 = dataUrl.split(",")[1];
        if (previewImg) {
          previewImg.src = dataUrl;
          previewImg.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

// Build Prompt for Gemini AI
function buildGeminiPrompt(tab) {
  const hint = document.getElementById("extraHint")?.value.trim() || "";
  const price = document.getElementById("sellingPrice")?.value.trim() || "";

  if (tab === "product-report" || tab === "market-analysis") {
    const cat = document.getElementById("categorySelect")?.value.trim() || hint || "Product from uploaded image";
    const cost = document.getElementById("budgetRange")?.value.trim() || "";
    return `You are an expert e-commerce business & pricing analyst in Bangladesh for "S.R. PRIME MART" (online store).
Carefully inspect the uploaded product photo (if provided) and user inputs:
- Product Hint/Category: ${cat}
- User's Planned Selling Price: ${price ? price + " BDT" : "Not specified"}
- Sourcing / Buying Cost: ${cost ? cost + " BDT" : "Not specified"}

Write a clear, helpful, practical report in natural **Bengali (Bangla)** with these sections:
1. **প্রোডাক্ট পরিচিতি ও বৈশিষ্ট্য (Product Analysis):** ছবিতে থাকা প্রোডাক্টটি কী, এর ডিজাইন, ব্যবহার ও কোয়ালিটি কেমন।
2. **মার্কেটিং অ্যানালাইসিস (Marketing Analysis):** বাংলাদেশে এই প্রোডাক্টের চাহিদা, টার্গেট কাস্টমার কারা, এবং কীভাবে বিক্রি বাড়ালে ভালো রেসপন্স পাওয়া যাবে।
3. **প্ল্যাটফর্ম ভিত্তিক দাম তুলনা (Platform Price Comparison in BDT):**
   • **AliExpress:** আনুমানিক সোর্সিং/বিক্রয় দাম (BDT-তে)
   • **Daraz Bangladesh:** দারাজে সাধারণত কত টাকায় বিক্রি হয়
   • **Facebook Marketplace:** মার্কেটপ্লেসে আনুমানিক প্রাইস রেঞ্জ
   • **Facebook Online Pages:** ফেসবুক পেজে সাধারণত কত দামে সেল হয়
4. **S.R. PRIME MART-এর জন্য সেরা বিক্রয়মূল্য (Suggested Selling Price):** সব তুলনা করে দোকানের জন্য একটি বাস্তবসম্মত বিক্রয়মূল্য (BDT) সাজেস্ট করুন।`;
  }

  const localContext = generateLocalResponse(tab);
  return `You are the business assistant for "S.R. PRIME MART" (Bangladesh online store).
Based on these details, write a clean, actionable response in natural Bengali (Bangla):\n\n${localContext}`;
}

// Fallback Local Template Response
function generateLocalResponse(tab) {
  if (tab === "product-report" || tab === "market-analysis") {
    const hint = document.getElementById("extraHint")?.value.trim() || document.getElementById("categorySelect")?.value.trim() || "Uploaded Product";
    const price = document.getElementById("sellingPrice")?.value.trim() || "350";
    return `📦 প্রোডাক্ট: ${hint}\n\n📊 আনুমানিক মার্কেট দাম তুলনা (BDT):\n• AliExpress সোর্সিং: ~১২০ - ২৫০ টাকা\n• Daraz Bangladesh: ~২৫০ - ৪৫০ টাকা\n• Facebook Marketplace: ~২৮০ - ৪৮০ টাকা\n• Facebook Page: ~৩৫০ - ৫৯০ টাকা\n\n✅ S.R. PRIME MART প্রস্তাবিত দাম: ${price} টাকা (+ ডেলিভারি চার্জ)।`;
  }
  if (tab === "which-first") {
    const stock = document.getElementById("stockList")?.value;
    const budget = document.getElementById("adBudget")?.value;
    return `🎯 কোন প্রোডাক্ট আগে প্রোমোট করবেন?\nস্টক: ${stock} | বাজেট: ${budget} টাকা\n\n১. যে প্রোডাক্টটির চাহিদা বেশি ও দাম সহনীয়, সেটি আগে Facebook Marketplace-এ লিস্ট করুন।\n২. রেসপন্স দেখে ${budget} টাকা বাজেট দিন।`;
  }
  if (tab === "find-customers") {
    const prod = document.getElementById("custProduct")?.value.trim() || "Store Product";
    const channel = document.getElementById("sellChannel")?.value;
    return `👥 কাস্টমার টার্গেটিং (${prod} - ${channel}):\n• বয়স: ১৮-৩৫ বছর (অনলাইন শপার ও গিফট বায়ার)।\n• Facebook Ads Interest: Online shopping, Gift ideas, Lifestyle & Accessories.`;
  }
  if (tab === "post-script") {
    const prod = document.getElementById("postProduct")?.value.trim() || "Featured Product";
    const price = document.getElementById("postPrice")?.value.trim() || "350";
    return `✍️ S.R. PRIME MART পোস্ট ক্যাপশন:\n\n✨ নিয়ে এলাম দারুণ কোয়ালিটির ${prod}!\n💰 অফার প্রাইস: মাত্র ${price} টাকা।\n🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (ঢাকায় ৭০৳, বাইরে ১৩০৳)।\n📩 অর্ডার করতে নাম, ঠিকানা ও ফোন নম্বর ইনবক্স করুন!`;
  }
  if (tab === "price-calculator") {
    const buy = parseFloat(document.getElementById("buyCost")?.value) || 0;
    const pack = parseFloat(document.getElementById("packCost")?.value) || 0;
    const mkt = parseFloat(document.getElementById("mktCost")?.value) || 0;
    const profit = parseFloat(document.getElementById("targetProfit")?.value) || 0;
    const total = buy + pack + mkt;
    return `🧮 প্রাইস হিসাব:\n• মোট খরচ: ${total} টাকা\n• কাঙ্ক্ষিত লাভ: ${profit} টাকা\n✅ বিক্রয়মূল্য রাখুন: ${total + profit} টাকা (অথবা ${Math.ceil((total + profit) / 10) * 10 - 1} টাকা)।`;
  }
  if (tab === "inbox-replies") {
    const price = document.getElementById("inboxPrice")?.value || "350";
    return `💬 ইনবক্স রিপ্লাই:\n"আসসালামু আলাইকুম স্যার! প্রোডাক্টটির দাম মাত্র ${price} টাকা। সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে নিতে পারবেন। অর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নম্বর দিন প্লিজ।"`;
  }
  if (tab === "reseller-kit") {
    const prod = document.getElementById("resellerProduct")?.value;
    const margin = document.getElementById("resellerMargin")?.value;
    return `🤝 রিসেলার অফার (${prod}):\nকোনো ইনভেস্টমেন্ট ছাড়াই আমাদের প্রোডাক্ট সেল করে ${margin}% পর্যন্ত প্রফিট আয় করুন। ডেলিভারি আমরাই করব।`;
  }
  if (tab === "weekly-plan") {
    const goal = document.getElementById("weeklyGoal")?.value;
    return `📅 সাপ্তাহিক প্ল্যান (${goal}):\nশনি-সোম: নতুন ছবি ও Marketplace লিস্টিং।\nমঙ্গল-বুধ: রিলস ভিডিও ও কম্বো অফার।\nবৃহস্পতি-শুক্র: পুরনো কাস্টমার ফলো-আপ ও সেলস হিসাব।`;
  }
  return "Ready.";
}

// Auto-discover a working Gemini model for this API Key
async function findWorkingGeminiModel(apiKey) {
  const cached = localStorage.getItem("sr_cached_gemini_model");
  if (cached) return cached;

  const listRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
  );
  const listData = await listRes.json();

  if (!listRes.ok) {
    throw new Error(listData.error?.message || "Invalid API Key");
  }

  const supported = (listData.models || [])
    .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
    .map(m => m.name.replace(/^models\//, ""));

  const preferredOrder = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest"
  ];

  for (const pref of preferredOrder) {
    if (supported.includes(pref)) {
      localStorage.setItem("sr_cached_gemini_model", pref);
      return pref;
    }
  }

  const anyFlash = supported.find(name => name.includes("flash") || name.includes("gemini"));
  if (anyFlash) {
    localStorage.setItem("sr_cached_gemini_model", anyFlash);
    return anyFlash;
  }

  throw new Error("No generateContent model available for this API key.");
}

// Live Gemini API Call
async function generateWithGemini(tab) {
  const apiKey = localStorage.getItem("sr_gemini_key").trim();
  const modelName = await findWorkingGeminiModel(apiKey);
  const promptText = buildGeminiPrompt(tab);

  const parts = [{ text: promptText }];
  if ((tab === "product-report" || tab === "market-analysis") && uploadedImageBase64) {
    parts.push({
      inline_data: {
        mime_type: uploadedImageMime || "image/jpeg",
        data: uploadedImageBase64
      }
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    // Clear cached model if it failed and throw message
    localStorage.removeItem("sr_cached_gemini_model");
    throw new Error(data.error?.message || `HTTP ${response.status}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || generateLocalResponse(tab);
}

// Generate Button Handler
generateBtn.addEventListener("click", async () => {
  generateBtn.disabled = true;
  generateBtn.textContent = "Analyzing...";
  resultBox.textContent = "ছবি ও মার্কেট ডাটা বিশ্লেষণ করা হচ্ছে, একটু অপেক্ষা করুন...";

  const apiKey = localStorage.getItem("sr_gemini_key");

  try {
    if (apiKey && apiKey.trim().length > 10) {
      const aiText = await generateWithGemini(currentTab);
      resultBox.textContent = aiText;
    } else {
      resultBox.textContent =
        "⚠️ [ছবি দেখে রিয়েল-টাইম AI রিপোর্ট পেতে উপরে '⚙️ AI Key' বাটনে Gemini API Key দিন]\n\n" +
        generateLocalResponse(currentTab);
    }
  } catch (err) {
    resultBox.textContent =
      `❌ API Error: ${err.message}\n\n` +
      `সমাধান: Google AI Studio (aistudio.google.com) থেকে একটি নতুন API Key নিয়ে '⚙️ AI Key' বাটনে সেভ করে আবার চেষ্টা করুন।\n\n` +
      `--- নিচে প্রাথমিক হিসাব দেওয়া হলো ---\n\n` +
      generateLocalResponse(currentTab);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";
  }
});

// Copy, Save, Listen & Tab Navigation
copyBtn.addEventListener("click", () => {
  const text = resultBox.textContent;
  if (!text || text === "Your result will appear here.") return;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});

saveBtn.addEventListener("click", () => {
  const text = resultBox.textContent;
  if (!text || text === "Your result will appear here.") return;
  const items = getSavedItems();
  items.unshift({
    id: Date.now(),
    tab: currentTab.toUpperCase(),
    date: new Date().toLocaleDateString(),
    text
  });
  localStorage.setItem("sr_saved_items", JSON.stringify(items));
  updateSavedCount();
  saveBtn.textContent = "Saved!";
  setTimeout(() => (saveBtn.textContent = "Save"), 1500);
});

function renderSavedList() {
  const container = document.getElementById("savedListContainer");
  if (!container) return;
  const items = getSavedItems();

  if (items.length === 0) {
    container.innerHTML = `<p style="color:#94a3b8; font-size:0.9rem;">এখনো কোনো রিপোর্ট বা পোস্ট সেভ করা হয়নি।</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      item => `
      <div class="saved-item">
        <div class="saved-item-head">
          <span>${item.tab} • ${item.date}</span>
          <button class="delete-saved" onclick="deleteSavedItem(${item.id})">Delete</button>
        </div>
        <div style="white-space:pre-wrap; font-size:0.86rem; color:#e2e8f0;">${item.text}</div>
      </div>
    `
    )
    .join("");
}

window.deleteSavedItem = function (id) {
  const updated = getSavedItems().filter(item => item.id !== id);
  localStorage.setItem("sr_saved_items", JSON.stringify(updated));
  updateSavedCount();
  renderSavedList();
};

listenBtn.addEventListener("click", () => {
  const text = resultBox.textContent;
  if (!text || text === "Your result will appear here.") return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    listenBtn.textContent = "Listen";
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "bn-BD";
  utterance.onend = () => (listenBtn.textContent = "Listen");
  listenBtn.textContent = "Stop";
  window.speechSynthesis.speak(utterance);
});

tabsGrid.addEventListener("click", e => {
  if (e.target.classList.contains("tab-btn")) {
    renderTab(e.target.dataset.tab);
  }
});

// Init
updateStatus();
updateSavedCount();
renderTab("product-report");
