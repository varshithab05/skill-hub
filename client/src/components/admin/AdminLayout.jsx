import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import {
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  Fade,
  Collapse,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  ExitToApp as LogoutIcon,
  Analytics as AnalyticsIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { logout } from "../../redux/slices/adminSlice";

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

const drawerWidth = 260;

const AdminLayout = () => {
  const isMobile = useMediaQuery(`(max-width: 600px)`);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Close mobile drawer when route changes
    if (mobileOpen && isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Jobs", icon: <WorkIcon />, path: "/admin/jobs" },
    { text: "Analytics", icon: <AnalyticsIcon />, path: "/admin/analytics" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: darkThemeColors.background.paper,
        width: "100%",
      }}
    >
      <Box
        sx={{
          backgroundColor: darkThemeColors.background.default,
          color: darkThemeColors.text.primary,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: drawerCollapsed ? "center" : "space-between",
        }}
      >
        <Fade in={!drawerCollapsed}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: "bold", color: darkThemeColors.primary.main }}
          >
            SkillHub Admin
          </Typography>
        </Fade>
        {!isMobile && (
          <IconButton
            onClick={handleDrawerCollapse}
            sx={{ color: darkThemeColors.text.primary }}
            size="small"
          >
            <ChevronLeftIcon
              sx={{
                transform: drawerCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
              }}
            />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ backgroundColor: darkThemeColors.divider }} />
      <Box sx={{ flexGrow: 1, overflow: "hidden", py: 2 }}>
        <List sx={{ width: "100%", padding: 0 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                py: 1.5,
                px: drawerCollapsed ? 1.5 : 3,
                mb: 1,
                mx: 1,
                borderRadius: "8px",
                backgroundColor: isActive(item.path)
                  ? alpha(darkThemeColors.primary.main, 0.15)
                  : "transparent",
                "&:hover": {
                  backgroundColor: isActive(item.path)
                    ? alpha(darkThemeColors.primary.main, 0.2)
                    : alpha(darkThemeColors.text.primary, 0.08),
                },
                transition: "all 0.2s ease-in-out",
                display: "flex",
                justifyContent: drawerCollapsed ? "center" : "flex-start",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <Tooltip
                title={drawerCollapsed ? item.text : ""}
                placement="right"
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path)
                      ? darkThemeColors.primary.main
                      : darkThemeColors.text.primary,
                    minWidth: drawerCollapsed ? 0 : 40,
                    mr: drawerCollapsed ? 0 : 2,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              <Collapse orientation="horizontal" in={!drawerCollapsed}>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: darkThemeColors.text.primary,
                    opacity: isActive(item.path) ? 1 : 0.85,
                    m: 0,
                    "& .MuiTypography-root": {
                      color: isActive(item.path)
                        ? darkThemeColors.primary.main
                        : darkThemeColors.text.primary,
                    },
                  }}
                />
              </Collapse>
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider sx={{ backgroundColor: darkThemeColors.divider }} />
      <List sx={{ py: 2 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: drawerCollapsed ? 1.5 : 3,
            mx: 1,
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: alpha(darkThemeColors.text.primary, 0.08),
            },
            transition: "all 0.2s ease-in-out",
            display: "flex",
            justifyContent: drawerCollapsed ? "center" : "flex-start",
          }}
        >
          <Tooltip title={drawerCollapsed ? "Logout" : ""} placement="right">
            <ListItemIcon
              sx={{
                color: darkThemeColors.text.primary,
                minWidth: drawerCollapsed ? 0 : 40,
                mr: drawerCollapsed ? 0 : 2,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
          </Tooltip>
          <Collapse orientation="horizontal" in={!drawerCollapsed}>
            <ListItemText
              primary="Logout"
              sx={{ color: darkThemeColors.text.primary, opacity: 0.85, m: 0 }}
            />
          </Collapse>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: darkThemeColors.background.default,
      }}
    >
      <CssBaseline />
      <Box
        component="nav"
        sx={{
          width: { sm: drawerCollapsed ? 80 : drawerWidth },
          flexShrink: { sm: 0 },
          transition: "width 0.3s",
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: darkThemeColors.background.paper,
              borderRight: `1px solid ${darkThemeColors.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerCollapsed ? 80 : drawerWidth,
              boxSizing: "border-box",
              backgroundColor: darkThemeColors.background.paper,
              borderRight: `1px solid ${darkThemeColors.divider}`,
              boxShadow: `4px 0 6px ${alpha("#000", 0.15)}`,
              transition: "width 0.3s",
              overflowX: "hidden",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            sm: `calc(100% - ${drawerCollapsed ? "80px" : drawerWidth}px)`,
          },
          backgroundColor: darkThemeColors.background.default,
          minHeight: "100vh",
          transition: "width 0.3s, margin 0.3s",
          color: darkThemeColors.text.primary,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
