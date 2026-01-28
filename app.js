const body = document.body;

const addBtn = document.getElementById("addEntry");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const saveBtn = document.getElementById("saveEntry");

const foodInput = document.getElementById("foodInput");
const extraInput = document.getElementById("extraInput");
const checkboxes = document.querySelectorAll(".checkbox-grid input");

const list = document.getElementById("entryList");
const themeToggle = document.getElementById("themeToggle");
const printBtn = document.getElementById("printPdf");

const confirmModal = document.getElementById("confirmModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

const SYMPTOMS = ["Bewusstlos", "Übergeben", "Durchfall", "Ausschlag", "Akne"];

let entries = JSON.parse(localStorage.getItem("entries") || "[]");
let currentIndex = null;
let mode = "new";

/* THEME */
if (localStorage.getItem("theme") === "light") {
  body.classList.add("light");
}

themeToggle.onclick = () => {
  body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    body.classList.contains("light") ? "light" : "dark"
  );
};

/* MODAL */
addBtn.onclick = () => openModal("new");

function openModal(m, data = null, index = null) {
  modal.classList.remove("hidden");
  mode = m;
  currentIndex = index;

  foodInput.value = data?.food || "";
  extraInput.value = data?.extra || "";

  checkboxes.forEach(c => {
    c.checked = data?.symptoms?.includes(c.value) || false;
    c.disabled = mode === "view";
  });

  foodInput.readOnly = mode === "view";
  extraInput.readOnly = mode === "view";
  saveBtn.style.display = mode === "view" ? "none" : "block";
}

closeModal.onclick = () => modal.classList.add("hidden");

/* SAVE */
saveBtn.onclick = () => {
  if (!foodInput.value.trim()) return;

  const entry = {
    date: new Date().toLocaleDateString("de-DE"),
    timestamp: Date.now(),
    food: foodInput.value,
    extra: extraInput.value,
    symptoms: [...checkboxes].filter(c => c.checked).map(c => c.value)
  };

  if (mode === "edit") entries[currentIndex] = entry;
  else entries.push(entry);

  localStorage.setItem("entries", JSON.stringify(entries));
  modal.classList.add("hidden");
  render();
};

/* LIST RENDER – NEU → ALT */
function render() {
  list.innerHTML = "";

  [...entries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((e, i) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${e.date}</strong>
        <div class="row">
          <button>Ansehen</button>
          <button>Bearbeiten</button>
          <button class="danger">Löschen</button>
        </div>
      `;

      const [view, edit, del] = li.querySelectorAll("button");

      view.onclick = () => openModal("view", e, i);
      edit.onclick = () => openModal("edit", e, i);
      del.onclick = () => openDelete(i);

      list.appendChild(li);
    });
}

/* DELETE */
function openDelete(i) {
  confirmModal.classList.remove("hidden");

  confirmDelete.onclick = () => {
    entries.splice(i, 1);
    localStorage.setItem("entries", JSON.stringify(entries));
    confirmModal.classList.add("hidden");
    render();
  };

  cancelDelete.onclick = () => confirmModal.classList.add("hidden");
}

/* PDF – KEINE & MEHR */
printBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  entries.forEach(entry => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(entry.date, 10, y);
    y += 8;

    doc.setFont(undefined, "normal");
    doc.setFontSize(11);
    doc.text(`Lebensmittel: ${entry.food}`, 10, y);
    y += 6;

    if (entry.extra) {
      doc.text(`Extra: ${entry.extra}`, 10, y);
      y += 6;
    }

    SYMPTOMS.forEach(sym => {
      const checked = entry.symptoms.includes(sym);
      doc.text(`[${checked ? "x" : " "}] ${sym}`, 12, y);
      y += 5;
    });

    y += 10;
  });

  doc.save("Essensliste.pdf");
};

render();
