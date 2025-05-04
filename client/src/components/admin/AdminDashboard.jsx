import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from "@mui/icons-material";
import {
  fetchAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updatePermissions,
  clearSuccess,
  clearError,
  getCurrentAdmin,
} from "../../redux/slices/adminSlice";

// Custom dark theme colors for consistent styling
const darkThemeColors = {
  background: {
    default: "#1a1d23", // dark
    paper: "#23272f", // grey
    card: "#23272f", // grey
    lighter: "#2a2f38", // slightly lighter than grey
  },
  primary: {
    main: "#58c4dc", // cyan-blue
    light: "#7ad4e6", // lighter cyan-blue
    dark: "#3a9cb2", // darker cyan-blue
  },
  text: {
    primary: "#f6f7f9", // light
    secondary: "#b0b7c3", // lighter grey
  },
  divider: "rgba(246, 247, 249, 0.12)", // light with opacity
};

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    admins = [],
    loading,
    error,
    success,
    currentAdmin,
  } = useSelector((state) => state.admin);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionsAdmin, setPermissionsAdmin] = useState(null);

  const availablePermissions = [
    "manageUsers",
    "manageJobs",
    "manageBids",
    "manageTransactions",
    "viewReports",
    "manageAdmins",
    "manageSettings",
  ];

  useEffect(() => {
    // Always fetch the current admin first to ensure we have the latest data
    dispatch(getCurrentAdmin()).then(() => {
      dispatch(fetchAllAdmins());
    });
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setOpenDialog(false);
      setSelectedAdmin(null);
      setFormData({ name: "", email: "", password: "", role: "admin" });
      dispatch(clearSuccess());

      // Refresh the current admin data to ensure it's up to date
      dispatch(getCurrentAdmin());
    }
  }, [success, dispatch]);

  const handleOpenDialog = (admin = null) => {
    if (admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        password: "",
        role: admin.role,
      });
      setSelectedAdmin(admin);
    } else {
      setFormData({ name: "", email: "", password: "", role: "admin" });
      setSelectedAdmin(null);
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAdmin(null);
    setFormData({ name: "", email: "", password: "", role: "admin" });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!selectedAdmin && !formData.password.trim())
      errors.password = "Password is required";
    if (
      formData.email.trim() &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    )
      errors.email = "Invalid email address";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (selectedAdmin) {
      // Update existing admin
      const updates = { ...formData };
      if (!updates.password) delete updates.password; // Don't send empty password
      await dispatch(updateAdmin({ id: selectedAdmin._id, data: updates }));
    } else {
      // Create new admin
      await dispatch(createAdmin(formData));
    }
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (adminToDelete) {
      await dispatch(deleteAdmin(adminToDelete._id));
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAdminToDelete(null);
  };

  const handleOpenPermissionsDialog = (admin) => {
    setPermissionsAdmin(admin);
    setSelectedPermissions(admin.permissions || []);
    setPermissionsDialogOpen(true);
  };

  const handleClosePermissionsDialog = () => {
    setPermissionsDialogOpen(false);
    setPermissionsAdmin(null);
    setSelectedPermissions([]);
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = async () => {
    if (permissionsAdmin) {
      await dispatch(
        updatePermissions({
          id: permissionsAdmin._id,
          permissions: selectedPermissions,
        })
      );
      handleClosePermissionsDialog();
    }
  };

  // Get stats for the dashboard
  const totalAdmins = admins.length;
  const superAdmins = admins.filter(
    (admin) => admin.role === "superuser"
  ).length;
  const regularAdmins = admins.filter((admin) => admin.role === "admin").length;

  return (
    <Container
      maxWidth="xl"
      sx={{
        bgcolor: darkThemeColors.background.default,
        color: darkThemeColors.text.primary,
        pt: 2,
        pb: 4,
      }}
    >
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          sx={{ mb: 3, borderRadius: 1 }}
        >
          {error}
        </Alert>
      )}

      {/* Dashboard Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              mb: 1,
              color: darkThemeColors.text.primary,
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: darkThemeColors.text.secondary }}
          >
            Manage administrators and their permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: 2,
            bgcolor: darkThemeColors.primary.main,
            "&:hover": {
              bgcolor: darkThemeColors.primary.dark,
              boxShadow: 4,
            },
          }}
        >
          Add Admin
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              bgcolor: darkThemeColors.background.card,
              border: `1px solid ${darkThemeColors.divider}`,
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                    color: darkThemeColors.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <AdminPanelSettingsIcon />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: darkThemeColors.text.secondary }}
                  >
                    Total Admins
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      color: darkThemeColors.text.primary,
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        size={24}
                        sx={{ color: darkThemeColors.primary.main }}
                      />
                    ) : (
                      totalAdmins
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, bgcolor: darkThemeColors.divider }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Chip
                  label={`${superAdmins} Super Admins`}
                  size="small"
                  sx={{
                    bgcolor: alpha("#10b981", 0.2),
                    color: "#10b981",
                    fontWeight: "medium",
                  }}
                />
                <Chip
                  label={`${regularAdmins} Regular Admins`}
                  size="small"
                  sx={{
                    bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                    color: darkThemeColors.primary.main,
                    fontWeight: "medium",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional stat cards can be added here */}
      </Grid>

      {/* Admin List */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 4,
          bgcolor: darkThemeColors.background.card,
          border: `1px solid ${darkThemeColors.divider}`,
        }}
      >
        <CardHeader
          title={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: darkThemeColors.text.primary }}
              >
                Administrator List
              </Typography>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => dispatch(fetchAllAdmins())}
                  sx={{ color: darkThemeColors.primary.main }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
          sx={{
            borderBottom: `1px solid ${darkThemeColors.divider}`,
            pb: 2,
          }}
        />
        <TableContainer
          component={Box}
          sx={{ maxHeight: 440, overflow: "auto" }}
        >
          <Table key="admin-table" stickyHeader sx={{ minWidth: 650 }}>
            <TableHead key="table-head">
              <TableRow key="header-row">
                <TableCell
                  key="name-header"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  key="email-header"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  key="role-header"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Role
                </TableCell>
                <TableCell
                  key="permissions-header"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Permissions
                </TableCell>
                <TableCell
                  key="actions-header"
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody key="table-body">
              {loading ? (
                <TableRow key="loading-row">
                  <TableCell
                    key="loading-cell"
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 3,
                      bgcolor: darkThemeColors.background.paper,
                      color: darkThemeColors.text.primary,
                      borderBottom: `1px solid ${darkThemeColors.divider}`,
                    }}
                  >
                    <CircularProgress
                      size={40}
                      sx={{ color: darkThemeColors.primary.main }}
                    />
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow key="empty-row">
                  <TableCell
                    key="empty-cell"
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 3,
                      bgcolor: darkThemeColors.background.paper,
                      color: darkThemeColors.text.secondary,
                      borderBottom: `1px solid ${darkThemeColors.divider}`,
                    }}
                  >
                    <Typography variant="body1" color="inherit">
                      No administrators found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow
                    key={admin._id}
                    sx={{
                      bgcolor: darkThemeColors.background.paper,
                      color: darkThemeColors.text.primary,
                      "&:hover": {
                        bgcolor: darkThemeColors.background.lighter,
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            bgcolor:
                              admin.role === "superuser"
                                ? theme.palette.error.main
                                : theme.palette.primary.main,
                          }}
                        >
                          {admin.name && admin.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {admin.name || "Unknown"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      {admin.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      <Chip
                        label={
                          admin.role === "superuser" ? "Super User" : "Admin"
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            admin.role === "superuser"
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.1),
                          color:
                            admin.role === "superuser"
                              ? theme.palette.error.main
                              : theme.palette.primary.main,
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      {admin.permissions && admin.permissions.length > 0 ? (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {admin.permissions.slice(0, 2).map((permission) => (
                            <Chip
                              key={`${admin._id}-${permission}`}
                              label={permission}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                              }}
                            />
                          ))}
                          {admin.permissions.length > 2 && (
                            <Chip
                              key={`${admin._id}-more-permissions`}
                              label={`+${admin.permissions.length - 2}`}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                color: theme.palette.grey[700],
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No permissions
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      <Box sx={{ display: "flex" }}>
                        <Tooltip title="Edit Admin">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(admin)}
                            sx={{
                              color: theme.palette.primary.main,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Permissions">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPermissionsDialog(admin)}
                            sx={{
                              color: theme.palette.info.main,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                              },
                            }}
                          >
                            <SecurityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {currentAdmin && currentAdmin._id !== admin._id && (
                          <Tooltip title="Delete Admin">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(admin)}
                              sx={{
                                color: theme.palette.error.main,
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Admin Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkThemeColors.background.paper,
            color: darkThemeColors.text.primary,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, color: darkThemeColors.text.primary }}>
          {selectedAdmin ? "Edit Administrator" : "Add New Administrator"}
        </DialogTitle>
        <DialogContent sx={{ pb: 0, pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                variant="outlined"
                margin="normal"
                InputLabelProps={{
                  sx: { color: darkThemeColors.text.secondary },
                }}
                InputProps={{
                  sx: {
                    color: darkThemeColors.text.primary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                variant="outlined"
                margin="normal"
                InputLabelProps={{
                  sx: { color: darkThemeColors.text.secondary },
                }}
                InputProps={{
                  sx: {
                    color: darkThemeColors.text.primary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={
                  selectedAdmin
                    ? "Password (leave blank to keep current)"
                    : "Password"
                }
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                variant="outlined"
                margin="normal"
                InputLabelProps={{
                  sx: { color: darkThemeColors.text.secondary },
                }}
                InputProps={{
                  sx: {
                    color: darkThemeColors.text.primary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                variant="outlined"
                margin="normal"
                InputLabelProps={{
                  sx: { color: darkThemeColors.text.secondary },
                }}
                InputProps={{
                  sx: {
                    color: darkThemeColors.text.primary,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                  },
                }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="admin">Admin</option>
                <option value="superuser">Super User</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            variant="outlined"
            sx={{
              color: darkThemeColors.text.primary,
              borderColor: darkThemeColors.divider,
              "&:hover": {
                borderColor: darkThemeColors.text.primary,
                bgcolor: alpha(darkThemeColors.text.primary, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{
              bgcolor: darkThemeColors.primary.main,
              "&:hover": {
                bgcolor: darkThemeColors.primary.dark,
              },
            }}
          >
            {selectedAdmin ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkThemeColors.background.paper,
            color: darkThemeColors.text.primary,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: darkThemeColors.text.primary }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: darkThemeColors.text.primary }}>
            Are you sure you want to delete administrator{" "}
            <strong>{adminToDelete?.name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            color="inherit"
            variant="outlined"
            sx={{
              color: darkThemeColors.text.primary,
              borderColor: darkThemeColors.divider,
              "&:hover": {
                borderColor: darkThemeColors.text.primary,
                bgcolor: alpha(darkThemeColors.text.primary, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{
              bgcolor: "#ef4444", // Tailwind red-500
              "&:hover": {
                bgcolor: "#dc2626", // Tailwind red-600
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={permissionsDialogOpen}
        onClose={handleClosePermissionsDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkThemeColors.background.paper,
            color: darkThemeColors.text.primary,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: darkThemeColors.text.primary }}>
          Manage Permissions for {permissionsAdmin?.name}
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            {availablePermissions.map((permission) => (
              <FormControlLabel
                key={permission}
                control={
                  <Checkbox
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    sx={{
                      color: darkThemeColors.primary.main,
                      "&.Mui-checked": {
                        color: darkThemeColors.primary.main,
                      },
                    }}
                  />
                }
                label={permission}
                sx={{ color: darkThemeColors.text.primary }}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClosePermissionsDialog}
            color="inherit"
            variant="outlined"
            sx={{
              color: darkThemeColors.text.primary,
              borderColor: darkThemeColors.divider,
              "&:hover": {
                borderColor: darkThemeColors.text.primary,
                bgcolor: alpha(darkThemeColors.text.primary, 0.1),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{
              bgcolor: darkThemeColors.primary.main,
              "&:hover": {
                bgcolor: darkThemeColors.primary.dark,
              },
            }}
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
