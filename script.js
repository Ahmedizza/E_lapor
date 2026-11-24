const STORAGE_KEY = "elapor_humas_sd_alhikmah_2026";
const ADMIN_PIN = "1234";

// Data simulasi awal agar aplikasi langsung siap diuji saat dibuka
const initialComplaints = [
  {
    ticket: "HMS-2026-101",
    date: "18 November 2026, 08:15 WIB",
    name: "Rahmawati (Wali Murid Kelas 3A)",
    contact: "081234567801",
    role: "Wali Murid",
    category: "Sarana & Prasarana",
    title: "Perbaikan pendingin ruangan (AC) di Ruang Kelas 3A",
    description: "Pendingin ruangan di kelas 3A kurang dingin sejak dua hari terakhir sehingga siswa merasa gerah saat pembelajaran siang.",
    status: "Selesai",
    response: "Terima kasih atas laporannya. Tim Sarpras SD Plus Al Hikmah telah membersihkan filter dan mengisi ulang freon AC kelas 3A pada 19 November 2026."
  },
  {
    ticket: "HMS-2026-102",
    date: "20 November 2026, 10:30 WIB",
    name: "Anonim",
    contact: "-",
    role: "Wali Murid",
    category: "Kesiswaan & Kedisiplinan",
    title: "Penataan arus penjemputan siswa di gerbang depan saat jam pulang",
    description: "Mohon pengaturan jalur kendaraan penjemput di area gerbang utama pada pukul 14.30 WIB agar tidak terjadi penumpukan di bahu jalan.",
    status: "Diproses",
    response: "Aspirasi telah diteruskan ke Koordinator Kesiswaan dan Petugas Keamanan untuk penjadwalan piket pengaturan lalu lintas gerbang mulai pekan ini."
  },
  {
    ticket: "HMS-2026-103",
    date: "23 November 2026, 09:05 WIB",
    name: "Ahmad Fauzi",
    contact: "085712349988",
    role: "Masyarakat Umum",
    category: "Administrasi & Tata Usaha",
    title: "Informasi jadwal pembukaan gelombang pendaftaran siswa baru",
    description: "Apakah pendaftaran jalur prestasi untuk tahun ajaran mendatang sudah dibuka bulan Desember ini?",
    status: "Diterima",
    response: "Laporan telah diterima oleh Tim Humas SD Plus Al Hikmah dan sedang disiapkan rincian informasi resminya."
  }
];

// Mengambil atau menginisialisasi data dari localStorage
function getComplaints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialComplaints));
    return [...initialComplaints];
  }

  const complaints = JSON.parse(saved);
  return complaints.map((item) => ({
    reportType: "Pengaduan",
    incidentDate: "-",
    location: "-",
    confidential: false,
    attachments: [],
    notificationChannel: "Tidak Ada",
    disposition: "Belum didisposisikan",
    discussion: item.discussion || [],
    ...item
  }));
}

function saveComplaints(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Mencegah injeksi karakter HTML pada input pengguna
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getStatusBadgeClass(status) {
  if (status === "Selesai") return "badge badge-done";
  if (status === "Diproses") return "badge badge-process";
  return "badge badge-received";
}

function formatCurrentDate() {
  const now = new Date();
  const options = { day: "2-digit", month: "long", year: "numeric" };
  const datePart = now.toLocaleDateString("id-ID", options);
  const timePart = now.toTimeString().slice(0, 5);
  return `${datePart}, ${timePart} WIB`;
}

// 1. Navigasi Antar Tab Menu
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-tab");

    tabButtons.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(targetId).classList.add("active");
  });
});

// 2. Sakelar Mode Anonim pada Formulir Pengaduan
const anonCheckbox = document.getElementById("is-anonymous");
const identityFields = document.getElementById("identity-fields");
const nameInput = document.getElementById("reporter-name");
const contactInput = document.getElementById("reporter-contact");

anonCheckbox.addEventListener("change", () => {
  if (anonCheckbox.checked) {
    identityFields.classList.add("hidden");
    nameInput.required = false;
    contactInput.required = false;
  } else {
    identityFields.classList.remove("hidden");
    nameInput.required = true;
    contactInput.required = true;
  }
});

// 3. Pengiriman Formulir Pengaduan & Generator Tiket
const complaintForm = document.getElementById("complaint-form");
const ticketResultBox = document.getElementById("ticket-result");
const generatedTicketCode = document.getElementById("generated-ticket-code");
const copyTicketBtn = document.getElementById("copy-ticket-btn");

complaintForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const complaints = getComplaints();
  const randomNum = Math.floor(200 + Math.random() * 799);
  const newTicket = `HMS-2026-${randomNum}`;

  const isAnon = anonCheckbox.checked;
  const evidenceInput = document.getElementById("evidence-files");
  const cameraInput = document.getElementById("camera-photo");
  const attachmentNames = [
    ...Array.from(evidenceInput.files).map((file) => file.name),
    ...Array.from(cameraInput.files).map((file) => file.name)
  ];
  const notificationChannel = document.getElementById("notification-channel").value;
  const newEntry = {
    ticket: newTicket,
    date: formatCurrentDate(),
    name: isAnon ? "Anonim" : nameInput.value.trim(),
    contact: isAnon ? "-" : contactInput.value.trim(),
    role: document.getElementById("reporter-role").value,
    reportType: document.getElementById("report-type").value,
    category: document.getElementById("service-category").value,
    incidentDate: document.getElementById("incident-date").value,
    location: document.getElementById("incident-location").value.trim(),
    confidential: document.getElementById("is-confidential").checked,
    attachments: attachmentNames,
    notificationChannel,
    disposition: "Belum didisposisikan",
    title: document.getElementById("complaint-title").value.trim(),
    description: document.getElementById("complaint-desc").value.trim(),
    status: "Diterima",
    response: "Laporan Anda telah masuk ke sistem Humas SD Plus Al Hikmah dan menunggu peninjauan petugas.",
    discussion: []
  };

  complaints.unshift(newEntry);
  saveComplaints(complaints);

  generatedTicketCode.textContent = newTicket;
  ticketResultBox.classList.remove("hidden");

  complaintForm.reset();
  document.getElementById("camera-photo-preview").innerHTML = "";
  document.getElementById("camera-photo-preview").classList.add("hidden");
  identityFields.classList.remove("hidden");
  nameInput.required = true;
  contactInput.required = true;
  document.getElementById("is-confidential").checked = false;

  renderAdminDashboard();
  renderPublicDashboard();
});

copyTicketBtn.addEventListener("click", () => {
  const code = generatedTicketCode.textContent;
  navigator.clipboard.writeText(code).then(() => {
    copyTicketBtn.textContent = "Tersalin!";
    setTimeout(() => {
      copyTicketBtn.textContent = "Salin Kode";
    }, 2000);
  });
});

// Pratinjau foto langsung dari kamera perangkat
const cameraInput = document.getElementById("camera-photo");
const cameraPreview = document.getElementById("camera-photo-preview");

cameraInput.addEventListener("change", () => {
  const photo = cameraInput.files[0];
  if (!photo) return;

  const photoUrl = URL.createObjectURL(photo);
  cameraPreview.innerHTML = `<img src="${photoUrl}" alt="Pratinjau foto bukti" />`;
  cameraPreview.classList.remove("hidden");
});

// 4. Pelacakan Status Tiket Pengaduan
const trackForm = document.getElementById("track-form");
const trackInput = document.getElementById("track-input");
const trackResult = document.getElementById("track-result");

function searchTicket(code) {
  const cleanCode = code.trim().toUpperCase();
  const complaints = getComplaints();
  const found = complaints.find((item) => item.ticket.toUpperCase() === cleanCode);

  if (!found) {
    trackResult.innerHTML = `
      <div class="track-card">
        <p style="color: #b91c1c; font-weight: 600;">Nomor tiket "${escapeHTML(cleanCode)}" tidak ditemukan.</p>
        <p style="font-size: 0.9rem; color: #64748b; margin-top: 4px;">Pastikan penulisan kode tiket sesuai (contoh: HMS-2026-101).</p>
      </div>
    `;
    return;
  }

  const attachments = (found.attachments || []).map((name) => `<span class="attachment-chip">${escapeHTML(name)}</span>`).join("");
  const discussion = (found.discussion || []).map((message) => `
    <div class="discussion-message ${message.sender === "Petugas Humas" ? "official" : "reporter"}">
      <small>${escapeHTML(message.sender)} &bull; ${escapeHTML(message.date)}</small>
      ${escapeHTML(message.text)}
    </div>
  `).join("");

  trackResult.innerHTML = `
    <div class="track-card">
      <div class="admin-item-top">
        <strong>Kode Tiket: ${escapeHTML(found.ticket)}</strong>
        <span class="${getStatusBadgeClass(found.status)}">${escapeHTML(found.status)}</span>
      </div>
      <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 10px;">
        Dikirim ${escapeHTML(found.date)} &bull; ${escapeHTML(found.reportType)} &bull; Bidang: <strong>${escapeHTML(found.category)}</strong>
      </p>
      <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">
        Kejadian: ${escapeHTML(found.incidentDate)} &bull; Lokasi: ${escapeHTML(found.location)}
      </p>
      <h3 style="font-size: 1.05rem; margin-bottom: 6px;">${escapeHTML(found.title)}</h3>
      <p style="font-size: 0.94rem; margin-bottom: 14px;">${escapeHTML(found.description)}</p>
      ${attachments ? `<div class="attachment-list"><strong>Bukti:</strong>${attachments}</div>` : ""}
      ${found.notificationChannel && found.notificationChannel !== "Tidak Ada" ? `<p style="font-size:0.82rem;color:#64748b;margin-top:8px;">Notifikasi aktif: ${escapeHTML(found.notificationChannel)}</p>` : ""}
      <div style="background: #ffffff; border-left: 4px solid #14532d; padding: 12px; border-radius: 6px; margin-top:12px;">
              <strong style="font-size: 0.88rem; color: #1e5631;">Tanggapan Resmi Humas SD Plus Al Hikmah:</strong>
        <p style="font-size: 0.92rem; margin-top: 4px;">${escapeHTML(found.response)}</p>
      </div>
      <div class="discussion-box">
        <strong>Ruang Diskusi Tiket</strong>
        <div class="discussion-list">${discussion || '<p style="font-size:0.85rem;color:#64748b;">Belum ada balasan diskusi.</p>'}</div>
        ${found.confidential ? '<p style="font-size:0.82rem;color:#92400e;">Tiket ini ditandai rahasia; balasan internal dibatasi petugas.</p>' : '<form id="reporter-reply-form" class="track-bar"><input type="text" id="reporter-reply-input" placeholder="Tulis balasan untuk petugas..." required /><button type="submit" class="btn btn-outline">Kirim Balasan</button></form>'}
      </div>
    </div>
  `;

  const replyForm = document.getElementById("reporter-reply-form");
  if (replyForm) {
    replyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const replyInput = document.getElementById("reporter-reply-input");
      const reply = replyInput.value.trim();
      if (!reply) return;
      const complaints = getComplaints();
      const complaintIndex = complaints.findIndex((item) => item.ticket === found.ticket);
      complaints[complaintIndex].discussion = complaints[complaintIndex].discussion || [];
      complaints[complaintIndex].discussion.push({ sender: "Pelapor", text: reply, date: formatCurrentDate() });
      saveComplaints(complaints);
      searchTicket(found.ticket);
    });
  }
}

trackForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchTicket(trackInput.value);
});

// 5. Panel Simulasi Admin Humas
const adminLoginForm = document.getElementById("admin-login-form");
const adminPinInput = document.getElementById("admin-pin-input");
const adminLoginBox = document.getElementById("admin-login-box");
const adminDashboard = document.getElementById("admin-dashboard");
const logoutAdminBtn = document.getElementById("logout-admin-btn");

adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (adminPinInput.value.trim() === ADMIN_PIN) {
    adminLoginBox.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    adminPinInput.value = "";
    renderAdminDashboard();
  } else {
    alert("PIN salah. Gunakan PIN demo: 1234");
  }
});

logoutAdminBtn.addEventListener("click", () => {
  adminDashboard.classList.add("hidden");
  adminLoginBox.classList.remove("hidden");
});

function renderAdminDashboard() {
  const complaints = getComplaints();

  document.getElementById("stat-total").textContent = complaints.length;
  document.getElementById("stat-process").textContent = complaints.filter((c) => c.status === "Diproses").length;
  document.getElementById("stat-done").textContent = complaints.filter((c) => c.status === "Selesai").length;

  const listContainer = document.getElementById("admin-ticket-list");
  listContainer.innerHTML = "";

  complaints.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "admin-item";
    card.innerHTML = `
      <div class="admin-item-top">
        <div>
          <strong>${escapeHTML(item.ticket)}</strong> &mdash;
          <span style="font-size: 0.88rem; color: #64748b;">${escapeHTML(item.category)} (${escapeHTML(item.role)})</span>
        </div>
        <span class="${getStatusBadgeClass(item.status)}">${escapeHTML(item.status)}</span>
      </div>
      <p style="font-size: 0.84rem; color: #64748b; margin-bottom: 6px;">
        Pelapor: <strong>${escapeHTML(item.name)}</strong> | Kontak: ${escapeHTML(item.contact)} | ${escapeHTML(item.date)}
      </p>
      <p style="font-size: 0.84rem; color: #64748b; margin-bottom: 6px;">
        Jenis: ${escapeHTML(item.reportType)} | Lokasi: ${escapeHTML(item.location)} | Tanggal kejadian: ${escapeHTML(item.incidentDate)} | ${item.confidential ? "<strong>RAHASIA</strong>" : "Publik"}
      </p>
      ${(item.attachments || []).length ? `<div class="attachment-list"><strong>Bukti:</strong>${item.attachments.map((name) => `<span class="attachment-chip">${escapeHTML(name)}</span>`).join("")}</div>` : ""}
      <h4 style="margin: 8px 0 4px;">${escapeHTML(item.title)}</h4>
      <p style="font-size: 0.92rem; margin-bottom: 10px;">${escapeHTML(item.description)}</p>

      <div class="admin-actions">
        <select id="status-select-${index}" style="max-width: 180px;">
          <option value="Diterima" ${item.status === "Diterima" ? "selected" : ""}>Diterima</option>
          <option value="Diproses" ${item.status === "Diproses" ? "selected" : ""}>Diproses</option>
          <option value="Selesai" ${item.status === "Selesai" ? "selected" : ""}>Selesai</option>
        </select>
        <select id="disposition-select-${index}" style="max-width: 220px;">
          <option ${item.disposition === "Belum didisposisikan" ? "selected" : ""}>Belum didisposisikan</option>
          <option ${item.disposition === "Kepala Sekolah" ? "selected" : ""}>Kepala Sekolah</option>
          <option ${item.disposition === "Bidang Akademik" ? "selected" : ""}>Bidang Akademik</option>
          <option ${item.disposition === "Bidang Kesiswaan" ? "selected" : ""}>Bidang Kesiswaan</option>
          <option ${item.disposition === "Bidang Sarana Prasarana" ? "selected" : ""}>Bidang Sarana Prasarana</option>
          <option ${item.disposition === "Tata Usaha" ? "selected" : ""}>Tata Usaha</option>
        </select>
        <input type="text" id="reply-input-${index}" value="${escapeHTML(item.response)}" placeholder="Tulis tanggapan resmi Humas..." style="flex: 1; min-width: 220px;" />
        <button type="button" class="btn btn-primary" onclick="updateTicket(${index})">Simpan Tindak Lanjut</button>
      </div>
      <div class="discussion-box">
        <strong>Balasan diskusi dua arah</strong>
        <div class="track-bar" style="margin-top:8px;">
          <input type="text" id="official-reply-${index}" placeholder="Tulis balasan resmi untuk pelapor..." />
          <button type="button" class="btn btn-outline" onclick="addOfficialReply(${index})">Kirim Balasan</button>
        </div>
      </div>
    `;
    listContainer.appendChild(card);
  });
}

window.updateTicket = function (index) {
  const complaints = getComplaints();
  const newStatus = document.getElementById(`status-select-${index}`).value;
  const newResponse = document.getElementById(`reply-input-${index}`).value.trim();
  const newDisposition = document.getElementById(`disposition-select-${index}`).value;

  complaints[index].status = newStatus;
  complaints[index].response = newResponse || "Sedang ditindaklanjuti oleh Tim Humas SD Plus Al Hikmah.";
  complaints[index].disposition = newDisposition;

  saveComplaints(complaints);
  renderAdminDashboard();
  renderPublicDashboard();
  alert(`Status, disposisi, dan tanggapan untuk tiket ${complaints[index].ticket} berhasil diperbarui.\nNotifikasi ${complaints[index].notificationChannel} dicatat untuk pelapor.`);
};

window.addOfficialReply = function (index) {
  const input = document.getElementById(`official-reply-${index}`);
  const text = input.value.trim();
  if (!text) return;

  const complaints = getComplaints();
  complaints[index].discussion = complaints[index].discussion || [];
  complaints[index].discussion.push({ sender: "Petugas Humas", text, date: formatCurrentDate() });
  saveComplaints(complaints);
  renderAdminDashboard();
};

function renderPublicDashboard() {
  const complaints = getComplaints().filter((item) => !item.confidential);
  document.getElementById("public-stat-total").textContent = complaints.length;
  document.getElementById("public-stat-received").textContent = complaints.filter((item) => item.status === "Diterima").length;
  document.getElementById("public-stat-process").textContent = complaints.filter((item) => item.status === "Diproses").length;
  document.getElementById("public-stat-done").textContent = complaints.filter((item) => item.status === "Selesai").length;

  const list = document.getElementById("public-report-list");
  list.innerHTML = complaints.map((item) => `
    <article class="public-report-item">
      <span class="${getStatusBadgeClass(item.status)}">${escapeHTML(item.status)}</span>
      <h4>${escapeHTML(item.title)}</h4>
      <p style="font-size:0.85rem;color:#64748b;">${escapeHTML(item.category)} &bull; ${escapeHTML(item.reportType)} &bull; ${escapeHTML(item.date)}</p>
      <p style="font-size:0.88rem;margin-top:6px;">${escapeHTML(item.description)}</p>
      <p style="font-size:0.82rem;margin-top:8px;"><strong>Disposisi:</strong> ${escapeHTML(item.disposition || "Belum didisposisikan")}</p>
    </article>
  `).join("") || '<p style="color:#64748b;">Belum ada laporan publik untuk ditampilkan.</p>';
}

renderPublicDashboard();

const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotWindow = document.getElementById("chatbot-window");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotMessages = document.getElementById("chatbot-messages");

chatbotToggle.addEventListener("click", () => chatbotWindow.classList.toggle("hidden"));
chatbotClose.addEventListener("click", () => chatbotWindow.classList.add("hidden"));

const GEMINI_KEY_STORAGE = "elapor_gemini_api_key";
const GEMINI_MODEL_STORAGE = "elapor_gemini_model";
const chatbotHistory = [];

const chatbotAnswers = {
  cara: "Pilih ‘Buat Pengaduan’, isi jenis laporan, bidang, kronologi, tanggal, lokasi, lalu kirim bukti bila perlu.",
  tiket: "Buka menu ‘Lacak Tiket’, masukkan kode tiket HMS-2026-XXX, lalu sistem menampilkan status dan tanggapan.",
  privasi: "Pilih Anonim untuk menyembunyikan identitas. Pilih Rahasia untuk membatasi laporan agar tidak tampil pada dashboard publik.",
  status: "Diterima berarti laporan masuk, Diproses berarti sedang ditangani, dan Selesai berarti tindak lanjut telah selesai.",
  foto: "Anda dapat menekan tombol ‘Ambil Foto Langsung’ pada formulir. Perangkat akan membuka kamera dan menampilkan pratinjau foto sebelum dikirim.",
  bukti: "Bukti pendukung dapat berupa PDF, dokumen Word, foto, screenshot, atau video singkat.",
  anonim: "Gunakan opsi kirim sebagai Anonim jika Anda tidak ingin nama dan kontak ditampilkan pada laporan.",
  rahasia: "Aktifkan opsi Rahasia agar isi laporan tidak ditampilkan pada dashboard statistik publik.",
  notifikasi: "Saat mengirim laporan, Anda dapat memilih notifikasi melalui Email, SMS, atau WhatsApp."
};

function appendChatMessage(text, sender) {
  chatbotMessages.insertAdjacentHTML("beforeend", `<div class="chat-message ${sender}">${escapeHTML(text)}</div>`);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getChatbotAnswer(message) {
  const text = message.toLowerCase();
  if (/tiket|lacak|tracking|cek.*status/.test(text)) return chatbotAnswers.tiket;
  if (/cara|bagaimana.*lapor|buat.*aduan|mengirim.*laporan/.test(text)) return chatbotAnswers.cara;
  if (/anonim/.test(text)) return chatbotAnswers.anonim;
  if (/rahasia|privasi|publik/.test(text)) return chatbotAnswers.rahasia;
  if (/foto|kamera|memfoto|ambil.*gambar/.test(text)) return chatbotAnswers.foto;
  if (/bukti|dokumen|pdf|word|video|screenshot|lampiran/.test(text)) return chatbotAnswers.bukti;
  if (/notifikasi|email|sms|whatsapp/.test(text)) return chatbotAnswers.notifikasi;
  if (/status|diproses|diterima|selesai/.test(text)) return chatbotAnswers.status;
  if (/halo|hai|pagi|siang|sore|selamat/.test(text)) return "Halo! Silakan tanyakan cara melapor, pelacakan tiket, bukti pendukung, privasi, status, atau notifikasi.";
  if (/terima kasih|makasih|thanks/.test(text)) return "Sama-sama. Semoga bantuan ini memudahkan Anda. Jika masih membutuhkan bantuan, silakan kirim pertanyaan lain.";
  return "Maaf, saya belum memahami pertanyaan tersebut. Coba tanyakan: cara melapor, melacak tiket, laporan anonim atau rahasia, unggah bukti, atau arti status.";
}

const chatbotSettingsButton = document.getElementById("chatbot-settings");
const chatbotSettingsForm = document.getElementById("chatbot-settings-form");
const geminiApiKeyInput = document.getElementById("gemini-api-key");
const geminiModelInput = document.getElementById("gemini-model");
const chatbotMode = document.getElementById("chatbot-mode");

function updateChatbotMode() {
  const key = sessionStorage.getItem(GEMINI_KEY_STORAGE);
  const model = sessionStorage.getItem(GEMINI_MODEL_STORAGE) || "gemini-2.5-flash";
  geminiModelInput.value = model;
  if (key) {
    chatbotMode.textContent = `Gemini aktif · ${model}`;
  } else {
    chatbotMode.textContent = "Mode bantuan — konfigurasi Gemini tersedia";
  }
}

chatbotSettingsButton.addEventListener("click", () => {
  geminiApiKeyInput.value = sessionStorage.getItem(GEMINI_KEY_STORAGE) || "";
  chatbotSettingsForm.classList.toggle("hidden");
});

chatbotSettingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const key = geminiApiKeyInput.value.trim();
  const model = geminiModelInput.value.trim() || "gemini-2.5-flash";

  if (!key) {
    sessionStorage.removeItem(GEMINI_KEY_STORAGE);
    sessionStorage.removeItem(GEMINI_MODEL_STORAGE);
    appendChatMessage("API key Gemini dihapus. Asisten kembali ke mode bantuan lokal.", "bot");
  } else {
    sessionStorage.setItem(GEMINI_KEY_STORAGE, key);
    sessionStorage.setItem(GEMINI_MODEL_STORAGE, model);
    appendChatMessage(`Pengaturan Gemini berhasil disimpan untuk sesi ini. Model: ${model}`, "bot");
  }

  geminiApiKeyInput.value = key ? "" : "";
  chatbotSettingsForm.classList.add("hidden");
  updateChatbotMode();
});

async function getGeminiAnswer(message) {
  const apiKey = sessionStorage.getItem(GEMINI_KEY_STORAGE);
  const model = sessionStorage.getItem(GEMINI_MODEL_STORAGE) || "gemini-2.5-flash";
  if (!apiKey) return null;

  const systemPrompt = `Anda adalah Asisten AI E-Lapor untuk website pengaduan Humas SD Plus Al Hikmah. Jawab dalam bahasa Indonesia yang ramah, jelas, ringkas, dan aman. Jelaskan fitur: buat pengaduan, jenis laporan, bidang, kronologi, tanggal, lokasi, bukti, foto langsung, anonim, rahasia, pelacakan tiket HMS-2026-XXX, status Diterima/Diproses/Selesai, diskusi dengan petugas, disposisi admin, dan notifikasi Email/SMS/WhatsApp. Jangan meminta atau menyimpan nama pelapor, kata sandi, PIN, nomor identitas, atau data sensitif lain dalam percakapan. Jika pertanyaan berada di luar sistem, berikan jawaban umum.`;

  const contents = chatbotHistory.slice(-10).map((item) => ({
    role: item.role === "user" ? "user" : "model",
    parts: [{ text: item.text }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini gagal merespons (${response.status}). ${errorText.slice(0, 180)}`);
  }

  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!answer) throw new Error("Gemini tidak memberikan teks jawaban.");
  return answer;
}

async function sendChatMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;

  appendChatMessage(cleanText, "user");
  chatbotHistory.push({ role: "user", text: cleanText });

  const typing = document.createElement("div");
  typing.className = "chat-message bot typing";
  chatbotMessages.appendChild(typing);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  try {
    const geminiAnswer = await getGeminiAnswer(cleanText);
    typing.remove();

    if (geminiAnswer) {
      appendChatMessage(geminiAnswer, "bot");
      chatbotHistory.push({ role: "model", text: geminiAnswer });
    } else {
      appendChatMessage(getChatbotAnswer(cleanText), "bot");
    }
  } catch (error) {
    typing.remove();
    appendChatMessage(`${getChatbotAnswer(cleanText)}\n\n[Catatan: integrasi Gemini belum berhasil. ${escapeHTML(error.message)}]`, "bot");
  }
}

document.querySelectorAll("[data-chat]").forEach((button) => {
  button.addEventListener("click", () => sendChatMessage(button.textContent));
});

const chatbotForm = document.getElementById("chatbot-form");
const chatbotInput = document.getElementById("chatbot-input");

chatbotForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendChatMessage(chatbotInput.value);
  chatbotInput.value = "";
  chatbotInput.focus();
});

updateChatbotMode();