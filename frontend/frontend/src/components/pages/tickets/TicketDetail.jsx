import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Comments from "../../layout/Comments";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";

const API_URL = import.meta.env.VITE_API_URL;
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  const [agents, setAgents] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");

  const [status, setStatus] = useState("");

  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // --------------------------------
  // STATUS FUNCTIONS
  // --------------------------------
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
  };
  const handleConfirmDelete = () => {
    api
      .delete(`/tickets/${id}/`)
      .then(() => {
        navigate("/dashboard/");
      })
      .catch(() => {
        setError("Could not delete ticket");
      });
  };
  const handleNextStatus = () => {
    const nextStatus = {
      OPEN: "IN_PROGRESS",
      IN_PROGRESS: "RESOLVED",
      RESOLVED: "CLOSED",
    };

    const newStatus = nextStatus[status];

    if (newStatus) {
      handleStatusChange(newStatus);
    }
  };

  const handleStatusChange = (newStatus) => {
    api
      .patch(`/tickets/${id}/`, { status: newStatus })
      .then((res) => {
        setTicket(res.data);
        setStatus(res.data.status);
      })
      .catch(() => setError("Could not update status"));
  };

  const getNextStatusLabel = () => {
    switch (status) {
      case "OPEN":
        return "Start Progress";

      case "IN_PROGRESS":
        return "Mark as Resolved";

      case "RESOLVED":
        return "Close Ticket";

      case "CLOSED":
        return "Closed";

      default:
        return "Update Status";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "OPEN":
        return "Open";

      case "IN_PROGRESS":
        return "In Progress";

      case "RESOLVED":
        return "Resolved";

      case "CLOSED":
        return "Closed";

      default:
        return status;
    }
  };

  // --------------------------------
  // ATTACHMENTS
  // --------------------------------

  useEffect(() => {
    api
      .get(`/tickets/${id}/attachments/`)
      .then((res) => setAttachments(res.data))
      .catch(() => setError("Could not load attachments"));
  }, [id]);

  // --------------------------------
  // GET AGENTS
  // --------------------------------

  useEffect(() => {
    if (user?.role === "admin") {
      api
        .get("auth/agent/")
        .then((res) => {
          setAgents(res.data);
        })
        .catch(() => setError("Could not load agents"));
    }
  }, [user]);

  // --------------------------------
  // GET CATEGORIES
  // --------------------------------

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch(() => {
        setError("Could not load categories");
      });
  }, []);

  // --------------------------------
  // GET TICKET
  // --------------------------------

  useEffect(() => {
    api
      .get(`/tickets/${id}/`)
      .then((res) => {
        setTicket(res.data);

        setTitle(res.data.title);
        setDescription(res.data.description);
        setPriority(res.data.priority);
        setCategory(res.data.category);
        setAssignedTo(res.data.assigned_to);
        setStatus(res.data.status);
      })
      .catch(() => {
        setError("Ticket not found or you don't have access");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);



  const handleSave = () => {
    api
      .patch(`/tickets/${id}/`, {
        title,
        description,
        priority,
        category,
      })
      .then((res) => {
        setTicket(res.data);
        setEditing(false);
      })
      .catch(() => {
        setError("Could not update ticket");
      });
  };

  // --------------------------------
  // CANCEL EDIT
  // --------------------------------

  const handleCancel = () => {
    setTitle(ticket.title);
    setDescription(ticket.description);
    setPriority(ticket.priority);
    setCategory(ticket.category);

    setEditing(false);
  };

  // --------------------------------
  // DELETE
  // --------------------------------

  // const handleDelete = () => {
  //   api
  //     .delete(`/tickets/${id}/`)
  //     .then(() => {
  //       navigate("/dashboard/");
  //     })
  //     .catch(() => {
  //       setError("Could not delete ticket");
  //     });
  // };

  // --------------------------------
  // ASSIGN TICKET
  // --------------------------------

  const handleAssign = (agentId) => {
    api
      .patch(`/tickets/${id}/`, {
        assigned_to: agentId,
      })
      .then((res) => {
        setTicket(res.data);
        setAssignedTo(agentId);
      })
      .catch(() => {
        setError("Could not assign ticket");
      });
  };

  // --------------------------------
  // PRIORITY STYLE
  // --------------------------------

  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";

      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "low":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

          <p className="text-sm text-slate-500">Loading ticket...</p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm text-center max-w-md w-full">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Something went wrong
          </h2>

          <p className="text-sm text-red-600 mt-2">{error}</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------
  // PAGE
  // --------------------------------

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}

        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition mb-6"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Back to tickets
        </button>

        {/* Main ticket card */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}

          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
                  Ticket #{ticket.id}
                </p>

                <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                  {ticket.title}
                </h1>
              </div>

              {/* Priority */}

              <span
                className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold capitalize ${getPriorityStyle(
                  ticket.priority,
                )}`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>

          {/* Ticket body */}

          <div className="px-6 py-6">
            {/* Description */}

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Description
              </h3>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap">
                  {ticket.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Ticket information */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
              {/* Category */}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Category
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {ticket.category_name || "Uncategorized"}
                </p>
              </div>

              {/* Created By */}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Created By
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {ticket.created_by_username || "Unknown"}
                </p>
              </div>

              {/* Created At */}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Created At
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(ticket.created_at)}
                </p>
              </div>

              {/* Status */}

              {user?.role === "agent" ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getStatusLabel(status)}
                  </p>

                  {status !== "CLOSED" && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleNextStatus}
                      sx={{
                        mt: 1.5,
                        textTransform: "none",
                        borderRadius: "8px",
                        boxShadow: "none",
                      }}
                    >
                      {getNextStatusLabel()}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    STATUS
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getStatusLabel(ticket.status)}
                  </p>
                </div>
              )}

              {/* Resolved At */}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Resolved At
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(ticket.resolved_at)}
                </p>
              </div>

              {/* Attachments */}

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Attachments
                </p>

                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {attachments.length === 0 ? (
                    <p>No attachments</p>
                  ) : (
                    attachments.map((attachment) => (
                      <div key={attachment.id}>
                        <a
                          href={`${API_URL}${attachment.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {attachment.file.split("/").pop()}
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Assign To - Admin only */}

              {user?.role === "admin" && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                    Assign To
                  </p>

                  <FormControl fullWidth size="small">
                    <Select
                      value={assignedTo || ""}
                      displayEmpty
                      onChange={(e) => handleAssign(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Unassigned</em>
                      </MenuItem>

                      {agents.map((agent) => (
                        <MenuItem key={agent.id} value={agent.id}>
                          {agent.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}
            </div>

            {/* Actions */}

            {!editing && (
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <Button
                  variant="contained"
                  onClick={() => setEditing(true)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    boxShadow: "none",
                    backgroundColor: "#000000",
                    "&:hover": {
                      backgroundColor: "#1f2937",
                      boxShadow: "none",
                    },
                  }}
                >
                  Edit Ticket
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleDelete}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    color: "#dc2626",
                    borderColor: "#fecaca",
                    "&:hover": {
                      backgroundColor: "#fef2f2",
                      borderColor: "#fca5a5",
                    },
                  }}
                >
                  Delete
                </Button>
                <Dialog
          open={showDeleteDialog}
          slots={{
            transition: Transition,
          }}
          keepMounted
          onClose={handleCloseDeleteDialog}
          aria-describedby="logout-dialog-description"
          role="alertdialog"
        >
          <DialogTitle>
            Logout
          </DialogTitle>

          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Are you sure you want to delete?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>
              No
            </Button>

            <Button
              onClick={handleConfirmDelete}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>


              </div>
            )}

            {/* Comments */}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Comments ticketId={id} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}

            <div className="px-6 py-5 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Edit Ticket</h2>

              <p className="text-sm text-slate-500 mt-1">
                Update the ticket information below.
              </p>
            </div>

            {/* Form */}

            <div className="p-6 overflow-y-auto">
              {/* Title */}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter ticket title"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Description */}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter ticket description"
                  rows={5}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 outline-none resize-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Priority */}

              <FormControl fullWidth size="small">
                <InputLabel id="priority-label">Priority</InputLabel>

                <Select
                  labelId="priority-label"
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                  sx={{
                    borderRadius: "10px",
                  }}
                >
                  <MenuItem value="LOW">Low</MenuItem>

                  <MenuItem value="MEDIUM">Medium</MenuItem>

                  <MenuItem value="HIGH">High</MenuItem>

                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>

              {/* Category */}

              <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  mt: 2.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Attachment */}

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Attachment{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </h3>

                <label className="group flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl px-4 py-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-400 transition-all duration-200">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                    📎
                  </div>

                  <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                    {selectedFile
                      ? selectedFile.name
                      : "Click to select a file"}
                  </p>

                  {!selectedFile && (
                    <p className="text-xs text-slate-400">
                      PDF, PNG, JPG, DOCX, TXT, CSV — up to 10MB
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
