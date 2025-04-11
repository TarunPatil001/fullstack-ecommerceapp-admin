import React, { useContext, useEffect, useRef, useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { fetchDataFromApi } from "../../utils/api";
import { Link, useParams } from "react-router-dom";
import { RiStarSFill } from "react-icons/ri";
import { Button, Rating } from "@mui/material";
import { MyContext } from "../../App";


const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000); // Convert milliseconds to seconds

    if (diff < 0) return "Just now"; // Prevents negative time differences
    if (diff < 60) return `${diff} sec${diff !== 1 ? 's' : ''} ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
};



const ProductDetails = () => {

    const context = useContext(MyContext);
    const [slideIndex, setSlideIndex] = useState(0);
    const [product, setProduct] = useState();
    const zoomSlideBig = useRef(null);
    const zoomSlideSml = useRef(null);
    const [bgColor, setBgColor] = useState("#ffffff"); // Default background

    const { id } = useParams();


    useEffect(() => {
        fetchDataFromApi(`/api/product/${id}`).then((response) => {
            if (response.error === false) {
                setProduct(response?.data);
            }
        })
    }, [id]); // Runs whenever productId changes

    const reviewDate = new Date().toISOString();
    const [time, setTime] = useState(timeAgo(reviewDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(timeAgo("2025-02-01T01:44:00")); // Update time continuously
        }, 1000); // Update every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, [reviewDate]);



    // Function to manually set the slide index when clicking on thumbnails
    const goto = (index) => {
        setSlideIndex(index);
        zoomSlideBig.current.swiper.slideTo(index); // Moves only the main swiper
    };


    const onSlideChange = () => {
        if (!zoomSlideBig.current?.swiper) return;

        const currentIndex = zoomSlideBig.current.swiper.realIndex;
        setSlideIndex(currentIndex);
    };


    // Function to extract the dominant color from the image
    const extractDominantColor = (imageSrc) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Prevent CORS issues for external images
        img.src = imageSrc;

        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < pixels.length; i += 40) { // Sampling every 10th pixel for efficiency
                r += pixels[i];
                g += pixels[i + 1];
                b += pixels[i + 2];
                count++;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            setBgColor(`rgb(${r}, ${g}, ${b})`);
        };
    };

    // Update background color when the slideIndex changes
    useEffect(() => {
        if (product?.images?.[slideIndex]) {
            extractDominantColor(product.images[slideIndex]);
        }
    }, [slideIndex, product?.images]);


    return (
        // <>
        //     <div className="flex items-center justify-between pt-3 ">
        //         <h1 className="text-[20px] font-bold">Products Details</h1>
        //     </div>

        //     <div className={`productDetails flex gap-5 mt-2 `}>
        //         <div className="w-[50%]">
        //             <div className="flex gap-3 max-h-[560px]">
        //                 <div className="slider h-auto w-[10%] min-w-[40px] max-w-[80px] productDetailImageOptions flex flex-col items-center justify-center relative py-10">
        //                     {product?.images?.length !== 0 &&
        //                         <Swiper
        //                             ref={zoomSlideSml}
        //                             centeredSlides={true}
        //                             centeredSlidesBounds={true}
        //                             slidesPerView={"auto"}
        //                             spaceBetween={6}
        //                             direction={"vertical"}
        //                             navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
        //                             modules={[Navigation]}
        //                             className="zoomProductSliderThumbs absolute h-full overflow-hidden"
        //                         >

        //                             {product?.images?.map((image, index) => (
        //                                 <SwiperSlide
        //                                     key={index}
        //                                     className="!w-[40px] !h-[40px] flex items-center justify-center"
        //                                 >
        //                                     <div
        //                                         className={`item w-[40px] h-[40px] p-0.5 border border-black rounded-md overflow-hidden cursor-pointer group ${slideIndex === index ? "opacity-1 border-4 !border-blue-700" : "opacity-50"}`}
        //                                         onClick={() => goto(index)}
        //                                         onMouseEnter={() => goto(index)}
        //                                     >
        //                                         <img
        //                                             src={image}
        //                                             alt="img"
        //                                             className="w-full h-full object-cover transition-all rounded-md"
        //                                         />
        //                                     </div>
        //                                 </SwiperSlide>

        //                             ))}
        //                         </Swiper>
        //                     }

        //                     <div className="swiper-button-prev"></div>
        //                     <div className="swiper-button-next"></div>
        //                 </div>

        //                 {/* Main Image Viewer */}
        //                 <div className="zoomContainer w-full h-auto max-w-[90%] max-h-[560px] mx-auto relative shadow rounded-md aspect-square">
        //                     <div className="w-full h-full border-red-400">
        //                         <Swiper
        //                             ref={zoomSlideBig}
        //                             slidesPerView={1}
        //                             spaceBetween={0}
        //                             onSlideChange={onSlideChange}
        //                             className="productZoomSwiper w-full h-full rounded-md"
        //                             style={{ backgroundColor: bgColor, transition: "background 0.5s ease" }}
        //                         >
        //                             {product?.images?.map((image, index) => (
        //                                 <SwiperSlide key={index}>
        //                                     <InnerImageZoom
        //                                         zoomType="hover"
        //                                         zoomPreload={true}
        //                                         hideCloseButton={true}
        //                                         fullscreenOnMobile={false}
        //                                         zoomScale={1}
        //                                         src={image}
        //                                         className="w-full h-full object-cover"
        //                                     />
        //                                 </SwiperSlide>
        //                             ))}
        //                         </Swiper>
        //                     </div>
        //                 </div>
        //             </div>

        //         </div>

        //         <div className={`bg-white p-5 rounded-md ${context.isSidebarOpen === true ? 'w-[50%] z-50' : 'w-[80%]'}`}>

        //             <span className="text-[16px] font-bold text-gray-500">{product?.brand}</span>
        //             <h1 className="text-[20px]">{product?.name}</h1>
        //             <div className="flex items-center mt-2">
        //                 <span className="bg-green-600 h-[20px] rounded-full px-2 flex items-center justify-center gap-[2px] font-medium text-[14px] text-white">{product?.rating} <RiStarSFill className="text-[14px]" /></span>
        //                 <span className="separator text-lg"></span>
        //                 <span>{product?.rating > 0 ? product?.rating : 0} rating{product?.rating >= 2 ? 's' : ''} & {product?.reviews?.length > 0 ? product?.reviews?.length : 0} review{product?.reviews?.length >= 2 ? 's' : ''}</span>
        //             </div>

        //             <hr className="my-4 h-[1px] rounded-md" />

        //             <div className="flex items-center my-2">
        //                 <span className="flex items-center gap-3">
        //                     <span className="price text-[28px] font-medium flex items-center">
        //                         ₹<span>{new Intl.NumberFormat('en-IN').format(product?.price)}</span>
        //                     </span>
        //                     <span className="oldPrice line-through text-[var(--text-light)] text-[16px] font-medium flex items-center">
        //                         ₹<span>{new Intl.NumberFormat('en-IN').format(product?.oldPrice)}</span>
        //                     </span>
        //                     <span className="text-[16px] text-green-600 font-medium text">({product?.discount}% off)</span>
        //                 </span>
        //                 <span className="separator text-xl"></span>
        //                 <span className="flex items-center gap-2">Available in stocks: {
        //                     product?.countInStock > 0 ? product?.countInStock : <><span className="text-red-600 bg border border-red-600 px-2 py-1 capitalize text-[12px]">Out of stock</span></>
        //                 }</span>
        //             </div>

        //             <span className="text-[16px] border p-2 rounded-md">{product?.categoryName}<span className="separator text-lg"></span>{product?.subCategoryName}<span className="separator text-lg"></span>{product?.thirdSubCategoryName}</span>

        //             <div className=" mt-5">
        //                 {
        //                     product?.productRam.length > 0 &&

        //                     <span className="text-[16px] flex gap-2 items-center">
        //                         Ram :
        //                         {
        //                             product?.productRam.map((ram, index) => {
        //                                 return (

        //                                     <span className="border-2 rounded-md p-2 h-[35px] w-[50px] text-[14px] flex items-center justify-center" key={index}>{ram}</span>

        //                                 )
        //                             })
        //                         }
        //                     </span>
        //                 }
        //             </div>

        //             <div className=" mt-2">
        //                 <span className="text-[16px] flex gap-2 items-center">
        //                     <span>Size :</span>
        //                     {
        //                         product?.size.map((psize, index) => {
        //                             return (
        //                                 <>
        //                                     <span className="border-2 rounded-md p-2 h-[35px] w-[50px] text-[14px] flex items-center justify-center" key={index}>{psize}</span>
        //                                 </>
        //                             )
        //                         })
        //                     }
        //                 </span>
        //             </div>

        //             <div className=" mt-5">
        //                 <span className="text-[16px] flex gap-2 items-center">
        //                     <span>Published At :</span>
        //                     {
        //                         (new Date(product?.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }))

        //                     }
        //                 </span>
        //             </div>

        //             <h2 className="text-[16px] mt-2">Product Description : </h2>
        //             {
        //                 product?.description && <p className="text-[14px] text-gray-500 text-justify mt-1">{product?.description}</p>
        //             }
        //         </div>
        //     </div>

        //     <hr className="my-4 h-[1px] rounded-md bg-gray-300" />

        //     <div className="flex flex-col justify-center pt-3 ">
        //         <h1 className="text-[20px] font-bold">Customer Reviews</h1>
        //         <div className="gap-2 mt-2 bg-white rounded-md p-5 grid grid-cols-1">

        //             <div className="review flex items-center p-5 border rounded-md">
        //                 <div className="info flex items-start gap-3 w-full">
        //                     <div className="img w-[50px] min-w-[50px] h-[50px] overflow-hidden rounded-full relative">
        //                         <img src={context?.userData?.avatar !== "" ? `${context?.userData?.avatar}` : `https://ui-avatars.com/api/?name=${context?.userData?.name?.replace(/ /g, "+")}`} alt="user image" className="h-full w-full object-cover" />
        //                     </div>
        //                     <div className="flex flex-col w-full">
        //                         <div className="flex items-center gap-5 w-full">
        //                             <span className="flex items-center gap-2">
        //                                 <span className="text-[16px] font-bold">{"Karan Aujhla"}</span>
        //                                 <span className="text-gray-500 text-[12px]">{time}</span>
        //                             </span>
        //                             <Rating name="size-medium" defaultValue={5} readOnly />
        //                         </div>
        //                         <p className="text-sm text-gray-700 mt-2 text-justify">Lpsum dolor sit amet.</p>
        //                     </div>
        //                 </div>
        //             </div>


        //         </div>
        //     </div>
        // </>

        <>
            <div className="flex flex-col gap-2 mt-14">

                <div className="flex items-center justify-between py-3 w-full">
                    <h1 className="text-lg md:text-[20px] font-bold w-full">Products Details</h1>
                </div>

                <div className={`productDetails flex flex-col lg:flex-row gap-5 mt-2 lg:max-h-[560px] `}>

                    <div className="w-full lg:w-[50%]">
                        <div className="flex flex-col-reverse lg:flex-row gap-3 ">

                            <div className="slider h-auto w-full lg:w-[10%] lg:min-w-[40px] lg:max-w-[80px] max-h-[560px] productDetailImageOptions flex flex-row lg:flex-col items-center justify-center relative">
                                {product?.images?.length !== 0 &&
                                    <Swiper
                                        ref={zoomSlideSml}
                                        centeredSlides={true}
                                        centeredSlidesBounds={true}
                                        slidesPerView={"auto"}
                                        spaceBetween={6}
                                        direction={typeof window !== "undefined" && window.innerWidth < 1024 ? "horizontal" : "vertical"}
                                        navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
                                        modules={[Navigation]}
                                        className="zoomProductSliderThumbs absolute h-full overflow-hidden"
                                    >
                                        {product?.images?.map((image, index) => (
                                            <SwiperSlide
                                                key={index}
                                                className="!w-[40px] !h-[40px] flex items-center justify-center"
                                            >
                                                <div
                                                    className={`item w-[40px] h-[40px] p-0.5 border border-black rounded-md overflow-hidden cursor-pointer group ${slideIndex === index ? "opacity-1 border-4 !border-blue-700" : "opacity-50"}`}
                                                    onClick={() => goto(index)}
                                                    onMouseEnter={() => goto(index)}
                                                >
                                                    <img
                                                        src={image}
                                                        alt="img"
                                                        className="w-full h-full object-cover transition-all rounded-md"
                                                    />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                }

                                <div className="swiper-button-prev"></div>
                                <div className="swiper-button-next"></div>
                            </div>

                            {/* Main Image Viewer */}
                            <div className="zoomContainer w-full h-auto max-w-full lg:max-w-[90%] max-h-[560px] mx-auto relative shadow rounded-md aspect-square">
                                <div className="w-full h-full border-red-400">
                                    <Swiper
                                        ref={zoomSlideBig}
                                        slidesPerView={1}
                                        spaceBetween={0}
                                        onSlideChange={onSlideChange}
                                        className="productZoomSwiper w-full h-full rounded-md"
                                        style={{ backgroundColor: bgColor, transition: "background 0.5s ease" }}
                                    >
                                        {product?.images?.map((image, index) => (
                                            <SwiperSlide key={index}>
                                                <InnerImageZoom
                                                    zoomType="hover"
                                                    zoomPreload={true}
                                                    hideCloseButton={true}
                                                    fullscreenOnMobile={false}
                                                    zoomScale={1}
                                                    src={image}
                                                    className="w-full h-full object-cover"
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white p-3 sm:p-5 rounded-md w-full lg:w-[50%] mt-5 lg:mt-0 ${context.isSidebarOpen === true ? 'lg:z-50' : ''}`}>
                        <span className="text-sm sm:text-[16px] font-bold text-gray-500">{product?.brand}</span>
                        <h1 className="text-md lg:text-[20px]">{product?.name}</h1>
                        <div className="flex flex-wrap items-center mt-2 gap-1">
                            <span className="bg-green-600 h-[20px] rounded-full px-2 flex items-center justify-center gap-[2px] font-medium text-[14px] text-white">{product?.rating} <RiStarSFill className="text-[14px]" /></span>
                            <span className="separator text-lg"></span>
                            <span className="text-sm sm:text-base">{product?.rating > 0 ? product?.rating : 0} rating{product?.rating >= 2 ? 's' : ''} & {product?.reviews?.length > 0 ? product?.reviews?.length : 0} review{product?.reviews?.length >= 2 ? 's' : ''}</span>
                        </div>

                        <hr className="my-4 h-[1px] rounded-md" />

                        <div className="flex flex-col sm:flex-row sm:items-center my-2 gap-2 sm:gap-4">
                            <span className="flex items-center gap-3">
                                <span className="price text-xl sm:text-[28px] font-medium flex items-center">
                                    ₹<span>{new Intl.NumberFormat('en-IN').format(product?.price)}</span>
                                </span>
                                <span className="oldPrice line-through text-[var(--text-light)] text-sm sm:text-[16px] font-medium flex items-center">
                                    ₹<span>{new Intl.NumberFormat('en-IN').format(product?.oldPrice)}</span>
                                </span>
                                <span className="text-sm sm:text-[16px] text-green-600 font-medium">({product?.discount}% off)</span>
                            </span>
                            <span className="separator text-xl !hidden sm:!block"></span>
                            <span className="flex items-center gap-2 text-sm sm:text-base">Available in stocks: {
                                product?.countInStock > 0 ? product?.countInStock : <><span className="text-red-600 bg border border-red-600 px-2 py-1 capitalize text-[12px]">Out of stock</span></>
                            }</span>
                        </div>

                        <span className="text-sm sm:text-[16px] border p-2 rounded-md inline-block mt-2">
                            {product?.categoryName}<span className="separator text-lg"></span>{product?.subCategoryName}<span className="separator text-lg"></span>{product?.thirdSubCategoryName}
                        </span>

                        <div className="mt-3 sm:mt-5">
                            {
                                product?.productRam.length > 0 &&
                                <span className="text-sm sm:text-[16px] flex gap-2 items-center flex-wrap">
                                    Ram :
                                    {
                                        product?.productRam.map((ram, index) => {
                                            return (
                                                <span className="border-2 rounded-md p-2 h-[35px] w-[50px] text-[14px] flex items-center justify-center" key={index}>{ram}</span>
                                            )
                                        })
                                    }
                                </span>
                            }
                        </div>

                        <div className="mt-2">
                            <span className="text-sm sm:text-[16px] flex gap-2 items-center flex-wrap">
                                <span>Size :</span>
                                {
                                    product?.size.map((psize, index) => {
                                        return (
                                            <span className="border-2 rounded-md p-2 h-[35px] w-[50px] text-[14px] flex items-center justify-center" key={index}>{psize}</span>
                                        )
                                    })
                                }
                            </span>
                        </div>

                        <div className="mt-3 sm:mt-5">
                            <span className="text-sm sm:text-[16px] flex gap-2 items-center flex-wrap">
                                <span>Published At :</span>
                                {
                                    (new Date(product?.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }))
                                }
                            </span>
                        </div>

                        <h2 className="text-sm sm:text-[16px] mt-2">Product Description : </h2>
                        {
                            product?.description && <p className="text-xs sm:text-[14px] text-gray-500 text-justify mt-1">{product?.description}</p>
                        }
                    </div>
                </div>

                <hr className="my-4 h-[1px] rounded-md bg-gray-300 " />



                <div className="flex flex-col justify-center pt-3">
                    <h1 className="text-lg md:text-[20px] font-bold">Customer Reviews</h1>
                    <div className="gap-2 mt-2 bg-white rounded-md p-3 sm:p-5 grid grid-cols-1">
                        <div className="review flex items-center p-3 sm:p-5 border rounded-md">
                            <div className="info flex items-start gap-3 w-full">
                                <div className="img w-[40px] sm:w-[50px] min-w-[40px] sm:min-w-[50px] h-[40px] sm:h-[50px] overflow-hidden rounded-full relative">
                                    <img src={context?.userData?.avatar !== "" ? `${context?.userData?.avatar}` : `https://ui-avatars.com/api/?name=${context?.userData?.name?.replace(/ /g, "+")}`} alt="user image" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 w-full">
                                        <span className="flex items-center gap-2">
                                            <span className="text-sm sm:text-[16px] font-bold">{"Karan Aujhla"}</span>
                                            <span className="text-gray-500 text-[10px] sm:text-[12px]">{time}</span>
                                        </span>
                                        <Rating name="size-medium" defaultValue={5} readOnly size={window.innerWidth < 640 ? "small" : "medium"} />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-700 mt-2 text-justify">Lpsum dolor sit amet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
