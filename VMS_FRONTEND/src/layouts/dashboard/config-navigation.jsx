import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    permissions: 'super-permission',
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },

  {
    permissions: 'super-permission|user-list|user-create|user-edit|user-delete|password-reset|customer-permission',
    title: 'User Management',
    path: '/user/list',
    icon: <Iconify icon="carbon:id-management" sx={{ width: 1, height: 1 }} />,
  },

  {
    permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
    title: 'Role Management',
    path: '/role/list',
    icon: <Iconify icon="eos-icons:role-binding" sx={{ width: 1, height: 1 }} />,
  },

  {
    permissions:
      'super-permission|brand-list|brand-create|brand-edit|brand-delete|vehicle-registration-list|vehicle-registration-create|vehicle-registration-edit|vehicle-registration-view',
    title: 'Vehicle Management',
    icon: <Iconify icon="tdesign:vehicle" sx={{ width: 1, height: 1 }} />,
    path: '/vehicleBrand/list',
    subpages: [
      {
        permissions: 'super-permission|brand-list|brand-create|brand-edit|brand-delete',
        role: 'Super Admin',
        title: 'Vehicle Brand',
        path: '/vehicleBrand/list',
        icon: <Iconify icon="carbon:vehicle-insights" sx={{ width: 1, height: 1 }} />,
      },
      {
        permissions:
          'super-permission|vehicle-registration-list|vehicle-registration-create|vehicle-registration-edit|vehicle-registration-view',
        role: 'Super Admin',
        title: 'Vehicle Registration',
        path: '/vehicleRegistration/list',
        icon: <Iconify icon="mdi:high-occupancy-vehicle-lane" sx={{ width: 1, height: 1 }} />,
      },
    ],
  },

  {
    permissions: 'super-permission|job-list|job-create|job-edit|job-delete',
    title: 'Job Management',
    path: '/job/list',
    icon: <Iconify icon="tdesign:task" sx={{ width: 1, height: 1 }} />,
  },

  {
    permissions: 'super-permission|product-list|product-create|product-edit|product-delete',
    title: 'Product Management',
    path: '/Product/list',
    icon: <Iconify icon="icon-park-outline:ad-product" sx={{ width: 1, height: 1 }} />,
  },
  {
    permissions: 'super-permission|service-list|service-view',
    title: 'vehicle Service',
    path: '/vehicleService/list',
    icon: <Iconify icon="carbon:vehicle-services" sx={{ width: 1, height: 1 }} />,
  },

  {
    permissions: 'super-permission|customer-list|customer-create|customer-edit|customer-delete',
    title: 'Customer Management',
    path: '/Customer/list',
    icon: <Iconify icon="raphael:customer" sx={{ width: 1, height: 1 }} />,
  },

  {
    permissions: 'super-permission|supplier-list|supplier-create|supplier-edit|supplier-delete',
    title: 'Supplier Management',
    path: '/Supplier/list',
    icon: <Iconify icon="icon-park-solid:user-business" sx={{ width: 1, height: 1 }} />,
  },

  // {

  //   role:"Super Admin",
  //   title: 'Users',
  //   icon: <Iconify icon="mdi:users" sx={{ width: 1, height: 1 }}/>,
  //   subpages: [
  //     {
  //       role:"Super Admin",
  //       title: 'User Managment',
  //       path: '/users/user',
  //       icon: <Iconify icon="carbon:id-management" sx={{ width: 1, height: 1 }}/>,
  //     },
  //   ],
  // },

  {
    permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
    title: 'Vehicle Log Management',
    path: 'VehicleLog/list',
    icon: <Iconify icon="icon-park-solid:edit-two" sx={{ width: 1, height: 1 }} />,
  },
  {
    permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
    title: 'stock Management',
    icon: <Iconify icon="icon-park-solid:slave" sx={{ width: 1, height: 1 }} />,
    subpages: [
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Stock List',
        path: '/stockCategory/list',
        icon: (
          <Iconify icon="solar:checklist-minimalistic-line-duotone" sx={{ width: 1, height: 1 }} />
        ),
      },
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Add Stock',
        path: '/stock/add',
        icon: <Iconify icon="solar:widget-add-linear" sx={{ width: 1, height: 1 }} />,
      },
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Stock Taking',
        path: '/stock/stockTaking',
        icon: <Iconify icon="carbon:inventory-management" sx={{ width: 1, height: 1 }} />,
      },
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Stock Return',
        path: '/stock/stockReturn',
        icon: <Iconify icon="ph:key-return-light" sx={{ width: 1, height: 1 }} />,
      },
    ],
  },
  {
    //purchase stock and inside there should be purchase stock and purchase stock list
    permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
    title: 'Purchasing',
    // path: '/purchaseStock/list',
    icon: <Iconify icon="arcticons:purchased-apps" sx={{ width: 1, height: 1 }} />,
    subpages: [
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Purchase Stock',
        path: '/purchaseStock/add',
        icon: <Iconify icon="bxs:purchase-tag-alt" sx={{ width: 1, height: 1 }} />,
      },
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Purchase Stock List',
        path: '/purchaseStock/list',
        icon: <Iconify icon="fluent-mdl2:product-list" sx={{ width: 1, height: 1 }} />,
      },
    ],
  },
  {
    permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
    title: 'Sales Management',
    // path: '/sales/productSales',
    icon: <Iconify icon="carbon:sales-ops" sx={{ width: 1, height: 1 }} />,
    //add two subpages called product sales and job sales
    subpages: [
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Product Sales',
        path: '/sales/productSales',
        icon: <Iconify icon="carbon:product" sx={{ width: 1, height: 1 }} />,
      },
      {
        permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
        role: 'Super Admin',
        title: 'Job Sales',
        path: '/sales/jobSales',
        icon: <Iconify icon="carbon:task" sx={{ width: 1, height: 1 }} />,
      },
    ],
  },
  // {
  //   permissions: 'super-permission|role-list|role-create|role-edit|role-delete',
  //   title: 'Supplier Payment',
  //   path: '/supplierPayment/add',
  //   icon: <Iconify icon="material-symbols:payments-outline" sx={{ width: 1, height: 1 }} />, 
  // }
];

export default navConfig;
