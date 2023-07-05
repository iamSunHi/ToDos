import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Observable, map } from 'rxjs';

import { Task } from '../models/task.model';

@Injectable()
export class TaskService {
  private baseUrl: string = 'http://localhost:3000/';
  tasks: Array<Task> = [];
  incompleteTasks: Array<Task> = [];
  completedTasks: Array<Task> = [];
  searchResult: Array<Task> = [];

  addingTask: Task | undefined;
  deletingTask: Task | undefined;

  constructor(private _httpClient: HttpClient) {}

  /* ---------------------- DATA REQUEST ---------------------- */
  addTask(info: any, currentDate: string | undefined) {
    this.addingTask = new Task(
      info.title,
      info.description,
      currentDate,
      info.priority,
      false,
      info.subtask
    );
    if (this.addingTask) {
      this.postTask(this.addingTask).subscribe({
        complete: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Add successfully!',
            icon: 'success',
          });
        },
      });
    } else
      Swal.fire({
        title: 'Error!',
        text: 'The task to be deleted does not exist or is invalid!',
        icon: 'error',
      });
    setTimeout(() => {
      this._httpClient
        .get<Array<Task>>(this.baseUrl + 'tasks')
        .subscribe((tasks: Array<Task>) => {
          if (tasks.length > 0) {
            this.addingTask = tasks[tasks.length - 1];
          }
          if (!this.addingTask) {
            return;
          }
          let inserted = false;
          for (let i = 0; i < this.incompleteTasks.length; i++) {
            if (this.addingTask.title < this.incompleteTasks[i].title) {
              this.incompleteTasks.splice(i, 0, this.addingTask);
              inserted = true;
              break;
            }
          }
          if (!inserted) {
            this.incompleteTasks.push(this.addingTask);
          }
          setTimeout(() => {
            if (!this.addingTask) {
              return;
            }
            const newElement = document.querySelector<HTMLElement>(
              `#task-${this.addingTask.id}`
            );
            if (newElement) {
              newElement.style.display = 'flex';
            } else {
              console.error(
                `New element with ID task-${this.addingTask.id} not found.`
              );
            }
          }, 0);
        });
    }, 100);
  }

  removeTask() {
    if (this.deletingTask) {
      if (this.deletingTask.isCompleted) {
        this.completedTasks.splice(
          this.completedTasks.indexOf(this.deletingTask),
          1
        );
      } else
        this.incompleteTasks.splice(
          this.incompleteTasks.indexOf(this.deletingTask),
          1
        );
      this.deleteTask(this.deletingTask).subscribe();
    } else
      Swal.fire({
        title: 'Error!',
        text: 'The task to be deleted does not exist or is invalid!',
        icon: 'error',
      });
  }

  updateTask(task: Task) {
    this.putTask(task).subscribe();
    Swal.fire({
      title: 'Success!',
      text: 'Update successfull!',
      icon: 'success',
    });
  }

  saveTasks(): void {
    this.tasks = this.incompleteTasks
      .concat(this.completedTasks)
      .sort((a, b) => a.id - b.id);
    for (let task of this.tasks) {
      this.putTask(task).subscribe();
    }
    for (let i = 0; i < this.incompleteTasks.length; i++) {
      if (this.incompleteTasks[i].isCompleted) {
        /*
          Since the array is originally sorted,
          it is only necessary to find the index of the element with a larger id
        */
        const insertIndex = this.completedTasks.findIndex(
          (task) => task.id > this.incompleteTasks[i].id
        );
        if (insertIndex !== -1) {
          this.completedTasks.splice(insertIndex, 0, this.incompleteTasks[i]);
        } else {
          // If the insertion location is not found, add to the end of the array
          this.completedTasks.push(this.incompleteTasks[i]);
        }
      }
    }
    Swal.fire({
      title: 'Success!',
      text: 'Save successfull!',
      icon: 'success',
    });
  }

  searchTasks(searchValue: string) {
    this.searchResult = this.tasks.filter((task: Task) => {
      return (
        task.title.toUpperCase().includes(searchValue.toUpperCase()) ||
        task.description.toUpperCase().includes(searchValue.toUpperCase())
      );
    });
  }

  /* ---------------------- HTTP METHODS ---------------------- */
  getTasks(): Observable<Array<Task>> {
    // const dataUrl = this.baseUrl + 'tasks';
    const dataUrl = 'https://raw.githubusercontent.com/SunHiIsDev/ToDos/main/db.json';
    return this._httpClient.get<Array<Task>>(dataUrl);
  }
  postTask(task: Task): Observable<Task> {
    // const dataUrl = this.baseUrl + 'tasks';
    const dataUrl = 'https://raw.githubusercontent.com/SunHiIsDev/ToDos/main/db.json';
    // const headers = { 'content-type': 'application/json'}
    // const jsonData = JSON.stringify(task);
    return this._httpClient.post<Task>(dataUrl, task);
  }
  putTask(task: Task): Observable<Task> {
    // const dataUrl = this.baseUrl + 'tasks/' + task.id;
    const dataUrl = 'https://raw.githubusercontent.com/SunHiIsDev/ToDos/main/db.json';
    // const headers = { 'content-type': 'application/json'}
    // const jsonData = JSON.stringify(task);
    return this._httpClient.put<Task>(dataUrl, task);
  }
  deleteTask(task: Task): Observable<Task> {
    // const dataUrl = this.baseUrl + 'tasks/' + task.id;
    const dataUrl = 'https://raw.githubusercontent.com/SunHiIsDev/ToDos/main/db.json';
    // const headers = { 'content-type': 'application/json'}
    // const jsonData = JSON.stringify(task);
    return this._httpClient.delete<Task>(dataUrl);
  }
}
