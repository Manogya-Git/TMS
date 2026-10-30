import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import api from "../../api/axios";

const NewTicketDialog = ({ open, onClose, onTicketCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setCategory("");
    setSelectedFile(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/tickets/", {
        title,
        description,
        priority,
        category,
      });

      // Ticket now exists — upload the attachment if one was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/tickets/${res.data.id}/attachments/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onTicketCreated(res.data);
      handleClose();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to create ticket",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>New ticket</DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
        />

        <TextField
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />

        <TextField
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          size="small"
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          size="small"
        >
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="URGENT">Urgent</MenuItem>
        </TextField>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Attachment (optional)
          </h3>

          <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-blue-400 transition block">
            <input
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <p className="text-sm text-slate-500">
              {selectedFile ? selectedFile.name : "Click to select a file"}
            </p>
          </label>
        </div>

        {error && (
          <p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>
            {error}
          </p>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} sx={{ color: "#334155" }}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={submitting}
          variant="contained"
          sx={{ backgroundColor: "#475569" }}
        >
          {submitting ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTicketDialog;