
let jegyek = [];

const STORAGE_KEY = 'naplo_jegyek';
const tantargySelect = document.getElementById('tantargy');
const gradeButtons = document.querySelectorAll('.grade-btn');
const hozzaadasBtn = document.getElementById('hozzaadas');
const jegyekTbody = document.getElementById('jegyek-tbody');
const atlagSzoveg = document.getElementById('atlag-szoveg');
const tantargyAtlagTbody = document.getElementById('tantargy-atlag-tbody');

// Kiválasztott jegy (állapot)
let selectedGrade = null;

// Alkalmazás inicializálása
function init() {
    loadFromStorage();
    setupEventListeners();
    populateSubjects();
    renderGrades();
    updateAverages();
}

// Event listenrek beállítása
function setupEventListeners() {
    
    gradeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectGrade(parseInt(e.target.dataset.grade));
        });
    });

    
    hozzaadasBtn.addEventListener('click', addGrade);

    
    tantargySelect.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addGrade();
        }
    });
}

// Jegy kiválasztása
function selectGrade(grade) {
    selectedGrade = grade;
    
    
    gradeButtons.forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.grade) === grade) {
            btn.classList.add('selected');
        }
    });
}

// Jegy hozzáadása
function addGrade() {
    const subject = tantargySelect.value.trim();

    if (!subject) {
        alert('Kérjük válasszon egy tantárgyat!');
        return;
    }

    if (selectedGrade === null) {
        alert('Kérjük válasszon egy jegyet!');
        return;
    }

    // Új jegy objektum
    const ujJegy = {
        tantargy: subject,
        jegy: selectedGrade,
        datum: getTodayDate(),
        id: Date.now() // Egyedi azonosító
    };

    // Hozzáadás a tömbhöz
    jegyek.push(ujJegy);

    saveToStorage();

    populateSubjects();
    renderGrades();
    updateAverages();

    tantargySelect.value = '';
    selectedGrade = null;
    gradeButtons.forEach(btn => btn.classList.remove('selected'));
}

// Jegy törlése
function deleteGrade(id) {
    if (confirm('Biztosan törölni szeretné ezt a jegyet?')) {
        jegyek = jegyek.filter(j => j.id !== id);
        saveToStorage();
        renderGrades();
        updateAverages();
        populateSubjects();
    }
}

// Jegyek megjelenítése a táblázatban
function renderGrades() {
    jegyekTbody.innerHTML = '';

    if (jegyek.length === 0) {
        jegyekTbody.innerHTML = '<tr><td colspan="5" class="empty-message">Nincs még felvett jegy</td></tr>';
        return;
    }

    jegyek.slice().reverse().forEach((jegy, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${jegyek.length - index}</td>
            <td>${jegy.tantargy}</td>
            <td><strong>${jegy.jegy}</strong></td>
            <td>${jegy.datum}</td>
            <td><button class="delete-btn" onclick="deleteGrade(${jegy.id})">Törlés</button></td>
        `;
        jegyekTbody.appendChild(row);
    });
}

// Átlagok frissítése
function updateAverages() {
    const atlag = calculateOverallAverage();
    atlagSzoveg.textContent = `Átlag: ${atlag.toFixed(2)}`;

    renderSubjectAverages();
}

// Összátlag kiszámítása
function calculateOverallAverage() {
    if (jegyek.length === 0) return 0;

    return jegyek.reduce((sum, jegy) => sum + jegy.jegy, 0) / jegyek.length;
}

function renderSubjectAverages() {
    tantargyAtlagTbody.innerHTML = '';

    if (jegyek.length === 0) {
        tantargyAtlagTbody.innerHTML = '<tr><td colspan="2" class="empty-message">Nincs még felvett jegy</td></tr>';
        return;
    }

    // Tantárgyak csoportosítása
    const bySubject = {};
    jegyek.forEach(jegy => {
        if (!bySubject[jegy.tantargy]) {
            bySubject[jegy.tantargy] = [];
        }
        bySubject[jegy.tantargy].push(jegy.jegy);
    });

    Object.keys(bySubject).sort().forEach(subject => {
        const grades = bySubject[subject];
        const avg = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject}</td>
            <td>${avg.toFixed(2)}</td>
        `;
        tantargyAtlagTbody.appendChild(row);
    });
}

// Tantárgyak feltöltése 
function populateSubjects() {
    const subjects = [...new Set(jegyek.map(j => j.tantargy))];
    const currentValue = tantargySelect.value;

    // Lehetséges tantárgyak (alapértékek)
    const defaultSubjects = ['Matematika', 'Magyar', 'Angol', 'Informatika', 'Történelem', 'Biológia'];
    const allSubjects = [...new Set([...subjects, ...defaultSubjects])].sort();

    tantargySelect.innerHTML = '<option value="">Tantárgy kiválasztása</option>';
    allSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        tantargySelect.appendChild(option);
    });

    tantargySelect.value = currentValue;
}

// localStorage
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jegyek));
}
function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        jegyek = JSON.parse(stored);
    }
}

// Mai dátum formázása (YYYY-MM-DD)
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
}

// Alkalmazás indítása
init();