
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import API from "./api";
import "./App.css";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    try {
      const response = await API.get("/");
      setExpenses(response.data);
      setError("");
    } catch {
      setError("Cannot connect to server. Check your backend.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate(new Date().toISOString().slice(0, 10));
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = { title, amount: Number(amount), category, date };

      if (editId) {
        await API.put(`/${editId}`, data);
      } else {
        await API.post("/", data);
      }

      resetForm();
      await fetchExpenses();
    } catch {
      setError("Could not save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(new Date(expense.date).toISOString().slice(0, 10));
    setEditId(expense._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await API.delete(`/${id}`);
      await fetchExpenses();
    } catch {
      setError("Could not delete expense.");
    }
  };

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <main className="app">
      <header className="header">
        <div className="logo"><Wallet size={25} /></div>
        <div>
          <h1>PennyWise</h1>
          <p>Your personal expense tracker</p>
        </div>
      </header>

      <section className="summary">
        <p>Total Expenses</p>
        <h2>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
        <span>{expenses.length} transaction(s)</span>
      </section>

      <section className="panel">
        <h2>{editId ? "Edit Expense" : "Add New Expense"}</h2>

        <form onSubmit={handleSubmit} className="expense-form">
          <label>
            Expense Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lunch"
              required
            />
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["Food", "Travel", "Bills", "Shopping", "Other"].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              <Plus size={18} />
              {loading ? "Saving..." : editId ? "Update Expense" : "Add Expense"}
            </button>
            {editId && (
              <button type="button" className="cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Recent Transactions</h2>
        {error && <p className="error">{error}</p>}

        {expenses.length === 0 ? (
          <p className="empty">No expenses yet. Add your first expense!</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{expense.title}</td>
                    <td><span className="category">{expense.category}</span></td>
                    <td>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                    <td className="amount">
                      ₹{Number(expense.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="icon-btn edit"
                          onClick={() => handleEdit(expense)}
                          aria-label="Edit expense"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(expense._id)}
                          aria-label="Delete expense"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
