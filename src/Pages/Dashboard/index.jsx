import { useState, useContext, useMemo } from 'react'
import { MyContext } from '../../App'
import DashboardBoxes from '../../Components/DashboardBoxes'
import { Button } from '@mui/material'
import { FiPlus } from "react-icons/fi";
import { useLocation, useNavigate } from 'react-router-dom';
import { GoDotFill } from "react-icons/go";
import { CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartTooltip, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { useEffect } from 'react'
import { fetchDataFromApi } from '../../utils/api'
import Products from '../Products'
import Orders from '../Orders'

// const label = { inputProps: { 'aria-label': 'Checkbox demo' } };


// const columns = [
//   {
//     id: 'product',
//     label: 'PRODUCT',
//     minWidth: 150,
//     align: 'left'
//   },
//   {
//     id: 'category',
//     label: 'BROAD CATEGORY',
//     minWidth: 170,
//     align: 'left'
//   },
//   {
//     id: 'subCategory',
//     label: 'SUB CATEGORY',
//     minWidth: 150,
//     align: 'left'
//   },
//   {
//     id: 'subCategory',
//     label: 'SPECIFIC CATEGORY',
//     minWidth: 180,
//     align: 'left'
//   },
//   {
//     id: 'price',
//     label: 'PRICE',
//     minWidth: 100,
//     align: 'left',
//     format: (value) => `$${value.toFixed(2)}`,
//   },
//   {
//     id: 'sales',
//     label: 'SALES',
//     minWidth: 130,
//     align: 'center'
//   },
//   {
//     id: 'rating',
//     label: 'RATING',
//     minWidth: 100,
//     align: 'center'
//   },
//   {
//     id: 'action',
//     label: 'ACTION',
//     minWidth: 130,
//     align: 'center'
//   },
// ];


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: "auto",
//     },
//   },
// };


const Dashboard = () => {

  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [isOpenOrder, setIsOpenOrder] = useState(null);

  // const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryFilterValue, setCategoryFilterValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  // const [refreshData, setRefreshData] = useState(false); 

  const [productData, setProductData] = useState([]);
  // State to manage the selected categories for each level
  const [productCategory, setProductCategory] = useState([]);
  const [productCategory2, setProductCategory2] = useState([]);
  const [productCategory3, setProductCategory3] = useState([]);
  // const [subCategories, setSubCategories] = useState([]);
  // const [thirdLevelCategories, setThirdLevelCategories] = useState([]);

  // States to manage selected rows and select all functionality
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [pageOrder, setPageOrder] = useState(1); // 1-based index to match backend
  const [searchQuery, setSearchQuery] = useState('')
  const [allOrders, setAllOrders] = useState([]); // Stores all orders globally
  const [filteredOrders, setFilteredOrders] = useState([]); // Stores search results
  const [rowsPerPage2, setRowsPerPage2] = useState(4);

  const [users, setUsers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [overallTotalSales, setOverallTotalSales] = useState(0);

  const [chartData, setChartData] = useState([]);
  // const [year, setYear] = useState(new Date().getFullYear());
  // const location = useLocation();


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token !== undefined && token !== null && token !== '') {
      context?.setIsLogin(true);
    } else {
      navigate("/sign-in");
    }
  }, [context?.setIsLogin, navigate]);

  useEffect(()=>{
    window.scrollTo(0, 0);
  },[])

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Construct query parameters dynamically
      const queryParams = new URLSearchParams();

      // Append category, subcategory, and thirdSubCategory filters if they exist
      if (productCategory.length > 0) {
        queryParams.append("categoryIds", productCategory.join(","));
      }
      if (productCategory2.length > 0) {
        queryParams.append("subCategoryIds", productCategory2.join(","));
      }
      if (productCategory3.length > 0) {
        queryParams.append("thirdSubCategoryIds", productCategory3.join(","));
      }

      // Edge case: No categories selected, fetch all products
      let query = "/api/product/get-all-products";

      // Apply filters only when any category type is selected
      if (queryParams.toString().length > 0) {
        query = `/api/product/get-all-filtered-products?${queryParams.toString()}`;
      }

      // Append pagination and other filtering parameters
      queryParams.append("page", page);
      queryParams.append("perPage", rowsPerPage);
      if (categoryFilterValue) {
        queryParams.append("categoryFilter", categoryFilterValue);
      }

      // Fetch filtered data
      const res = await fetchDataFromApi(query);
      setProductData(res?.data || []);
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch products when categories or filters change
    fetchProducts();
  }, [productCategory, productCategory2, productCategory3, page, rowsPerPage, categoryFilterValue, context?.isReducer]);



  // const isShowOrderedProduct = (index) => {
  //   if (isOpenOrder === index) {
  //     setIsOpenOrder(null);
  //   } else {
  //     setIsOpenOrder(index);
  //   }
  // }


  // // Handle Category Change
  // const handleChangeProductCategory = (event) => {
  //   const selectedCategories = event.target.value;
  //   setProductCategory(selectedCategories);

  //   // If a category is removed, reset subcategories and third-level categories
  //   if (selectedCategories.length === 0) {
  //     setProductCategory2([]);
  //     setProductCategory3([]);
  //     setSubCategories([]);
  //     setThirdLevelCategories([]);
  //   } else {
  //     // Filter subcategories based on the selected categories
  //     const newSubCategories = filterSubCategories(selectedCategories);
  //     setSubCategories(newSubCategories);

  //     // If no subcategories are found, reset subcategory and third-level category selections
  //     if (newSubCategories.length === 0) {
  //       setProductCategory2([]);
  //       setProductCategory3([]);
  //       setThirdLevelCategories([]);
  //     } else {
  //       // Reset third-level categories if the selected subcategories are no longer valid
  //       const validSubCategories = productCategory2.filter((subCatId) =>
  //         newSubCategories.some((subCat) => subCat._id === subCatId)
  //       );
  //       setProductCategory2(validSubCategories);

  //       if (validSubCategories.length === 0) {
  //         setProductCategory3([]);
  //         setThirdLevelCategories([]);
  //       } else {
  //         // Filter third-level categories based on the valid subcategories
  //         const newThirdLevelCategories = filterThirdLevelCategories(validSubCategories);
  //         setThirdLevelCategories(newThirdLevelCategories);

  //         // If no third-level categories are found, reset third-level category selections
  //         if (newThirdLevelCategories.length === 0) {
  //           setProductCategory3([]);
  //         } else {
  //           // Reset third-level categories if the selected third-level categories are no longer valid
  //           const validThirdLevelCategories = productCategory3.filter((thirdCatId) =>
  //             newThirdLevelCategories.some((thirdCat) => thirdCat._id === thirdCatId)
  //           );
  //           setProductCategory3(validThirdLevelCategories);
  //         }
  //       }
  //     }
  //   }
  // };

  // // Handle Subcategory Change
  // const handleChangeProductCategory2 = (event) => {
  //   const selectedSubCategories = event.target.value;
  //   setProductCategory2(selectedSubCategories);

  //   // If a subcategory is removed, reset third-level categories
  //   if (selectedSubCategories.length === 0) {
  //     setProductCategory3([]);
  //     setThirdLevelCategories([]);
  //   } else {
  //     // Filter third-level categories based on the selected subcategories
  //     const newThirdLevelCategories = filterThirdLevelCategories(selectedSubCategories);
  //     setThirdLevelCategories(newThirdLevelCategories);

  //     // If no third-level categories are found, reset third-level category selections
  //     if (newThirdLevelCategories.length === 0) {
  //       setProductCategory3([]);
  //     } else {
  //       // Reset third-level categories if the selected third-level categories are no longer valid
  //       const validThirdLevelCategories = productCategory3.filter((thirdCatId) =>
  //         newThirdLevelCategories.some((thirdCat) => thirdCat._id === thirdCatId)
  //       );
  //       setProductCategory3(validThirdLevelCategories);
  //     }
  //   }
  // };

  // // Handle Third-level Category Change
  // const handleChangeProductCategory3 = (event) => {
  //   const selectedThirdLevelCategories = event.target.value;
  //   setProductCategory3(selectedThirdLevelCategories);
  // };

  // // Filter Subcategories based on Category Selection
  // const filterSubCategories = (categoryIds) => {
  //   if (!context?.catData) return [];
  //   return context.catData
  //     .filter((cat) => categoryIds.includes(cat._id))
  //     .flatMap((cat) => cat.children || []);
  // };

  // // Filter Third-Level Categories based on Subcategory Selection
  // const filterThirdLevelCategories = (subCategoryIds) => {
  //   if (!context?.catData) return [];
  //   return context.catData
  //     .flatMap((cat) => cat.children || [])
  //     .filter((subCat) => subCategoryIds.includes(subCat._id))
  //     .flatMap((subCat) => subCat.children || []);
  // };

  // // Reset filters function
  // const resetFilters = () => {
  //   setProductCategory([]); // Reset selected categories
  //   setProductCategory2([]); // Reset selected subcategories
  //   setProductCategory3([]); // Reset selected third-level categories
  //   setSubCategories([]); // Clear subcategories
  //   setThirdLevelCategories([]); // Clear third-level categories
  // };


  // // Handle Select All
  // const handleSelectAll = () => {
  //   console.log("Select All Clicked: ", selectAll);
  //   if (selectAll) {
  //     setSelectedRows([]); // Uncheck all, clear selected rows array
  //     console.log("Unchecking all rows");
  //   } else {
  //     // Select all rows in the current page by storing only the _id
  //     const allRows = productData
  //       .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  //       .map(product => product._id);
  //     setSelectedRows(allRows); // Select all rows
  //     console.log("Selecting all rows with IDs: ", allRows);
  //   }
  //   setSelectAll(!selectAll); // Toggle selectAll state
  // };


  // // Handle Row Select or Deselect
  // const handleRowCheckboxChange = (product) => {
  //   console.log("Row Checkbox clicked for product: ", product);
  //   const isProductSelected = selectedRows.includes(product._id);
  //   console.log("Is Product Selected? ", isProductSelected);

  //   const newSelectedRows = isProductSelected
  //     ? selectedRows.filter(id => id !== product._id) // Remove product _id from selection
  //     : [...selectedRows, product._id]; // Add product _id to selection

  //   setSelectedRows(newSelectedRows);
  //   console.log("Updated selected rows (IDs): ", newSelectedRows);

  //   // Check if all rows are selected manually
  //   if (newSelectedRows.length === productData.length) {
  //     setSelectAll(true); // All rows are selected
  //     console.log("All rows selected");
  //   } else {
  //     setSelectAll(false); // Not all rows selected
  //     console.log("Not all rows selected");
  //   }
  // };


  // // Handle the rendering of individual row checkboxes
  // const isRowSelected = (product) => selectedRows.includes(product._id);

  useEffect(() => {
    console.log("Selected rows (IDs) updated: ", selectedRows);
  }, [selectedRows]);

  useEffect(() => {
    console.log("Select All status changed: ", selectAll);
  }, [selectAll]);

  useEffect(() => {
    console.log("Product Data: ", productData);
  }, [productData]);

  useEffect(() => {
    console.log("Page: ", page, "Rows Per Page: ", rowsPerPage);
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchDataFromApi('/api/user/get-all-user').then((res) => {
      if (res?.error === false) {
        setUsers(res?.data);
      }
    })

    fetchDataFromApi('/api/user/get-all-reviews').then((res) => {
      if (res?.error === false) {
        setAllReviews(res?.data);
      }
    })

    fetchDataFromApi('/api/product/get-total-sales').then((res) => {
      if (res?.error === false) {
        setOverallTotalSales(res?.totalSales);
      }
    })

    getTotalSalesByYear();
    getTotalUsersByYear();

  }, []);




  // const handleChangeCategoryFilterValue = (event) => {
  //   setCategoryFilterValue(event.target.value);
  //   setPage(0); // Reset to first page on category change
  // };

  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };

  // const filteredProductData = categoryFilterValue
  //   ? productData.filter((product) => product.categoryName === categoryFilterValue)
  //   : productData;

  // const emptyRows =
  //   page > 0
  //     ? Math.max(0, (1 + page) * rowsPerPage - filteredProductData.length)
  //     : 0;


  // const handleEditCategory = (productId, productName) => {
  //   console.log("ProductListPage - Product ID :", productId);
  //   console.log("ProductListPage - Product Name :", productName);

  //   context.setIsOpenFullScreenPanel({
  //     open: true,
  //     model: "Product Details",
  //     productId: productId,
  //     productName: productName,
  //   });
  // };



  // const handleDeleteProduct = async (e, productId) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     const result = await toast.promise(
  //       deleteData(`/api/product/${productId}`),
  //       {
  //         loading: "Deleting category... Please wait.",
  //         success: (res) => {
  //           if (res?.success) {
  //             setProductData((prevData) => prevData.filter(product => product._id !== productId));
  //             return res.message || "Product deleted successfully!";
  //           } else {
  //             throw new Error(res?.message || "An unexpected error occurred.");
  //           }
  //         },
  //         error: (err) => {
  //           return err?.response?.data?.message || err.message || "Failed to delete product. Please try again.";
  //         },
  //       }
  //     );

  //     console.log("Delete Result:", result);
  //   } catch (err) {
  //     console.error("Error in handleDeleteProduct:", err);
  //     toast.error(err?.message || "An unexpected error occurred.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  // const handleDeleteSelectedRow = async (e, selectedRows) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     console.log("Selected Rows:", selectedRows);

  //     // Validate selectedRows
  //     if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
  //       throw new Error("Invalid product IDs.");
  //     }

  //     // Convert array to comma-separated string
  //     const idsQueryParam = selectedRows.join(',');

  //     // Make DELETE request with query parameters
  //     const result = await toast.promise(
  //       deleteMultipleData(`/api/product/delete-multiple-products?ids=${idsQueryParam}`),
  //       {
  //         loading: "Deleting product(s)... Please wait.",
  //         success: (response) => {  // Removed async from here
  //           if (response.success) {
  //             // Update UI to remove the deleted products
  //             setProductData((prevData) =>
  //               prevData.filter((product) => !selectedRows.includes(product._id))
  //             );
  //             setSelectedRows([]); // Clear selected rows after successful deletion
  //             setSelectAll(false); // Uncheck "Select All" checkbox
  //             return response.message || "Product(s) deleted successfully!";
  //           } else {
  //             throw new Error(response.message || "An unexpected error occurred.");
  //           }
  //         },
  //         error: (err) => {
  //           return err.message || "Failed to delete product(s). Please try again.";
  //         },
  //       }
  //     );

  //     console.log("Delete Result:", result);
  //   } catch (err) {
  //     console.error("Error in handleDeleteSelectedRow:", err);
  //     toast.error(err.message || "An unexpected error occurred.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };




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
  // const paginatedOrders = useMemo(() => {
  //   const startIndex = (pageOrder - 1) * rowsPerPage2;
  //   return filteredOrders.slice(startIndex, startIndex + rowsPerPage2);
  // }, [filteredOrders, pageOrder, rowsPerPage2]);


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




  const getTotalUsersByYear = async () => {
    try {
      const res = await fetchDataFromApi(`/api/order/users`);
      if (!res?.monthlyUsers) return [];
  
      const users = res.monthlyUsers.map(item => ({
        name: item?.name || 'Unknown',
        Total_Users: parseInt(item?.TotalUsers) || 0,
      }));
  
      setChartData(prevData => mergeChartData(prevData, users));
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };
  
  const getTotalSalesByYear = async () => {
    try {
      const res = await fetchDataFromApi(`/api/order/sales`);
      if (!res?.monthlySales) return [];
  
      const sales = res.monthlySales.map(item => ({
        name: item?.name || 'Unknown',
        Total_Sales: parseInt(item?.TotalSales) || 0,
      }));
  
      setChartData(prevData => mergeChartData(prevData, sales));
      return sales;
    } catch (error) {
      console.error("Error fetching sales:", error);
      return [];
    }
  };
  
  // Merge sales and user data to prevent overriding existing values
  const mergeChartData = (prevData = [], newData = []) => {
    const dataMap = new Map(prevData.map(item => [item.name, { ...item }]));
  
    newData.forEach(newItem => {
      const existingItem = dataMap.get(newItem.name) || {};
      dataMap.set(newItem.name, { ...existingItem, ...newItem });
    });
  
    return Array.from(dataMap.values()).sort((a, b) => {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];
      return months.indexOf(a.name) - months.indexOf(b.name);
    });
  };

  // const handleAddStock = (productId, amount) => {
  //   setProductData(prevProducts =>
  //     prevProducts.map(product =>
  //       product._id === productId
  //         ? { ...product, countInStock: product.countInStock + amount }
  //         : product
  //     )
  //   );
  // };


  return (
    <>
      {/* {
        console.log("sale: ", overallTotalSales)
      } */}
      <div className={`w-full px-5 py-5 my-4 mt-14 lg:py-2 bg-white hover:bg-[var(--bg-hover-primary)] border border-[rgba(0,0,0,0.1)] flex items-center justify-between gap-8 mb-5 rounded-md `}>
        <div className="info">
          <h1 className='text-[28px] leading-10 sm:text-[35px] sm:leading-10 font-bold mb-2'>Hello &#128075;, <br /> <span className='text-[var(--bg-primary)]'> {context?.userData?.name} </span></h1>
          <p className='text-[16px]'>Here’s What happening on your store today. See the statistics at once.</p>
          <Button className='!mt-4 lg:!mt-10 flex items-center gap-1 !capitalize !text-[14px] !font-medium !text-white !bg-[var(--text-active)] !p-2 !px-4' onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Product Details' })}><FiPlus className='text-[18px]' />Add Product</Button>
        </div>
        <img src="/shop-illustration.webp" alt="image" className='w-[250px] hidden lg:block' />
      </div>

      {
        productData?.length !== 0 && users?.length !== 0 && allReviews?.length !== 0 &&
        <DashboardBoxes orders={allOrders?.length} products={productData?.length} users={users?.length - 1 || 0} reviews={allReviews?.length} category={context?.catData?.length} sales={overallTotalSales} />
      }

      <div className='-mt-9'>
      <Products />
      </div>

      <div className='-mt-9'>
      <Orders />
      </div>
      {/* <div className="card my-4 bg-white border rounded-md px-1">
        <div className='flex items-center justify-between p-5 gap-2 flex-col sm:flex-row'>
          <h2 className='text-[20px] font-bold w-full text-left'>Recent Orders</h2>
          <div className='w-[100%] sm:w-[100%] md:w-[100%] lg:w-[50%]'>
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
          <table className="w-full text-[14px] text-left rtl:text-right text-[var(--text-light)] rounded-md">
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
                        <Badge status={item?.order_status} />
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
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-center overflow-x-auto w-full">
          <div className="customScroll flex overflow-x-auto w-max py-5">
            <Pagination
              count={Math.ceil(filteredOrders.length / rowsPerPage2)}
              page={pageOrder}
              onChange={(event, value) => setPageOrder(value)}
              showFirstButton
              showLastButton
              className="min-w-max"
            />
          </div>
        </div>



      </div> */}

      <div className="card my-4 bg-white border rounded-md px-1">
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h2 className="text-[20px] font-bold">Total Sales & Total Users</h2>
        </div>

        <div className="flex items-center justify-start px-5 pt-2 pb-5 gap-5">
          <span className="flex items-center">
            <GoDotFill className="text-violet-500" /> Total Sales
          </span>
          <span className="flex items-center">
            <GoDotFill className="text-green-500" /> Total Users
          </span>
        </div>

        <div className="overflow-x-auto customScroll">
          <div className="h-[500px] min-w-[1200px]"> {/* Increased width */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                {/* Define gradients */}
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" opacity={0.7} />

                {/* Scrollable X-Axis */}
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  minTickGap={10}
                />

                {/* Fixed Y-Axis */}
                <YAxis tick={{ fontSize: 12 }} />

                <RechartTooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />

                {/* Apply gradient fills */}
                <Area
                  type="monotone"
                  dataKey="Total_Sales"
                  stroke="#8884d8"
                  fill="url(#colorSales)"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="Total_Users"
                  stroke="#82ca9d"
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>


    </>
  )
}

export default Dashboard
