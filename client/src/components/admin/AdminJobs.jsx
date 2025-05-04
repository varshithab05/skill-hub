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
  Chip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Avatar,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
} from "@mui/material";
import {
  Delete,
  Edit,
  Search,
  Refresh,
  Work,
  AttachMoney,
} from "@mui/icons-material";
import {
  fetchJobs,
  deleteJob,
  updateJob,
} from "../../redux/slices/adminJobsSlice";

const JOB_STATUS_OPTIONS = ["open", "in-progress", "completed", "closed"];

const AdminJobs = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.adminJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    status: "",
    budget: { min: 0, max: 0 },
    categories: "",
    skillsRequired: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (jobs) {
      let filtered = [...jobs];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (job) =>
            job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            job.skills
              ?.join(" ")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((job) => job.status === statusFilter);
      }

      setFilteredJobs(filtered);
      setPage(1); // Reset to first page when filters change
    }
  }, [jobs, searchQuery, statusFilter]);

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setEditFormData({
      title: job.title,
      description: job.description,
      status: job.status,
      budget: {
        min: job.budget?.min || 0,
        max: job.budget?.max || 0,
      },
      categories: job.categories?.join(", ") || "",
      skillsRequired: job.skillsRequired?.join(", ") || "",
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    const updates = {
      ...editFormData,
      categories: editFormData.categories
        .split(",")
        .map((cat) => cat.trim())
        .filter(Boolean),
      skillsRequired: editFormData.skillsRequired
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    await dispatch(updateJob({ jobId: selectedJob._id, updates }));
    setOpenEditDialog(false);
    setSelectedJob(null);
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedJob) {
      dispatch(deleteJob(selectedJob._id));
      setOpenDeleteDialog(false);
      setSelectedJob(null);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate job statistics
  const totalJobs = jobs?.length || 0;
  const openJobs = jobs?.filter((job) => job.status === "open")?.length || 0;
  const inProgressJobs =
    jobs?.filter((job) => job.status === "in-progress")?.length || 0;
  const completedJobs =
    jobs?.filter((job) => job.status === "completed")?.length || 0;
  const closedJobs =
    jobs?.filter((job) => job.status === "closed")?.length || 0;

  // Calculate average budget
  const avgBudget =
    jobs && jobs.length > 0
      ? jobs.reduce(
          (sum, job) =>
            sum + ((job.budget?.min || 0) + (job.budget?.max || 0)) / 2,
          0
        ) / jobs.length
      : 0;

  // Pagination
  const paginatedJobs = filteredJobs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const pageCount = Math.ceil(filteredJobs.length / rowsPerPage);

  return (
    <Box sx={{ p: 3, bgcolor: darkThemeColors.background.default, minHeight: "100vh" }}>
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
            Jobs Management
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: darkThemeColors.text.secondary }}
          >
            View and manage all Jobs on the platform
          </Typography>
        </Box>
      </Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: darkThemeColors.background.paper,
              borderRadius: 2,
              boxShadow: `0 4px 20px ${alpha("#000", 0.15)}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(darkThemeColors.primary.main, 0.1),
                    color: darkThemeColors.primary.main,
                  }}
                >
                  <Work />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{ ml: 2, color: darkThemeColors.text.primary }}
                >
                  Total Jobs
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: darkThemeColors.primary.main, fontWeight: "bold" }}
              >
                {totalJobs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: darkThemeColors.background.paper,
              borderRadius: 2,
              boxShadow: `0 4px 20px ${alpha("#000", 0.15)}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha("#4caf50", 0.1),
                    color: "#4caf50",
                  }}
                >
                  <Work />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{ ml: 2, color: darkThemeColors.text.primary }}
                >
                  Active Jobs
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#4caf50", fontWeight: "bold" }}
              >
                {openJobs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: darkThemeColors.background.paper,
              borderRadius: 2,
              boxShadow: `0 4px 20px ${alpha("#000", 0.15)}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha("#ff9800", 0.1),
                    color: "#ff9800",
                  }}
                >
                  <Work />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{ ml: 2, color: darkThemeColors.text.primary }}
                >
                  In Progress
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#ff9800", fontWeight: "bold" }}
              >
                {inProgressJobs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: darkThemeColors.background.paper,
              borderRadius: 2,
              boxShadow: `0 4px 20px ${alpha("#000", 0.15)}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha("#f44336", 0.1),
                    color: "#f44336",
                  }}
                >
                  <AttachMoney />
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{ ml: 2, color: darkThemeColors.text.primary }}
                >
                  Avg. Budget
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#f44336", fontWeight: "bold" }}
              >
                ${avgBudget.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: darkThemeColors.text.secondary }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: darkThemeColors.background.paper,
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkThemeColors.divider,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(darkThemeColors.primary.main, 0.5),
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkThemeColors.primary.main,
                },
                color: darkThemeColors.text.primary,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel
              id="status-filter-label"
              sx={{ color: darkThemeColors.text.primary }}
            >
              Status
            </InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              sx={{
                bgcolor: darkThemeColors.background.paper,
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkThemeColors.divider,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkThemeColors.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkThemeColors.primary.main,
                },
                color: darkThemeColors.text.primary,
                "& .MuiSelect-icon": {
                  color: darkThemeColors.text.primary
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: darkThemeColors.background.paper,
                    "& .MuiMenuItem-root": {
                      color: darkThemeColors.text.primary,
                      "&:hover": {
                        backgroundColor: alpha(darkThemeColors.primary.main, 0.1)
                      },
                      "&.Mui-selected": {
                        backgroundColor: alpha(darkThemeColors.primary.main, 0.2),
                        "&:hover": {
                          backgroundColor: alpha(darkThemeColors.primary.main, 0.3)
                        }
                      }
                    }
                  }
                }
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              {JOB_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Jobs Table */}
      <Card
        sx={{
          bgcolor: darkThemeColors.background.paper,
          borderRadius: 2,
          boxShadow: `0 4px 20px ${alpha("#000", 0.15)}`,
          mb: 3,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: darkThemeColors.text.secondary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Title
                </TableCell>
                <TableCell
                  sx={{
                    color: darkThemeColors.text.secondary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: darkThemeColors.text.secondary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Budget
                </TableCell>
                <TableCell
                  sx={{
                    color: darkThemeColors.text.secondary,
                    borderBottom: `1px solid ${darkThemeColors.divider}`,
                  }}
                >
                  Categories
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: darkThemeColors.text.secondary,
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
                      color: darkThemeColors.text.secondary,
                      borderBottom: `1px solid ${darkThemeColors.divider}`,
                    }}
                  >
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : paginatedJobs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{
                      py: 3,
                      color: darkThemeColors.text.secondary,
                      borderBottom: `1px solid ${darkThemeColors.divider}`,
                    }}
                  >
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobs.map((job) => (
                  <TableRow
                    key={job._id}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(darkThemeColors.primary.main, 0.05),
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      {job.title}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      <Chip
                        label={job.status}
                        size="small"
                        sx={{
                          bgcolor: (() => {
                            switch (job.status) {
                              case "open":
                                return alpha("#4caf50", 0.1);
                              case "in-progress":
                                return alpha("#ff9800", 0.1);
                              case "completed":
                                return alpha("#2196f3", 0.1);
                              case "closed":
                                return alpha("#f44336", 0.1);
                              default:
                                return alpha(darkThemeColors.text.secondary, 0.1);
                            }
                          })(),
                          color: (() => {
                            switch (job.status) {
                              case "open":
                                return "#4caf50";
                              case "in-progress":
                                return "#ff9800";
                              case "completed":
                                return "#2196f3";
                              case "closed":
                                return "#f44336";
                              default:
                                return darkThemeColors.text.secondary;
                            }
                          })(),
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: darkThemeColors.text.primary,
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      ${job.budget?.min || 0} - ${job.budget?.max || 0}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      {job.categories?.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          size="small"
                          sx={{
                            mr: 0.5,
                            mb: 0.5,
                            bgcolor: alpha(darkThemeColors.primary.main, 0.1),
                            color: darkThemeColors.primary.main,
                          }}
                        />
                      ))}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        borderBottom: `1px solid ${darkThemeColors.divider}`,
                      }}
                    >
                      <Tooltip title="Edit Job">
                        <IconButton
                          onClick={() => handleEditClick(job)}
                          size="small"
                          sx={{
                            color: darkThemeColors.primary.main,
                            "&:hover": {
                              bgcolor: alpha(darkThemeColors.primary.main, 0.1),
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton
                          onClick={() => handleDeleteClick(job)}
                          size="small"
                          sx={{
                            color: "#f44336",
                            ml: 1,
                            "&:hover": {
                              bgcolor: alpha("#f44336", 0.1),
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 3,
        }}
      >
        <Pagination
          count={pageCount}
          page={page}
          onChange={handlePageChange}
          color="primary"
          sx={{
            "& .MuiPaginationItem-root": {
              color: darkThemeColors.text.secondary,
              "&.Mui-selected": {
                bgcolor: alpha(darkThemeColors.primary.main, 0.1),
                color: darkThemeColors.primary.main,
                "&:hover": {
                  bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                },
              },
              "&:hover": {
                bgcolor: alpha(darkThemeColors.text.primary, 0.05),
              },
            },
          }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkThemeColors.background.paper,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ color: darkThemeColors.text.primary }}>
          {selectedJob ? "Edit Job" : "Create Job"}
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkThemeColors.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(darkThemeColors.primary.main, 0.5),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: darkThemeColors.primary.main,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: darkThemeColors.text.secondary,
                },
                "& .MuiOutlinedInput-input": {
                  color: darkThemeColors.text.primary,
                },
              }}
            />
            {/* Add other form fields with similar styling */}
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: darkThemeColors.background.paper }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              color: darkThemeColors.text.secondary,
              "&:hover": {
                bgcolor: alpha(darkThemeColors.text.primary, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            sx={{
              bgcolor: darkThemeColors.primary.main,
              "&:hover": {
                bgcolor: darkThemeColors.primary.dark,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: darkThemeColors.background.paper,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ color: darkThemeColors.text.primary }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: darkThemeColors.text.primary }}>
            Are you sure you want to delete this job?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: darkThemeColors.background.paper }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: darkThemeColors.text.secondary,
              "&:hover": {
                bgcolor: alpha(darkThemeColors.text.primary, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminJobs;


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
