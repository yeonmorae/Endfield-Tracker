const { ipcRenderer } = require('electron');

function getInitialTasks() {
    return [
        { id: 1, name: "관리권 교환", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 2, name: "택배", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 3, name: "위탁 의뢰", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 4, name: "재활용 센터", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 5, name: "희귀 채집물", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 6, name: "무트코인", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 7, name: "친구 지원", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 8, name: "제강호 시설", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 9, name: "무릉 환경관측", type: "custom", time: "2일마다", visible: true, checked: false, canDelete: false },
        { id: 10, name: "크레딧 사용", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 11, name: "이성 소모", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 12, name: "일일 퀘스트", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 13, name: "각인권/단조제 구매", type: "weekly", visible: true, checked: false, canDelete: false },
        { id: 14, name: "주간 업무", type: "weekly", visible: true, checked: false, canDelete: false },
        { id: 15, name: "농장 관리", type: "daily", visible: true, checked: false, canDelete: false },
        { id: 16, name: "재료 채집", type: "daily", visible: true, checked: false, canDelete: false }
    ];
}

let userTasks = JSON.parse(localStorage.getItem('userTasks'));
if (!userTasks || userTasks.length === 0) {
    userTasks = getInitialTasks();
    localStorage.setItem('userTasks', JSON.stringify(userTasks));
}
let userEvents = JSON.parse(localStorage.getItem('userEvents')) || [];

function renderMainList() {
    const dailyContainer = document.getElementById('daily-list');
    const weeklyContainer = document.getElementById('weekly-list');
    dailyContainer.innerHTML = ''; weeklyContainer.innerHTML = '';

    userTasks.filter(t => t.visible).forEach(task => {
        const html = `
            <div class="task-item" onclick="toggleTaskCheck(${task.id})">
                <span>${task.name} ${task.time ? `<small>(${task.time})</small>` : ''}</span>
                <input type="checkbox" ${task.checked ? 'checked' : ''} 
                       onclick="event.stopPropagation()" 
                       onchange="toggleTaskCheck(${task.id})">
            </div>`;
        if (task.type === 'weekly') weeklyContainer.innerHTML += html;
        else dailyContainer.innerHTML += html;
    });
    renderEvents();
}

function renderEvents() {
    const container = document.getElementById('event-list');
    container.innerHTML = '';
    userEvents.forEach((event, index) => {
        const dday = calculateDDay(event.date);
        container.innerHTML += `
            <div class="task-item" onclick="toggleEvent(${index})">
                <span style="flex:2">${event.name}</span>
                <span class="${dday.class}" style="flex:1; text-align:center">${dday.text}</span>
                <input type="checkbox" ${event.checked ? 'checked' : ''} 
                       onclick="event.stopPropagation()" 
                       onchange="toggleEvent(${index})">
            </div>`;
    });
}

function renderVisibilitySettings() {
    const container = document.getElementById('visibility-controls');
    container.innerHTML = '';
    const addHeader = (title, color) => {
        container.innerHTML += `<div style="grid-column:1/-1; color:${color}; font-size:0.85rem; margin-top:10px; border-bottom:1px solid #444;">${title}</div>`;
    };

    addHeader("■ 일간 숙제", "#00ffcc");
    userTasks.filter(t => t.type !== 'weekly').forEach(t => container.innerHTML += createSettingItemHTML(t));
    addHeader("■ 주간 숙제", "#00ffcc");
    userTasks.filter(t => t.type === 'weekly').forEach(t => container.innerHTML += createSettingItemHTML(t));
    addHeader("■ 이벤트 관리", "#ffcc00");
    userEvents.forEach((ev, idx) => {
        container.innerHTML += `<div class="setting-item"><span>${ev.name}</span><button class="del-btn" onclick="deleteEvent(${idx})">삭제</button></div>`;
    });
}

function createSettingItemHTML(task) {
    const deleteBtn = (task.canDelete === true) ? `<button class="del-btn" onclick="deleteTask(${task.id})">X</button>` : '';
    return `<div class="setting-item">
        <span>${task.name}</span>
        <div>
            <button onclick="toggleVisibility(${task.id})" style="background:${task.visible ? '#00ffcc' : '#555'}; color:${task.visible ? '#000' : '#fff'}; padding:2px 5px;">${task.visible ? '공개' : '비공개'}</button>
            ${deleteBtn}
        </div>
    </div>`;
}

window.toggleVisibility = (id) => { const t = userTasks.find(x => x.id === id); if (t) t.visible = !t.visible; save(); };
window.deleteTask = (id) => { if (confirm("삭제할까요?")) { userTasks = userTasks.filter(x => x.id !== id); save(); } };
window.deleteEvent = (idx) => { if (confirm("삭제할까요?")) { userEvents.splice(idx, 1); save(); } };
window.toggleTaskCheck = (id) => { 
    const t = userTasks.find(x => x.id === id); 
    if (t) {
        t.checked = !t.checked; 
        localStorage.setItem('userTasks', JSON.stringify(userTasks));
        renderMainList(); 
    }
};
window.toggleEvent = (idx) => { 
    userEvents[idx].checked = !userEvents[idx].checked; 
    localStorage.setItem('userEvents', JSON.stringify(userEvents));
    renderMainList();
};

function save() {
    localStorage.setItem('userTasks', JSON.stringify(userTasks));
    localStorage.setItem('userEvents', JSON.stringify(userEvents));
    renderVisibilitySettings(); renderMainList();
}

function calculateDDay(date) {
    const diff = new Date(date).setHours(5, 0, 0, 0) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return { text: "D-Day", class: "expired" };
    if (days < 0) return { text: "만료", class: "expired" };
    return { text: `D-${days}`, class: "" };
}

window.onload = () => {
    const modal = document.getElementById('settings-modal');
    const opacitySlider = document.getElementById('set-opacity');
    const opacityText = document.getElementById('opacity-value');

    opacityText.innerText = opacitySlider.value;
    document.getElementById('new-event-date').value = new Date().toISOString().split('T')[0];

    document.getElementById('open-settings').onclick = () => { renderVisibilitySettings(); modal.style.display = 'block'; };
    document.getElementById('close-x-settings').onclick = () => modal.style.display = 'none';

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') modal.style.display = 'none';
    });

    document.getElementById('set-always-on-top').onchange = (e) => ipcRenderer.send('toggle-always-on-top', e.target.checked);
    opacitySlider.oninput = (e) => {
        opacityText.innerText = e.target.value;
        ipcRenderer.send('change-opacity', e.target.value / 100);
    };

    const taskTypeRadios = document.querySelectorAll('input[name="task-type"]');
    taskTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            document.getElementById('custom-time-container').style.display = (radio.value === 'custom') ? 'block' : 'none';
        });
    });

    document.getElementById('add-task-btn').onclick = () => {
        const name = document.getElementById('new-task-name').value;
        const type = document.querySelector('input[name="task-type"]:checked').value;
        const time = document.getElementById('new-task-time').value;
        if (!name) return alert("이름 입력!");
        userTasks.push({ id: Date.now(), name, type, time, visible: true, checked: false, canDelete: true });
        document.getElementById('new-task-name').value = ''; save();
    };

    document.getElementById('add-event-btn').onclick = () => {
        const name = document.getElementById('new-event-name').value;
        const date = document.getElementById('new-event-date').value;
        if (!name || !date) return alert("입력 누락!");
        userEvents.push({ name, date, checked: false });
        document.getElementById('new-event-name').value = ''; save();
    };

    renderMainList();
    setInterval(checkReset, 60000);
    checkReset();
};

function checkReset() {
    const now = new Date();
    const last = localStorage.getItem('lastReset');
    if (now.getHours() >= 5 && last !== now.toDateString()) {
        userTasks.forEach(t => t.checked = false);
        if (now.getDay() === 1) userTasks.filter(t => t.type === 'weekly').forEach(t => t.checked = false);
        save();
        localStorage.setItem('lastReset', now.toDateString());
    }
}