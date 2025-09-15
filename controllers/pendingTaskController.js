import PendingTask from "../models/PendingTask.js";

export const getPendingTasks = async (req, res) => {
    try {
        const tasks = await PendingTask.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json({ msg: "Pending tasks fetched successfully", data: tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error fetching pending tasks" });
    }
};

export const addPendingTask = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ msg: "Task description is required" });

        const task = new PendingTask({
            description,
            createdBy: req.user.id,
        });

        await task.save();
        res.status(201).json({ msg: "Task added successfully", data: task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error adding task" });
    }
};

export const updatePendingTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await PendingTask.findById(id);
        if (!task) return res.status(404).json({ msg: "Task not found" });

        // Mark completed
        task.isCompleted = true;
        await task.save();

        res.json({ msg: "Task marked as completed", data: task });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error updating task" });
    }
};
