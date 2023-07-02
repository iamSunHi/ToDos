import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  providers: [TaskService],
})
export class TasksComponent {
  isLoading: boolean = true;
  isFound: boolean = false;

  currentDate: string | undefined;
  searchValue: string = '';
  sortBy: string = 'Title';

  addTaskForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    priority: new FormControl('', [Validators.required]),
  });

  constructor(public taskService: TaskService) {
    setInterval(() => {
      this.currentDate = new Date().toLocaleString('vi');
    }, 1);
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.incompleteTasks = [];
    this.taskService.completedTasks = [];
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        for (let task of tasks) {
          if (task.isCompleted) this.taskService.completedTasks.push(task);
          else this.taskService.incompleteTasks.push(task);
          this.taskService.tasks.push(task);
        }
        this.taskService.incompleteTasks.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        this.taskService.completedTasks.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
      },
      complete: () => {
        setTimeout(() => {
          this.showItems();
          this.isLoading = false;
        }, 0);
      },
    });
  }

  addTask(): void {
    this.taskService.addTask(this.addTaskForm.value, this.currentDate);
    this.closeAddForm();
  }

  showToastMessage(title: string, message: string, type: any): void {
    Swal.fire({
      title: title,
      text: message,
      icon: type,
    });
  }

  showAddForm(): void {
    const addTask = document.querySelector<HTMLElement>('.add-form__container');
    if (addTask) {
      addTask.style.display = 'flex';
    }
  }
  closeAddForm(): void {
    const addTask = document.querySelector<HTMLElement>('.add-form__container');
    if (addTask) {
      addTask.style.display = 'none';
    }
  }

  showDeleteConfirmation(): void {
    const deleteConfirmation = document.querySelector<HTMLElement>(
      '.deleteConfirmation'
    );
    if (deleteConfirmation) {
      deleteConfirmation.style.display = 'flex';
    }
  }
  closeDeleteConfirmation(): void {
    const deleteConfirmation = document.querySelector<HTMLElement>(
      '.deleteConfirmation'
    );
    if (deleteConfirmation) {
      deleteConfirmation.style.display = 'none';
    }
  }

  showItems(): void {
    let index = 1;
    const waitingTime = 200;

    const incompleteHeader = document.querySelector<HTMLElement>(
      '.container__body__incomplete-header'
    );
    const incompleteBody = document.querySelectorAll<HTMLElement>(
      '.container__body__incomplete-list__item'
    );
    const completedHeader = document.querySelector<HTMLElement>(
      '.container__body__completed-header'
    );
    const completedBody = document.querySelectorAll<HTMLElement>(
      '.container__body__completed-list__item'
    );
    const saveBtn = document.querySelector<HTMLElement>(
      '.container__body__save-btn'
    );

    if (incompleteHeader) {
      incompleteHeader.style.display = 'flex';
    }
    if (completedHeader) {
      completedHeader.style.display = 'block';
    }

    incompleteBody.forEach((item) => {
      setTimeout(() => {
        if (item) {
          item.style.display = 'flex';
        }
      }, waitingTime * index);
      index++;
    });
    completedBody.forEach((item) => {
      setTimeout(() => {
        if (item) {
          item.style.display = 'flex';
        }
      }, waitingTime * index);
      index++;
    });
    setTimeout(() => {
      if (saveBtn) {
        saveBtn.style.display = 'block';
      }
    }, waitingTime * index);
  }

  searchEventListener(): void {
    if (this.searchValue === '') {
      this.isFound = false;
      return;
    }
    this.taskService.searchTasks(this.searchValue);

    if (this.taskService.searchResult.length != 0) {
      this.isFound = true;
    } else {
      this.isFound = false;
    }
  }

  changeSortEventListener(event: Event): void {
    // add '.active'
    const sortType = event.target as HTMLElement;
    if (sortType.classList.contains('active')) {
      return;
    }
    const parentElement = sortType.parentElement;
    parentElement?.childNodes.forEach((node) => {
      const child = node as HTMLElement;
      if (!child.classList.contains(sortType.classList.toString())) {
        if (child.classList.contains('active')) {
          child.classList.remove('active');
        }
      }
    });
    sortType.classList.add('active');
    this.sortBy = sortType.innerText;

    // change sort type in list
    switch (this.sortBy) {
      case 'Title':
        this.taskService.incompleteTasks.sort((a, b) => {
          if (a.title === b.title) {
            return b.priority - a.priority;
          }
          return a.title.localeCompare(b.title);
        });
        this.taskService.completedTasks.sort((a, b) => {
          if (a.title === b.title) {
            return b.priority - a.priority;
          }
          return a.title.localeCompare(b.title);
        });
        break;
      case 'Priority':
        this.taskService.incompleteTasks.sort((a, b) => {
          if (a.priority === b.priority) {
            return a.title.localeCompare(b.title);
          }
          return b.priority - a.priority;
        });
        this.taskService.completedTasks.sort((a, b) => {
          if (a.priority === b.priority) {
            return a.title.localeCompare(b.title);
          }
          return b.priority - a.priority;
        });
        break;
    }
  }

  changeStatusEventListener(id: number): void {
    const changedElement = document.querySelector(`#task-${id}`);
    if (!changedElement) {
      console.error(`Element with ID task-${id} not found.`);
      return;
    }

    const parentElement = changedElement.parentElement;
    if (!parentElement) {
      console.error(`Parent element not found for task-${id}.`);
      return;
    }

    if (
      changedElement.classList.contains(
        'container__body__incomplete-list__item'
      )
    ) {
      const changedTask = this.taskService.incompleteTasks.find(
        (task) => task.id === id
      );
      if (!changedTask) {
        console.error(`Task with ID ${id} not found in incompleteTasks.`);
        return;
      }

      parentElement.removeChild(changedElement);

      if (this.taskService.completedTasks.length > 0) {
        let inserted = false;
        for (let i = 0; i < this.taskService.completedTasks.length; i++) {
          if (changedTask.title < this.taskService.completedTasks[i].title) {
            this.taskService.completedTasks.splice(i, 0, changedTask);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          this.taskService.completedTasks.push(changedTask);
        }
      } else {
        this.taskService.completedTasks.push(changedTask);
      }
      this.taskService.incompleteTasks.splice(
        this.taskService.incompleteTasks.indexOf(changedTask),
        1
      );

      setTimeout(() => {
        const newElement = document.querySelector<HTMLElement>(`#task-${id}`);
        if (newElement) {
          newElement.style.display = 'flex';
        } else {
          console.error(`New element with ID task-${id} not found.`);
        }
      }, 0);
    } else if (
      changedElement.classList.contains('container__body__completed-list__item')
    ) {
      const changedTask = this.taskService.completedTasks.find(
        (task) => task.id === id
      );
      if (!changedTask) {
        console.error(`Task with ID ${id} not found in completedTasks.`);
        return;
      }

      parentElement.removeChild(changedElement);

      if (this.taskService.incompleteTasks.length > 0) {
        let inserted = false;
        for (let i = 0; i < this.taskService.incompleteTasks.length; i++) {
          if (changedTask.title < this.taskService.incompleteTasks[i].title) {
            this.taskService.incompleteTasks.splice(i, 0, changedTask);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          this.taskService.incompleteTasks.push(changedTask);
        }
      } else {
        this.taskService.incompleteTasks.push(changedTask);
      }
      this.taskService.completedTasks.splice(
        this.taskService.completedTasks.indexOf(changedTask),
        1
      );

      setTimeout(() => {
        const newElement = document.querySelector<HTMLElement>(`#task-${id}`);
        if (newElement) {
          newElement.style.display = 'flex';
        } else {
          console.error(`New element with ID task-${id} not found.`);
        }
      }, 0);
    }
  }
}
