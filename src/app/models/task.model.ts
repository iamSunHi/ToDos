export class Task {
  id!: number;
  title: string;
  description: string;
  date: string | undefined;
  priority: number;
  isCompleted: boolean = false;
  subTask: Array<Task> = [];

  constructor(title: string, description: string, date: string | undefined, priority: number, isCompleted: boolean, subTask: Array<Task>) {
    this.title = title;
    this.description = description;
    this.date = date;
    this.priority = priority;
    this.isCompleted = isCompleted;
    this.subTask = subTask;
  }
}
