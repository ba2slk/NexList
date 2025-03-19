const API_URL = window.API_URL || "http://127.0.0.1:8000/todo";
console.log(API_URL);
// 할 일 목록 불러오기
async function loadTodos() {
    const response = await fetch(API_URL);
    const todos = await response.json();
    const list = document.getElementById("todo-list");
    list.innerHTML = "";

    todos.forEach(todo => {
        const item = document.createElement("li");

        item.innerHTML = `
            <span id="text-${todo.id}">
                ${todo.completed ? "✅" : "❌"} ${todo.task}: ${todo.description}
            </span>
            <input type="text" id="edit-task-${todo.id}" value="${todo.task}" style="display:none;">
            <input type="text" id="edit-description-${todo.id}" value="${todo.description}" style="display:none;">
            <div class="button-group">
                <button class="complete-btn" onclick="toggleComplete(${todo.id})">
                    ${todo.completed ? "Undo" : "Done"}
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                <button class="edit-btn" id="edit-btn-${todo.id}" onclick="toggleEdit(${todo.id})">Edit</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// 할 일 추가
async function addTodo() {
    const task = document.getElementById("task").value;
    const description = document.getElementById("description").value;

    if (!task) {
        alert("할 일을 입력하세요!");
        return;
    }

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, description, completed: false })
    });

    document.getElementById("task").value = "";
    document.getElementById("description").value = "";
    loadTodos();
}

async function toggleComplete(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const todo = await response.json();

    // 상태 반전
    const updatedCompleted = !todo.completed;

    // PUT 요청으로 상태 업데이트
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

// 수정 버튼 클릭 시 입력 필드로 변경
function toggleEdit(id) {
    const textSpan = document.getElementById(`text-${id}`);
    const editTask = document.getElementById(`edit-task-${id}`);
    const editDescription = document.getElementById(`edit-description-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);

    if (editTask.style.display === "none") {
        textSpan.style.display = "none";
        editTask.style.display = "inline";
        editDescription.style.display = "inline";
        editBtn.textContent = "Save";
        editBtn.setAttribute("onclick", `saveEdit(${id})`);
    } else {
        textSpan.style.display = "inline";
        editTask.style.display = "none";
        editDescription.style.display = "none";
        editBtn.textContent = "Edit";
        editBtn.setAttribute("onclick", `toggleEdit(${id})`);
    }
}

// 수정 내용 저장
async function saveEdit(id) {
    const newTask = document.getElementById(`edit-task-${id}`).value;
    const newDescription = document.getElementById(`edit-description-${id}`).value;

    if (!newTask) {
        alert("할 일을 입력하세요!");
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask, description: newDescription })
    });

    loadTodos();
}

// window 객체에 함수 추가 (전역에서 접근 가능하도록)
window.addTodo = addTodo;
window.deleteTodo = deleteTodo;
window.deleteAllTodos = deleteAllTodos;
window.toggleComplete = toggleComplete;
window.toggleEdit = toggleEdit;
window.saveEdit = saveEdit;

// 페이지 로딩 시 할 일 목록 불러오기
loadTodos();