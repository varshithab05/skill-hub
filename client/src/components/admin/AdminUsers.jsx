import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  CircularProgress,
  alpha,
  Divider,
  Avatar,
  Select,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import {
  Delete,
  Edit,
  Search,
  Refresh,
  PersonAdd,
  VerifiedUser,
} from "@mui/icons-material";
import {
  fetchUsers,
  deleteUser,
  updateUser,
} from "../../redux/slices/adminUsersSlice";

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

const USER_ROLES = ["freelancer", "enterprise", "hybrid"];

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.adminUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editFormData, setEditFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    commissionRate: 0,
    bio: "",
    info: {
      skills: "",
      portfolio: "",
      experience: "",
    },
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (users) {
      let filtered = [...users];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply role filter
      if (roleFilter !== "all") {
        filtered = filtered.filter((user) => user.role === roleFilter);
      }

      setFilteredUsers(filtered);
      setPage(1); // Reset to first page when filters change
    }
  }, [users, searchQuery, roleFilter]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      role: user.role || "",
      commissionRate: user.commissionRate || 0,
      bio: user.bio || "",
      info: {
        skills: user.info?.skills?.join(", ") || "",
        portfolio: user.info?.portfolio || "",
        experience: user.info?.experience?.join(", ") || "",
      },
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    const updates = {
      ...editFormData,
      info: {
        ...editFormData.info,
        skills: editFormData.info.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        experience: editFormData.info.experience
          .split(",")
          .map((exp) => exp.trim())
          .filter(Boolean),
      },
    };

    await dispatch(updateUser({ userId: selectedUser._id, updates }));
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      dispatch(deleteUser(selectedUser._id));
      setOpenDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  // Calculate user statistics
  const totalUsers = users?.length || 0;

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: darkThemeColors.background.default,
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
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
            User Management
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: darkThemeColors.text.secondary }}
          >
            View and manage all users on the platform
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Tooltip title="This feature is not implemented yet">
            <span>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                disabled
                sx={{
                  borderRadius: 2,
                  py: 1,
                  boxShadow: 2,
                  bgcolor: darkThemeColors.primary.main,
                  "&:hover": {
                    bgcolor: darkThemeColors.primary.dark,
                    boxShadow: 4,
                  },
                }}
              >
                Add User
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                  <PersonAdd />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: darkThemeColors.text.secondary }}
                  >
                    Total Users
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
                      totalUsers
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, bgcolor: darkThemeColors.divider }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                  <VerifiedUser />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: darkThemeColors.text.secondary }}
                  >
                    User Roles
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
                      USER_ROLES.length
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, bgcolor: darkThemeColors.divider }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 3,
          bgcolor: darkThemeColors.background.card,
          border: `1px solid ${darkThemeColors.divider}`,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search users by name, email or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: darkThemeColors.text.secondary }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
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
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel
                  id="role-filter-label"
                  sx={{ color: darkThemeColors.text.secondary }}
                >
                  Filter by Role
                </InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  label="Filter by Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    color: darkThemeColors.text.primary,
                    bgcolor: darkThemeColors.background.lighter,
                    '& .MuiSelect-select': {
                      bgcolor: darkThemeColors.background.lighter,
                    },
                    '& .MuiMenu-paper': {
                      bgcolor: darkThemeColors.background.lighter,
                    },
                    '& .MuiMenuItem-root': {
                      bgcolor: darkThemeColors.background.lighter,
                      '&:hover': {
                        bgcolor: alpha(darkThemeColors.primary.main, 0.1),
                      },
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: darkThemeColors.primary.main,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: darkThemeColors.background.lighter,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        border: `1px solid ${darkThemeColors.divider}`,
                      },
                    },
                  }}
                >
                  <MenuItem
                    value="all"
                    sx={{ color: darkThemeColors.text.primary }}
                  >
                    All Roles
                  </MenuItem>
                  {USER_ROLES.map((role) => (
                    <MenuItem
                      key={role}
                      value={role}
                      sx={{ color: darkThemeColors.text.primary }}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Tooltip title="Refresh Users">
                <IconButton
                  onClick={() => dispatch(fetchUsers())}
                  sx={{
                    bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                    color: darkThemeColors.primary.main,
                    "&:hover": {
                      bgcolor: alpha(darkThemeColors.primary.main, 0.3),
                    },
                    mr: 1,
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User List */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          mb: 3,
          bgcolor: darkThemeColors.background.card,
          border: `1px solid ${darkThemeColors.divider}`,
        }}
      >
        <TableContainer
          component={Box}
          sx={{ maxHeight: 600, overflow: "auto" }}
        >
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  User
                </TableCell>
                <TableCell
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
                  sx={{
                    fontWeight: "bold",
                    bgcolor: darkThemeColors.background.lighter,
                    color: darkThemeColors.text.primary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Skills
                </TableCell>
                <TableCell
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
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
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
                      sx={{ color: darkThemeColors.primary.main }}
                    />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
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
                      No users found matching your filters
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user._id}
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
                          src={user.avatar}
                          alt={user.name}
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 2,
                            bgcolor: user.avatar
                              ? "transparent"
                              : darkThemeColors.primary.main,
                          }}
                        >
                          {!user.avatar && user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "medium",
                              color: darkThemeColors.text.primary,
                            }}
                          >
                            {user.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: darkThemeColors.text.secondary }}
                          >
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      <Chip
                        label={
                          user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)
                        }
                        size="small"
                        sx={{
                          bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                          color: darkThemeColors.primary.main,
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
                      {user.info?.skills && user.info.skills.length > 0 ? (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {user.info.skills.slice(0, 2).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                bgcolor: alpha(
                                  darkThemeColors.primary.main,
                                  0.2
                                ),
                                color: darkThemeColors.primary.main,
                              }}
                            />
                          ))}
                          {user.info.skills.length > 2 && (
                            <Chip
                              label={`+${user.info.skills.length - 2}`}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                bgcolor: alpha(
                                  darkThemeColors.text.secondary,
                                  0.2
                                ),
                                color: darkThemeColors.text.secondary,
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: darkThemeColors.text.secondary }}
                        >
                          No skills listed
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
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(user)}
                            sx={{
                              color: darkThemeColors.primary.main,
                              "&:hover": {
                                bgcolor: alpha(
                                  darkThemeColors.primary.main,
                                  0.2
                                ),
                              },
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(user)}
                            sx={{
                              color: "#ef4444",
                              "&:hover": {
                                bgcolor: alpha("#ef4444", 0.2),
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(event, value) => setPage(value)}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: darkThemeColors.text.primary,
                  "&.Mui-selected": {
                    bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                    color: darkThemeColors.primary.main,
                    "&:hover": {
                      bgcolor: alpha(darkThemeColors.primary.main, 0.3),
                    },
                  },
                  "&:hover": {
                    bgcolor: alpha(darkThemeColors.text.primary, 0.1),
                  },
                },
              }}
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
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
          Edit User
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkThemeColors.divider }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={editFormData.username}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, username: e.target.value })
                }
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel sx={{ color: darkThemeColors.text.secondary }}>
                  Role
                </InputLabel>
                <Select
                  value={editFormData.role}
                  label="Role"
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  sx={{
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
                  }}
                >
                  {USER_ROLES.map((role) => (
                    <MenuItem
                      key={role}
                      value={role}
                      sx={{ color: darkThemeColors.text.primary }}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Commission Rate (%)"
                type="number"
                value={editFormData.commissionRate}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    commissionRate: e.target.value,
                  })
                }
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
                label="Bio"
                multiline
                rows={3}
                value={editFormData.bio}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, bio: e.target.value })
                }
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
                label="Skills (comma separated)"
                value={editFormData.info.skills}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    info: { ...editFormData.info, skills: e.target.value },
                  })
                }
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
                label="Portfolio URL"
                value={editFormData.info.portfolio}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    info: { ...editFormData.info, portfolio: e.target.value },
                  })
                }
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
                label="Experience (comma separated)"
                value={editFormData.info.experience}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    info: { ...editFormData.info, experience: e.target.value },
                  })
                }
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
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
            onClick={handleEditSubmit}
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
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Are you sure you want to delete user{" "}
            <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
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
            onClick={handleConfirmDelete}
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
    </Box>
  );
};

export default AdminUsers;
