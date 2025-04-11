import React, { useContext, useMemo, useState } from 'react'
import Badge from '../../Components/Badge'
import { Button, Pagination, TablePagination } from '@mui/material'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import SearchBox from '../../Components/SearchBox';
import { editData, fetchDataFromApi } from '../../utils/api';
import { useEffect } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { MyContext } from '../../App';
import { useLocation } from 'react-router-dom';

const Orders = () => {

    // const context = useContext(MyContext);
    // const [isOpenOrder, setIsOpenOrder] = useState(null);
    // const [orderStatus, setOrderStatus] = useState({});
    // const [orders, setOrders] = useState([]);
    // const [totalOrders, setTotalOrders] = useState(0);
    // const [pageOrder, setPageOrder] = useState(1); // 1-based index to match backend
    // const [rowsPerPage, setRowsPerPage] = useState(4);
    // const [searchQuery, setSearchQuery] = useState('')
    // const [allOrders, setAllOrders] = useState([]); // Stores all orders globally
    // const [filteredOrders, setFilteredOrders] = useState([]); // Stores search results



    // const handleChange = (event, itemId) => {
    //     const newStatus = event.target.value;

    //     // Update state for only the specific order
    //     setOrderStatus((prevStatuses) => ({
    //         ...prevStatuses,
    //         [itemId]: newStatus, // Updates only the specific order ID
    //     }));

    //     const obj = {
    //         id: itemId,
    //         order_status: newStatus,
    //     };

    //     editData(`/api/order/order-status/${itemId}`, obj)
    //         .then((res) => {
    //             console.log("API Response:", res);

    //             if (res?.error === false) {
    //                 context?.openAlertBox("success", res?.message);
    //                 getOrderDetails();
    //             } else {
    //                 console.error("Unexpected API response:", res);
    //             }
    //         })
    //         .catch((err) => {
    //             console.error("Error updating order status:", err);
    //         });

    // };


    // const isShowOrderedProduct = (index) => {
    //     if (isOpenOrder === index) {
    //         setIsOpenOrder(null);
    //     } else {
    //         setIsOpenOrder(index);
    //     }
    // }



    // // Fetch all orders once on mount
    // const getOrderDetails = () => {
    //     fetchDataFromApi(`/api/order/order-list`)
    //         .then((res) => {
    //             if (res?.error === false) {
    //                 setAllOrders(res?.data || []); // Store all orders globally
    //                 setFilteredOrders(res?.data || []); // Default to all orders
    //                 setTotalOrders(res?.totalOrders || res?.data?.length || 0);
    //                 updatePaginatedOrders(res?.data || [], 1);
    //             }
    //         });
    // };

    // // Update displayed orders based on current pagination
    // const updatePaginatedOrders = (data, newPage) => {
    //     const startIndex = (newPage - 1) * rowsPerPage;
    //     const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);
    //     setOrders(paginatedData);
    //     setTotalOrders(data.length); // Update total orders for correct pagination
    // };

    // // Fetch all orders on component mount
    // useEffect(() => {
    //     getOrderDetails();
    // }, []);

    // // Update pagination when page or rowsPerPage changes
    // useEffect(() => {
    //     updatePaginatedOrders(filteredOrders, pageOrder);
    // }, [pageOrder, rowsPerPage, filteredOrders]);

    // useEffect(() => {
    //     if (searchQuery.trim() !== "") {
    //         const lowerCaseQuery = searchQuery.toLowerCase().trim();

    //         const filteredResults = allOrders.filter((order) => {
    //             const paymentId = order?.paymentId
    //                 ? order.paymentId.toString().trim().toLowerCase()
    //                 : "CASH_ON_DELIVERY"; // ✅ Default value when paymentId is missing

    //             console.log(`Checking PaymentID: "${paymentId}" against "${lowerCaseQuery}"`); // ✅ Debugging

    //             const fields = [
    //                 order?._id,
    //                 paymentId, // ✅ Now includes "CASH ON DELIVERY"
    //                 order?.delivery_address?.mobile,
    //                 order?.delivery_address?.name,
    //                 order?.delivery_address?.address_line1,
    //                 order?.delivery_address?.landmark,
    //                 order?.delivery_address?.city,
    //                 order?.delivery_address?.state,
    //                 order?.delivery_address?.country,
    //                 order?.delivery_address?.pincode,
    //                 order?.userId?.email,
    //                 order?.createdAt
    //             ];

    //             return fields.some((field) => {
    //                 if (typeof field === "string") {
    //                     const fieldLower = field?.toLowerCase().trim() || "";
    //                     return (
    //                         fieldLower.includes(lowerCaseQuery) ||
    //                         fieldLower.split(" ").some((word) => word.startsWith(lowerCaseQuery))
    //                     );
    //                 } else if (typeof field === "number") {
    //                     return field.toString().includes(searchQuery);
    //                 }
    //                 return false;
    //             });
    //         });

    //         console.log("Search Query:", searchQuery);
    //         console.log("Filtered Results:", filteredResults);

    //         setFilteredOrders(filteredResults);
    //         setPageOrder(1);
    //         updatePaginatedOrders(filteredResults, 1);
    //     } else {
    //         setFilteredOrders(allOrders);
    //         updatePaginatedOrders(allOrders, pageOrder);
    //     }
    // }, [searchQuery, allOrders]);


    const context = useContext(MyContext);
    const [isOpenOrder, setIsOpenOrder] = useState(false);
    const [orderStatus, setOrderStatus] = useState({});
    const [allOrders, setAllOrders] = useState([]); // Stores all orders globally
    const [filteredOrders, setFilteredOrders] = useState([]); // Stores search results
    const [pageOrder, setPageOrder] = useState(1); // 1-based index to match backend
    const [rowsPerPage, setRowsPerPage] = useState(4);
    const [searchQuery, setSearchQuery] = useState('');

    // const location = useLocation();
    // const isHome = location.pathname === "/";
    useEffect(()=>{
            window.scrollTo(0, 0);
        },[])

    const handleChange = (event, itemId) => {
        const newStatus = event.target.value;

        setOrderStatus((prevStatuses) => ({
            ...prevStatuses,
            [itemId]: newStatus,
        }));

        editData(`/api/order/order-status/${itemId}`, { id: itemId, order_status: newStatus })
            .then((res) => {
                if (res?.error === false) {
                    context?.openAlertBox("success", res?.message);
                    getOrderDetails();
                } else {
                    console.error("Unexpected API response:", res);
                }
            })
            .catch((err) => console.error("Error updating order status:", err));
    };

    const isShowOrderedProduct = (index) => {
        if (isOpenOrder === index) {
            setIsOpenOrder(null);
        } else {
            setIsOpenOrder(index);
        }
    }

    // Fetch all orders once on mount
    const getOrderDetails = () => {
        fetchDataFromApi(`/api/order/order-list`)
            .then((res) => {
                if (res?.error === false) {
                    const orders = res?.data || [];
                    setAllOrders(orders);
                    setFilteredOrders(orders);
                    setPageOrder(1); // Reset pagination
                }
            });
    };

    // Update displayed orders based on current pagination
    const paginatedOrders = useMemo(() => {
        const startIndex = (pageOrder - 1) * rowsPerPage;
        return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredOrders, pageOrder, rowsPerPage]);


    // Fetch all orders on component mount
    useEffect(() => {
        getOrderDetails();
    }, []);

    // Handle search functionality
    useEffect(() => {
        if (searchQuery.trim() !== "") {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            const filteredResults = allOrders.filter((order) => {
                const paymentId = order?.paymentId
                    ? order.paymentId.toString().trim().toLowerCase()
                    : "cash_on_delivery";

                const fields = [
                    order?._id,
                    paymentId,
                    order?.delivery_address?.mobile,
                    order?.delivery_address?.name,
                    order?.delivery_address?.address_line1,
                    order?.delivery_address?.landmark,
                    order?.delivery_address?.city,
                    order?.delivery_address?.state,
                    order?.delivery_address?.country,
                    order?.delivery_address?.pincode,
                    order?.userId?.email,
                    order?.createdAt
                ];

                return fields.some((field) => {
                    if (typeof field === "string") {
                        return field.toLowerCase().includes(lowerCaseQuery);
                    } else if (typeof field === "number") {
                        return field.toString().includes(searchQuery);
                    }
                    return false;
                });
            });

            setFilteredOrders(filteredResults);
            setPageOrder(1);
        } else {
            setFilteredOrders(allOrders);
        }
    }, [searchQuery, allOrders]);




    return (
        <div className={`card my-4 mt-14 bg-white border rounded-md px-1 h-auto w-auto relative`}>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-2'>
                <h2 className='text-[20px] font-bold'>Recent Orders</h2>
                <div className='w-full sm:w-[60%] md:w-[50%]'>
                    <SearchBox
                        searchName="orders"
                        searchQuery={searchQuery}
                        setSearchQuery={(query) => {
                            setSearchQuery(query);
                            setPageOrder(1); // ✅ Reset pagination when searching
                        }}
                    />

                </div>
            </div>

            <div className="customScroll relative overflow-x-auto rounded-md pb-5">
                <table className="w-full text-[14px] text-left rtl:text-right text-[var(--text-light)] rounded-md over">
                    <thead className="text-[14px] text-gray-700 uppercase bg-gray-100 whitespace-nowrap">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left"></th>
                            <th scope="col" className="px-6 py-3 text-left">Order Id</th>
                            <th scope="col" className="px-6 py-3 text-left">Payment Id</th>
                            <th scope="col" className="px-6 py-3 text-left">Name</th>
                            <th scope="col" className="px-6 py-3 text-left">Mobile No.</th>
                            <th scope="col" className="px-6 py-3 text-left w-[400px] min-w-[400px]">Address</th>
                            <th scope="col" className="px-6 py-3 text-left">Pin Code</th>
                            <th scope="col" className="px-6 py-3 text-left">Email</th>
                            <th scope="col" className="px-6 py-3 text-left">Total Amount</th>
                            <th scope="col" className="px-6 py-3 text-left">User Id</th>
                            <th scope="col" className="px-6 py-3 text-left">Order Status</th>
                            <th scope="col" className="px-6 py-3 text-left">Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.length === 0 ? (
                            allOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                        No Orders Received Yet
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="9" rowSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No Matching Orders Found
                                    </td>
                                </tr>
                            )
                        ) : (
                            paginatedOrders.map((item, index) => (
                                <>
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <Button
                                                className="!text-black !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1] flex items-center justify-center"
                                                onClick={() => isShowOrderedProduct(index)}
                                            >
                                                {isOpenOrder === index ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                            </Button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <span className="text-[var(--bg-primary)] font-semibold">
                                                {item?._id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <span className="text-[var(--bg-primary)] font-semibold">
                                                {item?.paymentId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.delivery_address?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.delivery_address?.mobile
                                                ? String(item?.delivery_address?.mobile).replace(/^(\d{2})(\d{5})(\d{5})$/, '+$1 $2 $3')
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-left whitespace-normal break-words">
                                            {[
                                                item?.delivery_address?.address_line1,
                                                item?.delivery_address?.landmark,
                                                item?.delivery_address?.city,
                                                item?.delivery_address?.state,
                                                item?.delivery_address?.pincode,
                                                item?.delivery_address?.country
                                            ].filter(Boolean).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.delivery_address?.pincode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.userId?.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.totalAmt ? item.totalAmt.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '₹0'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.userId?._id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                                                <Select
                                                    value={orderStatus[item?._id] ?? item?.order_status ?? ''}
                                                    onChange={(e) => handleChange(e, item?._id)}
                                                    displayEmpty
                                                    inputProps={{ 'aria-label': 'Without label' }}
                                                    sx={{
                                                        '&.MuiOutlinedInput-root': {
                                                            backgroundColor: `${(orderStatus[item._id] ?? item?.order_status) === 'pending' ? 'red' :
                                                                (orderStatus[item._id] ?? item?.order_status) === 'confirm' ? 'blue' :
                                                                    (orderStatus[item._id] ?? item?.order_status) === 'delivered' ? 'green' : 'white'
                                                                } !important`,
                                                        },
                                                        '& .MuiSelect-select': {
                                                            backgroundColor: `${(orderStatus[item._id] ?? item?.order_status) === 'pending' ? 'red' :
                                                                (orderStatus[item._id] ?? item?.order_status) === 'confirm' ? 'blue' :
                                                                    (orderStatus[item._id] ?? item?.order_status) === 'delivered' ? 'green' : 'white'
                                                                } !important`,
                                                            color: 'white !important',
                                                            padding: '8px 12px',
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'transparent !important', // Hide the border
                                                        },
                                                        '& .MuiSvgIcon-root': { color: 'white !important' }, // Change dropdown arrow color
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                bgcolor: 'white', // Keeps the dropdown background white
                                                                '& .MuiMenuItem-root': { color: 'black' }, // Default black text
                                                                '& .MuiMenuItem-root[data-value="pending"]': { color: 'red' }, // Pending text color
                                                                '& .MuiMenuItem-root[data-value="confirm"]': { color: 'blue' }, // Confirm text color
                                                                '& .MuiMenuItem-root[data-value="delivered"]': { color: 'green' }, // Delivered text color
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value={'pending'}>Pending</MenuItem>
                                                    <MenuItem value={'confirm'}>Confirm</MenuItem>
                                                    <MenuItem value={'delivered'}>Delivered</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}
                                        </td>
                                    </tr>
                                    {
                                        isOpenOrder === index && (
                                            <tr>
                                                <td colSpan="6" className="p-0">
                                                    <div className="customScroll relative overflow-x-auto my-2 px-20">
                                                        <table className="w-full text-[14px] text-left rtl:text-right text-[var(--text-light)]">
                                                            <thead className="text-[14px] text-gray-700 uppercase bg-gray-100 whitespace-nowrap">
                                                                <tr>
                                                                    <th scope="col" className="px-6 py-3 text-left w-[200px] min-w-[200px]">Product Id</th>
                                                                    <th scope="col" className="px-6 py-3 text-left w-[300px] min-w-[300px]">Product Title</th>
                                                                    <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">Image</th>
                                                                    <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">Quantity</th>
                                                                    <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">Price</th>
                                                                    <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">SubTotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    item?.products?.map((productItem, index) => (
                                                                        <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                                                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                                {productItem?.productId}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-normal break-words text-left">
                                                                                {productItem?.productTitle}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                                <div className="!w-[50px] !h-[50px]">
                                                                                    <img
                                                                                        src={productItem?.image}
                                                                                        alt=""
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-left">{productItem?.quantity}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                                {productItem?.price ? productItem.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '₹0'}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                                {productItem?.subTotal ? productItem.subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '₹0'}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </>
                            ))
                        )}

                    </tbody>
                </table>


                {/* <table className="w-full text-[14px] text-left rtl:text-right text-[var(--text-light)] rounded-md">
                    <thead className="text-[14px] text-gray-700 uppercase bg-gray-100 whitespace-nowrap">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left"></th>
                            <th scope="col" className="px-6 py-3 text-left">Order Id</th>
                            <th scope="col" className="px-6 py-3 text-left">Payment Id</th>
                            <th scope="col" className="px-6 py-3 text-left">Name</th>
                            <th scope="col" className="px-6 py-3 text-left">Mobile No.</th>
                            <th scope="col" className="px-6 py-3 text-left w-[400px] min-w-[400px]">Address</th>
                            <th scope="col" className="px-6 py-3 text-left">Pin Code</th>
                            <th scope="col" className="px-6 py-3 text-left">Email</th>
                            <th scope="col" className="px-6 py-3 text-left">Total Amount</th>
                            <th scope="col" className="px-6 py-3 text-left">User Id</th>
                            <th scope="col" className="px-6 py-3 text-left">Order Status</th>
                            <th scope="col" className="px-6 py-3 text-left">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {
                            orders?.length !== 0 ? (
                                orders?.map((item, index) => ( 
                {paginatedOrders.length !== 0 ? (
                    paginatedOrders.map((item, index) => (
                        <>
                            <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    <Button
                                        className="!text-black !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1] flex items-center justify-center"
                                        onClick={() => toggleOrderedProduct(index)}
                                    >
                                        {isOpenOrder === (index) ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                    </Button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    <span className="text-[var(--bg-primary)] font-semibold">
                                        {item?._id}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    <span className="text-[var(--bg-primary)] font-semibold">
                                        {item?.paymentId}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    {item?.delivery_address?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    {item?.delivery_address?.mobile
                                        ? String(item?.delivery_address?.mobile).replace(/^(\d{2})(\d{5})(\d{5})$/, '+$1 $2 $3')
                                        : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-left whitespace-normal break-words">
                                    {[
                                        item?.delivery_address?.address_line1,
                                        item?.delivery_address?.landmark,
                                        item?.delivery_address?.city,
                                        item?.delivery_address?.state,
                                        item?.delivery_address?.pincode,
                                        item?.delivery_address?.country
                                    ].filter(Boolean).join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    {item?.delivery_address?.pincode}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    {item?.userId?.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    {item?.totalAmt ? item.totalAmt.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '₹0'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left ">
                                    {item?.userId?._id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                                        <Select
                                            value={orderStatus[item?._id] ?? item?.order_status ?? ''}
                                            onChange={(e) => handleChange(e, item?._id)}
                                            displayEmpty
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            sx={{
                                                '&.MuiOutlinedInput-root': {
                                                    backgroundColor: `${(orderStatus[item._id] ?? item?.order_status) === 'pending' ? 'red' :
                                                        (orderStatus[item._id] ?? item?.order_status) === 'confirm' ? 'blue' :
                                                            (orderStatus[item._id] ?? item?.order_status) === 'delivered' ? 'green' : 'white'
                                                        } !important`,
                                                },
                                                '& .MuiSelect-select': {
                                                    backgroundColor: `${(orderStatus[item._id] ?? item?.order_status) === 'pending' ? 'red' :
                                                        (orderStatus[item._id] ?? item?.order_status) === 'confirm' ? 'blue' :
                                                            (orderStatus[item._id] ?? item?.order_status) === 'delivered' ? 'green' : 'white'
                                                        } !important`,
                                                    color: 'white !important',
                                                    padding: '8px 12px',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'transparent !important', // Hide the border
                                                },
                                                '& .MuiSvgIcon-root': { color: 'white !important' }, // Change dropdown arrow color
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        bgcolor: 'white', // Keeps the dropdown background white
                                                        '& .MuiMenuItem-root': { color: 'black' }, // Default black text
                                                        '& .MuiMenuItem-root[data-value="pending"]': { color: 'red' }, // Pending text color
                                                        '& .MuiMenuItem-root[data-value="confirm"]': { color: 'blue' }, // Confirm text color
                                                        '& .MuiMenuItem-root[data-value="delivered"]': { color: 'green' }, // Delivered text color
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value={'pending'}>Pending</MenuItem>
                                            <MenuItem value={'confirm'}>Confirm</MenuItem>
                                            <MenuItem value={'delivered'}>Delivered</MenuItem>
                                        </Select>
                                    </FormControl>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-left ">
                                    {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}
                                </td>
                            </tr>
                            {
                                isOpenOrder === index && (
                                    <tr>
                                        <td colSpan="6" className="p-0">
                                            <div className="customScroll relative overflow-x-auto my-2 px-20">
                                                <table className="w-full text-[14px] text-left rtl:text-right text-[var(--text-light)]">
                                                    <thead className="text-[14px] text-gray-700 uppercase bg-gray-100 whitespace-nowrap">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left w-[200px] min-w-[200px]">Product Id</th>
                                                            <th scope="col" className="px-6 py-3 text-left w-[300px] min-w-[300px]">Product Title</th>
                                                            <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">Image</th>
                                                            <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">Quantity</th>
                                                            <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">Price</th>
                                                            <th scope="col" className="px-6 py-3 text-left w-[100px] min-w-[100px]">SubTotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            item?.products?.map((productItem, index) => (
                                                                <tr key={index} className="bg-white border-b hover:bg-gray-50 transition">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                        {productItem?.productId}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-normal break-words text-left">
                                                                        {productItem?.productTitle}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                        <div className="!w-[50px] !h-[50px]">
                                                                            <img
                                                                                src={productItem?.image}
                                                                                alt=""
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-left">{productItem?.quantity}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                        {productItem?.price ? productItem.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '₹0'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                                                        {productItem?.subTotal ? productItem.subTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '₹0'}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }
                        </>
                    ))
                ) : (
                    <tr className="w-full">
                        <td colSpan="100%" className="w-full text-center py-6" style={{ width: "100%" }}>
                            <div className="flex flex-col items-center justify-center w-full">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4076/4076484.png"
                                    alt="Empty Orders"
                                    className="w-32 h-32 mb-4 opacity-70"
                                />
                                <h2 className="text-xl font-semibold text-gray-700">
                                    {allOrders.length === 0 ? "No Orders Received Yet" : "No Matching Orders Found"}
                                </h2>
                                <p className="text-gray-500">
                                    {allOrders.length === 0
                                        ? "Looks like orders are not placed yet."
                                        : "Try changing the filter criteria."}
                                </p>
                            </div>
                        </td>
                    </tr>


                )
                }
            </tbody>
        </table> */}
            </div >

            <div className="p-4 flex items-center justify-center overflow-x-auto w-full">
                <div className="customScroll flex overflow-x-auto w-max py-5">
                    <Pagination
                        count={Math.ceil(filteredOrders.length / rowsPerPage)}
                        page={pageOrder}
                        onChange={(event, value) => setPageOrder(value)}
                        showFirstButton
                        showLastButton
                        className="min-w-max"
                    />
                </div>
            </div>

        </div >
    )
}

export default Orders
