import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Typography,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  alpha,
  Avatar,
  CircularProgress,
  Stack,
  Chip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  People,
  Work,
  ShowChart,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline,
} from "@mui/icons-material";
import { fetchUsers } from "../../redux/slices/adminUsersSlice";
import { fetchJobs } from "../../redux/slices/adminJobsSlice";

// Custom dark theme colors from tailwind.config.js
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

// Chart colors
const COLORS = [
  "#58c4dc", // cyan-blue
  "#7ad4e6", // lighter cyan-blue
  "#FFBB28",
  "#FF8042",
  "#FF4242",
  "#8884d8",
  "#82ca9d",
];

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector(
    (state) => state.adminUsers
  );
  const { jobs, loading: jobsLoading } = useSelector(
    (state) => state.adminJobs
  );
  const [userStats, setUserStats] = useState({
    roleDistribution: [],
    monthlyGrowth: [],
    activeUsers: 0,
    totalUsers: 0,
  });
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    monthlyJobGrowth: [],
    jobStatusDistribution: [],
  });

  const loading = usersLoading || jobsLoading;

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (users && users.length > 0) {
      // Calculate role distribution
      const roleStats = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // Calculate monthly growth
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          name: date.toLocaleString("default", { month: "short" }),
          users: users.filter((user) => {
            const userDate = new Date(user.createdAt);
            return (
              userDate.getMonth() === date.getMonth() &&
              userDate.getFullYear() === date.getFullYear()
            );
          }).length,
        };
      }).reverse();

      setUserStats({
        roleDistribution: Object.entries(roleStats).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
        monthlyGrowth: monthlyData,
        activeUsers: users.filter((user) => user.status === "active").length,
        totalUsers: users.length,
      });
    }
  }, [users]);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      // Calculate job status distribution
      const statusStats = jobs.reduce((acc, job) => {
        const status =
          job.status.charAt(0).toUpperCase() +
          job.status.slice(1).replace("-", " ");
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Calculate monthly job growth
      const monthlyJobData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          name: date.toLocaleString("default", { month: "short" }),
          jobs: jobs.filter((job) => {
            const jobDate = new Date(job.createdAt);
            return (
              jobDate.getMonth() === date.getMonth() &&
              jobDate.getFullYear() === date.getFullYear()
            );
          }).length,
        };
      }).reverse();

      setJobStats({
        totalJobs: jobs.length,
        activeJobs: jobs.filter((job) => job.status === "open").length,
        completedJobs: jobs.filter((job) => job.status === "completed").length,
        monthlyJobGrowth: monthlyJobData,
        jobStatusDistribution: Object.entries(statusStats).map(
          ([name, value]) => ({
            name,
            value,
          })
        ),
      });
    }
  }, [jobs]);

  // Calculate average job budget
  const avgBudget =
    jobs && jobs.length > 0
      ? jobs.reduce(
          (sum, job) =>
            sum + ((job.budget?.min || 0) + (job.budget?.max || 0)) / 2,
          0
        ) / jobs.length
      : 0;

  return (
    <Container
      maxWidth="xl"
      sx={{
        backgroundColor: darkThemeColors.background.default,
        color: darkThemeColors.text.primary,
        pt: 3,
        pb: 6,
        minHeight: "100%",
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
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color={darkThemeColors.text.secondary}>
            Monitor platform performance and user activity
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: `0 4px 20px ${alpha(
                  darkThemeColors.primary.main,
                  0.15
                )}`,
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
                  <People />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    color={darkThemeColors.text.secondary}
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
                      userStats.totalUsers
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider
                sx={{ my: 2, backgroundColor: darkThemeColors.divider }}
              />
              <Stack direction="row" spacing={1} justifyContent="space-between">
                <Chip
                  label={`${userStats.activeUsers} Active`}
                  size="small"
                  sx={{
                    bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                    color: darkThemeColors.primary.light,
                    fontWeight: "medium",
                  }}
                />
                <Chip
                  label={`${
                    userStats.totalUsers - userStats.activeUsers
                  } Inactive`}
                  size="small"
                  sx={{
                    bgcolor: alpha("#FFBB28", 0.2),
                    color: "#FFBB28",
                    fontWeight: "medium",
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: `0 4px 20px ${alpha(
                  darkThemeColors.primary.main,
                  0.15
                )}`,
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha("#82ca9d", 0.2),
                    color: "#82ca9d",
                    width: 48,
                    height: 48,
                  }}
                >
                  <Work />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    color={darkThemeColors.text.secondary}
                  >
                    Total Jobs
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
                      jobStats.totalJobs
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider
                sx={{ my: 2, backgroundColor: darkThemeColors.divider }}
              />
              <Stack direction="row" spacing={1} justifyContent="space-between">
                <Chip
                  label={`${jobStats.activeJobs} Open`}
                  size="small"
                  sx={{
                    bgcolor: alpha("#82ca9d", 0.2),
                    color: "#82ca9d",
                    fontWeight: "medium",
                  }}
                />
                <Chip
                  label={`${jobStats.completedJobs} Completed`}
                  size="small"
                  sx={{
                    bgcolor: alpha("#8884d8", 0.2),
                    color: "#8884d8",
                    fontWeight: "medium",
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: `0 4px 20px ${alpha(
                  darkThemeColors.primary.main,
                  0.15
                )}`,
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha("#FFBB28", 0.2),
                    color: "#FFBB28",
                    width: 48,
                    height: 48,
                  }}
                >
                  <ShowChart />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    color={darkThemeColors.text.secondary}
                  >
                    Avg. Budget
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
                      `$${avgBudget.toFixed(0)}`
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider
                sx={{ my: 2, backgroundColor: darkThemeColors.divider }}
              />
              <Box sx={{ height: 40 }}>
                {!loading && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={jobStats.monthlyJobGrowth}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <Area
                        type="monotone"
                        dataKey="jobs"
                        stroke="#FFBB28"
                        fill={alpha("#FFBB28", 0.2)}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                boxShadow: `0 4px 20px ${alpha(
                  darkThemeColors.primary.main,
                  0.15
                )}`,
                transform: "translateY(-2px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha("#FF8042", 0.2),
                    color: "#FF8042",
                    width: 48,
                    height: 48,
                  }}
                >
                  <Timeline />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography
                    variant="body2"
                    color={darkThemeColors.text.secondary}
                  >
                    User Growth
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
                    ) : userStats.monthlyGrowth.length > 0 ? (
                      `+${
                        userStats.monthlyGrowth[
                          userStats.monthlyGrowth.length - 1
                        ].users
                      }`
                    ) : (
                      "0"
                    )}
                  </Typography>
                </Box>
              </Box>
              <Divider
                sx={{ my: 2, backgroundColor: darkThemeColors.divider }}
              />
              <Box sx={{ height: 40 }}>
                {!loading && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={userStats.monthlyGrowth}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#FF8042"
                        fill={alpha("#FF8042", 0.2)}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              height: "100%",
            }}
          >
            <CardHeader
              title="Monthly User Growth"
              titleTypographyProps={{
                variant: "h6",
                color: darkThemeColors.text.primary,
              }}
              avatar={
                <Avatar
                  sx={{
                    bgcolor: alpha(darkThemeColors.primary.main, 0.2),
                    color: darkThemeColors.primary.main,
                  }}
                >
                  <BarChartIcon />
                </Avatar>
              }
            />
            <Divider sx={{ backgroundColor: darkThemeColors.divider }} />
            <CardContent>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300,
                  }}
                >
                  <CircularProgress
                    sx={{ color: darkThemeColors.primary.main }}
                  />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={userStats.monthlyGrowth}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={alpha(darkThemeColors.text.secondary, 0.2)}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={darkThemeColors.text.secondary}
                    />
                    <YAxis stroke={darkThemeColors.text.secondary} />
                    <RechartsTooltip
                      formatter={(value) => [`${value} Users`, "New Users"]}
                      contentStyle={{
                        backgroundColor: darkThemeColors.background.lighter,
                        border: `1px solid ${darkThemeColors.divider}`,
                        color: darkThemeColors.text.primary,
                      }}
                    />
                    <Bar
                      dataKey="users"
                      name="New Users"
                      fill={darkThemeColors.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Job Growth Chart */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              height: "100%",
            }}
          >
            <CardHeader
              title="Monthly Job Growth"
              titleTypographyProps={{
                variant: "h6",
                color: darkThemeColors.text.primary,
              }}
              avatar={
                <Avatar
                  sx={{
                    bgcolor: alpha("#82ca9d", 0.2),
                    color: "#82ca9d",
                  }}
                >
                  <BarChartIcon />
                </Avatar>
              }
            />
            <Divider sx={{ backgroundColor: darkThemeColors.divider }} />
            <CardContent>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300,
                  }}
                >
                  <CircularProgress
                    sx={{ color: darkThemeColors.primary.main }}
                  />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={jobStats.monthlyJobGrowth}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={alpha(darkThemeColors.text.secondary, 0.2)}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={darkThemeColors.text.secondary}
                    />
                    <YAxis stroke={darkThemeColors.text.secondary} />
                    <RechartsTooltip
                      formatter={(value) => [`${value} Jobs`, "New Jobs"]}
                      contentStyle={{
                        backgroundColor: darkThemeColors.background.lighter,
                        border: `1px solid ${darkThemeColors.divider}`,
                        color: darkThemeColors.text.primary,
                      }}
                    />
                    <Bar
                      dataKey="jobs"
                      name="New Jobs"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User Role Distribution */}
        <Grid item xs={12} md={6} sx={{ mt: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              height: "100%",
            }}
          >
            <CardHeader
              title="User Role Distribution"
              titleTypographyProps={{
                variant: "h6",
                color: darkThemeColors.text.primary,
              }}
              avatar={
                <Avatar
                  sx={{
                    bgcolor: alpha("#8884d8", 0.2),
                    color: "#8884d8",
                  }}
                >
                  <PieChartIcon />
                </Avatar>
              }
            />
            <Divider sx={{ backgroundColor: darkThemeColors.divider }} />
            <CardContent>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300,
                  }}
                >
                  <CircularProgress
                    sx={{ color: darkThemeColors.primary.main }}
                  />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userStats.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill={darkThemeColors.primary.main}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userStats.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: darkThemeColors.text.primary }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Job Status Distribution */}
        <Grid item xs={12} md={6} sx={{ mt: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              backgroundColor: darkThemeColors.background.card,
              border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
              height: "100%",
            }}
          >
            <CardHeader
              title="Job Status Distribution"
              titleTypographyProps={{
                variant: "h6",
                color: darkThemeColors.text.primary,
              }}
              avatar={
                <Avatar
                  sx={{
                    bgcolor: alpha("#FF8042", 0.2),
                    color: "#FF8042",
                  }}
                >
                  <PieChartIcon />
                </Avatar>
              }
            />
            <Divider sx={{ backgroundColor: darkThemeColors.divider }} />
            <CardContent>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300,
                  }}
                >
                  <CircularProgress
                    sx={{ color: darkThemeColors.primary.main }}
                  />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobStats.jobStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill={darkThemeColors.primary.main}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {jobStats.jobStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: darkThemeColors.text.primary }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminAnalytics;

// Custom tooltip component for pie charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: darkThemeColors.background.paper,
          p: 2,
          border: `1px solid ${alpha(darkThemeColors.primary.main, 0.2)}`,
          borderRadius: 1,
          boxShadow: `0 4px 20px ${alpha('#000', 0.2)}`,
        }}
      >
        <Typography sx={{ color: darkThemeColors.text.primary, fontWeight: 'bold', mb: 1 }}>
          {payload[0].name}
        </Typography>
        <Typography sx={{ color: darkThemeColors.primary.main }}>
          Count: {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};
