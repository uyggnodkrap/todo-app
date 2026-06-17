import { supabase } from './supabase.js';

type Priority = "보통" | "중요" | "매우 중요";

const PRIORITY_ORDER: Record<Priority, number> = {
  "매우 중요": 0,
  "중요": 1,
  "보통": 2,
};

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

class TodoApp {
  private todos: Todo[] = [];

  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private list: HTMLUListElement;
  private emptyMessage: HTMLParagraphElement;

  constructor() {
    this.form = document.getElementById("todo-form") as HTMLFormElement;
    this.input = document.getElementById("todo-input") as HTMLInputElement;
    this.list = document.getElementById("todo-list") as HTMLUListElement;
    this.emptyMessage = document.getElementById("empty-message") as HTMLParagraphElement;

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = this.input.value.trim();
      if (text) {
        this.addTodo(text);
        this.input.value = "";
        this.input.focus();
      }
    });

    this.init();
  }

  private async init(): Promise<void> {
    await this.load();
    this.render();
  }

  private async load(): Promise<void> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('load error:', error.message);
      return;
    }

    this.todos = (data ?? []).map((row: any) => ({
      id: row.id,
      text: row.text,
      completed: row.completed,
      priority: row.priority as Priority,
      createdAt: new Date(row.created_at).getTime(),
    }));
  }

  private render(): void {
    this.list.innerHTML = "";

    if (this.todos.length === 0) {
      this.emptyMessage.style.display = "block";
      return;
    }

    this.emptyMessage.style.display = "none";

    const sorted = [...this.todos].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );
    sorted.forEach((todo) => {
      this.list.appendChild(this.renderItem(todo));
    });
  }

  private renderItem(todo: Todo): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const label = document.createElement("label");
    label.className = "todo-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => this.toggleTodo(todo.id));

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    label.appendChild(checkbox);
    label.appendChild(span);

    const prioritySelect = document.createElement("select");
    prioritySelect.className = `priority-badge priority-${todo.priority.replace(" ", "")}`;
    (["보통", "중요", "매우 중요"] as Priority[]).forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      opt.selected = p === todo.priority;
      prioritySelect.appendChild(opt);
    });
    prioritySelect.addEventListener("change", () => {
      const newPriority = prioritySelect.value as Priority;
      prioritySelect.className = `priority-badge priority-${newPriority.replace(" ", "")}`;
      this.updatePriority(todo.id, newPriority);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "삭제";
    deleteBtn.addEventListener("click", () => this.deleteTodo(todo.id));

    li.appendChild(label);
    li.appendChild(prioritySelect);
    li.appendChild(deleteBtn);

    return li;
  }

  private async addTodo(text: string): Promise<void> {
    const id = Date.now().toString();
    const createdAt = Date.now();

    const { error } = await supabase.from('todos').insert({
      id,
      text,
      completed: false,
      priority: "보통",
      created_at: new Date(createdAt).toISOString(),
    });

    if (error) {
      console.error('addTodo error:', error.message);
      return;
    }

    this.todos.push({ id, text, completed: false, priority: "보통", createdAt });
    this.render();
  }

  private async toggleTodo(id: string): Promise<void> {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) {
      console.error('toggleTodo error:', error.message);
      return;
    }

    todo.completed = !todo.completed;
    this.render();
  }

  private async updatePriority(id: string, priority: Priority): Promise<void> {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ priority })
      .eq('id', id);

    if (error) {
      console.error('updatePriority error:', error.message);
      return;
    }

    todo.priority = priority;
    this.render();
  }

  private async deleteTodo(id: string): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteTodo error:', error.message);
      return;
    }

    this.todos = this.todos.filter((t) => t.id !== id);
    this.render();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
});
