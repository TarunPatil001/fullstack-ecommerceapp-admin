import { useContext, useEffect, useState } from 'react'
import { Badge, Button, IconButton } from '@mui/material';
import { FaRegBell, FaRegUser } from "react-icons/fa";
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MdOutlineLogout } from "react-icons/md";
import { MyContext } from "../../App";
import { useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from '../../utils/api';
import { AiOutlineMenuUnfold } from 'react-icons/ai';


const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Header = () => {

  const context = useContext(MyContext);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ avatar: '', name: '', email: '' });
  const [anchorMyAcc, setAnchorMyAcc] = useState(null);
  const openMyAcc = Boolean(anchorMyAcc);

  const [isSticky, setIsSticky] = useState(true); // Track sticky state
  const [lastScrollY, setLastScrollY] = useState(0); // Track last scroll position

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar (sticky) when scrolling up
      if (currentScrollY < lastScrollY) {
        setIsSticky(true);
      }
      // Hide navbar (non-sticky) when scrolling down
      else {
        setIsSticky(false);
      }

      setLastScrollY(currentScrollY); // Update the last scroll position
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const navigateToSignIn = () => {
    navigate("/sign-in");
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token !== undefined && token !== null && token !== '') {
      context?.setIsLogin(true);
    } else {
      navigate("/");
    }
  }, [context, navigate]);

  useEffect(() => {
    if (context.isLogin) {
      setLoginData({
        avatar: context?.userData?.avatar,
        name: context?.userData?.name,
        email: context?.userData?.email,
      });
    }
  }, [context.isLogin, context?.userData]);


  const logout = () => {
    setAnchorMyAcc(null);

    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem('accessToken')}`, { withCredentials: true }).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.clear();
        navigate("/");
      }
    })
  }


  return (
    <header className={`w-full h-14 py-2 shadow-md transition-all duration-700 bg-[#fff] pr-7 flex items-center justify-between z-[50] ${context.isSidebarOpen ? (context.windowWidth < 992 ? 'pl-5' : 'pl-72') : 'pl-5'} ${isSticky ? "fixed top-0" : "fixed top-0"}`}>
      <div className="part1">
        <Button className="!w-[40px] !h-[40px] !rounded-full !min-w-[40px] !text-[rgba(0,0,0,0.8)] shadow hover:bg-gray-200" onClick={() => context.setIsSidebarOpen(!context.isSidebarOpen)}><AiOutlineMenuUnfold className={`text-[18px] ${context.isSidebarOpen === true ? '-rotate-180' : 'rotate-0'} transition-all duration-300`} /></Button>
      </div>

      <div className="part2 w-auto flex items-center justify-center gap-5">
        <IconButton aria-label="notification">
          <StyledBadge badgeContent={4} color="secondary">
            <FaRegBell />
          </StyledBadge>
        </IconButton>

        {
          context.isLogin === true ? (

            <div className="relative">
              <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer" onClick={handleClickMyAcc}>
                {/* <img src={loginData?.avatar !== "" ? `${loginData?.avatar}` : `https://ui-avatars.com/api/?name=${loginData?.name?.replace(/ /g, "+")}`} alt="user image" className="h-full w-full object-cover" /> */}
                <img src={loginData?.avatar || `https://ui-avatars.com/api/?name=${loginData?.name?.replace(/ /g, "+")}`} alt="user avatar" className="h-full w-full object-cover" />
              </div>

              <Menu
                anchorEl={anchorMyAcc}
                id="account-menu"
                open={openMyAcc}
                onClose={handleCloseMyAcc}
                onClick={handleCloseMyAcc}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleCloseMyAcc}>
                  <div className="flex items-center justify-center gap-3 h-[40px]">
                    <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer">
                      <img src={loginData?.avatar || `https://ui-avatars.com/api/?name=${loginData?.name?.replace(/ /g, "+")}`} alt="user avatar" className="h-full w-full object-cover" />
                    </div>
                    <div className="info">
                      <h3 className='text-[14px] font-bold leading-5'>{loginData?.name}</h3>
                      <p className='text-[12px] opacity-70'>{loginData?.email}</p>
                    </div>
                  </div>
                </MenuItem>
                <hr />
                <MenuItem onClick={() => { handleCloseMyAcc(); navigateToProfile(); }} className='flex items-center justify-center gap-3 h-[40px]'>
                  <FaRegUser className='text-[14px]' /> <span className='flex items-center justify-center text-[14px]'>Profile</span>
                </MenuItem>
                <hr />
                <MenuItem onClick={() => { handleCloseMyAcc(); logout(); }} className='flex items-center justify-center gap-3 h-[40px]'>
                  <MdOutlineLogout className='text-[15px]' /> <span className='flex items-center justify-center text-[14px]'>Sign out</span>
                </MenuItem>
              </Menu>
            </div>

          ) : (

            <Button className='custom-btn !rounded-full !capitalize' onClick={navigateToSignIn}>Sign In</Button>

          )
        }

      </div>
    </header>
   
  )
}

export default Header