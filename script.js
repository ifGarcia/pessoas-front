// Importar e configurar o Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const apiUrl = 'https://pessoas-api-802e6fbb1ada.herokuapp.com/people';

document.getElementById('person-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const email = document.getElementById('email').value;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, age, email })
  });

  const person = await response.json();
  addPersonToTable(person);
  document.getElementById('person-form').reset();
});

async function fetchPeople() {
  const response = await fetch(apiUrl);
  const people = await response.json();
  people.forEach(person => addPersonToTable(person));
}

function addPersonToTable(person) {
  const table = document.getElementById('people-list');
  const row = table.insertRow();
  row.setAttribute('data-id', person._id);

  const nameCell = row.insertCell(0);
  const ageCell = row.insertCell(1);
  const emailCell = row.insertCell(2);
  const actionsCell = row.insertCell(3);

  nameCell.textContent = person.name;
  ageCell.textContent = person.age;
  emailCell.textContent = person.email;

  const editButton = document.createElement('button');
  editButton.textContent = 'Editar';
  editButton.addEventListener('click', () => openEditModal(person));
  actionsCell.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Excluir';
  deleteButton.addEventListener('click', () => deletePerson(person._id, row));
  actionsCell.appendChild(deleteButton);
}

async function deletePerson(id, row) {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE'
  });
  if (response.ok) {
    row.remove();
  } else {
    console.error('Failed to delete person', response.status);
  }
}

function openEditModal(person) {
  const modal = document.getElementById('edit-modal');
  modal.style.display = 'block';

  document.getElementById('edit-id').value = person._id;
  document.getElementById('edit-name').value = person.name;
  document.getElementById('edit-age').value = person.age;
  document.getElementById('edit-email').value = person.email;
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value;
  const age = document.getElementById('edit-age').value;
  const email = document.getElementById('edit-email').value;

  const response = await fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, age, email })
  });

  if (response.ok) {
    const updatedPerson = await response.json();
    updatePersonInTable(updatedPerson);
    document.getElementById('edit-modal').style.display = 'none';
  } else {
    console.error('Failed to update person', response.status);
  }
});

function updatePersonInTable(person) {
  const row = document.querySelector(`tr[data-id='${person._id}']`);
  row.cells[0].textContent = person.name;
  row.cells[1].textContent = person.age;
  row.cells[2].textContent = person.email;
}

document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('edit-modal').style.display = 'none';
});

window.onclick = function(event) {
  const modal = document.getElementById('edit-modal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

const peopleRef = ref(db, 'people');
onChildAdded(peopleRef, (data) => {
  addPersonToTable(data.val());
});

onChildChanged(peopleRef, (data) => {
  updatePersonInTable(data.val());
});

onChildRemoved(peopleRef, (data) => {
  const row = document.querySelector(`tr[data-id='${data.key}']`);
  if (row) {
    row.remove();
  }
});

fetchPeople();