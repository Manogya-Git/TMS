
import React, { useState, useEffect, useRef } from "react";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/formatDate";
import { useNotifications } from "../../context/NotificationContext";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, error, markAsRead } =
    useNotifications();

  // Controls notification dropdown
  const [open, setOpen] = useState(false);

  // Controls logout confirmation dialog
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    setOpen(false);
    navigate(`/tickets/${notification.ticket}`);
  };

  // Opens the logout confirmation dialog
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  // Closes the logout confirmation dialog
  const handleCloseLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  // Actually logs the user out
  const handleConfirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
    navigate("/login");
  };

  return (
    <Box
      sx={{
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        borderRadius: "16px 16px 0 0",
      }}
    >
      {/* Left side */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <ConfirmationNumberIcon
          sx={{ fontSize: 22, color: "#172554" }}
        />

        <Typography
          sx={{
            fontSize: "17px",
            fontWeight: 700,
            color: "#172033",
          }}
        >
          Ticket Manager
        </Typography>
      </Box>

      {/* Right side */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2.5,
        }}
      >
        {/* Notifications */}
        <Box sx={{ position: "relative" }} ref={dropdownRef}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsNoneIcon
              sx={{
                fontSize: 25,
                color: "#172033",
                cursor: "pointer",
              }}
              onClick={() => setOpen((prev) => !prev)}
            />
          </Badge>

          {open && (
            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: "36px",
                width: "320px",
                maxHeight: "384px",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                zIndex: 50,
              }}
            >
              <Box
                sx={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#172033",
                  }}
                >
                  Notifications
                </Typography>
              </Box>

              {error && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#dc2626",
                    padding: "12px 16px",
                  }}
                >
                  {error}
                </Typography>
              )}

              {notifications.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    padding: "24px 16px",
                    textAlign: "center",
                  }}
                >
                  No notifications yet.
                </Typography>
              ) : (
                notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    sx={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f8fafc",
                      cursor: "pointer",
                      backgroundColor: !notification.is_read
                        ? "#eff6ff"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "#334155",
                      }}
                    >
                      {notification.message}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      {formatDate(notification.created_at)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>

        {/* User email */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid #dbe3ee",
            borderRadius: "8px",
            padding: "5px 8px",
          }}
        >
          <Typography
            sx={{
              fontSize: "13px",
              color: "#475569",
            }}
          >
            {user?.email}
          </Typography>

          <Typography
            sx={{
              fontSize: "11px",
              color: "#d97706",
              backgroundColor: "#fef3c7",
              borderRadius: "4px",
              padding: "2px 5px",
              fontWeight: 500,
            }}
          >
            {user?.role}
          </Typography>
        </Box>

        {/* Logout */}
        <LogoutIcon
          sx={{
            fontSize: 24,
            color: "#334155",
            cursor: "pointer",
          }}
          onClick={handleLogout}
        />

        {/* Logout confirmation dialog */}
        <Dialog
          open={showLogoutDialog}
          slots={{
            transition: Transition,
          }}
          keepMounted
          onClose={handleCloseLogoutDialog}
          aria-describedby="logout-dialog-description"
          role="alertdialog"
        >
          <DialogTitle>
            Logout
          </DialogTitle>

          <DialogContent>
            <DialogContentText id="logout-dialog-description">
              Are you sure you want to logout?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseLogoutDialog}>
              No
            </Button>

            <Button
              onClick={handleConfirmLogout}
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Header;

