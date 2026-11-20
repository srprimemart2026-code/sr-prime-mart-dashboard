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

const apiKeyToggleBtn = document.getElementById("apiKeyToggleBtn");
const apiKeyBox = document.getElementById("apiKeyBox");
const geminiApiKeyInput = document.getElementById("geminiApiKey");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const statusText = document.getElementById("statusText");

function updateStatus() {
  const key = localStorage.getItem("sr_gemini_key");
  if (key && key.trim().length > 10) {
    statusText.textContent = "Online – Vision AI Ready (gemini-3.8-flash)";
    geminiApiKeyInput.value = key;
  } else {
    statusText.textContent = "Online – Add Gemini API Key in '⚙️ AI Key' for photo analysis";
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

function getSavedItems() {
  return JSON.parse(localStorage.getItem("sr_saved_items") || "[]");
}

function updateSavedCount() {
  savedCountEl.textContent = getSavedItems().length;
}

const tabForms = {
  "product-report": `
    <div class="form-group">
      <label>Upload a product photo</label>
      <div class="file-wrapper">
        <input type="file" id="productPhoto" accept="image/*" />
      </div>
      <img id="photoPreview" class="preview-thumb" alt="Preview" />
    </div>
    <div class="form-group">
      <label>Extra hint (optional)</label>
      <input type="text" id="extraHint" class="input-control" placeholder="e.g. men’s, silver, stainless steel bracelet" />
    </div>
    <div class="form-group">
      <label>Your selling price in BDT (optional)</label>
      <input type="number" id="sellingPrice" class="input-control" placeholder="e.g. 350" />
    </div>
  `,
  "market-analysis": `
    <div class="form-group">
      <label>Upload product photo (optional)</label>
      <div class="file-wrapper">
        <input type="file" id="marketPhoto" accept="image/*" />
      </div>
      <img id="marketPhotoPreview" class="preview-thumb" alt="Preview" />
    </div>
    <div class="form-group">
      <label>Product Name / Category</label>
      <input type="text" id="categorySelect" class="input-control" value="Men's Stainless Steel Bracelet" />
    </div>
    <div class="form-group">
      <label>Buying Cost in BDT (optional)</label>
      <input type="number" id="budgetRange" class="input-control" placeholder="e.g. 180" />
    </div>
  `,
  "which-first": `
    <div class="form-group">
      <label>Available Stock Products</label>
      <input type="text" id="stockList" class="input-control" value="Black steel bracelet, Titanium ring, Casual watch" />
    </div>
    <div class="form-group">
      <label>Ad Budget (BDT)</label>
      <input type="number" id="adBudget" class="input-control" value="1500" />
    </div>
  `,
  "find-customers": `
    <div class="form-group">
      <label>Product Name</label>
      <input type="text" id="custProduct" class="input-control" placeholder="e.g. Men's Steel Bracelet" />
    </div>
    <div class="form-group">
      <label>Selling Channel</label>
      <select id="sellChannel" class="select-control">
        <option value="Facebook Marketplace + Page">Facebook Marketplace + Page</option>
        <option value="Facebook Boost / Paid Ads">Facebook Boost / Paid Ads</option>
        <option value="University & Office Young Men">University & Office Young Men</option>
        <option value="Gift Buyers">Gift Buyers</option>
      </select>
    </div>
  `,
  "post-script": `
    <div class="form-group">
      <label>Product Name & Feature</label>
      <input type="text" id="postProduct" class="input-control" placeholder="e.g. Stylish Men's Bracelet" />
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Price (BDT)</label>
        <input type="number" id="postPrice" class="input-control" placeholder="e.g. 350" />
      </div>
      <div class="form-group">
        <label>Format</label>
        <select id="postFormat" class="select-control">
          <option value="Facebook Page / Marketplace Post">Facebook Page / Marketplace Post</option>
          <option value="15-Second Reels / TikTok Video Script">15-Second Reels / TikTok Video Script</option>
        </select>
      </div>
    </div>
  `,
  "price-calculator": `
    <div class="grid-2">
      <div class="form-group">
        <label>Buying Cost (BDT)</label>
        <input type="number" id="buyCost" class="input-control" value="160" />
      </div>
      <div class="form-group">
        <label>Packaging Cost (BDT)</label>
        <input type="number" id="packCost" class="input-control" value="25" />
      </div>
    </div>
    <div class="grid-2">
      <div class="form-group">
        <label>Ad Cost per Order (BDT)</label>
        <input type="number" id="mktCost" class="input-control" value="45" />
      </div>
      <div class="form-group">
        <label>Target Profit (BDT)</label>
        <input type="number" id="targetProfit" class="input-control" value="120" />
      </div>
    </div>
  `,
  "inbox-replies": `
    <div class="form-group">
      <label>Customer Question</label>
      <select id="inboxScenario" class="select-control">
        <option value="price">Dam koto? / Price please?</option>
        <option value="delivery">Delivery charge koto? Koidin lagbe?</option>
        <option value="quality">Original photo / Color uthe jabe na to?</option>
        <option value="discount">Discount / Kom rakha jabe?</option>
      </select>
    </div>
    <div class="form-group">
      <label>Price (BDT)</label>
      <input type="number" id="inboxPrice" class="input-control" value="350" />
    </div>
  `,
  "reseller-kit": `
    <div class="form-group">
      <label>Reseller Product</label>
      <input type="text" id="resellerProduct" class="input-control" value="Men's Accessories Collection" />
    </div>
    <div class="form-group">
      <label>Reseller Commission (%)</label>
      <input type="number" id="resellerMargin" class="input-control" value="20" />
    </div>
  `,
  "weekly-plan": `
    <div class="form-group">
      <label>Weekly Goal</label>
      <select id="weeklyGoal" class="select-control">
        <option value="Increase Daily Orders from Facebook Marketplace">Increase Daily Orders from Facebook Marketplace</option>
        <option value="Launch New Stock">Launch New Stock</option>
      </select>
    </div>
    <div class="form-group">
      <label>Daily Hours</label>
      <input type="number" id="dailyHours" class="input-control" value="2" />
    </div>
  `,
  "saved": `<div id="savedListContainer"></div>`
};

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
      reader.onload = (evt) => {
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

function buildPrompt(tab) {
  const hint = document.getElementById("extraHint")?.value.trim() || "";
  const price = document.getElementById("sellingPrice")?.value.trim() || "";
  const cat = document.getElementById("categorySelect")?.value.trim() || hint || "Uploaded Product";
  const cost = document.getElementById("budgetRange")?.value.trim() || "";

  if (tab === "product-report" || tab === "market-analysis") {
    return `You are an e-commerce pricing & marketing analyst for "S.R. PRIME MART" in Bangladesh.
Inspect the uploaded product image and details:
- Product / Hint: ${cat}
- Planned Price: ${price ? price + " BDT" : "Not set"}
- Buying Cost: ${cost ? cost + " BDT" : "Not set"}

Reply in natural Bengali (Bangla) with:
1. প্রোডাক্ট পরিচিতি ও বৈশিষ্ট্য (ছবি দেখে প্রোডাক্টটি কী ও কেমন)
2. মার্কেটিং অ্যানালাইসিস ও কাস্টমার প্রোফাইল
3. দাম তুলনা (BDT): AliExpress, Daraz, Facebook Marketplace, এবং Facebook Page-এ আনুমানিক কত টাকায় বিক্রি হয়
4. S.R. PRIME MART-এর জন্য সেরা বিক্রয়মূল্য (BDT)`;
  }

  if (tab === "price-calculator") {
    const buy = parseFloat(document.getElementById("buyCost")?.value) || 0;
    const pack = parseFloat(document.getElementById("packCost")?.value) || 0;
    const mkt = parseFloat(document.getElementById("mktCost")?.value) || 0;
    const profit = parseFloat(document.getElementById("targetProfit")?.value) || 0;
    const total = buy + pack + mkt;
    return `Calculate price in Bengali for S.R. PRIME MART: Buying=${buy}, Packaging=${pack}, Ad=${mkt}, Total Cost=${total}, Desired Profit=${profit}. Suggest final selling price in BDT.`;
  }

  return `Act as business helper for "S.R. PRIME MART" in Bangladesh. Tab: ${tab}. Write a helpful response in Bengali (Bangla).`;
}

async function resolveWorkingModel(apiKey) {
  const cached = localStorage.getItem("sr_cached_gemini_model");
  if (cached && !cached.includes("2.5") && !cached.includes("1.5")) return cached;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "API Key error");

  const models = (data.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map(m => m.name.replace(/^models\//, ""));

  const pick =
    models.find(n => n.includes("3.8-flash")) ||
    models.find(n => n.includes("3.8")) ||
    models.find(n => n.includes("flash") && !n.includes("2.5") && !n.includes("1.5")) ||
    models.find(n => !n.includes("2.5") && !n.includes("1.5")) ||
    models[0];

  if (!pick) throw new Error("No supported Gemini model found.");
  localStorage.setItem("sr_cached_gemini_model", pick);
  return pick;
}

async function callGemini(tab) {
  const apiKey = localStorage.getItem("sr_gemini_key").trim();
  const model = await resolveWorkingModel(apiKey);
  const parts = [{ text: buildPrompt(tab) }];

  if ((tab === "product-report" || tab === "market-analysis") && uploadedImageBase64) {
    parts.push({
      inline_data: {
        mime_type: uploadedImageMime || "image/jpeg",
        data: uploadedImageBase64
      }
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    }
  );

  const data = await res.json();
  if (!res.ok) {
    localStorage.removeItem("sr_cached_gemini_model");
    throw new Error(data.error?.message || "Request failed");
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

generateBtn.addEventListener("click", async () => {
  const key = localStorage.getItem
