const API_URL = window.API_URL || "http://127.0.0.1:8000/todo";

// 할 일 목록 불러오기
async function loadTodos() {
    const response = await fetch(API_URL);
    const todos = await response.json();
    const list = document.getElementById("todo-list");
    list.innerHTML = "";

    todos.forEach(todo => {
        const item = document.createElement("li");

        // 날짜 표시용 문자열
        let dueDateStr = "";
        let isoDateValue = "";  // date input에 들어갈 YYYY-MM-DD 형식

        if (todo.due_date) {
            const dateObj = new Date(todo.due_date);
            dueDateStr = ` (~${dateObj.toLocaleDateString()})`;
            // HTML의 <input type="date">는 "YYYY-MM-DD" 형식을 사용해야 함
            isoDateValue = dateObj.toISOString().slice(0, 10);
        }

        // 수정 시 텍스트 인풋 -> 달력 인풋으로 변경
        // 기존 edit-due-${todo.id}를 text -> date로 바꾸고, value는 isoDateValue
        item.innerHTML = `
            <span id="text-${todo.id}">
                ${todo.completed ? "✅" : "❌"} ${todo.task}${dueDateStr}
            </span>
            <input type="text" id="edit-task-${todo.id}" value="${todo.task}" style="display:none;">
            <input type="date" id="edit-due-${todo.id}" value="${isoDateValue}" style="display:none;">
            <div class="button-group">
                <button class="complete-btn" onclick="toggleComplete(${todo.id})">
                    ${todo.completed ? "👎" : "👍"}
                </button>
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
    // 날짜 미선택 시 오늘 날짜를 기본값으로 설정
    if (!dueDate) {
        dueDate = new Date().toISOString();
    }
    
    const payload = { task, due_date: dueDate, completed: false };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // 입력값 초기화 및 UI 원상복구
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

    // Edit → Save
    if (editTask.style.display === "none") {
        textSpan.style.display = "none";
        editTask.style.display = "inline";
        editDue.style.display = "inline";
        editBtn.textContent = "💾";
        editBtn.setAttribute("onclick", `saveEdit(${id})`);
    } 
    // Save → Edit
    else {
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
    const newDue = document.getElementById(`edit-due-${id}`).value;  // date input
    if (!newTask) {
        alert("할 일을 입력하세요!");
        return;
    }

    // date input은 "YYYY-MM-DD" 형태 문자열
    // 백엔드에서 원하는 대로 저장
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

    // 플레이스홀더 클릭 시 실제 입력 UI 표시
    placeholder.addEventListener("click", () => {
        placeholder.style.display = "none";
        activeInputContainer.style.display = "flex";
        todoInput.focus();
    });

    // 입력 시 내용이 있으면 달력(날짜 입력) 표시
    todoInput.addEventListener("input", () => {
        if (todoInput.value.trim() !== "") {
            dateInput.style.display = "block";
        } else {
            dateInput.style.display = "none";
        }
    });

    // ESC 키 -> 입력창 초기화
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

    // 달력에서도 엔터 입력 시 할 일 추가
    dateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            addTodo();
        }
    });
});

// 전역 함수 노출 (버튼 호출용)
window.deleteTodo = deleteTodo;
window.deleteAllTodos = deleteAllTodos;
window.toggleComplete = toggleComplete;
window.toggleEdit = toggleEdit;
window.saveEdit = saveEdit;

loadTodos();
