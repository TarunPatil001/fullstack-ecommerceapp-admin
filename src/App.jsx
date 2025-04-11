import { createContext, forwardRef, useState } from 'react';
import './App.css'
import './responsive.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Dashboard from './Pages/Dashboard/index';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import Products from './Pages/Products';
import AddProduct from './Pages/Products/addProduct';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { IoCloseOutline } from "react-icons/io5";
import Slide from '@mui/material/Slide';
import Users from './Pages/Users';
import CategoryList from './Pages/Category';
import AddCategory from './Pages/Category/addCategory';
import SubCategoryList from './Pages/Category/subCategoryList';
import AddSubCategory from './Pages/Category/addSubCategory';
import HomeSliderBanners from './Pages/HomeSliderBanners';
import AddHomeSlide from './Pages/HomeSliderBanners/addHomeSlide';
import Orders from './Pages/Orders';
import ForgotPassword from './Pages/ForgotPassword';
import VerifyAccount from './Pages/VerifyAccount';
import ChangePassword from './Pages/ChangePassword';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { fetchDataFromApi } from './utils/api';
import Profile from './Pages/Profile';
import AddAddress from './Pages/Address/addAddress';
import { useReducer } from 'react';
import ProductDetails from './Pages/Products/productDetails';
import AddRAMS from './Pages/Products/addRAMS';
import AddWeight from './Pages/Products/addWeight';
import AddSize from './Pages/Products/addSize';
import AddBannersV1 from './Pages/Banners/addBannersV1';
import BannersV1List from './Pages/Banners';
import BlogList from './Pages/Blog';
import AddBlog from './Pages/Blog/addBlog';


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MyContext = createContext();

function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  // const apiUrl = import.meta.env.VITE_API_URL;
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState([]);
  const [addressIdNo, setAddressIdNo] = useState(null);
  const [catData, setCatData] = useState([]);
  const [categoryIdNo, setCategoryIdNo] = useState(null);
  const [bannerV1Data, setBannerV1Data] = useState([]);
  const [bannerIdNo, setBannerIdNo] = useState(null);
  const [homeSlideData, setHomeSlideData] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [blogIdNo, setBlogIdNo] = useState([]);
  const [productIdNo, setProductIdNo] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarWidth, setSidebarWidth] = useState(18);


  const [isReducer, forceUpdate] = useReducer(x => x + 1, 0);

  const [isOpenFullScreenPanel, setIsOpenFullScreenPanel] = useState({
    open: false,
    model: '',
  });


  useEffect(() => {
    const body = document.body;

    // On mobile: lock body scroll when sidebar is open
    if (isSidebarOpen && windowWidth < 992) {
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none'; // for smoother mobile lock
    }
    // On desktop: do NOT lock body, but prevent scroll when hovering sidebar
    else {
      body.style.overflow = '';
      body.style.touchAction = '';
    }

    return () => {
      body.style.overflow = '';
      body.style.touchAction = '';
    };
  }, [isSidebarOpen, windowWidth]);

  const lockScroll = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };




  const router = createBrowserRouter([
    {
      path: "/",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <Dashboard />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/sign-up",
      exact: true,
      element: (
        <>
          <SignUp />
        </>
      ),
    },
    {
      path: "/forgot-password",
      exact: true,
      element: (
        <>
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/verify-account",
      exact: true,
      element: (
        <>
          <VerifyAccount />
        </>
      ),
    },
    {
      path: "/change-password",
      exact: true,
      element: (
        <>
          <ChangePassword />
        </>
      ),
    },
    {
      path: "/sign-in",
      exact: true,
      element: (
        <>
          <Login />
        </>
      ),
    },
    {
      path: "/products",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <Products />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/products/addProductRams",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <AddRAMS />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/products/addProductWeight",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <AddWeight />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/products/addProductSize",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <AddSize />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/product/:id",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <ProductDetails />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/homeSlider/list",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <HomeSliderBanners />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/category/list",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <CategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/subCategory/list",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <SubCategoryList />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/users",
      exact: true,
      element: (
        <>
                   <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <Users />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/orders",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <Orders />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/profile",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${0}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <Profile />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/bannersV1/list",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <BannersV1List />
              </div>
            </div>
          </section>
        </>
      ),
    },
    {
      path: "/blog/list",
      exact: true,
      element: (
        <>
          <section className={`main overflow-x-hidden`}>
            <Header />
            <div className='contentMain flex h-full'>
              <div
                // className="sidebarWrapper overflow-y-auto transition-all duration-300"
                className={`overflow-hidden sidebarWrapper ${isSidebarOpen === true ? `w-[${sidebarWidth}%] z-50` : 'w-[0%] opacity-0'} transition-all duration-300`}
                style={{
                  width: isSidebarOpen
                    ? windowWidth < 992
                      ? `${sidebarWidth / 2}%`
                      : `${sidebarWidth}%`
                    : '0%',
                  height: '100vh',
                }}
                onMouseEnter={() => {
                  if (window.innerWidth > 992) {
                    lockScroll();
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth > 992) {
                    unlockScroll();
                  }
                }}
              >
                <Sidebar />
              </div>

              <div className={`contentRight p-5 ${isSidebarOpen === true ? (windowWidth < 992 ? 'w-[100%]' : 'w-[82%]') : 'w-[100%]'} transition-all duration-300`} >
                <BlogList />
              </div>
            </div>
          </section>
        </>
      ),
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token !== undefined && token !== null && token !== '') {
      setIsLogin(true);
      fetchDataFromApi(`/api/user/user-details`).then((res) => {
        setUserData(res.data);
        if (res?.response?.data?.error === true) {
          if (res?.response?.data?.message === "You have not login") {
            localStorage.clear();
            openAlertBox("error", "Your session has expired. Please login again.");
            setIsLogin(false);
          }
        }
      })

    } else {
      setIsLogin(false);
    }

  }, [isLogin]);


  useEffect(() => {
    fetchDataFromApi("/api/category").then((res) => {
      console.log(res?.data);
      setCatData(res?.data);
    })

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  useEffect(() => {
    if (windowWidth < 992) {
      setIsSidebarOpen(false);
      setSidebarWidth(100);
    } else {
      setSidebarWidth(18);
    }
  }, [windowWidth])


  const openAlertBox = (status, msg) => {
    if (status === "success") {
      toast.success(msg);
    } else if (status === "error") {
      toast.error(msg);
    } else if (status === "loading") {
      toast.loading(msg, { id: "loadingToast" });
    }
  };

  const values = {
    isSidebarOpen,
    setIsSidebarOpen,

    // User authentication
    isLogin,
    setIsLogin,

    isOpenFullScreenPanel,
    setIsOpenFullScreenPanel,

    // User details
    userData,
    setUserData,

    // Utility functions
    openAlertBox,

    address,
    setAddress,

    addressIdNo,
    setAddressIdNo,

    categoryIdNo,
    setCategoryIdNo,

    bannerIdNo,
    setBannerIdNo,

    catData,
    setCatData,

    homeSlideData,
    setHomeSlideData,

    bannerV1Data,
    setBannerV1Data,

    blogData,
    setBlogData,

    blogIdNo,
    setBlogIdNo,

    productIdNo,
    setProductIdNo,

    isReducer,
    forceUpdate,

    windowWidth,
    sidebarWidth,
    setSidebarWidth,
  };

  return (
    <>
      <MyContext.Provider value={values}>
        <RouterProvider router={router} />
        <Dialog
          fullScreen
          open={isOpenFullScreenPanel.open}
          onClose={() => setIsOpenFullScreenPanel({ open: false })}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: 'fixed', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar className='flex items-start justify-start gap-2'>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setIsOpenFullScreenPanel({ open: false })}
                aria-label="close"
              >
                <IoCloseOutline />
              </IconButton>
              <Typography variant="h6" component="div">
                <span className='text-gray-800'>{isOpenFullScreenPanel?.model}</span>
              </Typography>
            </Toolbar>
          </AppBar>
          <div className='mt-5 pt-4 md:p-4'>

            {isOpenFullScreenPanel?.model === "Product Details" && <AddProduct />}

            {isOpenFullScreenPanel?.model === "Home Banner Details" && <AddHomeSlide />}

            {isOpenFullScreenPanel?.model === "Category Details" && <AddCategory />}

            {isOpenFullScreenPanel?.model === "Sub-Category Details" && <AddSubCategory />}

            {isOpenFullScreenPanel?.model === "Address Details" && <AddAddress />}

            {isOpenFullScreenPanel?.model === "BannerV1 Details" && <AddBannersV1 />}

            {isOpenFullScreenPanel?.model === "Blog Details" && <AddBlog />}


          </div>

        </Dialog>

        <Toaster />
      </MyContext.Provider>
    </>
  )
}

export default App
export { MyContext };