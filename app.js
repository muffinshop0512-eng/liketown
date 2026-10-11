/**
 * Like Town Doctor Queue Management System
 * Developed for FiveM / Like Town Community
 */

// --- CONFIGURATION & CONSTANTS ---
const STATUS_CONFIG = {
  next: {
    id: 'next',
    label: 'รอเคสถัดไป',
    shortLabel: 'รอเคสถัดไป',
    classBadge: 'status-next',
    cardClass: 'status-next-card',
    dotColor: '#ffb833',
    icon: 'fa-user-clock',
    desc: 'พร้อมรับเคสคนแรก คิวแรก'
  },
  busy: {
    id: 'busy',
    label: 'กำลังทำเคส',
    shortLabel: 'กำลังทำเคส',
    classBadge: 'status-busy',
    cardClass: 'status-busy-card',
    dotColor: '#ef4444',
    icon: 'fa-heart-pulse',
    desc: 'กำลังรักษา/ทำหัตถการ'
  },
  queue: {
    id: 'queue',
    label: 'ยังไม่ถึงเคส',
    shortLabel: 'ยังไม่ถึงเคส',
    classBadge: 'status-queue',
    cardClass: '',
    dotColor: '#a855f7',
    icon: 'fa-users',
    desc: 'รออยู่ในลำดับคิว'
  },
  none: {
    id: 'none',
    label: 'ยังไม่มีเคส',
    shortLabel: 'ยังไม่มีเคส',
    classBadge: 'status-none',
    cardClass: '',
    dotColor: '#94a3b8',
    icon: 'fa-bed-pulse',
    desc: 'สแตนด์บาย / รอเรียกเคส'
  },
  afk: {
    id: 'afk',
    label: 'พัก/เหม่อไม่เกิน 15 นาที',
    shortLabel: 'พัก/เหม่อ (15น.)',
    classBadge: 'status-afk',
    cardClass: 'status-afk-card',
    dotColor: '#f59e0b',
    icon: 'fa-mug-hot',
    desc: 'พักเบรกชั่วคราว (จับเวลา 15 นาที)'
  }
};

const DEFAULT_RANKS = [
  { id: 'rank-1', name: 'ผอ.โรงพยาบาล', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' },
  { id: 'rank-2', name: 'รอง ผอ.โรงพยาบาล', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)' },
  { id: 'rank-3', name: 'แพทย์ผู้เชี่ยวชาญ', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)' },
  { id: 'rank-4', name: 'แพทย์ชำนาญการ', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
  { id: 'rank-5', name: 'แพทย์ทั่วไป', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
  { id: 'rank-6', name: 'แพทย์ฝึกหัด', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)' }
];

const DEFAULT_DOCTORS = [
  {
    id: 'doc-1',
    name: 'หมอพอร์ช',
    code: 'DOC-01',
    rankId: 'rank-1',
    status: 'next',
    caseCount: 8,
    afkStartTime: null,
    notes: 'หัวหน้าเวรช่วงบ่าย'
  },
  {
    id: 'doc-2',
    name: 'หมอแซนด์',
    code: 'DOC-02',
    rankId: 'rank-3',
    status: 'busy',
    caseCount: 12,
    afkStartTime: null,
    notes: 'กำลัง CPR เคสรถคว่ำ'
  },
  {
    id: 'doc-3',
    name: 'หมอเบียร์',
    code: 'DOC-03',
    rankId: 'rank-4',
    status: 'queue',
    caseCount: 5,
    afkStartTime: null,
    notes: 'พร้อมรับเคสต่อ'
  },
  {
    id: 'doc-4',
    name: 'หมอมาร์ค',
    code: 'DOC-04',
    rankId: 'rank-5',
    status: 'queue',
    caseCount: 6,
    afkStartTime: null,
    notes: ''
  },
  {
    id: 'doc-5',
    name: 'หมอน้ำหวาน',
    code: 'DOC-05',
    rankId: 'rank-6',
    status: 'afk',
    caseCount: 3,
    afkStartTime: Date.now() - (6 * 60 * 1000), // AFK for 6 mins
    notes: 'ไปเติมน้ำ'
  },
  {
    id: 'doc-6',
    name: 'หมอฟลุ๊ค',
    code: 'DOC-06',
    rankId: 'rank-5',
    status: 'none',
    caseCount: 2,
    afkStartTime: null,
    notes: 'เพิ่งเข้าเวร'
  }
];

// --- APP STATE ---
class AppState {
  constructor() {
    this.doctors = [];
    this.ranks = [];
    this.logs = [];
    this.viewMode = 'queue'; // 'queue' or 'board'
    this.soundEnabled = true;
    this.searchQuery = '';
    this.filterRank = 'all';
    this.load();
  }

  load() {
    try {
      const savedDoctors = localStorage.getItem('liketown_doctors');
      const savedRanks = localStorage.getItem('liketown_ranks');
      const savedSound = localStorage.getItem('liketown_sound');
      const savedLogs = localStorage.getItem('liketown_logs');

      this.doctors = savedDoctors ? JSON.parse(savedDoctors) : DEFAULT_DOCTORS;
      this.ranks = savedRanks ? JSON.parse(savedRanks) : DEFAULT_RANKS;
      this.soundEnabled = savedSound !== null ? JSON.parse(savedSound) : true;
      this.logs = savedLogs ? JSON.parse(savedLogs) : [];

      if (!this.logs || this.logs.length === 0) {
        this.addLog('ระบบจัดคิว Like Town เริ่มต้นใช้งานเรียบร้อยแล้ว');
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.doctors = DEFAULT_DOCTORS;
      this.ranks = DEFAULT_RANKS;
      this.soundEnabled = true;
      this.logs = [];
    }
  }

  save() {
    try {
      localStorage.setItem('liketown_doctors', JSON.stringify(this.doctors));
      localStorage.setItem('liketown_ranks', JSON.stringify(this.ranks));
      localStorage.setItem('liketown_sound', JSON.stringify(this.soundEnabled));
      localStorage.setItem('liketown_logs', JSON.stringify(this.logs.slice(0, 50)));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  resetToDefault() {
    this.doctors = JSON.parse(JSON.stringify(DEFAULT_DOCTORS));
    this.ranks = JSON.parse(JSON.stringify(DEFAULT_RANKS));
    this.logs = [];
    this.addLog('รีเซ็ตข้อมูลสู่ค่าเริ่มต้นระบบ Like Town');
    this.save();
  }

  addLog(message) {
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logs.unshift({ time, message, id: Date.now() + Math.random() });
    if (this.logs.length > 50) this.logs.pop();
    this.save();
  }

  getRank(rankId) {
    return this.ranks.find(r => r.id === rankId) || {
      name: 'ไม่มียศ',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.3)'
    };
  }
}

// --- SOUND SYSTEM (Web Audio API - No external dependencies) ---
const SoundFX = {
  ctx: null,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  },

  playCallChime() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.45); // D6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.22);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.6);
  },

  playFinishChime() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  },

  playAfkWarning() {
    if (!state.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }
};

// --- INITIALIZE GLOBALS ---
const state = new AppState();
let warnedDoctors = new Set(); // To avoid repeating warning sound every second for AFK

// --- UI RENDER FUNCTIONS ---
function renderAll() {
  updateStats();
  if (state.viewMode === 'queue') {
    renderQueueView();
  } else {
    renderBoardView();
  }
  renderLogs();
  populateRankFilter();
}

function updateStats() {
  const total = state.doctors.length;
  const busyCount = state.doctors.filter(d => d.status === 'busy').length;
  const nextCount = state.doctors.filter(d => d.status === 'next').length;
  const queueCount = state.doctors.filter(d => d.status === 'queue').length;
  const afkCount = state.doctors.filter(d => d.status === 'afk').length;
  const totalCases = state.doctors.reduce((sum, d) => sum + (d.caseCount || 0), 0);

  document.getElementById('stat-total-docs').textContent = total;
  document.getElementById('stat-busy-docs').textContent = busyCount;
  document.getElementById('stat-next-docs').textContent = nextCount;
  document.getElementById('stat-queue-docs').textContent = queueCount;
  document.getElementById('stat-afk-docs').textContent = afkCount;
  document.getElementById('stat-total-cases').textContent = totalCases;

  // Sound toggle button UI
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    if (state.soundEnabled) {
      soundBtn.innerHTML = '<i class="fa-solid fa-volume-high text-orange-400"></i><span>เสียงเปิด</span>';
      soundBtn.classList.add('border-orange-500/50');
      soundBtn.classList.remove('border-gray-700');
    } else {
      soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark text-gray-400"></i><span>เสียงปิด</span>';
      soundBtn.classList.remove('border-orange-500/50');
      soundBtn.classList.add('border-gray-700');
    }
  }
}

// Filtered Doctors list
function getFilteredDoctors() {
  return state.doctors.filter(doc => {
    const matchesSearch = !state.searchQuery || 
      doc.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (doc.code && doc.code.toLowerCase().includes(state.searchQuery.toLowerCase()));
    const matchesRank = state.filterRank === 'all' || doc.rankId === state.filterRank;
    return matchesSearch && matchesRank;
  });
}

// Calculate remaining AFK time
function getAfkInfo(startTime) {
  if (!startTime) return { text: '00:00', isOvertime: false, secondsLeft: 0 };
  const totalSeconds = 15 * 60; // 15 mins
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const remainingSeconds = totalSeconds - elapsedSeconds;

  if (remainingSeconds <= 0) {
    const overtime = Math.abs(remainingSeconds);
    const m = Math.floor(overtime / 60).toString().padStart(2, '0');
    const s = (overtime % 60).toString().padStart(2, '0');
    return {
      text: `เกินเวลา +${m}:${s}`,
      isOvertime: true,
      secondsLeft: remainingSeconds
    };
  } else {
    const m = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
    const s = (remainingSeconds % 60).toString().padStart(2, '0');
    return {
      text: `เหลือ ${m}:${s}`,
      isOvertime: false,
      secondsLeft: remainingSeconds
    };
  }
}

// Render Queue Mode (ลำดับคิว 1, 2, 3...)
function renderQueueView() {
  const container = document.getElementById('queue-list-container');
  const boardContainer = document.getElementById('board-view-container');
  container.classList.remove('hidden');
  boardContainer.classList.add('hidden');

  const filtered = getFilteredDoctors();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-10 text-center text-gray-400">
        <i class="fa-solid fa-user-doctor text-4xl mb-3 text-gray-500"></i>
        <p class="text-lg font-medium">ไม่พบข้อมูลคุณหมอ</p>
        <p class="text-sm text-gray-500">กรุณากดปุ่ม "เพิ่มคุณหมอ" หรือเปลี่ยนคำค้นหา</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach((doc, index) => {
    const rank = state.getRank(doc.rankId);
    const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.none;
    const afkInfo = doc.status === 'afk' ? getAfkInfo(doc.afkStartTime) : null;
    const isAfkOvertime = afkInfo && afkInfo.isOvertime;

    let rowExtraClass = statusCfg.cardClass;
    if (isAfkOvertime) rowExtraClass += ' status-afk-overtime';

    html += `
      <div class="doctor-row glass-panel p-4 mb-3 rounded-2xl flex flex-wrap md:flex-nowrap items-center justify-between gap-4 border transition-all ${rowExtraClass}"
           draggable="true" 
           data-id="${doc.id}" 
           ondragstart="handleDragStart(event)" 
           ondragover="handleDragOver(event)" 
           ondragleave="handleDragLeave(event)" 
           ondrop="handleDrop(event)">
        
        <!-- Left: Drag handle, Order Number & Doctor Info -->
        <div class="flex items-center gap-3.5 flex-1 min-w-[220px]">
          <div class="cursor-grab active:cursor-grabbing text-gray-500 hover:text-orange-400 p-1">
            <i class="fa-solid fa-grip-vertical text-lg"></i>
          </div>

          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg font-mono bg-black/40 border border-orange-500/20 text-orange-400 shadow-inner">
            ${index + 1}
          </div>

          <div class="relative">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-900/50 to-orange-950/40 border border-orange-500/30 flex items-center justify-center text-xl text-orange-300 font-bold shadow-md">
              <i class="fa-solid fa-stethoscope"></i>
            </div>
            ${doc.status === 'busy' ? '<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span></span>' : ''}
            ${doc.status === 'next' ? '<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span></span>' : ''}
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-base font-bold text-white tracking-wide">${escapeHtml(doc.name)}</h3>
              ${doc.code ? `<span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-mono">${escapeHtml(doc.code)}</span>` : ''}
            </div>

            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs px-2.5 py-0.5 rounded-full font-medium inline-block" 
                    style="color: ${rank.color}; background-color: ${rank.bg}; border: 1px solid ${rank.border};">
                <i class="fa-solid fa-shield-halved text-[10px] mr-1"></i>${escapeHtml(rank.name)}
              </span>

              ${doc.notes ? `<span class="text-xs text-gray-400 italic truncate max-w-[150px]"><i class="fa-regular fa-comment-dots mr-1"></i>${escapeHtml(doc.notes)}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Middle: Status Selector & AFK Timer -->
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-start gap-1">
            <span class="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">สถานะปัจจุบัน</span>
            
            <div class="relative inline-block">
              <select onchange="changeDoctorStatus('${doc.id}', this.value)" 
                      class="appearance-none status-badge ${statusCfg.classBadge} cursor-pointer pl-3 pr-8 py-1.5 rounded-xl font-medium text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-black/50 border">
                <option value="next" ${doc.status === 'next' ? 'selected' : ''}>🟡 รอเคสถัดไป</option>
                <option value="busy" ${doc.status === 'busy' ? 'selected' : ''}>🔴 กำลังทำเคส</option>
                <option value="queue" ${doc.status === 'queue' ? 'selected' : ''}>🟣 ยังไม่ถึงเคส</option>
                <option value="none" ${doc.status === 'none' ? 'selected' : ''}>⚪ ยังไม่มีเคส</option>
                <option value="afk" ${doc.status === 'afk' ? 'selected' : ''}>☕ พัก/เหม่อไม่เกิน 15 นาที</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <i class="fa-solid fa-chevron-down text-[10px]"></i>
              </div>
            </div>
          </div>

          ${doc.status === 'afk' ? `
            <div class="flex flex-col items-start gap-1">
              <span class="text-[11px] text-gray-400 uppercase font-semibold">เวลาพักเบรก</span>
              <div class="px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${isAfkOvertime ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-amber-500/15 text-amber-300 border border-amber-500/40'}">
                <i class="fa-regular fa-clock"></i>
                <span class="afk-timer-text" data-start="${doc.afkStartTime}">${afkInfo.text}</span>
              </div>
            </div>
          ` : ''}

          <!-- Case Count Badge -->
          <div class="flex flex-col items-center gap-1 px-3 py-1 bg-black/30 rounded-xl border border-white/5">
            <span class="text-[10px] text-gray-400">ยอดเคส</span>
            <div class="flex items-center gap-1">
              <button onclick="changeCaseCount('${doc.id}', -1)" class="text-gray-400 hover:text-white px-1 text-xs">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="text-sm font-bold text-orange-400 font-mono px-1.5">${doc.caseCount || 0}</span>
              <button onclick="changeCaseCount('${doc.id}', 1)" class="text-gray-400 hover:text-white px-1 text-xs">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-2">
          <!-- Quick Action Buttons based on status -->
          ${doc.status === 'busy' ? `
            <button onclick="finishDoctorCase('${doc.id}')" 
                    class="px-3 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition">
              <i class="fa-solid fa-circle-check"></i> เสร็จเคส (วนคิว)
            </button>
          ` : ''}

          ${doc.status === 'next' ? `
            <button onclick="startDoctorCase('${doc.id}')" 
                    class="px-3 py-1.5 rounded-xl bg-red-600/25 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition">
              <i class="fa-solid fa-truck-medical"></i> รับเคสทันที
            </button>
          ` : ''}

          <!-- Move Up / Down in Queue -->
          <div class="flex items-center bg-black/40 rounded-xl border border-white/5 p-0.5">
            <button onclick="moveQueue('${doc.id}', -1)" title="เลื่อนคิวขึ้น" class="p-1.5 hover:text-orange-400 text-gray-400 hover:bg-white/5 rounded-lg transition text-xs">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button onclick="moveQueue('${doc.id}', 1)" title="เลื่อนคิวลง" class="p-1.5 hover:text-orange-400 text-gray-400 hover:bg-white/5 rounded-lg transition text-xs">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>

          <!-- Edit & Delete buttons -->
          <button onclick="openEditDoctorModal('${doc.id}')" title="แก้ไขข้อมูลหมอ" class="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button onclick="deleteDoctor('${doc.id}')" title="ลบคุณหมอ" class="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Render Board Mode (Kanban 5 คอลัมน์)
function renderBoardView() {
  const container = document.getElementById('queue-list-container');
  const boardContainer = document.getElementById('board-view-container');
  container.classList.add('hidden');
  boardContainer.classList.remove('hidden');

  const filtered = getFilteredDoctors();

  const statuses = ['next', 'busy', 'queue', 'afk', 'none'];
  const columns = {
    next: [],
    busy: [],
    queue: [],
    afk: [],
    none: []
  };

  filtered.forEach(doc => {
    if (columns[doc.status]) {
      columns[doc.status].push(doc);
    } else {
      columns.none.push(doc);
    }
  });

  let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">';

  statuses.forEach(statusKey => {
    const cfg = STATUS_CONFIG[statusKey];
    const docs = columns[statusKey];

    html += `
      <div class="glass-panel p-3.5 rounded-2xl flex flex-col min-h-[500px] border border-white/10">
        <!-- Column Header -->
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${cfg.dotColor}; box-shadow: 0 0 8px ${cfg.dotColor};"></span>
            <h4 class="font-bold text-sm text-white">${cfg.label}</h4>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-gray-300 font-mono font-bold">
            ${docs.length}
          </span>
        </div>

        <!-- Cards Container -->
        <div class="flex-1 space-y-2.5 overflow-y-auto max-h-[750px] pr-1">
    `;

    if (docs.length === 0) {
      html += `
        <div class="h-32 flex items-center justify-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl">
          ไม่มีคุณหมอในสถานะนี้
        </div>
      `;
    } else {
      docs.forEach(doc => {
        const rank = state.getRank(doc.rankId);
        const afkInfo = doc.status === 'afk' ? getAfkInfo(doc.afkStartTime) : null;
        const isAfkOvertime = afkInfo && afkInfo.isOvertime;

        html += `
          <div class="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-orange-500/40 transition-all shadow-md group ${isAfkOvertime ? 'status-afk-overtime' : ''}">
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="font-bold text-sm text-white truncate">${escapeHtml(doc.name)}</div>
              ${doc.code ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">${escapeHtml(doc.code)}</span>` : ''}
            </div>

            <div class="mb-2">
              <span class="text-[10px] px-2 py-0.5 rounded-full font-medium inline-block" 
                    style="color: ${rank.color}; background-color: ${rank.bg}; border: 1px solid ${rank.border};">
                ${escapeHtml(rank.name)}
              </span>
            </div>

            ${doc.status === 'afk' ? `
              <div class="mb-2 px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center justify-between ${isAfkOvertime ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}">
                <span class="text-[10px] text-gray-400">เวลาพัก:</span>
                <span class="afk-timer-text" data-start="${doc.afkStartTime}">${afkInfo.text}</span>
              </div>
            ` : ''}

            <!-- Quick Status Change in Board -->
            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <div class="text-[11px] text-gray-400">
                เคสสะสม: <span class="text-orange-400 font-bold font-mono">${doc.caseCount || 0}</span>
              </div>

              <div class="flex items-center gap-1">
                <select onchange="changeDoctorStatus('${doc.id}', this.value)" 
                        class="bg-gray-900 text-gray-300 text-[10px] rounded px-1.5 py-1 border border-gray-700 focus:outline-none">
                  <option value="next" ${doc.status === 'next' ? 'selected' : ''}>รอเคสถัดไป</option>
                  <option value="busy" ${doc.status === 'busy' ? 'selected' : ''}>กำลังทำเคส</option>
                  <option value="queue" ${doc.status === 'queue' ? 'selected' : ''}>ยังไม่ถึงเคส</option>
                  <option value="afk" ${doc.status === 'afk' ? 'selected' : ''}>พัก 15 น.</option>
                  <option value="none" ${doc.status === 'none' ? 'selected' : ''}>ยังไม่มีเคส</option>
                </select>
                <button onclick="openEditDoctorModal('${doc.id}')" class="text-gray-500 hover:text-white p-1">
                  <i class="fa-solid fa-pen text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;
  });

  html += '</div>';
  boardContainer.innerHTML = html;
}

// Render Recent Activity Logs
function renderLogs() {
  const container = document.getElementById('activity-logs');
  if (!container) return;

  if (state.logs.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-500 italic">ยังไม่มีกิจกรรม</p>';
    return;
  }

  container.innerHTML = state.logs.slice(0, 10).map(log => `
    <div class="text-xs py-1.5 border-b border-white/5 flex items-start gap-2">
      <span class="text-gray-500 font-mono shrink-0">${log.time}</span>
      <span class="text-gray-300">${escapeHtml(log.message)}</span>
    </div>
  `).join('');
}

// Populate Rank filter dropdown
function populateRankFilter() {
  const select = document.getElementById('filter-rank-select');
  if (!select) return;

  const currentVal = state.filterRank;
  select.innerHTML = '<option value="all">ทุกยศตำแหน่ง</option>' + 
    state.ranks.map(r => `
      <option value="${r.id}" ${r.id === currentVal ? 'selected' : ''}>${escapeHtml(r.name)}</option>
    `).join('');
}

// --- QUEUE ACTIONS & LOGIC ---

// 1. เรียกเคสถัดไป (Promote Next to Busy, and Next in queue to Next)
function callNextCase() {
  // Find doctor with status 'next'
  const nextDoc = state.doctors.find(d => d.status === 'next');

  if (nextDoc) {
    nextDoc.status = 'busy';
    state.addLog(`🔔 เรียก ${nextDoc.name} (${nextDoc.code || 'หมอ'}) เข้าทำเคส`);
    SoundFX.playCallChime();

    // Auto-promote first 'queue' doctor to 'next'
    const queueDoc = state.doctors.find(d => d.status === 'queue');
    if (queueDoc) {
      queueDoc.status = 'next';
      state.addLog(`👉 ${queueDoc.name} ขยับขึ้นเป็น "รอเคสถัดไป"`);
    }
  } else {
    // If no one is currently 'next', check if someone is in 'queue'
    const queueDoc = state.doctors.find(d => d.status === 'queue');
    if (queueDoc) {
      queueDoc.status = 'next';
      state.addLog(`👉 ${queueDoc.name} ได้รับการตั้งเป็น "รอเคสถัดไป"`);
      SoundFX.playCallChime();
    } else {
      showToast('ไม่มีคุณหมอที่อยู่ในคิวเรียกเคส', 'warning');
      return;
    }
  }

  state.save();
  renderAll();
  showToast('เรียกเคสถัดไปเรียบร้อยแล้ว!', 'success');
}

// 2. จบเคสแล้ววนไปต่อท้ายคิว
function finishDoctorCase(doctorId) {
  const doc = state.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  doc.caseCount = (doc.caseCount || 0) + 1;
  doc.status = 'queue';
  state.addLog(`✅ ${doc.name} ทำเคสเสร็จสิ้น (+1 เคส รวม ${doc.caseCount}) และวนไปต่อท้ายคิว`);
  SoundFX.playFinishChime();

  // Move doctor to end of doctors array
  const index = state.doctors.findIndex(d => d.id === doctorId);
  if (index > -1) {
    state.doctors.splice(index, 1);
    state.doctors.push(doc);
  }

  // Ensure there's a doctor with status 'next'
  ensureNextDoctorAssigned();

  state.save();
  renderAll();
  showToast(`${doc.name} เสร็จเคสและวนคิวเรียบร้อย!`, 'success');
}

// Start Doctor Case immediately from 'next'
function startDoctorCase(doctorId) {
  const doc = state.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  doc.status = 'busy';
  state.addLog(`🚑 ${doc.name} เริ่มทำเคส`);
  SoundFX.playCallChime();

  ensureNextDoctorAssigned();

  state.save();
  renderAll();
}

// Ensure there is always a 'next' doctor if someone is in queue
function ensureNextDoctorAssigned() {
  const hasNext = state.doctors.some(d => d.status === 'next');
  if (!hasNext) {
    const queueDoc = state.doctors.find(d => d.status === 'queue');
    if (queueDoc) {
      queueDoc.status = 'next';
      state.addLog(`👉 เลื่อน ${queueDoc.name} ขึ้นเป็น "รอเคสถัดไป"`);
    }
  }
}

// 3. เปลี่ยนสถานะของหมอโดยตรง
function changeDoctorStatus(doctorId, newStatus) {
  const doc = state.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  const oldStatus = doc.status;
  doc.status = newStatus;

  // Handle AFK Timer logic
  if (newStatus === 'afk') {
    doc.afkStartTime = Date.now();
    state.addLog(`☕ ${doc.name} เริ่มพัก/เหม่อ (จับเวลา 15 นาที)`);
  } else {
    doc.afkStartTime = null;
    warnedDoctors.delete(doc.id);
  }

  const oldLabel = STATUS_CONFIG[oldStatus]?.label || oldStatus;
  const newLabel = STATUS_CONFIG[newStatus]?.label || newStatus;

  if (newStatus !== 'afk') {
    state.addLog(`🔄 เปลี่ยนสถานะ ${doc.name}: ${oldLabel} ➔ ${newLabel}`);
  }

  state.save();
  renderAll();
}

// Adjust case count manually
function changeCaseCount(doctorId, delta) {
  const doc = state.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  doc.caseCount = Math.max(0, (doc.caseCount || 0) + delta);
  state.save();
  renderAll();
}

// Move doctor up or down in queue
function moveQueue(doctorId, direction) {
  const index = state.doctors.findIndex(d => d.id === doctorId);
  if (index === -1) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= state.doctors.length) return;

  // Swap
  const temp = state.doctors[index];
  state.doctors[index] = state.doctors[targetIndex];
  state.doctors[targetIndex] = temp;

  state.save();
  renderAll();
}

// --- DRAG AND DROP REORDERING ---
let draggedDoctorId = null;

function handleDragStart(e) {
  const row = e.target.closest('.doctor-row');
  if (!row) return;
  draggedDoctorId = row.dataset.id;
  row.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  const row = e.target.closest('.doctor-row');
  if (row && row.dataset.id !== draggedDoctorId) {
    row.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const row = e.target.closest('.doctor-row');
  if (row) {
    row.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const targetRow = e.target.closest('.doctor-row');
  if (!targetRow) return;

  targetRow.classList.remove('drag-over');
  const targetId = targetRow.dataset.id;

  const allRows = document.querySelectorAll('.doctor-row');
  allRows.forEach(r => r.classList.remove('dragging', 'drag-over'));

  if (!draggedDoctorId || draggedDoctorId === targetId) return;

  const fromIndex = state.doctors.findIndex(d => d.id === draggedDoctorId);
  const toIndex = state.doctors.findIndex(d => d.id === targetId);

  if (fromIndex > -1 && toIndex > -1) {
    const [movedDoctor] = state.doctors.splice(fromIndex, 1);
    state.doctors.splice(toIndex, 0, movedDoctor);
    state.addLog(`↕ สลับลำดับคิว: ${movedDoctor.name}`);
    state.save();
    renderAll();
  }
  draggedDoctorId = null;
}

// --- LIVE 15-MINUTE AFK TICKER & OVERTIME ALARM ---
setInterval(() => {
  const afkElements = document.querySelectorAll('.afk-timer-text');
  let hasActiveAfk = false;

  afkElements.forEach(el => {
    const startTime = parseInt(el.dataset.start, 10);
    if (!startTime) return;

    hasActiveAfk = true;
    const info = getAfkInfo(startTime);
    el.textContent = info.text;

    // Check if overtime alarm needed
    if (info.isOvertime) {
      const row = el.closest('.doctor-row');
      const docId = row ? row.dataset.id : null;
      if (docId && !warnedDoctors.has(docId)) {
        SoundFX.playAfkWarning();
        warnedDoctors.add(docId);
        showToast('⚠️ มีคุณหมอพักเกินเวลา 15 นาทีแล้ว!', 'warning');
      }
    }
  });
}, 1000);

// --- MODAL & FORM HANDLERS ---

// Doctor Modal (Add & Edit)
function openAddDoctorModal() {
  document.getElementById('modal-doctor-title').textContent = 'เพิ่มคุณหมอใหม่';
  document.getElementById('doctor-id-input').value = '';
  document.getElementById('doctor-name-input').value = '';
  document.getElementById('doctor-code-input').value = '';
  document.getElementById('doctor-notes-input').value = '';
  document.getElementById('doctor-cases-input').value = '0';
  document.getElementById('doctor-status-input').value = 'queue';

  populateRankOptions();
  showModal('modal-doctor');
}

function openEditDoctorModal(doctorId) {
  const doc = state.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  document.getElementById('modal-doctor-title').textContent = 'แก้ไขข้อมูลคุณหมอ';
  document.getElementById('doctor-id-input').value = doc.id;
  document.getElementById('doctor-name-input').value = doc.name;
  document.getElementById('doctor-code-input').value = doc.code || '';
  document.getElementById('doctor-notes-input').value = doc.notes || '';
  document.getElementById('doctor-cases-input').value = doc.caseCount || 0;
  document.getElementById('doctor-status-input').value = doc.status || 'queue';

  populateRankOptions(doc.rankId);
  showModal('modal-doctor');
}

function populateRankOptions(selectedRankId = null) {
  const select = document.getElementById('doctor-rank-input');
  select.innerHTML = state.ranks.map(r => `
    <option value="${r.id}" ${r.id === selectedRankId ? 'selected' : ''}>${escapeHtml(r.name)}</option>
  `).join('');
}

function saveDoctor(e) {
  e.preventDefault();
  const id = document.getElementById('doctor-id-input').value;
  const name = document.getElementById('doctor-name-input').value.trim();
  const code = document.getElementById('doctor-code-input').value.trim();
  const rankId = document.getElementById('doctor-rank-input').value;
  const status = document.getElementById('doctor-status-input').value;
  const notes = document.getElementById('doctor-notes-input').value.trim();
  const caseCount = parseInt(document.getElementById('doctor-cases-input').value, 10) || 0;

  if (!name) {
    showToast('กรุณาระบุชื่อคุณหมอ', 'error');
    return;
  }

  if (id) {
    // Edit existing doctor
    const doc = state.doctors.find(d => d.id === id);
    if (doc) {
      doc.name = name;
      doc.code = code;
      doc.rankId = rankId;
      doc.notes = notes;
      doc.caseCount = caseCount;

      if (doc.status !== status) {
        doc.status = status;
        if (status === 'afk') doc.afkStartTime = Date.now();
        else doc.afkStartTime = null;
      }

      state.addLog(`✏️ แก้ไขข้อมูล ${name}`);
      showToast('บันทึกข้อมูลคุณหมอเรียบร้อย', 'success');
    }
  } else {
    // Add new doctor
    const newDoc = {
      id: 'doc-' + Date.now(),
      name,
      code,
      rankId,
      status,
      caseCount,
      afkStartTime: status === 'afk' ? Date.now() : null,
      notes
    };
    state.doctors.push(newDoc);
    state.addLog(`➕ เพิ่มคุณหมอใหม่: ${name} (${code || 'ไม่มีรหัส'})`);
    showToast('เพิ่มคุณหมอเรียบร้อยแล้ว!', 'success');
  }

  state.save();
  closeModal('modal-doctor');
  renderAll();
}

function deleteDoctor(doctorId) {
  const doc = state.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  if (confirm(`คุณต้องการลบ "${doc.name}" ออกจากคิวหรือไม่?`)) {
    state.doctors = state.doctors.filter(d => d.id !== doctorId);
    state.addLog(`🗑️ ลบ ${doc.name} ออกจากระบบ`);
    state.save();
    renderAll();
    showToast(`ลบคุณหมอ ${doc.name} เรียบร้อย`, 'info');
  }
}

// --- RANK MANAGEMENT MODAL ---
function openRankModal() {
  renderRanksList();
  showModal('modal-ranks');
}

function renderRanksList() {
  const container = document.getElementById('ranks-list-container');
  if (!container) return;

  container.innerHTML = state.ranks.map((r, index) => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
      <div class="flex items-center gap-3">
        <span class="w-4 h-4 rounded-full border" style="background-color: ${r.color}; border-color: ${r.color};"></span>
        <span class="font-bold text-sm text-white">${escapeHtml(r.name)}</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs px-2.5 py-0.5 rounded-full" style="color: ${r.color}; background-color: ${r.bg}; border: 1px solid ${r.border};">
          ตัวอย่างป้าย
        </span>
        <button onclick="deleteRank('${r.id}')" class="p-1.5 text-gray-400 hover:text-red-400 rounded-lg">
          <i class="fa-solid fa-trash text-xs"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function addNewRank(e) {
  e.preventDefault();
  const name = document.getElementById('new-rank-name').value.trim();
  const color = document.getElementById('new-rank-color').value;

  if (!name) {
    showToast('กรุณาระบุชื่อยศ / ตำแหน่ง', 'error');
    return;
  }

  // Generate bg and border with opacity
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 255;
  const g = parseInt(hex.substring(2, 4), 16) || 122;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  const newRank = {
    id: 'rank-' + Date.now(),
    name,
    color,
    bg: `rgba(${r}, ${g}, ${b}, 0.16)`,
    border: `rgba(${r}, ${g}, ${b}, 0.45)`
  };

  state.ranks.push(newRank);
  state.addLog(`🎖️ สร้างยศใหม่: ${name}`);
  state.save();

  document.getElementById('new-rank-name').value = '';
  renderRanksList();
  populateRankFilter();
  showToast(`เพิ่มยศ "${name}" สำเร็จ!`, 'success');
}

function deleteRank(rankId) {
  if (state.ranks.length <= 1) {
    showToast('ต้องมียศอย่างน้อย 1 ตำแหน่งในระบบ', 'warning');
    return;
  }

  const rank = state.ranks.find(r => r.id === rankId);
  if (!rank) return;

  if (confirm(`คุณต้องการลบยศ "${rank.name}" หรือไม่?`)) {
    state.ranks = state.ranks.filter(r => r.id !== rankId);
    state.addLog(`ลบยศ: ${rank.name}`);
    state.save();
    renderRanksList();
    populateRankFilter();
    renderAll();
    showToast(`ลบยศ ${rank.name} เรียบร้อย`, 'info');
  }
}

// --- UTILITY FUNCTIONS ---
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const typeClasses = {
    success: 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100',
    warning: 'bg-amber-900/90 border-amber-500/50 text-amber-100',
    error: 'bg-red-900/90 border-red-500/50 text-red-100',
    info: 'bg-orange-950/90 border-orange-500/50 text-orange-100'
  }[type] || 'bg-gray-900/90 border-gray-500/50 text-gray-100';

  toast.className = `p-3 rounded-xl border shadow-xl text-sm font-medium flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${typeClasses}`;
  toast.innerHTML = `
    <i class="fa-solid fa-circle-info"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Export Data to JSON
function exportData() {
  const data = {
    doctors: state.doctors,
    ranks: state.ranks,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `liketown-doctor-queue-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('ส่งออกไฟล์ข้อมูลสำเร็จ', 'success');
}

// Import Data from JSON
function triggerImport() {
  document.getElementById('import-file-input').click();
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.doctors && data.ranks) {
        state.doctors = data.doctors;
        state.ranks = data.ranks;
        state.addLog('📥 นำเข้าข้อมูลระบบจากไฟล์เรียบร้อย');
        state.save();
        renderAll();
        showToast('นำเข้าข้อมูลสำเร็จ!', 'success');
      } else {
        showToast('รูปแบบไฟล์ข้อมูลไม่ถูกต้อง', 'error');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// --- INITIALIZE EVENT LISTENERS ON DOM LOAD ---
document.addEventListener('DOMContentLoaded', () => {
  // Search and Filter Listeners
  const searchInput = document.getElementById('search-doctor-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (state.viewMode === 'queue') renderQueueView();
      else renderBoardView();
    });
  }

  const rankSelect = document.getElementById('filter-rank-select');
  if (rankSelect) {
    rankSelect.addEventListener('change', (e) => {
      state.filterRank = e.target.value;
      if (state.viewMode === 'queue') renderQueueView();
      else renderBoardView();
    });
  }

  // View Mode Tabs
  const tabQueue = document.getElementById('tab-queue-view');
  const tabBoard = document.getElementById('tab-board-view');
  if (tabQueue && tabBoard) {
    tabQueue.addEventListener('click', () => {
      state.viewMode = 'queue';
      tabQueue.classList.add('active');
      tabBoard.classList.remove('active');
      renderAll();
    });
    tabBoard.addEventListener('click', () => {
      state.viewMode = 'board';
      tabBoard.classList.add('active');
      tabQueue.classList.remove('active');
      renderAll();
    });
  }

  // Sound Toggle
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      state.save();
      updateStats();
      showToast(state.soundEnabled ? 'เปิดระบบเสียงแจ้งเตือนแล้ว' : 'ปิดระบบเสียงแล้ว', 'info');
      if (state.soundEnabled) SoundFX.playCallChime();
    });
  }

  // Doctor Form Submit
  const docForm = document.getElementById('form-doctor');
  if (docForm) docForm.addEventListener('submit', saveDoctor);

  // Rank Form Submit
  const rankForm = document.getElementById('form-add-rank');
  if (rankForm) rankForm.addEventListener('submit', addNewRank);

  // Quick Action Buttons
  const btnCallNext = document.getElementById('btn-call-next');
  if (btnCallNext) btnCallNext.addEventListener('click', callNextCase);

  const btnReset = document.getElementById('btn-reset-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('คุณต้องการรีเซ็ตข้อมูลคิวหมอทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
        state.resetToDefault();
        renderAll();
        showToast('รีเซ็ตข้อมูลสู่ค่าเริ่มต้นเรียบร้อย', 'info');
      }
    });
  }

  // Initial Render
  renderAll();
});
