"use strict";

/* ===== Data vila (tanpa back-end, disimpan sebagai array objek) ===== */
const DATA_VILA = [
  {
    id: "melati", nama: "Vila Melati", tipe: "2 kamar tidur", lokasi: "Cisarua, Puncak",
    harga: 750000, kapasitasDasar: 4, kapasitasMaks: 6, tambahan: 100000,
    fasilitas: ["Wi-Fi", "Dapur lengkap", "Parkir 2 mobil"], tersedia: true,
    terpesan: [{ mulai: "2026-12-24", selesai: "2026-12-28" }]
  },
  {
    id: "anggrek", nama: "Vila Anggrek", tipe: "3 kamar tidur", lokasi: "Megamendung, Puncak",
    harga: 1200000, kapasitasDasar: 6, kapasitasMaks: 8, tambahan: 125000,
    fasilitas: ["Kolam renang", "Wi-Fi", "Area barbeku", "Pemanas air"], tersedia: true,
    terpesan: [{ mulai: "2026-12-30", selesai: "2027-01-02" }]
  },
  {
    id: "kenanga", nama: "Vila Kenanga", tipe: "5 kamar tidur", lokasi: "Cipanas, Puncak",
    harga: 2000000, kapasitasDasar: 8, kapasitasMaks: 10, tambahan: 150000,
    fasilitas: ["Kolam renang", "Taman luas", "Karaoke", "Dapur lengkap"], tersedia: false,
    terpesan: []
  }
];

const KUNCI_PESANAN = "vilaPermai.pesanan";
const KUNCI_NAMA = "vilaPermai.namaTerakhir";
let daftarVila = [];

/* ===== Utilitas ===== */
function $(id) { return document.getElementById(id); }

function formatRupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

function tanggalHariIni() {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + bulan + "-" + hari;
}

function hitungMalam(masuk, keluar) {
  const a = Date.parse(masuk + "T00:00:00Z");
  const b = Date.parse(keluar + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

function ambilVila(id) {
  return daftarVila.find(function (v) { return v.id === id; });
}

/* Penyimpanan lokal dibungkus try...catch agar tidak error di mode privat */
function bacaStorage(kunci, cadangan) {
  try {
    const mentah = localStorage.getItem(kunci);
    return mentah ? JSON.parse(mentah) : cadangan;
  } catch (e) {
    return cadangan;
  }
}

function tulisStorage(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
    return true;
  } catch (e) {
    return false;
  }
}

/* ===== Memuat data ===== */
function muatDataVila() {
  try {
    if (!Array.isArray(DATA_VILA) || DATA_VILA.length === 0) {
      throw new Error("Data vila kosong");
    }
    daftarVila = DATA_VILA;
    return true;
  } catch (e) {
    $("daftar-vila").textContent = "Data vila gagal dimuat. Silakan muat ulang halaman.";
    return false;
  }
}

/* ===== Render dengan createElement + appendChild ===== */
function buatElemen(tag, kelas, teks) {
  const el = document.createElement(tag);
  if (kelas) el.className = kelas;
  if (teks !== undefined) el.textContent = teks;
  return el;
}

function buatKartuVila(v) {
  const kartu = buatElemen("article", "villa-card");
  kartu.appendChild(buatElemen("h3", "villa-card__name", v.nama));
  kartu.appendChild(buatElemen("p", "villa-card__meta", v.tipe + " · " + v.lokasi));

  const harga = buatElemen("p", "villa-card__price", formatRupiah(v.harga));
  harga.appendChild(buatElemen("small", "", " / malam"));
  kartu.appendChild(harga);

  kartu.appendChild(buatElemen("p", "villa-card__meta",
    "Untuk " + v.kapasitasDasar + " tamu, maksimal " + v.kapasitasMaks + " tamu"));

  const ul = buatElemen("ul", "villa-card__facilities");
  v.fasilitas.forEach(function (f) { ul.appendChild(buatElemen("li", "", f)); });
  kartu.appendChild(ul);

  const status = v.tersedia
    ? buatElemen("span", "villa-card__status villa-card__status--ready", "Tersedia")
    : buatElemen("span", "villa-card__status villa-card__status--full", "Sedang penuh");
  kartu.appendChild(status);
  return kartu;
}

function renderVila(daftar) {
  const wadah = $("daftar-vila");
  wadah.replaceChildren();
  daftar.forEach(function (v) { wadah.appendChild(buatKartuVila(v)); });
  $("kosong").hidden = daftar.length > 0;
}

function isiDropdown() {
  const pilih = $("vila");
  pilih.replaceChildren();
  const awal = document.createElement("option");
  awal.value = "";
  awal.textContent = "-- Pilih vila --";
  pilih.appendChild(awal);
  daftarVila.forEach(function (v) {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.nama + " (" + formatRupiah(v.harga) + "/malam)";
    pilih.appendChild(opt);
  });
}

function filterVila() {
  const kata = $("cari").value.trim().toLowerCase();
  const hasil = daftarVila.filter(function (v) {
    const gabung = (v.nama + " " + v.lokasi + " " + v.tipe + " " + v.fasilitas.join(" ")).toLowerCase();
    return gabung.indexOf(kata) !== -1;
  });
  renderVila(hasil);
}

/* ===== Validasi ===== */
function tampilkanError(idField, pesan) {
  $("err-" + idField).textContent = pesan;
  $(idField).classList.toggle("booking-form__input--invalid", pesan !== "");
}

function validasiForm() {
  const nama = $("nama").value.trim();
  const idVila = $("vila").value;
  const masuk = $("checkin").value;
  const keluar = $("checkout").value;
  const tamu = Number($("tamu").value);
  let valid = true;

  ["nama", "vila", "checkin", "checkout", "tamu"].forEach(function (f) { tampilkanError(f, ""); });

  if (nama === "") { tampilkanError("nama", "Nama tamu wajib diisi."); valid = false; }
  if (idVila === "") { tampilkanError("vila", "Silakan pilih salah satu vila."); valid = false; }

  if (masuk === "") {
    tampilkanError("checkin", "Tanggal check-in wajib diisi."); valid = false;
  } else if (masuk < tanggalHariIni()) {
    tampilkanError("checkin", "Tanggal check-in tidak boleh di masa lalu."); valid = false;
  }

  if (keluar === "") {
    tampilkanError("checkout", "Tanggal check-out wajib diisi."); valid = false;
  } else if (keluar < tanggalHariIni()) {
    tampilkanError("checkout", "Tanggal check-out tidak boleh di masa lalu."); valid = false;
  } else if (masuk !== "" && keluar <= masuk) {
    tampilkanError("checkout", "Tanggal check-out harus setelah tanggal check-in."); valid = false;
  }

  if (!Number.isInteger(tamu) || tamu < 1 || tamu > 10) {
    tampilkanError("tamu", "Jumlah tamu harus berupa angka 1 sampai 10."); valid = false;
  } else if (idVila !== "" && ambilVila(idVila) && tamu > ambilVila(idVila).kapasitasMaks) {
    tampilkanError("tamu", "Vila ini hanya muat maksimal " + ambilVila(idVila).kapasitasMaks + " tamu."); valid = false;
  }
  return valid;
}

/* ===== Ketersediaan & perhitungan ===== */
function cekBentrok(v, masuk, keluar) {
  return v.terpesan.some(function (r) { return masuk < r.selesai && keluar > r.mulai; });
}

/* Total = (harga per malam + biaya tamu tambahan per malam) x jumlah malam */
function hitungTotalHarga(v, malam, tamu) {
  const lebih = Math.max(0, tamu - v.kapasitasDasar);
  const perMalam = v.harga + lebih * v.tambahan;
  return { lebih: lebih, perMalam: perMalam, total: perMalam * malam };
}

function tampilkanHasil(teks, jenis) {
  const kotak = $("hasil");
  kotak.classList.remove("summary--ok", "summary--error");
  if (jenis) kotak.classList.add("summary--" + jenis);
  $("hasil-teks").textContent = teks;
}

function cekKetersediaan() {
  if (!validasiForm()) {
    tampilkanHasil("Data belum benar. Perbaiki isian yang bertanda merah.", "error");
    return null;
  }
  const v = ambilVila($("vila").value);
  const masuk = $("checkin").value;
  const keluar = $("checkout").value;
  const tamu = Number($("tamu").value);

  if (!v.tersedia) {
    tampilkanHasil(v.nama + " sedang penuh. Silakan pilih vila lain.", "error");
    return null;
  }
  if (cekBentrok(v, masuk, keluar)) {
    tampilkanHasil("Maaf, " + v.nama + " sudah dipesan pada tanggal tersebut. Coba tanggal lain atau vila lain.", "error");
    return null;
  }

  const malam = hitungMalam(masuk, keluar);
  const h = hitungTotalHarga(v, malam, tamu);
  let teks = v.nama + " tersedia.\n" +
    "Harga per malam: " + formatRupiah(v.harga) + "\n";
  if (h.lebih > 0) {
    teks += "Tamu tambahan (" + h.lebih + " orang x " + formatRupiah(v.tambahan) + "): " +
      formatRupiah(h.lebih * v.tambahan) + " per malam\n";
  }
  teks += "Jumlah malam: " + malam + "\n" +
    "TOTAL: " + formatRupiah(h.total);
  tampilkanHasil(teks, "ok");
  return { vila: v, masuk: masuk, keluar: keluar, tamu: tamu, malam: malam, total: h.total };
}

/* ===== Pesanan tersimpan ===== */
function renderPesanan() {
  const ul = $("daftar-pesanan");
  const data = bacaStorage(KUNCI_PESANAN, []);
  ul.replaceChildren();
  if (data.length === 0) {
    ul.appendChild(buatElemen("li", "orders__item", "Belum ada pesanan."));
    return;
  }
  data.forEach(function (p) {
    ul.appendChild(buatElemen("li", "orders__item",
      p.nama + " – " + p.vila + ", " + p.masuk + " s.d. " + p.keluar +
      " (" + p.malam + " malam, " + p.tamu + " tamu) – " + formatRupiah(p.total)));
  });
}

function kirimPesanan(event) {
  event.preventDefault();
  const rincian = cekKetersediaan();
  if (!rincian) return;

  const nama = $("nama").value.trim();
  const data = bacaStorage(KUNCI_PESANAN, []);
  data.push({
    nama: nama, vila: rincian.vila.nama, masuk: rincian.masuk, keluar: rincian.keluar,
    tamu: rincian.tamu, malam: rincian.malam, total: rincian.total
  });

  const berhasil = tulisStorage(KUNCI_PESANAN, data) && tulisStorage(KUNCI_NAMA, nama);
  tampilkanHasil(
    "Terima kasih, " + nama + ". Pesanan " + rincian.vila.nama + " sebesar " + formatRupiah(rincian.total) +
    " sudah dicatat." + (berhasil ? "" : "\n(Peramban Anda tidak mengizinkan penyimpanan, jadi daftar pesanan tidak tersimpan.)") +
    "\nPemilik akan menghubungi Anda lewat WhatsApp untuk konfirmasi.", "ok");
  renderPesanan();
}

function hapusPesanan() {
  tulisStorage(KUNCI_PESANAN, []);
  renderPesanan();
}

/* ===== Inisialisasi ===== */
function mulai() {
  if (!muatDataVila()) return;
  renderVila(daftarVila);
  isiDropdown();
  renderPesanan();

  $("nama").value = bacaStorage(KUNCI_NAMA, "");
  $("checkin").min = tanggalHariIni();
  $("checkout").min = tanggalHariIni();

  $("cari").addEventListener("input", filterVila);
  $("btn-cek").addEventListener("click", cekKetersediaan);
  $("form-pesan").addEventListener("submit", kirimPesanan);
  $("btn-hapus").addEventListener("click", hapusPesanan);
}

document.addEventListener("DOMContentLoaded", mulai);
