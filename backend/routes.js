
import express from "express";
import Expense from "./Expense.js";

const router = express.Router();

// View all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// Add an expense
router.post("/", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title?.trim() || !category || !date ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Enter valid expense details" });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: Number(amount),
      category,
      date
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: "Could not add expense" });
  }
});

// Edit an expense
router.put("/:id", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title?.trim() || !category || !date ||
        !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Enter valid expense details" });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        amount: Number(amount),
        category,
        date
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: "Could not update expense" });
  }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete expense" });
  }
});

export default router;
