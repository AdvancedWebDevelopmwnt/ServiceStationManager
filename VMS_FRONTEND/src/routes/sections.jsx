import { lazy, Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate, useRoutes, useNavigate } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import UserList from 'src/sections/UserManagement/UserList';
import UserCreate from 'src/sections/UserManagement/UserCreate';
import UserEdit from 'src/sections/UserManagement/UserEdit';
import { LoginView } from 'src/sections/login';
import RestrictAccess from 'src/sections/error/restirctAccess';
import RoleList from 'src/sections/RoleManagement/RoleList';
import RoleCreate from 'src/sections/RoleManagement/RoleCreate';
import RoleEdit from 'src/sections/RoleManagement/RoleEdit';

import JobList from 'src/sections/JobManagement/JobList';
import JobCreate from 'src/sections/JobManagement/JobCreate';
import JobEdit from 'src/sections/JobManagement/JobEdit';
import Step1 from 'src/sections/servicePortal/step1';
import SelectionPage from 'src/sections/servicePortal/SelectionPage';
import ServicePortalLayout from 'src/layouts/servicePortal';
import { motion, AnimatePresence } from 'framer-motion';
import Step2 from 'src/sections/servicePortal/step2';
import Step3 from 'src/sections/servicePortal/step3';
import Step4 from 'src/sections/servicePortal/step4';
import SuperviseSelection from 'src/sections/servicePortal/SuperviseSelection';

import BodyWashStep1 from 'src/sections/servicePortal/vehicleSupervise/VehicleBodyWashOnly/step1';
// import BodyWashStep2 from 'src/sections/servicePortal/vehicleSupervise/VehicleBodyWashOnly/step2';
// import BodyWashStep3 from 'src/sections/servicePortal/vehicleSupervise/VehicleBodyWashOnly/step3';
// import BodyWashStep4 from 'src/sections/servicePortal/vehicleSupervise/VehicleBodyWashOnly/step4';

import ProductList from 'src/sections/ProductManagement/ProductList';
import ProductCreate from 'src/sections/ProductManagement/ProductCreate';
import ProductEdit from 'src/sections/ProductManagement/ProductEdit';

import JobSelection from 'src/sections/servicePortal/jobSelection';

import SupplierList from 'src/sections/SupplierManagement/SupplierList';
import SupplierCreate from 'src/sections/SupplierManagement/SupplierCreate';
import SupplierEdit from 'src/sections/SupplierManagement/SupplierEdit';

import VehicleList from 'src/sections/VehicleService/VehicleList';
import ViewVehicleRecord from 'src/sections/VehicleService/ViewVehicleRecord';

import ProductSales from 'src/sections/SalesManagement/ProductSales';
import JobSales from 'src/sections/SalesManagement/JobSale';

import SearchVehicleNumber from 'src/sections/servicePortal/vehicleSupervise/JobManagement/SearchVehicleNumber';
import VehicleInfoPage from 'src/sections/servicePortal/vehicleSupervise/JobManagement/VehicleInfoPage';
import OngoingServicePage from 'src/sections/servicePortal/vehicleSupervise/OnGoing/OngoingServicePage';
import CompletedServicePage from 'src/sections/servicePortal/vehicleSupervise/Completed/CompletedServicePage';


import VehicleLogManagement from 'src/sections/servicePortal/vehicleSupervise/VehicleLogManagement';

import BrandList from 'src/sections/VehicleManagement/VehicleBrand/BrandList';
import BrandCreate from 'src/sections/VehicleManagement/VehicleBrand/BrandCreate';
import BrandEdit from 'src/sections/VehicleManagement/VehicleBrand/BrandEdit';
import Login from 'src/sections/login/Login';

import CustomerList from 'src/sections/CustomerManagement/CustomerList';
import CustomerCreate from 'src/sections/CustomerManagement/CustomerCreate';
import CustomerEdit from 'src/sections/CustomerManagement/CustomerEdit';

import VehicleLogList from 'src/sections/VehicleLogManagement/VehicleLogList';
import ViewVehicleLogRecord from 'src/sections/VehicleLogManagement/ViewVehicleLogRecord';

import VehicleRegistrationCreate from 'src/sections/VehicleManagement/VehicleRegistration/VehicleRegistrationCreate';
import VehicleRegistrationList from 'src/sections/VehicleManagement/VehicleRegistration/VehicleRegistrationList';
import VehicleRegistrationEdit from 'src/sections/VehicleManagement/VehicleRegistration/VehicleRegistrationEdit';

import StockCreate from 'src/sections/StockManagement/StockCreate';
import StockList from 'src/sections/StockManagement/StockList';
import StockTaking from 'src/sections/StockManagement/StockTaking';
import StockReturn from 'src/sections/StockManagement/StockReturn';

import CreateAppointment from 'src/sections/Appointments/AppointmentCreate';
import AppointmentList from 'src/sections/Appointments/AppointmentList';
import AppointmentEdit from 'src/sections/Appointments/AppointmentEdit';

import Home from 'src/sections/Home/home';
import PurchasingAdd from 'src/sections/Purchasing/PurchasingAdd';

import SupplierPayment from 'src/sections/SupplierPaymentManagement/SupplierPayment';
import CustomerRegister from 'src/sections/CustomerRegistration/CustomerRegister';


export const IndexPage = lazy(() => import('src/pages/app'));

export const Page404 = lazy(() => import('src/pages/page-not-found'));

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an asynchronous authentication check
    const delay = setTimeout(() => {
      setLoading(false);

      if (!currentUser) {
        // Redirect to the login page if not authenticated
        navigate('/');
      }
    }, 1); // Adjust the delay as needed

    return () => clearTimeout(delay);
  }, [currentUser, navigate]);

  return loading ? null : <>{children}</>;
};

const hasAccess = (permissions) => {
  const { currentUser } = useSelector((state) => state.user);
  if (currentUser) {
    const permissionsArray = permissions.split('|').map((permission) => permission);
    const currentUserPermissions = currentUser.permissions[0].permission_list.map(
      (permission) => permission
    );

    // Check if any permission in currentUserPermissions is included in permissionsArray
    const hasPermission = currentUserPermissions.some((permission) =>
      permissionsArray.includes(permission)
    );
    return hasPermission;
  }
};

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Home />,
      
    },
    {
      path: '/login',
      element: <Login />,
    },

    {
      path: '/CustomerRegistration',
      element: <CustomerRegister />,
    },
    {
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),
      children: [
        { path: 'dashboard', element: <IndexPage /> },

        {
          path: 'user/list',
          element: hasAccess('super-permission|user-list',) ? (
            <UserList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'user/create',
          element: hasAccess('super-permission|user-create') ? (
            <UserCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'user/edit/:id',
          element: hasAccess('super-permission|user-edit') ? (
            <UserEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'role/list',
          element: hasAccess('super-permission|role-list') ? (
            <RoleList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'role/create',
          element: hasAccess('super-permission|role-create') ? (
            <RoleCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'role/edit/:id',
          element: hasAccess('super-permission|role-edit') ? (
            <RoleEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'vehicleBrand/list',
          element: hasAccess('super-permission|brand-list') ? (
            <BrandList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'vehicleBrand/create',
          element: hasAccess('super-permission|brand-create') ? (
            <BrandCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'vehicleBrand/edit/:id',
          element: hasAccess('super-permission|brand-edit') ? (
            <BrandEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'vehicleRegistration/create',
          element: hasAccess('super-permission|vehicle-registration-create') ? (
            <VehicleRegistrationCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'vehicleRegistration/list',
          element: hasAccess('super-permission|vehicle-registration-list') ? (
            <VehicleRegistrationList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'vehicleRegistration/edit/:id',
          element: hasAccess('super-permission|vehicle-registration-edit') ? (
            <VehicleRegistrationEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'job/list',
          element: hasAccess('super-permission|job-list') ? (
            <JobList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'job/create',
          element: hasAccess('super-permission|job-create') ? (
            <JobCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'job/edit/:id',
          element: hasAccess('super-permission|job-edit') ? (
            <JobEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'Product/list',
          element: hasAccess('super-permission|product-list') ? (
            <ProductList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'Product/create',
          element: hasAccess('super-permission|product-create') ? (
            <ProductCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'Product/edit/:id',
          element: hasAccess('super-permission|product-edit') ? (
            <ProductEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'vehicleService/list',
          element: hasAccess('super-permission|role-edit') ? (
            <VehicleList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'vehicleService/view/:id',
          element: hasAccess('super-permission|role-edit') ? (
            <ViewVehicleRecord />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'Customer/list',
          element: hasAccess('super-permission|customer-list') ? (
            <CustomerList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'Customer/create',
          element: hasAccess('super-permission|customer-create') ? (
            <CustomerCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'Customer/edit/:id',
          element: hasAccess('super-permission|customer-edit') ? (
            <CustomerEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'Supplier/list',
          element: hasAccess('super-permission|supplier-list') ? (
            <SupplierList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'Supplier/create',
          element: hasAccess('super-permission|supplier-create') ? (
            <SupplierCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'Supplier/edit/:id',
          element: hasAccess('super-permission|supplier-edit') ? (
            <SupplierEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'VehicleLog/list',
          element: hasAccess('super-permission|vehicle-log-list') ? (
            <VehicleLogList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'VehicleLog/view/:id',
          element: hasAccess('super-permission|vehicle-log-view') ? (
            <ViewVehicleLogRecord />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'stock/add',
          element: hasAccess('super-permission|stock-list') ? (
            <StockCreate />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: '/stockCategory/list',
          element: hasAccess('super-permission|stock-list') ? (
            <StockList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: '/stock/stockTaking',
          element: hasAccess('super-permission|stock-list') ? (
            <StockTaking />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: '/stock/stockReturn',
          element: hasAccess('super-permission|stock-list') ? (
            <StockReturn />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: '/purchaseStock/add',
          element: hasAccess('super-permission|stock-list') ? (
            <PurchasingAdd />
          ) : (
            <Navigate to="/403" replace />
          ),

        },

        {
          path: '/supplierPayment/add',
          element: hasAccess('super-permission|supplier-payment') ? (
            <SupplierPayment />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          //product sale
          path: '/sales/productSales',
          element: hasAccess('super-permission|supplier-payment') ? (
            <ProductSales />
          ) : (
            <Navigate to="/403" replace />
          ),

        },
        {
          //job sale
          path: '/sales/jobSales',
          element: hasAccess('super-permission|supplier-payment') ? (
            <JobSales />
          ) : (
            <Navigate to="/403" replace />
          ),
        },

        {
          path: 'appointments/list',
          element: hasAccess('customer-permission|appointment-list') ? (
            <AppointmentList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'appointments/create',
          element: hasAccess('customer-permission|appointment-create') ? (
            <CreateAppointment />
          ) : (
            <Navigate to="/403" replace />
          ),
         },
        {
          path: 'appointments/edit/:id',
          element: hasAccess('customer-permission|appointment-edit') ? (
            <AppointmentEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },


        {
          path: 'appointments/list',
          element: hasAccess('super-permission|appointment-list') ? (
            <AppointmentList />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        {
          path: 'appointments/create',
          element: hasAccess('super-permission|appointment-create') ? (
            <CreateAppointment />
          ) : (
            <Navigate to="/403" replace />
          ),
         },
        {
          path: 'appointments/edit/:id',
          element: hasAccess('super-permission|appointment-edit') ? (
            <AppointmentEdit />
          ) : (
            <Navigate to="/403" replace />
          ),
        },
        
  

        
      ],
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '403',
      element: <RestrictAccess />,
    },

    {
      element: (
        <ProtectedRoute>
          <Suspense>
            <Outlet />
          </Suspense>
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'servicePortal/welcome',
          element: (
            <ServicePortalLayout>
              <SelectionPage />
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/superviseSelection',
          element: (
            <ServicePortalLayout>
              <SuperviseSelection />
            </ServicePortalLayout>
          ),

        },
        {
          path: 'servicePortal/step1',
          element: (
            <ServicePortalLayout>
              {' '}
              <Step1 />{' '}
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/step2',
          element: (
            <ServicePortalLayout>
              {' '}
              <Step2 />{' '}
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/step3',
          element: (
            <ServicePortalLayout>
              {' '}
              <Step3 />{' '}
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/step4',
          element: (
            <ServicePortalLayout>
              {' '}
              <Step4 />{' '}
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/jobSelection',
          element: (
            <ServicePortalLayout>
              {' '}
              <JobSelection />{' '}
            </ServicePortalLayout>
          ),
        },

        //vehicle servicer routes
        {
          path: 'servicePortal/vehicleSupervise/searchvehicleNumber',
          element: (
            <ServicePortalLayout>
              {' '}
              <SearchVehicleNumber />{' '}
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/vehicleSupervise/vehicleInfo',
          element: (
            <ServicePortalLayout>
              <VehicleInfoPage />
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/vehicleSupervise/ongoingServices',
          element: (
            <ServicePortalLayout>
              <OngoingServicePage />
            </ServicePortalLayout>
          ),
        },
        {
          path: 'servicePortal/vehicleSupervise/completedServices',
          element: (
            <ServicePortalLayout>
              <CompletedServicePage />
            </ServicePortalLayout>
          ),
        },

        // Other children...

        //vehicle log management
        {
          path: 'servicePortal/vehicleSupervise/VehicleLogManagement',
          element: (
            <ServicePortalLayout>
              <VehicleLogManagement />
            </ServicePortalLayout>
          ),
        },

        //vehicle body wash only
        {
          path: 'servicePortal/bodyWashOnly/step1',
          element: (
            <ServicePortalLayout>
              <BodyWashStep1 />
            </ServicePortalLayout>
          ),
        },
        // {
        //   path: 'servicePortal/bodyWashOnly/step2',
        //   element: (
        //     <ServicePortalLayout>
        //       <BodyWashStep2 />
        //     </ServicePortalLayout>
        //   ),
        // },
        // {
        //   path: 'servicePortal/bodyWashOnly/step3',
        //   element: (
        //     <ServicePortalLayout>
        //       <BodyWashStep3 />
        //     </ServicePortalLayout>
        //   ),
        // },
        // {
        //   path: 'servicePortal/bodyWashOnly/step4',
        //   element: (
        //     <ServicePortalLayout>
        //       <BodyWashStep4 />
        //     </ServicePortalLayout>
        //   ),
        // },
        

      ],
    },

    // {
    //   path: '*',
    //   element: <Navigate to="/403" replace />,
    // },
  ]);

  return routes;
}
