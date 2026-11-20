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
    statusText.textContent = "Online – all tabs work. (Live Gemini AI Connected)";
    geminiApiKeyInput.value = key;
  } else {
    statusText.textContent = "Online – all tabs work. (Built-in Smart Bangla Mode)";
  }
}

apiKeyToggleBtn.addEventListener("click", () => {
  apiKeyBox.classList.toggle("hidden");
});

saveApiKeyBtn.addEventListener("click", () => {
  const val = geminiApiKeyInput.value.trim();
  if (val) {
    localStorage.setItem("sr_gemini_key", val);
  } else {
    localStorage.removeItem("sr_gemini_key");
  }
  updateStatus();
  apiKeyBox.classList.add("hidden");
});

// Update Saved Counter
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
      <label>Upload a product photo</label>
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
      <label>Select Accessory Category</label>
      <select id="categorySelect" class="select-control">
        <option value="Men's Bracelets (Leather / Stainless Steel / Beaded)">Men's Bracelets (Leather / Steel / Beaded)</option>
        <option value="Men's Rings (Titanium / Black / Silver)">Men's Rings (Titanium / Black / Silver)</option>
        <option value="Men's Watches (Quartz / Chronograph / Casual)">Men's Watches (Quartz / Chronograph / Casual)</option>
        <option value="Men's Chains & Pendants">Men's Chains & Pendants</option>
        <option value="Combo Gift Box (Watch + Bracelet + Ring)">Combo Gift Box (Watch + Bracelet + Ring)</option>
      </select>
    </div>
    <div class="form-group">
      <label>Target Budget Range in Bangladesh (BDT)</label>
      <input type="text" id="budgetRange" class="input-control" placeholder="e.g. 250 - 650 BDT" value="250 - 650 BDT" />
    </div>
  `,
  "which-first": `
    <div class="form-group">
      <label>Available Products in Your Stock (comma separated)</label>
      <input type="text" id="stockList" class="input-control" placeholder="e.g. Black steel bracelet, Silver ring, Leather watch, Couple chain" value="Black steel bracelet, Titanium ring, Casual leather watch" />
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

// Render Tab Form
function renderTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  dynamicFormArea.innerHTML = tabForms[tabId] || "";

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

  // Attach file listener if Product Report
  const photoInput = document.getElementById("productPhoto");
  if (photoInput) {
    photoInput.addEventListener("change", handlePhotoUpload);
  }
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedImageMime = file.type;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const dataUrl = evt.target.result;
    uploadedImageBase64 = dataUrl.split(",")[1];
    const preview = document.getElementById("photoPreview");
    if (preview) {
      preview.src = dataUrl;
      preview.style.display = "block";
    }
  };
  reader.readAsDataURL(file);
}

// Built-in Smart Bangla Response Engine (Works 100% offline/without API key)
function generateLocalResponse(tab) {
  if (tab === "product-report") {
    const hint = document.getElementById("extraHint")?.value.trim() || "Men's Premium Accessory (Bracelet / Ring / Watch)";
    const price = document.getElementById("sellingPrice")?.value.trim() || "350";
    const photoStatus = uploadedImageBase64 ? "✅ প্রোডাক্টের ছবি সংযুক্ত করা হয়েছে।" : "ℹ️ কোনো ছবি দেওয়া হয়নি (হিন্ট অনুযায়ী রিপোর্ট তৈরি করা হলো)।";

    return `📦 S.R. PRIME MART – প্রোডাক্ট রিপোর্ট\n${photoStatus}\n\n🔹 প্রোডাক্ট পরিচিতি: ${hint}\n🔹 প্রস্তাবিত বিক্রয়মূল্য: ${price} টাকা\n\n১. কাস্টমার কেন কিনবে (Selling Points):\n• দৈনন্দিন ব্যবহার (কলেজ, ইউনিভার্সিটি বা অফিস) এবং গিফট দেওয়ার জন্য দারুণ মানানসই।\n• প্রিমিয়াম ফিনিশিং, যা হাতে বা আঙুলে পরলে স্টাইলিশ লুক দেয়।\n• সাশ্রয়ী বাজেটে লং-লাস্টিং কোয়ালিটি।\n\n২. মার্কেটপ্লেস টাইটেল আইডিয়া:\n👉 Stylish ${hint} – Premium Quality | Cash on Delivery\n\n৩. বিক্রয় বাড়ানোর টিপস:\n• প্রোডাক্টটি হাতে পরা অবস্থায় দিনের আলোতে ২-৩টি ক্লিয়ার ছবি তুলুন।\n• ক্যাপশনে অবশ্যই "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি" উল্লেখ করুন।`;
  }

  if (tab === "market-analysis") {
    const cat = document.getElementById("categorySelect")?.value;
    const budget = document.getElementById("budgetRange")?.value;
    return `📊 মার্কেট অ্যানালাইসিস (${cat})\n\n🔹 বাজেট রেঞ্জ: ${budget}\n\n১. বর্তমান চাহিদা (Demand):\nবাংলাদেশে ১৮ থেকে ৩০ বছর বয়সী তরুণদের মধ্যে ${cat}-এর চাহিদা সারা বছরই থাকে। বিশেষ করে ঈদ, পূজা, ভ্যালেন্টাইনস ডে এবং ফ্রেন্ডশিপ ডে-তে বিক্রি ২-৩ গুণ বেড়ে যায়।\n\n২. কোন ডিজাইন বেশি চলে:\n• ম্যাট ব্ল্যাক (Matte Black) ও সিলভার ফিনিশ সবচেয়ে বেশি বিক্রি হয়।\n• সিম্পল ও মিনিমাল ডিজাইন কাস্টমাররা বেশি পছন্দ করে।\n\n৩. S.R. PRIME MART-এর জন্য পরামর্শ:\nসিঙ্গেল প্রোডাক্টের পাশাপাশি ২টি বা ৩টি আইটেম মিলিয়ে একটি "গিফট কম্বো বক্স" অফার করলে প্রতি অর্ডারে লাভ অনেক বাড়বে।`;
  }

  if (tab === "which-first") {
    const stock = document.getElementById("stockList")?.value;
    const budget = document.getElementById("adBudget")?.value;
    return `🎯 কোন প্রোডাক্টটি আগে প্রোমোট করবেন?\n\nআপনার স্টক: ${stock}\nমার্কেটিং বাজেট: ${budget} টাকা\n\n১. প্রথম পছন্দ (Fastest Selling):\nযে প্রোডাক্টটির দাম ৩০০-৪৫০ টাকার মধ্যে এবং দেখতে ইউনিক (যেমন: ব্ল্যাক স্টিল ব্রেসলেট বা রিং), সেটি সবার আগে Facebook Marketplace-এ লিস্ট করুন। কম দামের প্রোডাক্টে কাস্টমার দ্রুত অর্ডার কনফার্ম করে।\n\n২. দ্বিতীয় পছন্দ (High Profit):\nঘড়ি বা কম্বো আইটেমগুলো পেজে পোস্ট করে বুস্ট করুন, কারণ এগুলোতে প্রফিট মার্জিন বেশি থাকে।\n\n৩. বাজেট প্ল্যান:\n• প্রথম ৩ দিন ফ্রি Marketplace লিস্টিং থেকে রেসপন্স চেক করুন।\n• যে প্রোডাক্টে মেসেজ বেশি আসবে, সেটিতে ${budget} টাকা বাজেট দিন।`;
  }

  if (tab === "find-customers") {
    const prod = document.getElementById("custProduct")?.value.trim() || "Men's Accessories";
    const channel = document.getElementById("sellChannel")?.value;
    return `👥 কাস্টমার খোঁজার গাইড (${prod})\n\nটার্গেট চ্যানেল: ${channel}\n\n১. আদর্শ কাস্টমার কারা:\n• বয়স: ১৮ – ৩২ বছর।\n• পেশা: কলেজ/ইউনিভার্সিটি শিক্ষার্থী, তরুণ চাকরিজীবী এবং বাইকার।\n• গিফট বায়ার: মেয়েরা যারা প্রিয়জন, ভাই বা বন্ধুকে গিফট দিতে চায়।\n\n২. Facebook Ads টার্গেটিং আইডিয়া:\n• Location: Dhaka, Chattogram, Gazipur, Narayanganj, Sylhet (অথবা সারা বাংলাদেশ)।\n• Detailed Targeting: Men's fashion, Wristwatch, Jewellery, Online shopping, Gift.\n\n৩. অর্গানিক সেলস টিপস:\nFacebook Marketplace-এ প্রতিদিন সকাল ১০টা ও রাত ৮টায় নতুন ছবি দিয়ে লিস্টিং আপডেট করুন।`;
  }

  if (tab === "post-script") {
    const prod = document.getElementById("postProduct")?.value.trim() || "Men's Premium Bracelet";
    const price = document.getElementById("postPrice")?.value.trim() || "350";
    const format = document.getElementById("postFormat")?.value;

    if (format.includes("Video")) {
      return `🎬 ১৫ সেকেন্ডের রিলস / ভিডিও স্ক্রিপ্ট (${prod})\n\n[০-৩ সেকেন্ড - Hook]:\n(হাতে প্রোডাক্টটি পরে ক্লোজ-আপ শট নিন)\nভয়েস/টেক্সট: "মাত্র ${price} টাকায় হাতের লুক পুরো চেঞ্জ করতে চান?"\n\n[৪-১০ সেকেন্ড - Feature]:\n(রোদে বা লাইটে শাইন দেখান)\nভয়েস/টেক্সট: "এটি S.R. PRIME MART-এর প্রিমিয়াম ${prod}। কালার নষ্ট হওয়ার কোনো ভয় নেই, আর পরতেও দারুণ কম্ফোর্টেবল।"\n\n[১১-১৫ সেকেন্ড - Call to Action]:\nভয়েস/টেক্সট: "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি! স্টক শেষ হওয়ার আগেই এখনই ইনবক্স করুন।"`;
    }

    return `✍️ Facebook পোস্ট ক্যাপশন – S.R. PRIME MART\n\n✨ আপনার স্টাইলকে দিন আরও প্রিমিয়াম লুক! ✨\n\nনিয়ে এলাম দারুণ কোয়ালিটির **${prod}**। ক্যাজুয়াল হোক বা ফরমাল—যেকোনো আউটফিটের সাথেই দারুণ মানিয়ে যাবে।\n\n✅ প্রিমিয়াম ফিনিশিং ও লং-লাস্টিং কোয়ালিটি\n✅ নিজের ব্যবহার বা প্রিয়জনকে গিফট দেওয়ার জন্য সেরা\n✅ সারা বাংলাদেশে হোম ডেলিভারি সুবিধা\n\n💰 অফার প্রাইস: মাত্র ${price} টাকা!\n🚚 ডেলিভারি: ঢাকার ভেতরে ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা (ক্যাশ অন ডেলিভারি)।\n\n📩 অর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নম্বর দিয়ে ইনবক্স করুন অথবা কমেন্টে "Order" লিখুন!`;
  }

  if (tab === "price-calculator") {
    const buy = parseFloat(document.getElementById("buyCost")?.value) || 0;
    const pack = parseFloat(document.getElementById("packCost")?.value) || 0;
    const mkt = parseFloat(document.getElementById("mktCost")?.value) || 0;
    const profit = parseFloat(document.getElementById("targetProfit")?.value) || 0;

    const totalCost = buy + pack + mkt;
    const exactPrice = totalCost + profit;
    const psychologicalPrice = Math.ceil(exactPrice / 10) * 10 - 1; // e.g., 349 or 399

    return `🧮 S.R. PRIME MART – প্রাইস ও প্রফিট ক্যালকুলেটর\n\n• প্রোডাক্ট কেনা খরচ: ${buy} টাকা\n• প্যাকেজিং ও বক্স খরচ: ${pack} টাকা\n• মার্কেটিং / অ্যাড খরচ: ${mkt} টাকা\n----------------------------------\n📌 মোট খরচ (Total Cost): ${totalCost} টাকা\n🎯 কাঙ্ক্ষিত লাভ (Target Profit): ${profit} টাকা\n\n✅ প্রস্তাবিত বিক্রয়মূল্য: ${exactPrice} টাকা (অথবা অফার প্রাইস হিসেবে ${psychologicalPrice} টাকা রাখতে পারেন)\n\n💡 টিপস: কাস্টমারকে আলাদাভাবে ডেলিভারি চার্জ (ঢাকায় ৭০৳ / বাইরে ১৩০৳) জানিয়ে দেবেন, যাতে আপনার নিট লাভ ${profit} টাকা সুরক্ষিত থাকে।`;
  }

  if (tab === "inbox-replies") {
    const scenario = document.getElementById("inboxScenario")?.value;
    const price = document.getElementById("inboxPrice")?.value || "350";

    const replies = {
      price: `💬 কাস্টমার "দাম কত?" জিজ্ঞেস করলে এই রিপ্লাই দিন:\n\n"আসসালামু আলাইকুম স্যার! S.R. PRIME MART-এ স্বাগতম। 😊\nএই প্রোডাক্টটির প্রাইস মাত্র ${price} টাকা।\nসারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে নিতে পারবেন। অর্ডার কনফার্ম করতে আপনার নাম, পূর্ণ ঠিকানা ও মোবাইল নম্বরটি দিন প্লিজ।"`,
      delivery: `💬 ডেলিভারি চার্জ ও সময় জানতে চাইলে:\n\n"স্যার, ঢাকার ভেতরে ডেলিভারি চার্জ ৭০ টাকা (১-২ দিনের মধ্যে ডেলিভারি) এবং ঢাকার বাইরে ১৩০ টাকা (২-৩ দিনের মধ্যে হোম ডেলিভারি)। প্রোডাক্ট হাতে পেয়ে টাকা পরিশোধ করতে পারবেন। আপনার ঠিকানাটি দিলে এখনই অর্ডার কনফার্ম করে দিচ্ছি!"`,
      quality: `💬 কোয়ালিটি বা আসল ছবি দেখতে চাইলে:\n\n"স্যার, আমাদের পেজে দেওয়া ছবিগুলো ১০০% অরিজিনাল প্রোডাক্টের। প্রিমিয়াম কোয়ালিটি ম্যাটেরিয়াল হওয়ায় সহজে রঙ নষ্ট হয় না। ডেলিভারি ম্যানের সামনে চেক করে রিসিভ করার সুবিধা রয়েছে। নিশ্চিন্তে অর্ডার করতে পারেন!"`,
      discount: `💬 ডিসকাউন্ট চাইলে:\n\n"স্যার, আমরা সবসময় রিজনেবল প্রাইসে সেরা কোয়ালিটি দেওয়ার চেষ্টা করি, তাই ${price} টাকা একদম ফিক্সড অফার প্রাইস। তবে আপনি যদি একসাথে ২টি প্রোডাক্ট অর্ডার করেন, তাহলে ডেলিভারি চার্জে স্পেশাল ডিসকাউন্ট পাবেন!"`,
      followup: `💬 মেসেজ সিন করে রিপ্লাই না দিলে (ফলো-আপ মেসেজ):\n\n"আসসালামু আলাইকুম স্যার! প্রোডাক্টটি আমাদের স্টকে খুবই সীমিত পরিমাণে আছে। আপনি কি আজকের শিপিংয়ে আপনার অর্ডারটি কনফার্ম করতে চান? জানালে আপনার জন্য আলাদা করে রেখে দেব। ধন্যবাদ!"`
    };
    return replies[scenario];
  }

  if (tab === "reseller-kit") {
    const prod = document.getElementById("resellerProduct")?.value;
    const margin = document.getElementById("resellerMargin")?.value;
    return `🤝 S.R. PRIME MART – রিসেলার ইনভাইটেশন ও পলিসি\n\n📢 আমাদের সাথে রিসেলিং করে ঘরে বসে আয় করুন!\n\nপ্রোডাক্ট ক্যাটাগরি: ${prod}\nরিসেলার কমিশন / প্রফিট মার্জিন: ${margin}% পর্যন্ত!\n\n✅ রিসেলারদের জন্য সুবিধাসমূহ:\n১. কোনো অগ্রিম টাকা বা ইনভেস্টমেন্ট ছাড়াই ব্যবসা শুরু করতে পারবেন।\n২. আমাদের অরিজিনাল প্রোডাক্টের ছবি ও ভিডিও ব্যবহার করে আপনার পেজ বা গ্রুপে পোস্ট করবেন।\n৩. কাস্টমারের অর্ডার আসলে আমাদের শুধু নাম, ঠিকানা ও ফোন নম্বর দেবেন—প্যাকেজিং ও ডেলিভারি আমরাই করব।\n৪. ডেলিভারি কমপ্লিট হওয়ার সাথে সাথে আপনার প্রফিট বিকাশ/নগদে পাঠিয়ে দেওয়া হবে।`;
  }

  if (tab === "weekly-plan") {
    const goal = document.getElementById("weeklyGoal")?.value;
    const hours = document.getElementById("dailyHours")?.value;
    return `📅 S.R. PRIME MART – ৭ দিনের অ্যাকশন প্ল্যান\n\nলক্ষ্য: ${goal}\nদৈনিক সময়: ${hours} ঘণ্টা\n\n• শনিবার: সেরা ৩টি প্রোডাক্টের ক্লিয়ার ছবি ও ভিডিও রেডি করা এবং পেজে পোস্ট করা।\n• রবিবার: Facebook Marketplace-এ নতুন ৫টি লিস্টিং দেওয়া (সকাল ও রাতে)।\n• সোমবার: পুরনো ইনবক্স কাস্টমারদের ফলো-আপ মেসেজ পাঠানো।\n• মঙ্গলবার: একটি ১৫ সেকেন্ডের রিলস ভিডিও আপলোড করা।\n• বুধবার: ২টি আইটেম মিলিয়ে একটি কম্বো অফার পোস্ট করা।\n• বৃহস্পতিবার: সাপ্তাহিক সেলস ও প্রফিট হিসাব চেক করা এবং সেরা প্রোডাক্টে ছোট বাজেটে বুস্ট দেওয়া।\n• শুক্রবার: নতুন স্টক রিসার্চ ও আগামী সপ্তাহের কন্টেন্ট শিডিউল করা।`;
  }

  return "Ready.";
}

// Live Gemini API Call (if user added their optional key)
async function generateWithGemini(tab) {
  const apiKey = localStorage.getItem("sr_gemini_key");
  const localPromptContext = generateLocalResponse(tab);

  const promptText = `You are the business AI assistant for "S.R. PRIME MART", an online men's accessories store in Bangladesh (bracelets, rings, watches). 
Write a clear, practical, sales-focused response in natural Bengali (Bangla) for the tab "${tab}".
Base context and user inputs:\n${localPromptContext}\n
Make the output clean, well-structured with bullet points, ready to copy-paste for Bangladeshi customers or business planning.`;

  const parts = [{ text: promptText }];
  if (tab === "product-report" && uploadedImageBase64) {
    parts.push({
      inline_data: {
        mime_type: uploadedImageMime || "image/jpeg",
        data: uploadedImageBase64
      }
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
    }
  );

  if (!response.ok) {
    throw new Error("API Key invalid or quota exceeded. Falling back to Built-in Smart Mode.");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || localPromptContext;
}

// Generate Button Handler
generateBtn.addEventListener("click", async () => {
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  resultBox.textContent = "তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...";

  const apiKey = localStorage.getItem("sr_gemini_key");

  try {
    if (apiKey && apiKey.trim().length > 10) {
      const aiText = await generateWithGemini(currentTab);
      resultBox.textContent = aiText;
    } else {
      await new Promise(r => setTimeout(r, 250));
      resultBox.textContent = generateLocalResponse(currentTab);
    }
  } catch (err) {
    resultBox.textContent = generateLocalResponse(currentTab) + `\n\n[Note: ${err.message}]`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";
  }
});

// Copy Button
copyBtn.addEventListener("click", () => {
  const text = resultBox.textContent;
  if (!text || text === "Your result will appear here.") return;
  navigator.clipboard.writeText(text);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});

// Save Button
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

// Render Saved Tab
function renderSavedList() {
  const container = document.getElementById("savedListContainer");
  if (!container) return;
  const items = getSavedItems();

  if (items.length === 0) {
    container.innerHTML = `<p style="color:#94a3b8; font-size:0.9rem;">এখনো কোনো রিপোর্ট বা পোস্ট সেভ করা হয়নি। যেকোনো ট্যাবে Generate করে <b>Save</b> বাটনে চাপুন।</p>`;
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

// Listen (Text-to-Speech) Button
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

// Tab Click Listener
tabsGrid.addEventListener("click", e => {
  if (e.target.classList.contains("tab-btn")) {
    renderTab(e.target.dataset.tab);
  }
});

// Init
updateStatus();
updateSavedCount();
renderTab("product-report");
