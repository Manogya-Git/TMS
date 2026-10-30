import { useEffect, useState } from "react";
import api from "../../api/axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import NewTicketDialog from "../layout/NewTicketDialog";
import { formatDate } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import TablePagination from "@mui/material/TablePagination";

const BASE_URL = import.meta.env.VITE_API_URL;

const DashboardLayout = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/tickets/")
      .then((response) => {
        console.log("API Response:", response.data);
        setTickets(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setError(error.message || "Failed to fetch tickets");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";

      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "low":
        return "bg-green-100 text-green-700 border-green-100";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1>All Tickets</h1>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1>All Tickets</h1>
        <p>Error loading tickets: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Add Ticket Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="contained"
          sx={{ background: "black" }}
          onClick={() => setDialogOpen(true)}
        >
          Add Ticket
        </Button>
      </div>

      {/* Page Heading */}
      <h1 className="mb-4 text-2xl font-bold">All Tickets</h1>

      {/* Total Tickets */}
      <h1 className="mb-2 text-xl">{tickets.length} total</h1>

      {/* Tickets Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tickets table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Title
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Priority
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Assigned To
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Created At
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Updated At
              </TableCell>
              <TableCell sx={{ fontSize: "1.05rem", fontWeight: "bold" }}>
                Resolved At
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ticket) => (
                <TableRow
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  key={ticket.id}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f8fafc" },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {ticket.id}
                  </TableCell>

                  <TableCell>{ticket.title}</TableCell>

                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
      ${
        ticket.status === "OPEN"
          ? "bg-blue-100 text-blue-700"
          : ticket.status === "IN_PROGRESS"
            ? "bg-yellow-100 text-yellow-700"
            : ticket.status === "RESOLVED"
              ? "bg-green-100 text-green-700"
              : ticket.status === "CLOSED"
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-100 text-gray-700"
      }
    `}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyle(
                        ticket.priority,
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </TableCell>

                  <TableCell>{ticket.category_name || "—"}</TableCell>

                  <TableCell>
                    {ticket.assigned_to_username || "Unassigned"}
                  </TableCell>

                  <TableCell>{formatDate(ticket.created_at)}</TableCell>

                  <TableCell>{formatDate(ticket.updated_at)}</TableCell>

                  <TableCell>{formatDate(ticket.resolved_at)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={tickets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <NewTicketDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};

export default DashboardLayout;
