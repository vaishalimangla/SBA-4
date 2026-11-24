let editIndex = null;
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");
const save = document.getElementById("saveBtn");
const taskForm = document.getElementById("taskForm");
const taskContainer = document.getElementById("taskContainer");
const deleteLastBtn = document.getElementById("deleteLastBtn");

if (filterCategory) filterCategory.addEventListener("change", renderTasks);
if (filterStatus) filterStatus.addEventListener("change", renderTasks);

// Add or Update Task
save.addEventListener("click", (event) => {
  event.preventDefault();

  const task = {
    taskName: document.getElementById("iName").value.trim(),
    category: document.getElementById("iCategory").value,
    status: document.getElementById("iStatus").value,
    deadline: document.getElementById("iDeadline").value
  };

  if (!task.taskName) {
    alert("Please enter a task name.");
    return;
  }

  if (editIndex !== null) {
    taskList[editIndex] = task;
    editIndex = null;
    save.innerText = "Add Task";
  } else {
    taskList.push(task);
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTasks();

  // Reset form fields properly (including dropdowns)
  document.getElementById("iName").value = "";
  document.getElementById("iCategory").selectedIndex = 0;
  document.getElementById("iStatus").selectedIndex = 0;
  document.getElementById("iDeadline").value = "";
});

function renderTasks() {
  taskContainer.innerHTML = "";

  const today = new Date().toLocaleDateString("en-CA");
  let isUpdated = false;

  // 1. Check for overdue tasks
  taskList.forEach((task) => {
    if (task.deadline && task.deadline < today && task.status !== "Completed") {
      task.status = "Overdue";
      isUpdated = true;
    }
  });

  if (isUpdated) {
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }

  // 2. Get filter values
  const categoryQuery = filterCategory ? filterCategory.value : "All";
  const statusQuery = filterStatus ? filterStatus.value : "All";

  // 3. Filter by both category AND status while keeping originalIndex
  const filteredTasks = taskList
    .map((task, index) => ({ task, originalIndex: index }))
    .filter(({ task }) => {
      const matchesCategory = categoryQuery === "All" || task.category === categoryQuery;
      const matchesStatus = statusQuery === "All" || task.status === statusQuery;
      return matchesCategory && matchesStatus;
    });

  // 4. Empty state row spanning all 5 columns
  if (filteredTasks.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 5;
    emptyCell.textContent = taskList.length === 0 ? "No tasks yet." : "No matching tasks found.";
    emptyRow.appendChild(emptyCell);
    taskContainer.appendChild(emptyRow);
    return;
  }

  // 5. Render each task as a table row (<tr>) with <td> cells
  filteredTasks.forEach(({ task, originalIndex }) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${task.taskName}</strong></td>
      <td>${task.category || "General"}</td>
      <td><em>${task.status}</em></td>
      <td>${task.deadline || "No deadline"}</td>
    `;

    const actionTd = document.createElement("td");
    const updateBtn = document.createElement("button");
    updateBtn.classList.add("Update-Status");
    updateBtn.innerText = "Update Status";

    updateBtn.addEventListener("click", () => {
      document.getElementById("iName").value = task.taskName;
      document.getElementById("iCategory").value = task.category;
      document.getElementById("iStatus").value = task.status;
      document.getElementById("iDeadline").value = task.deadline;

      editIndex = originalIndex;
      save.innerText = "Update Task";
    });

    actionTd.appendChild(updateBtn);
    tr.appendChild(actionTd);
    taskContainer.appendChild(tr);
  });
}

// Delete last task
if (deleteLastBtn) {
  deleteLastBtn.addEventListener("click", () => {
    if (taskList.length === 0) {
      alert("No tasks to delete.");
      return;
    }

    taskList.pop();
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTasks();
  });
}

// Render saved tasks on page load
renderTasks();