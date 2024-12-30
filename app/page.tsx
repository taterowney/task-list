"use client";

import { useState, useEffect } from "react";

const exampleTasks = {"Urgent": [], "Monday": [], "Long-term": [], "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []}
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = daysOfTheWeek[new Date().getDay()];


export default function App() {
  // return (<TaskList />);
  return (
    <TabMenu tabNames={["To-Do", "Focus Timer"]} defaultTabIndex={0}>
      <TaskList />
      <Timer lockInTime={10} breakTime={5} />
    </TabMenu>
  );
}

function hoursBetween(date1, date2) {
  const ONE_HOUR = 1000 * 60 * 60;
  const differenceMs = Math.abs(date1 - date2);
  return Math.round(differenceMs / ONE_HOUR);
}

function TaskList() {
  const [day, setDay] = useState(today);
  const [tasks, setTasks] = useState(exampleTasks);
  const [slideDirection, setSlideDirection] = useState("");

  // On the client, after mount, read from localStorage
  useEffect(() => {
    const savedValue = localStorage.getItem('tasks');
    if (savedValue !== null) {
      setTasks(JSON.parse(savedValue));
    }
  }, []);

  // Whenever value changes, sync it back to localStorage
  useEffect(() => {
    if (tasks !== exampleTasks) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Check if the last reset date is more than 7 days ago
  useEffect(() => {
    if (!localStorage.getItem("lastReset")) {
      // set lastReset to the previous Monday at 00:00
      const today = new Date();
      const day = today.getDay();
      const diff = day === 0 ? 6 : day - 1; // Adjust for Sunday being 0
      const lastMonday = new Date(today.setDate(today.getDate() - diff));
      lastMonday.setHours(0, 0, 0, 0);
      localStorage.setItem("lastReset", lastMonday.toISOString());
    }
    else {
      const lastReset = new Date(localStorage.getItem("lastReset"));
      const today = new Date();
      if (hoursBetween(lastReset, today) > 7*24) {
        // Set all daily tasks to incomplete
        const newTasks = {...JSON.parse(localStorage.getItem("tasks"))};
        Object.keys(newTasks).forEach(key => {
          if (daysOfTheWeek.includes(key)) {
            newTasks[key].forEach(task => {
              task.completed = false;
            });
          }
        });
        setTasks(newTasks);
        // Set lastReset to 7 days from now
        localStorage.setItem("lastReset", new Date(lastReset.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString());
      }
    }
  }, []);

  function nextDay() {
    setSlideDirection("slide-left");
    const newDay = daysOfTheWeek[(daysOfTheWeek.indexOf(day) + 1) % daysOfTheWeek.length];
    setDay(newDay);
    // Reset animation class after animation completes
    setTimeout(() => setSlideDirection(""), 500);
  }

  function prevDay() {
    setSlideDirection("slide-right");
    const newDay = daysOfTheWeek[(daysOfTheWeek.indexOf(day) + daysOfTheWeek.length - 1) % daysOfTheWeek.length];
    setDay(newDay);
    // Reset animation class after animation completes
    setTimeout(() => setSlideDirection(""), 500);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <style jsx>{`
        .slide-left-title {
          animation: slideLeftTitle 0.35s ease-in-out;
        }
        .slide-right-title {
          animation: slideRightTitle 0.35s ease-in-out;
        }
        @keyframes slideLeftTitle {
          0% { transform: translateX(30%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRightTitle {
          0% { transform: translateX(-30%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        .slide-left {
          animation: slideLeft 0.35s ease-in-out;
        }
        .slide-right {
          animation: slideRight 0.35s ease-in-out;
        }
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          50% { transform: translateX(-10%); opacity: 0; }
          51% { transform: translateX(10%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          0% { transform: translateX(0); }
          50% { transform: translateX(10%); opacity: 0; }
          51% { transform: translateX(-10%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="flex justify-between items-center mb-8">
      <button 
        onClick={prevDay}
        className="px-6 py-2 text-lg font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        ← Previous
      </button>
      <h1 className={`text-4xl font-bold text-center ${slideDirection}-title`}>{day}</h1>
      <button
        onClick={nextDay} 
        className="px-6 py-2 text-lg font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        Next →
      </button>
      </div>
      <div className={`space-y-6 ${slideDirection}`}>
      <TaskCategory categoryName="Urgent" categoryTitle="Urgent" tasks={tasks} setTasks={setTasks} />
      <TaskCategory categoryName={day} categoryTitle="Daily Tasks" tasks={tasks} setTasks={setTasks} />
      <TaskCategory categoryName="Long-term" categoryTitle="Long-term Goals" tasks={tasks} setTasks={setTasks} />
    </div>
  </div>
  );
}

function TaskCategory({ categoryName, categoryTitle, tasks, setTasks}) {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  function useGlobalBindKeyDown(key, cb) {
    useEffect(() => {
      function handleKeyDown(event) {
        if (event.key === key) {
          cb?.();
        }
      }
  
      window.addEventListener('keydown', handleKeyDown);
  
      // Cleanup the event listener when the component unmounts
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [cb]);
  }

  // Key bindings for the "Add Task" modal
  useGlobalBindKeyDown("Enter", () => {if (isAddTaskModalOpen) {handleAddTask(); setNewTaskName("");}});
  useGlobalBindKeyDown("Escape", () => {if (isAddTaskModalOpen) {setIsAddTaskModalOpen(false); setNewTaskName("");}});
  // Key bindings to move to the next day
  // globalBindKeyDown("ArrowLeft", () => {if (!isAddTaskModalOpen) {prevDay()}});
  // globalBindKeyDown("ArrowRight", () => {if (!isAddTaskModalOpen) {nextDay()}});

  function handleTaskCheckbox(e, taskId) {
    const newTasks = {...tasks};
    newTasks[categoryName] = newTasks[categoryName].map(task => {
      if (task.id === taskId) {
        return {...task, completed: !task.completed};
}
      return task;
    });
    setTasks(newTasks);
  }

  function handleAddTaskButton() {
    setIsAddTaskModalOpen(true);
  }

  function handleAddTask() {
    setIsAddTaskModalOpen(false);
    const name = newTaskName;
    const newTasks = {...tasks};
    newTasks[categoryName].push({name: name, completed: false, id: new Date().getTime()});
    setTasks(newTasks);
  }

  function handleRemoveTask(id) {
    const newTasks = {...tasks};
    newTasks[categoryName] = newTasks[categoryName].filter(task => task.id !== id);
    setTasks(newTasks);
  }

  const categoryTasks = tasks[categoryName];
  const taskElements = categoryTasks.map(task => (
    <Task key={task.id} 
      name={task.name} 
      completed={task.completed} 
      handleComplete={(e) => handleTaskCheckbox(e, task.id)}
      handleRemove={() => handleRemoveTask(task.id)} 
    />
  ));

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{categoryTitle}</h2>
        <AddTaskButton handleAdd={handleAddTaskButton} />
      </div>
      <ul className="space-y-3">
        {taskElements}
      </ul>
      <DialogModal 
        isOpen={isAddTaskModalOpen} 
        setIsOpen={setIsAddTaskModalOpen} 
        handleConfirm={() => {handleAddTask(); setNewTaskName("")}} 
        handleCancel={() => {setIsAddTaskModalOpen(false); setNewTaskName("");}}
      >
        <NewTaskNameInput newTaskName={newTaskName} setNewTaskName={setNewTaskName} />
      </DialogModal>
    </div>
  );
}

function Task({ name, completed, handleComplete, handleRemove }) {
  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input 
          type="checkbox" 
          checked={completed} 
          onChange={handleComplete}
          className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
        />
        <span className={`${completed ? "text-gray-400 line-through" : "text-gray-700"} overflow-x-auto`}>
          {name}
        </span>
      </div>
      <RemoveTaskButton handleRemove={handleRemove} />
    </li>
  );
}

function AddTaskButton({ handleAdd }) {
  return (
    <button 
      className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors" 
      onClick={handleAdd}>
      +
    </button>
  );
}

function RemoveTaskButton({ handleRemove }) {
  return (
    <button 
      className="flex-shrink-0 bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors" 
      onClick={handleRemove}
    >
      -
    </button>
  );
}

function DialogModal({ isOpen, setIsOpen, handleConfirm, handleCancel, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors" 
            onClick={() => {handleCancel(); setIsOpen(false);}}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors" 
            onClick={() => {handleConfirm(); setIsOpen(false);}}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

function NewTaskNameInput({ newTaskName, setNewTaskName }) {
  return (
    <input 
      type="text" 
      placeholder="Enter task name" 
      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
      value={newTaskName} 
      onChange={(e) => setNewTaskName(e.target.value)}
      autoFocus={true}
    />
  );
}

function TabMenu( { tabNames, defaultTabIndex, children } ) {
  const [selectedTab, setSelectedTab] = useState(defaultTabIndex);
  const selectedTabStyle = "bg-blue-500 text-white";
  const unselectedTabStyle = "bg-gray-100 text-gray-700 hover:bg-gray-200";

  if (children.constructor !== Array) {
    children = [children];
  }

  return (
    <div className="p-8">
      <div className="flex flex-row gap-4 mb-6">
        {tabNames.map((tabName, index) => {
          const isSelected = selectedTab === index;
          return (
            <button
              key={tabName}
              className={`${isSelected ? selectedTabStyle : unselectedTabStyle} px-6 py-2 rounded-lg border border-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
              onClick={() => setSelectedTab(index)}
            >
              {tabName}
            </button>
          );
        })}
      </div>
      {children.map((child, index) => (
        <div key={index} style={{ display: selectedTab === index ? 'block' : 'none' }}>
          {child}
        </div>
      ))}
    </div>
  );
}

function handleNotification(message) {
  if (!("Notification" in window)) {
    return;
  }
  else if (Notification.permission === "granted") {
    console.log("Notification permission granted.");
    const notification = new Notification(message, {body: ""});
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        const notification = new Notification(message, {body: ""});
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });
  }
}

function Timer({ lockInTime, breakTime }) {
  const [ticking, setTicking] = useState(false),
        [timeRemaining, setTimeRemaining] = useState(lockInTime),
        [isLockedIn, setIsLockedIn] = useState(true)
   
   useEffect(() => {
    const timer = setTimeout(() => 
      {
        if (ticking) {
          setTimeRemaining(timeRemaining-1);
          if (timeRemaining === 0) {
            setTicking(false);
            setTimeRemaining(isLockedIn ? breakTime : lockInTime);

            // Push notification
            handleNotification(isLockedIn ? "Break Time!" : "Focus Time!");

            setIsLockedIn(!isLockedIn);
          }
        }
      }
    , 1e3)
    return () => clearTimeout(timer)
   }, [timeRemaining, ticking])
   
   function handlePauseResume() {
    setTicking(!ticking)
   }

   function handleReset() {
    setTicking(false);
    setTimeRemaining(lockInTime);
    setIsLockedIn(true);
   }

   const timeRemainingColor = isLockedIn ? "text-red-500" : "text-green-500"

return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
    <div className={`${timeRemainingColor} text-8xl font-bold font-mono`}>
      {Math.floor(timeRemaining/60)}:{timeRemaining%60 < 10 ? '0' : ''}{timeRemaining%60}
    </div>
    <div className="flex gap-6">
      <button 
        onClick={handlePauseResume}
        className="bg-blue-500 hover:bg-blue-600 text-white text-2xl w-16 h-16 rounded-full transition-colors"
      >
        {ticking ? "⏸" : "▶"}
      </button>
      <button 
        onClick={handleReset}
        className="bg-gray-500 hover:bg-gray-600 text-white text-2xl w-16 h-16 rounded-full transition-colors"
      >
        ↺
      </button>
    </div>
  </div>
);
}
