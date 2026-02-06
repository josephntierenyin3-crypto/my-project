import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export const WorkContext = createContext();

export const WorkProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const fetchWorkspaces = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.workspaces.list(userId);
      setWorkspaces(data);
    } catch (e) {
      setError(e.message);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async (workspaceId) => {
    if (!workspaceId) {
      setProjects([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.projects.list(workspaceId);
      setProjects(data);
    } catch (e) {
      setError(e.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async (projectId, workspaceId, userId) => {
    setLoading(true);
    setError(null);
    try {
      if (projectId) {
        const data = await api.tasks.listByProject(projectId);
        setTasks(data);
      } else if (workspaceId) {
        const data = await api.tasks.listByWorkspace(workspaceId);
        setTasks(data);
      } else if (userId) {
        const data = await api.tasks.listMyWork(userId);
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (e) {
      setError(e.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorkspace = async (userId, name, description) => {
    const row = await api.workspaces.create({ userId, name, description });
    setWorkspaces((prev) => [row, ...prev]);
    return row;
  };

  const updateWorkspace = async (id, body) => {
    const row = await api.workspaces.update(id, body);
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? row : w)));
    return row;
  };

  const deleteWorkspace = async (id) => {
    await api.workspaces.delete(id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (selectedWorkspaceId === id) {
      setSelectedWorkspaceId(null);
      setSelectedProjectId(null);
      setProjects([]);
      setTasks([]);
    }
  };

  const addProject = async (workspaceId, name, description) => {
    const row = await api.projects.create({ workspaceId, name, description });
    setProjects((prev) => [row, ...prev]);
    return row;
  };

  const updateProject = async (id, body) => {
    const row = await api.projects.update(id, body);
    setProjects((prev) => prev.map((p) => (p.id === id ? row : p)));
    return row;
  };

  const deleteProject = async (id) => {
    await api.projects.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setTasks([]);
    }
  };

  const addTask = async (projectId, task) => {
    const row = await api.tasks.create({
      projectId,
      title: task.title,
      description: task.description,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.dueDate,
      assignee_id: task.assigneeId,
    });
    setTasks((prev) => [row, ...prev]);
    return row;
  };

  const updateTask = async (id, body) => {
    const row = await api.tasks.update(id, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      due_date: body.dueDate,
      assignee_id: body.assigneeId,
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? row : t)));
    return row;
  };

  const deleteTask = async (id) => {
    await api.tasks.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <WorkContext.Provider
      value={{
        workspaces,
        projects,
        tasks,
        loading,
        error,
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        selectedProjectId,
        setSelectedProjectId,
        fetchWorkspaces,
        fetchProjects,
        fetchTasks,
        addWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </WorkContext.Provider>
  );
};
