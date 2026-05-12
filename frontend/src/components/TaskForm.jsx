// components/TaskForm.jsx
import { useState, useEffect } from "react";
import taskService from "../services/taskService";

const TaskForm = ({ tasks, setTasks, editingTask, setEditingTask }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        deadline: editingTask.deadline,
      });
    } else {
      setFormData({ title: "", description: "", deadline: "" });
    }
  }, [editingTask]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const updated = await taskService.updateTask(editingTask._id, formData);
        setTasks(
          tasks.map((task) => (task._id === updated._id ? updated : task)),
        );
      } else {
        const created = await taskService.createTask(formData);
        setTasks([...tasks, created]);
      }
      setEditingTask(null);
      setFormData({ title: "", description: "", deadline: "" });
    } catch (error) {
      alert("Failed to save task.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 shadow-md rounded mb-6"
    >
      <h1 className="text-2xl font-bold mb-4">
        {editingTask
          ? "Your Form Name: Edit Operation"
          : "Your Form Name: Create Operation"}
      </h1>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="date"
        name="deadline"
        value={formData.deadline}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        {editingTask ? "Update Button" : "Create Button"}
      </button>
    </form>
  );
};

export default TaskForm;
