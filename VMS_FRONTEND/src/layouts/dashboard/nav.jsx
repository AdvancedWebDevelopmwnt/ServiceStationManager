import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';

import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { account } from 'src/_mock/account';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import navConfig from './config-navigation';
import Iconify from 'src/components/iconify';
import { useSelector } from 'react-redux';


// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const { currentUser } = useSelector((state) => state.user);

  const upLg = useResponsive('up', 'lg');

 

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Avatar src={account.photoURL} alt="photoURL" />

      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2" sx={{color:'#f5b027'}}>{currentUser.user.userRole}</Typography>

        <Typography variant="body2" sx={{ color: '#e0ded7' }}>
          {currentUser.userRole}
        </Typography>
      </Box>
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
    {navConfig.map((item) => {
      const permissionsArray = item.permissions.split('|').map(permission => permission);
      const currentUserPermissions = currentUser.permissions[0].permission_list.map(permission => permission);

      // Check if any permission in currentUserPermissions is included in permissionsArray
      const hasPermission = currentUserPermissions.some(permission =>  
           permissionsArray.includes(permission)
      );

      return hasPermission && <NavItem key={item.title} item={item} />;
    })}
  </Stack>
  );





  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#2C3A47',
        '& .simplebar-content': {
          flexGrow: 1,
        },
      }}
    >
      <Logo sx={{ mt: 3, ml: 4 }} />
  
      {renderAccount}
  
      {renderMenu}
  
      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );
  

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const pathname = usePathname();
 
  const [isCollapsed, setCollapsed] = useState(false);
  const pathParts = item.path == undefined ? '' : item.path.split('/')[1];
  const active = pathname.startsWith('/'+pathParts) || (item.subpages && item.subpages.some(subpage => pathname.startsWith(subpage.path)));

  const handleToggleCollapse = () => {
    setCollapsed((prevCollapsed) => !prevCollapsed);
  };

  const renderSubpages = () => {
    if (item.subpages) {
      return (
        <Stack spacing={0} sx={{ pl: 2 }}>
          {item.subpages.map((subpage) => (
            <NavItem key={subpage.title} item={subpage} />
          ))}
        </Stack>
      );
    }
    return null;
  };

  return (
    <>
      <ListItemButton
        component={RouterLink}
        href={item.path}
        onClick={handleToggleCollapse}
        sx={{
          minHeight: 44,
          borderRadius: 0.75,
          typography: 'body2',
          color: '#8395a7',
          textTransform: 'capitalize',
          fontWeight: 'fontWeightMedium',
          ...(active && {
            color: '#2e86de',
            fontWeight: 'fontWeightSemiBold',
            bgcolor: (theme) => alpha(theme.palette.primary.blue, 0.08),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
            },
          }),
        }}
      >
        <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
          {item.icon}
        </Box>

        <Box component="span">{item.title}</Box>

        {item.subpages && (
          <Box
            component="span"
            sx={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '18px' }}
          >
            {isCollapsed ? <Iconify icon="ooui:collapse" sx={{ width: 0.7, height: 0.7 }}/> : <Iconify icon="ooui:expand" sx={{ width: 0.7, height: 0.7 }}/>}
          </Box>
        )}
      </ListItemButton>

      {isCollapsed && renderSubpages()}
    </>
  );
}


NavItem.propTypes = {
  item: PropTypes.object,
};
