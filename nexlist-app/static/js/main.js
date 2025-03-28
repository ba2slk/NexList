const API_URL = window.API_URL || "http://127.0.0.1:8000/todo";

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
                <!-- 완료 토글 -->
                <button class="complete-btn" onclick="toggleComplete(${todo.id})">
                    ${todo.completed ? "👎" : "👍"}
                </button>
                <!-- Edit/Save 버튼을 두 번째로 -->
                <button class="edit-btn" id="edit-btn-${todo.id}" onclick="toggleEdit(${todo.id})">✏️</button>
                <!-- Delete 버튼을 마지막으로 -->
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">➖</button>
            </div>
        `;
        list.appendChild(item);
    });

    // "모두 삭제" 버튼 표시/숨김 로직
    const deleteAllBtn = document.querySelector(".delete-all-btn");
    deleteAllBtn.style.display = todos.length > 0 ? "block" : "none";
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

    // 입력 필드 초기화
    document.getElementById("task").value = "";
    document.getElementById("description").value = "";

    // 설명 입력창 닫기 및 버튼 텍스트 리셋
    const descContainer = document.getElementById("desc-container");
    const toggleDescBtn = document.getElementById("toggle-desc");
    descContainer.style.display = "none";
    toggleDescBtn.textContent = "설명 추가";

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

// 전역에서 호출 가능하도록 함수 등록
window.addTodo = addTodo;
window.deleteTodo = deleteTodo;
window.deleteAllTodos = deleteAllTodos;
window.toggleComplete = toggleComplete;
window.toggleEdit = toggleEdit;
window.saveEdit = saveEdit;

// 페이지 로딩 시 할 일 목록 불러오기
loadTodos();
