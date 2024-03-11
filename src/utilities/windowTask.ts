const Task = {
  list: [] as ITask[],
  miniNum: 0,
  maxWidth: window.screen.availWidth,
  defaultMiniWidth: 190,

  handleActive(task: ITask) {
    Task.list.forEach((task) => {
      task.isActive = false;
    });
    const foundTask = Task.list.find((item) => item.id === task.id);
    if (foundTask) {
      foundTask.isActive = true;
    }
  },
  handleClose(task: ITask) {
    Task.list = Task.list.filter((item) => item.id !== task.id);
    Task.setDefaultActive();
  },
  handleMinimize(task: ITask) {
    task.isMinimize = !task.isMinimize;
    task.isMaximize = false;
    if (task.isMinimize) {
      Task.miniNum++;
      task.isActive = false;
      Task.setDefaultActive();
    } else {
      Task.miniNum--;
      Task.handleActive(task);
    }
    Task.calMiniWidth();
  },
  handleMaximize(task: ITask) {
    task.isMaximize = !task.isMaximize;
    task.isMinimize = false;
    Task.handleActive(task);
  },
  setDefaultActive() {
    const foundTask = Task.list.find((item) => item.isActive);
    const showedTask = Task.list.filter((item) => !item.isMinimize);
    if (!foundTask && showedTask.length) {
      Task.handleActive.call(null, showedTask[showedTask.length - 1]);
    }
  },
  createTask(
    name: string,
    type: string,
    memberId: string,
    lowerCaution: number,
    upperCaution: number,
    lowerCritical: number,
    upperCritical: number,
    currentValue: number,
    units: string
  ) {
    const foundTask = Task.list.find((item) => item.title == name);
    if (!foundTask) {
      Task.list = Task.list.map((task) => ({ ...task, isActive: false }));
      const task = {
        id: Math.floor(Math.random() * 1e10),
        title: name,
        isActive: false,
        isMinimize: false,
        isMaximize: false,
        miniWidth: Task.defaultMiniWidth,
        miniLeft: 0,
        type,
        memberId,
        lowerCaution,
        upperCaution,
        lowerCritical,
        upperCritical,
        currentValue,
        units,
      };
      Task.list.push(task);
      Task.handleActive(task);
    } else {
      if (foundTask.isMinimize) {
        Task.handleMinimize(foundTask);
      } else {
        Task.handleActive(foundTask);
      }
    }
  },
  calMiniWidth() {
    if (Task.miniNum != 0) {
      let newWidth = Task.maxWidth / Task.miniNum;
      let width = Math.min(newWidth, Task.defaultMiniWidth);
      let count = 0;
      Task.list.forEach((task) => {
        if (task.isMinimize) {
          task.miniWidth = width;
          task.miniLeft = width * count;
          count++;
        }
      });
    }
  },
};

interface ITask {
  id: number;
  title: string;
  isActive: boolean;
  isMinimize: boolean;
  isMaximize: boolean;
  miniWidth: number;
  miniLeft: number;
  type: string;
  memberId: string;
  lowerCaution: number;
  upperCaution: number;
  lowerCritical: number;
  upperCritical: number;
  currentValue: number;
  units: string;
}

export default Task;
