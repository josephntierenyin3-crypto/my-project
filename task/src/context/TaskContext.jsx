import React, { createContext, useState, useEffect } from 'react';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('fleet_tasks');
    const savedSubmissions = localStorage.getItem('fleet_submissions');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  // Save to localStorage whenever tasks or submissions change
  useEffect(() => {
    localStorage.setItem('fleet_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('fleet_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Task management functions
  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const markTaskDone = (id) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
        : task
    ));
  };

  // Submission/Booking functions
  const addSubmission = (submission) => {
    const newSubmission = {
      id: Date.now(),
      ...submission,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSubmissions([...submissions, newSubmission]);
    
    // If booking is done online, mark related task as done
    if (submission.taskId) {
      markTaskDone(submission.taskId);
    }
    
    return newSubmission;
  };

  const updateSubmission = (id, updates) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, ...updates } : sub
    ));
  };

  const approveSubmission = (id) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'approved' } : sub
    ));
  };

  // Auto counting functions
  const getTaskCounts = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
    };
  };

  const getSubmissionCounts = () => {
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      totalRevenue: submissions
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => sum + (Number(s.amount) || 0), 0),
      totalPassengers: submissions
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => sum + (Number(s.passengers) || 0), 0),
    };
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        submissions,
        addTask,
        updateTask,
        deleteTask,
        markTaskDone,
        addSubmission,
        updateSubmission,
        approveSubmission,
        getTaskCounts,
        getSubmissionCounts,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

