import { Button } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { MdDashboard, MdOutlineLogout } from 'react-icons/md'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { TbSlideshow } from "react-icons/tb";
import { LuUsers } from "react-icons/lu";
import { RiBloggerLine, RiProductHuntLine } from "react-icons/ri";
import { TbCategory } from "react-icons/tb";
import { IoBagCheckOutline } from "react-icons/io5";
import { FaAngleDown } from "react-icons/fa6";
import { Collapse } from 'react-collapse';
import { GoDotFill } from "react-icons/go";
import { BiSolidUserDetail } from "react-icons/bi";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { PiSlideshowLight } from 'react-icons/pi';

const Sidebar = () => {

  const context = useContext(MyContext);
  const navigate = useNavigate();

  const location = useLocation(); // Hook to get the current location
  const [selectedMenu, setSelectedMenu] = useState("");
  const [subMenuIndex1, setSubMenuIndex1] = useState(false);
  const [subMenuIndex2, setSubMenuIndex2] = useState(false);
  const [subMenuIndex3, setSubMenuIndex3] = useState(false);
  const [subMenuIndex4, setSubMenuIndex4] = useState(false);
  const [subMenuIndex5, setSubMenuIndex5] = useState(false);

  // const { id } = useParams();

  // Define a mapping of paths to menu names
  const menuMapping = {
    "/": "Dashboard",
    "/homeSlider/list": "Home Banners List",
    "/users": "Users",
    "/profile": "Profile",
    "/products": "Product List",
    "/products/addProductRams": "Add Product Rams",
    "/products/addProductWeight": "Add Product Weight",
    "/products/addProductSize": "Add Product Size",
    "/category/list": "Categories List",
    "/subCategory/list": "Sub-Categories List",
    "/orders": "Orders",
    "/bannersV1/list": "BannerV1 List",
    "/blog/list": "Blog List",
    "/logout": "Logout",
  };

  // Sync the selected menu based on the current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenu = menuMapping[currentPath] || "Dashboard";
    setSelectedMenu(currentMenu);

    if (context?.windowWidth < 992 && context?.isSidebarOpen === false) {

      // Close all submenus first
      setSubMenuIndex1(false);
      setSubMenuIndex2(false);
      setSubMenuIndex3(false);
      setSubMenuIndex4(false);
      setSubMenuIndex5(false);
    }

    // Open only the relevant submenu
    if (currentMenu.includes("Home Banners")) {
      setSubMenuIndex1(true);
    } else if (currentMenu.includes("Product")) {
      setSubMenuIndex2(true);
    } else if (currentMenu.includes("Categories")) {
      setSubMenuIndex3(true);
    } else if (currentMenu.includes("Banners")) {
      setSubMenuIndex4(true);
    } else if (currentMenu.includes("Blogs")) {
      setSubMenuIndex5(true);
    }
  }, [location.pathname, context?.windowWidth, context?.isSidebarOpen]);


  const logout = () => {
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.clear();
        navigate("/sign-in");
      }
    })
  }

  // useEffect(() => {
  //   if (context?.isSidebarOpen && context?.windowWidth < 992) {
  //     document.body.classList.add('no-scroll');
  //   } else {
  //     document.body.classList.remove('no-scroll');
  //   }
  // }, [context?.isSidebarOpen, context?.windowWidth]);


  return (
    <>
      <div className={`sidebar fixed top-0 left-0 bg-[#fff] w-[${context.isSidebarOpen === true ? `${(context?.sidebarWidth / 2) + 15}%` : '0px'}] z-[99] h-full border border-r pl-2`}>
        <div className="py-2 w-full px-8">
          <Link to="/" onClick={() => context?.windowWidth < 992 && context?.setIsSidebarOpen(false)}>
            <img src="https://isomorphic-furyroad.vercel.app/_next/static/media/logo.a795e14a.svg" alt="logo" className='w-[200px]' />
          </Link>
        </div>

        <ul className='mt-4 overflow-y-scroll customScroll max-h-[85vh]'>

          <li>
            <Link to="/">
              <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Dashboard' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Dashboard'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}><MdDashboard className='text-[25px]' />
                <span>Dashboard</span>
              </Button>
            </Link>
          </li>


          <li>
            <Link to="/profile">
              <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Profile' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Profile'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}><BiSolidUserDetail className='text-[25px]' />
                <span>Profile</span>
              </Button>
            </Link>
          </li>


          <li>
            <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Home Banners List' || selectedMenu === 'Add Home Banners' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSubMenuIndex1(!subMenuIndex1) }}><TbSlideshow className='text-[25px]' />
              <span>Home Slides</span>
              <span className={`ml-auto w-[30px] h-[30px] flex !items-center !justify-center transform transition-transform duration-300 ${subMenuIndex1 ? "-rotate-180" : "rotate-0"}`}><FaAngleDown /></span>
            </Button>

            <Collapse isOpened={subMenuIndex1}>
              <ul className='w-full'>
                <li className='w-full'>
                  <Link to="/homeSlider/list">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Home Banners List' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Home Banners List'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Home Banners List' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Home Banners List</span>
                    </Button>
                  </Link>
                </li>
                <li className='w-full'>
                  <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => { context.setIsOpenFullScreenPanel({ open: true, model: "Home Banner Details" }); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add Home Banner</span>
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>


          <li>
            <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Categories List' || selectedMenu === 'Add a Category' || selectedMenu === 'Sub-Categories List' || selectedMenu === 'Add a Sub-Category' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSubMenuIndex3(!subMenuIndex3) }}><TbCategory className='text-[25px]' />
              <span>Categories</span>
              <span className={`ml-auto w-[30px] h-[30px] flex items-center justify-center transform transition-transform duration-300 ${subMenuIndex3 ? "-rotate-180" : "rotate-0"}`}><FaAngleDown /></span>
            </Button>

            <Collapse isOpened={subMenuIndex3}>
              <ul className='w-full'>
                <li className='w-full'>
                  <Link to="/category/list">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Categories List' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Categories List'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Categories List' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Categories List</span>
                    </Button>
                  </Link>
                </li>
                <li className='w-full'>
                  <Button className={`!w-full !normal-case !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => { context.setIsOpenFullScreenPanel({ open: true, model: "Category Details" }); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add a Category</span>
                  </Button>
                </li>
                <li className='w-full'>
                  <Link to="/subCategory/list">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Sub-Categories List' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Sub-Categories List'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Sub-Categories List' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Sub-Categories List</span>
                    </Button>
                  </Link>
                </li>
                <li className='w-full'>
                  <Button className={`!w-full !normal-case !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => { context.setIsOpenFullScreenPanel({ open: true, model: "Sub-Category Details" }); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add a Sub-Category</span>
                  </Button>
                </li>
              </ul>
            </Collapse>
          </li>


          <li>
            <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Product List' || selectedMenu === 'Product Upload' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSubMenuIndex2(!subMenuIndex2) }}><RiProductHuntLine className='text-[25px]' />
              <span>Products</span>
              <span className={`ml-auto w-[30px] h-[30px] flex items-center justify-center transform transition-transform duration-300 ${subMenuIndex2 ? "-rotate-180" : "rotate-0"}`}><FaAngleDown /></span>
            </Button>

            <Collapse isOpened={subMenuIndex2}>
              <ul className='w-full'>
                <li className='w-full'>
                  <Link to="/products">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Product List' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Product List'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Product List' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Product List</span>
                    </Button>
                  </Link>
                </li>

                <li className='w-full'>
                  <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => { context.setIsOpenFullScreenPanel({ open: true, model: "Product Details" }); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add Product</span>
                  </Button>
                </li>

                <li className='w-full'>
                  <Link to="/products/addProductRams">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Add Product Rams' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Add Product Rams'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Add Product Rams' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Add Product RAMS</span>
                    </Button>
                  </Link>
                </li>

                <li className='w-full'>
                  <Link to="/products/addProductWeight">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Add Product Weight' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Add Product Weight'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Add Product Weight' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Add Product Weight</span>
                    </Button>
                  </Link>
                </li>

                <li className='w-full'>
                  <Link to="/products/addProductSize">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Add Product Size' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Add Product Size'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false) }}>
                      <GoDotFill className={`${selectedMenu === 'Add Product Size' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Add Product Size</span>
                    </Button>
                  </Link>
                </li>

              </ul>
            </Collapse>
          </li>


          <li>
            <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'BannerV1 List' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSubMenuIndex4(!subMenuIndex4) }}><PiSlideshowLight className='text-[25px]' />
              <span>Banners</span>
              <span className={`ml-auto w-[30px] h-[30px] flex !items-center !justify-center transform transition-transform duration-300 ${subMenuIndex4 ? "-rotate-180" : "rotate-0"}`}><FaAngleDown /></span>
            </Button>


            <Collapse isOpened={subMenuIndex4}>
              <ul className='w-full'>

                <li className='w-full'>
                  <Link to="/bannersV1/list">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'BannerV1 List' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('BannerV1 List'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'BannerV1 List' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Banner V1 List</span>
                    </Button>
                  </Link>
                </li>

                <li className='w-full'>
                  <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => { context.setIsOpenFullScreenPanel({ open: true, model: "BannerV1 Details" }); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add Banner V1</span>
                  </Button>
                </li>

                {/* <li className='w-full'>
                  <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Home Banner Details" })}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add Banner V2</span>
                  </Button>
                </li> */}

                {/* <li className='w-full'>
                  <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: "Home Banner Details" })}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add Banner V3</span>
                  </Button>
                </li> */}

              </ul>
            </Collapse>
          </li>


          <li>
            <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Blog List' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSubMenuIndex5(!subMenuIndex5) }}><RiBloggerLine className='text-[25px]' />
              <span>Blogs</span>
              <span className={`ml-auto w-[30px] h-[30px] flex !items-center !justify-center transform transition-transform duration-300 ${subMenuIndex5 ? "-rotate-180" : "rotate-0"}`}><FaAngleDown /></span>
            </Button>

            <Collapse isOpened={subMenuIndex5}>
              <ul className='w-full'>

                <li className='w-full'>
                  <Link to="/blog/list">
                    <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Blog List' ? "!text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Blog List'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                      <GoDotFill className={`${selectedMenu === 'Blog List' ? "!text-[var(--text-active)]" : "text-[rgba(0,0,0,0.3)]"}`} />
                      <span>Blog List</span>
                    </Button>
                  </Link>
                </li>

                <li className='w-full'>
                  <Button className={`!w-full !capitalize !pl-10 flex !justify-start !items-center gap-3 !text-[13px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)]`} onClick={() => { context.setIsOpenFullScreenPanel({ open: true, model: "Blog Details" }); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}>
                    <GoDotFill className={`text-[rgba(0,0,0,0.3)]`} />
                    <span>Add Blog</span>
                  </Button>
                </li>

              </ul>
            </Collapse>
          </li>


          <li>
            <Link to="/users">
              <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Users' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Users'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}><LuUsers className='text-[25px]' />
                <span>Users</span>
              </Button>
            </Link>
          </li>


          <li>
            <Link to="/orders">
              <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Orders' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""}`} onClick={() => { setSelectedMenu('Orders'); context?.windowWidth < 992 && context?.setIsSidebarOpen(false); }}><IoBagCheckOutline className='text-[25px]' />
                <span>Orders</span>
              </Button>
            </Link>
          </li>


          <li>
            <Button className={`!w-full !capitalize flex !justify-start !items-center gap-3 text-[14px] !text-[rgba(0,0,0,0.7)] !font-bold !py-2 hover:!bg-[var(--bg-light-hover)] ${selectedMenu === 'Logout' ? "!bg-[var(--bg-active)] !text-[var(--text-active)]" : ""} pointer-events-auto`} onClick={() => { setSelectedMenu('Logout'); logout(); }}><MdOutlineLogout className='text-[25px]' />
              <span>Logout</span>
            </Button>
          </li>

        </ul>
      </div >

      {/* <div className={`sidebarOverlay w-full h-full fixed top-0 left-0 bg-[rgba(0,0,0,0.5)]  overflow-hidden !z-[51]  ${context?.isSidebarOpen && context?.windowWidth < 992 ? "block" : "hidden"}`} onClick={() => context?.setIsSidebarOpen(false)} ></div> */}
      <div
        className={`sidebarOverlay w-full h-full fixed top-0 left-0 bg-[rgba(0,0,0,0.5)] overflow-hidden !z-[51] ${context?.isSidebarOpen && context?.windowWidth < 992 ? "block" : "hidden"
          }`}
        onClick={() => context?.setIsSidebarOpen(false)}
      ></div>

    </>
  )
}

export default Sidebar