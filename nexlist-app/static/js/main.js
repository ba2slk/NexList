const API_URL = window.API_URL || "http://127.0.0.1:8000/todo";

// 할 일 목록 불러오기
async function loadTodos() {
    const response = await fetch(API_URL);
    const todos = await response.json();
    const list = document.getElementById("todo-list");
    list.innerHTML = "";

    todos.forEach(todo => {
        const item = document.createElement("li");

        // 기한 초과 여부 계산
        let isOverdue = false;
        if (todo.due_date) {
            const due = new Date(todo.due_date);
            const now = new Date();
            if (due < now && !todo.completed) {
                isOverdue = true;
            }
        }

        let dueDateStr = "";
        let isoDateValue = "";
        if (todo.due_date) {
            const due = new Date(todo.due_date);
            const today = new Date();
            const isDueToday = due.getFullYear() === today.getFullYear() &&
                               due.getMonth() === today.getMonth() &&
                               due.getDate() === today.getDate();

            let dueColor = 'color: black;' // default
            if (isDueToday) {
                dueColor = 'color: rgb(7, 173, 40)';
            }
            else if (due < today){
                dueColor = 'color: rgb(234, 68, 87)';
            }

            dueDateStr = `<span class="${isDueToday ? 'due-today' : isOverdue ? 'due-overdue' : 'due-default'}">(~${due.toLocaleDateString()})</span>`;
            isoDateValue = due.toISOString().slice(0, 10);
        }

        item.innerHTML = `
            <input type="checkbox" id="check-${todo.id}" ${todo.completed ? "checked" : ""} onchange="toggleComplete(${todo.id})">
            <span id="text-${todo.id}" class="${todo.completed ? 'completed': ''}">
                ${todo.task} ${dueDateStr}
            </span>
            <input type="text" id="edit-task-${todo.id}" value="${todo.task}" style="display:none;">
            <input type="date" id="edit-due-${todo.id}" value="${isoDateValue}" style="display:none;">
            <div class="button-group">
                <button class="edit-btn" id="edit-btn-${todo.id}" onclick="toggleEdit(${todo.id})">✏️</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">➖</button>
            </div>
        `;

        list.appendChild(item);
    });

    const deleteAllBtn = document.querySelector(".delete-all-btn");
    deleteAllBtn.style.display = todos.length > 0 ? "block" : "none";
}

// 할 일 추가 (엔터 입력 시 호출)
async function addTodo() {
    const todoInput = document.getElementById("todo-input");
    const dateInput = document.getElementById("todo-date");
    const task = todoInput.value.trim();
    let dueDate = dateInput.value;

    if (!task) {
        alert("할 일을 입력하세요!");
        return;
    }

    if (!dueDate) {
        dueDate = new Date().toISOString();
    }

    const payload = { task, due_date: dueDate, completed: false };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    todoInput.value = "";
    dateInput.value = "";
    dateInput.style.display = "none";
    document.getElementById("active-input").style.display = "none";
    document.getElementById("placeholder").style.display = "block";

    loadTodos();
}

// 완료 상태 토글
async function toggleComplete(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const todo = await response.json();
    const updatedCompleted = !todo.completed;
    await fetch(`${API_URL}/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedCompleted })
    });
    loadTodos();
}

// 개별 할 일 삭제
async function deleteTodo(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTodos();
}

// 전체 삭제
async function deleteAllTodos() {
    await fetch(API_URL, { method: "DELETE" });
    loadTodos();
}

// 수정 버튼 토글
function toggleEdit(id) {
    const textSpan = document.getElementById(`text-${id}`);
    const editTask = document.getElementById(`edit-task-${id}`);
    const editDue = document.getElementById(`edit-due-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);

    if (editTask.style.display === "none") {
        textSpan.style.display = "none";
        editTask.style.display = "inline";
        editDue.style.display = "inline";
        editBtn.textContent = "Save";
        editBtn.setAttribute("onclick", `saveEdit(${id})`);
    } else {
        textSpan.style.display = "inline";
        editTask.style.display = "none";
        editDue.style.display = "none";
        editBtn.textContent = "✏️";
        editBtn.setAttribute("onclick", `toggleEdit(${id})`);
    }
}

// 수정 내용 저장
async function saveEdit(id) {
    const newTask = document.getElementById(`edit-task-${id}`).value;
    const newDue = document.getElementById(`edit-due-${id}`).value;
    if (!newTask) {
        alert("할 일을 입력하세요!");
        return;
    }
    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask, due_date: newDue })
    });
    loadTodos();
}

// 새 입력 UI 이벤트 처리
window.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById("placeholder");
    const activeInputContainer = document.getElementById("active-input");
    const todoInput = document.getElementById("todo-input");
    const dateInput = document.getElementById("todo-date");

    placeholder.addEventListener("click", () => {
        placeholder.style.display = "none";
        activeInputContainer.style.display = "flex";
        todoInput.focus();
    });

    todoInput.addEventListener("input", () => {
        if (todoInput.value.trim() !== "") {
            dateInput.style.display = "block";
        } else {
            dateInput.style.display = "none";
        }
    });

    todoInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            todoInput.value = "";
            dateInput.value = "";
            dateInput.style.display = "none";
            activeInputContainer.style.display = "none";
            placeholder.style.display = "block";
        } else if (e.key === "Enter") {
            addTodo();
        }
    });

    dateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            addTodo();
        }
    });
});

window.deleteTodo = deleteTodo;
window.deleteAllTodos = deleteAllTodos;
window.toggleComplete = toggleComplete;
window.toggleEdit = toggleEdit;
window.saveEdit = saveEdit;

loadTodos();
