let user = "";
let userType = "cliente";
let availableTimes = {};
let appointments = [];

const registeredBarbers = ["Juan", "João", "Pedro", "Batista"];

document.getElementById("userType").addEventListener("change", function () {
  const emailInput = document.getElementById("email");
  emailInput.style.display = this.value === "barbeiro" ? "none" : "block";
});

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value.trim();
  userType = document.getElementById("userType").value;
  user = username;

  if (!username) return alert("Informe o nome de usuário.");

  if (userType === "barbeiro") {
    if (!registeredBarbers.includes(username)) return alert("Barbeiro não cadastrado.");
    if (password !== "1234") return alert("Senha incorreta. A senha para barbeiros é 1234.");

    document.getElementById("adminPanel").style.display = "block";
    loadBarberSchedule();
  } else {
    if (!email) return alert("Informe seu e-mail.");
    document.getElementById("clientePanel").style.display = "block";
    loadBarberList();
  }

  document.getElementById("userWelcome").innerText = `Olá, ${user}`;
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("mainPanel").style.display = "block";
  renderAppointments();
}

function logout() {
  user = "";
  userType = "cliente";
  document.getElementById("mainPanel").style.display = "none";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("clientePanel").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

function loadBarberList() {
  const barberSelect = document.getElementById("barberSelect");
  barberSelect.innerHTML = "";

  registeredBarbers.forEach(barber => {
    const option = document.createElement("option");
    option.value = barber;
    option.textContent = barber;
    barberSelect.appendChild(option);
  });

  document.getElementById("barberSelect").addEventListener("change", renderScheduleOptions);
  renderScheduleOptions();
}

function loadBarberSchedule() {
  renderAvailableSlots();
}

function addAvailableSlot() {
  const date = document.getElementById("newDate").value;
  const time = document.getElementById("newTime").value;

  if (!date || !time) return alert("Informe data e hora.");

  if (!availableTimes[user]) availableTimes[user] = {};
  if (!availableTimes[user][date]) availableTimes[user][date] = [];

  if (!availableTimes[user][date].includes(time)) {
    availableTimes[user][date].push(time);
  }

  renderAvailableSlots();
  renderScheduleOptions();
}

function renderAvailableSlots() {
  const container = document.getElementById("availableSlots");
  container.innerHTML = "";

  if (userType !== "barbeiro") return;

  Object.keys(availableTimes[user] || {}).forEach(date => {
    const dateDiv = document.createElement("div");
    dateDiv.innerHTML = `<strong>${formatDate(date)}:</strong> ${availableTimes[user][date].join(", ")}`;
    container.appendChild(dateDiv);
  });
}

function renderScheduleOptions() {
  const container = document.getElementById("scheduleOptions");
  container.innerHTML = "";

  const selectedBarber = document.getElementById("barberSelect").value;
  const barberSchedule = availableTimes[selectedBarber] || {};

  if (Object.keys(barberSchedule).length === 0) {
    container.innerHTML = "<p>Nenhum horário disponível para este barbeiro.</p>";
    return;
  }

  Object.keys(barberSchedule).forEach(date => {
    const dateTitle = document.createElement("div");
    dateTitle.innerHTML = `<strong>${formatDate(date)}</strong>`;
    container.appendChild(dateTitle);

    barberSchedule[date].forEach(time => {
      const btn = document.createElement("button");
      btn.textContent = time;
      btn.className = "time-button";
      btn.dataset.date = date;
      btn.dataset.time = time;
      btn.onclick = () => {
        document.querySelectorAll(".time-button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      container.appendChild(btn);
    });
  });
}

function bookAppointment() {
  if (userType === "barbeiro") return alert("O barbeiro não pode agendar.");

  const selected = document.querySelector(".time-button.selected");
  if (!selected) return alert("Selecione um horário.");

  const date = selected.dataset.date;
  const time = selected.dataset.time;
  const service = document.getElementById("serviceSelect").value;
  const barber = document.getElementById("barberSelect").value;

  appointments.push({ user, barber, service, date, time });

  availableTimes[barber][date] = availableTimes[barber][date].filter(t => t !== time);
  if (availableTimes[barber][date].length === 0) delete availableTimes[barber][date];

  renderAvailableSlots();
  renderScheduleOptions();
  renderAppointments();
}

function renderAppointments() {
  const container = document.getElementById("appointmentsList");
  container.innerHTML = "";

  appointments
    .filter(a => userType === "barbeiro" || a.user === user)
    .forEach(a => {
      const card = document.createElement("div");
      card.className = "agendamento";
      card.innerHTML = `
        <p><strong>${a.service} com ${a.barber}</strong></p>
        <p>às ${a.time} em ${formatDate(a.date)}</p>
      `;
      container.appendChild(card);
    });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
}
