import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAdmin, clearError } from "../../redux/slices/adminSlice";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  alpha,
  Card,
  CardContent,
  Fade,
  Grow,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";

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

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.admin);

  useEffect(() => {
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [token, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required";
    if (
      email.trim() &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      errors.email = "Invalid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(loginAdmin({ email, password }));
  };

  const handleInputChange = (e, setter) => {
    const { value } = e.target;
    setter(value);
    // Clear error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${
          darkThemeColors.background.default
        } 0%, ${alpha(darkThemeColors.background.paper, 0.9)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Grow in={true} timeout={800}>
          <Card
            elevation={8}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: darkThemeColors.background.paper,
              boxShadow: `0 8px 40px ${alpha("#000", 0.25)}`,
            }}
          >
            <Box
              sx={{
                bgcolor: darkThemeColors.background.default,
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: `1px solid ${darkThemeColors.divider}`,
              }}
            >
              <AdminPanelSettings
                sx={{
                  color: darkThemeColors.primary.main,
                  fontSize: 40,
                  mb: 1,
                }}
              />
              <Typography
                component="h1"
                variant="h5"
                align="center"
                sx={{ color: darkThemeColors.text.primary, fontWeight: "bold" }}
              >
                Admin Login
              </Typography>
            </Box>
            <CardContent
              sx={{ p: 4, backgroundColor: darkThemeColors.background.paper }}
            >
              <Fade in={!!error} timeout={300}>
                <Box sx={{ mb: error ? 3 : 0 }}>
                  {error && (
                    <Alert
                      severity="error"
                      onClose={() => dispatch(clearError())}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: alpha("#f44336", 0.15),
                        color: "#f44336",
                        "& .MuiAlert-icon": {
                          color: "#f44336",
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Box>
              </Fade>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
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
                  InputLabelProps={{
                    sx: { color: darkThemeColors.text.secondary },
                  }}
                  sx={{
                    "& .MuiFormHelperText-root": {
                      color: "#f44336",
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword)}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          sx={{ color: darkThemeColors.text.secondary }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    sx: { color: darkThemeColors.text.secondary },
                  }}
                  sx={{
                    "& .MuiFormHelperText-root": {
                      color: "#f44336",
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 1.5,
                    position: "relative",
                    fontWeight: "bold",
                    backgroundColor: darkThemeColors.primary.main,
                    color: darkThemeColors.text.primary,
                    "&:hover": {
                      backgroundColor: darkThemeColors.primary.dark,
                    },
                    boxShadow: `0 4px 10px ${alpha(
                      darkThemeColors.primary.main,
                      0.3
                    )}`,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      sx={{ color: darkThemeColors.text.primary }}
                    />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Container>
    </Box>
  );
};

export default AdminLogin;
