class TodoManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = "all";
    this.initializeElements();
    this.bindEvents();
    this.render();
  }

  initializeElements() {
    this.taskInput = document.getElementById("taskInput");
    this.addTaskBtn = document.getElementById("addTaskBtn");
    this.taskList = document.getElementById("taskList");
    this.clearCompletedBtn = document.getElementById("clearCompletedBtn");
    this.filterBtns = document.querySelectorAll(".filter-btn");

    // Stats elements
    this.totalTasksEl = document.getElementById("totalTasks");
    this.pendingTasksEl = document.getElementById("pendingTasks");
    this.completedTasksEl = document.getElementById("completedTasks");
  }

  bindEvents() {
    this.addTaskBtn.addEventListener("click", () => this.addTask());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    this.clearCompletedBtn.addEventListener("click", () =>
      this.clearCompleted()
    );

    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.setFilter(e.target.dataset.filter)
      );
    });
  }

  addTask() {
    const text = this.taskInput.value.trim();
    if (!text) return;

    const task = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.taskInput.value = "";
    this.saveTasks();
    this.render();
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.saveTasks();
      this.render();
    }
  }

  deleteTask(id) {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
      taskElement.classList.add("removing");
      setTimeout(() => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.saveTasks();
        this.render();
      }, 300);
    }
  }

  clearCompleted() {
    const completedTasks = document.querySelectorAll(".task-item.completed");
    if (completedTasks.length === 0) return;

    completedTasks.forEach((task) => task.classList.add("removing"));

    setTimeout(() => {
      this.tasks = this.tasks.filter((t) => !t.completed);
      this.saveTasks();
      this.render();
    }, 300);
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    this.render();
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "pending":
        return this.tasks.filter((t) => !t.completed);
      case "completed":
        return this.tasks.filter((t) => t.completed);
      default:
        return this.tasks;
    }
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = total - completed;

    this.totalTasksEl.textContent = total;
    this.pendingTasksEl.textContent = pending;
    this.completedTasksEl.textContent = completed;
  }

  render() {
    this.updateStats();
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      let emptyMessage = "";
      switch (this.currentFilter) {
        case "pending":
          emptyMessage =
            this.tasks.length > 0
              ? "<h3>All caught up!</h3><p>You have no pending tasks. Great job!</p>"
              : "<h3>No pending tasks</h3><p>Add your first task to get started!</p>";
          break;
        case "completed":
          emptyMessage =
            "<h3>No completed tasks</h3><p>Complete some tasks to see them here!</p>";
          break;
        default:
          emptyMessage =
            "<h3>No tasks yet</h3><p>Add your first task above to get started with organizing your day!</p>";
      }

      this.taskList.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
      return;
    }

    this.taskList.innerHTML = filteredTasks
      .map(
        (task) => `
                    <div class="task-item ${
                      task.completed ? "completed" : ""
                    }" data-task-id="${task.id}">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? "checked" : ""}
                            onchange="todoManager.toggleTask('${task.id}')"
                        >
                        <span class="task-text">${this.escapeHtml(
                          task.text
                        )}</span>
                        <button class="task-delete" onclick="todoManager.deleteTask('${
                          task.id
                        }')" title="Delete task">
                            ×
                        </button>
                    </div>
                `
      )
      .join("");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveTasks() {
    try {
      const tasksData = JSON.stringify(this.tasks);
      // Since we can't use localStorage, we'll keep tasks in memory for this session
      this.tasksData = tasksData;
    } catch (error) {
      console.warn("Could not save tasks to storage");
    }
  }

  loadTasks() {
    try {
      // Since we can't use localStorage, return empty array for new sessions
      return this.tasksData ? JSON.parse(this.tasksData) : [];
    } catch (error) {
      console.warn("Could not load tasks from storage");
      return [];
    }
  }
}

// Initialize the todo manager when the page loads
let todoManager;
document.addEventListener("DOMContentLoaded", () => {
  todoManager = new TodoManager();
});
