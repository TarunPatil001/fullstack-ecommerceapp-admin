import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { ImGift } from "react-icons/im";
import { IoStatsChart } from "react-icons/io5";
import { GiShoppingBag } from "react-icons/gi";
import { BiSolidCategoryAlt } from 'react-icons/bi';
import { AiOutlineStock } from "react-icons/ai";
import { FaUserLarge } from 'react-icons/fa6';
import { PropTypes } from 'prop-types';

const DashboardBoxes = (props) => {
    return (
        <>
            <div className="relative">
                {/* Custom Navigation Buttons */}
                {/* <div className="swiper-button-next !flex !items-center !justify-center absolute right-0 z-10"></div>
                <div className="swiper-button-prev !flex !items-center !justify-center absolute left-0 z-10"></div> */}

                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    breakpoints={{
                        400: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                        },
                        650: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                        768: {
                            slidesPerView: 4,
                            spaceBetween: 10,
                        },
                    }}
                    navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    }}
                    modules={[Navigation]}
                    className="dashboardBoxesSlider !pr-0.5"
                >


                    <SwiperSlide>
                        <div className="box bg-pink-600 text-white p-4 rounded-md border border-[rgba(0,0,0,0.1)] hover:bg-pink-500 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-5 w-full">
                                <BiSolidCategoryAlt className="text-[40px] text-white" />
                                <div className="info w-[70%] flex flex-col items-center justify-center">
                                    <h3 className="font-medium text-[14px] text-[rgba(0,0,0,0.5)]">
                                        Total Categories
                                    </h3>
                                    <h2 className="font-bold text-[24px]">{props?.category}</h2>
                                </div>
                                <IoStatsChart className="text-[60px] text-white" />
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="box bg-green-600 text-white p-4 rounded-md border border-[rgba(0,0,0,0.1)] hover:bg-green-500 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-5 w-full">
                                <GiShoppingBag className="text-[40px] text-white" />
                                <div className="info w-[70%] flex flex-col items-center justify-center">
                                    <h3 className="font-medium text-[14px] text-[rgba(0,0,0,0.5)]">
                                        Total Products
                                    </h3>
                                    <h2 className="font-bold text-[24px]">{props?.products}</h2>
                                </div>
                                <IoStatsChart className="text-[60px] text-white" />
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="box bg-yellow-600 text-white p-4 rounded-md border border-[rgba(0,0,0,0.1)] hover:bg-yellow-500 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-5 w-full">
                                <ImGift className="text-[40px] text-white" />
                                <div className="info w-[70%] flex flex-col items-center justify-center">
                                    <h3 className="font-medium text-[14px] text-[rgba(0,0,0,0.5)]">
                                        Total Orders
                                    </h3>
                                    <h2 className="font-bold text-[24px]">{props?.orders}</h2>
                                </div>
                                <IoStatsChart className="text-[60px] text-white" />
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="box bg-gray-600 text-white p-4 rounded-md border border-[rgba(0,0,0,0.1)] hover:bg-gray-500 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-5 w-full">
                                <FaUserLarge className="text-[40px] text-white" />
                                <div className="info w-[70%] flex flex-col items-center justify-center">
                                    <h3 className="font-medium text-[14px] text-[rgba(0,0,0,0.5)]">
                                        Total Users
                                    </h3>
                                    <h2 className="font-bold text-[24px]">{props?.users}</h2>
                                </div>
                                <IoStatsChart className="text-[60px] text-white" />
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="box bg-teal-600 text-white p-4 rounded-md border border-[rgba(0,0,0,0.1)] hover:bg-teal-500 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-5 w-full">
                                <AiOutlineStock className="text-[40px] text-white" />
                                <div className="info w-[70%] flex flex-col items-center justify-center">
                                    <h3 className="font-medium text-[14px] text-[rgba(0,0,0,0.5)]">
                                        Total Sales
                                    </h3>
                                    <h2 className="font-bold text-[24px]">{props?.sales}</h2>
                                </div>
                                <IoStatsChart className="text-[60px] text-white" />
                            </div>
                        </div>
                    </SwiperSlide>

                </Swiper>
            </div>
        </>
    )
}

DashboardBoxes.propTypes = {
    category: PropTypes.number.isRequired,
    products: PropTypes.number.isRequired,
    orders: PropTypes.number.isRequired,
    users: PropTypes.number.isRequired,
    sales: PropTypes.number.isRequired,
};

export default DashboardBoxes
