import * as React from 'react';
import AppBar from '@mui/material/AppBar';

import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';

import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  Button,
  TextField,
  Stepper,
  Step,
  StepButton,
  CardActions,
  CardContent,
  Stack,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';
import { axiosInstance, setAuthToken } from 'src/axiosinstance/axiosinstance';
import { useDispatch, useSelector } from 'react-redux';
import { signOutSuccess } from 'src/redux/user/userSlice';
import { Navigate, useNavigate } from 'react-router-dom';

const pages = ['Vehicle Registration', 'Vehicle Supervise'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

export default function ServicePortalLayout({ children }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, x: '-100%' },
    animate: { opacity: 1, x: '0%' },
    exit: { opacity: 0, x: '100%' },
  };

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const hasVehicleRegistrationPermission =
    currentUser.permissions[0]?.permission_list.includes('vehicle-registration');
  const hasVehicleServicePermission =
    currentUser.permissions[0]?.permission_list.includes('vehicle-supervise');

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
    navigate('/servicePortal/welcome');
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const signOut = async (event) => {
    console.log('sign out');

    setAuthToken(currentUser.token);
    const response = await axiosInstance.post('/api/logout');

    if (response.data.status == true) {
      dispatch(signOutSuccess());
      window.location.reload();
    }
  };

  const handleMenuItem = (itemName) => {
    if (itemName == 'Logout') {
      signOut();
    }
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,

                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              SERVICE PORTAL
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              ></IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {hasVehicleRegistrationPermission && (
                <Button
                  key="Vehicle Registration"
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Vehicle Registration
                </Button>
              )}

              {hasVehicleServicePermission && (
                <Button
                  key="Vehicle Service"
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Vehicle Supervise
                </Button>
              )}

              {hasVehicleServicePermission && (
                <Button
                  key="Body Wash Only"
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  Body Wash Only
                </Button>
              )}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={() => {
                      handleMenuItem(setting);
                    }}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box>{children}</Box>
    </motion.div>
  );
}
