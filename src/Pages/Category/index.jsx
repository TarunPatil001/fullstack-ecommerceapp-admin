import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material'
import { useContext, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { RiDeleteBin6Line, RiDownloadCloud2Line } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { MdOutlineEdit } from 'react-icons/md'
import { IoEyeOutline } from 'react-icons/io5'
import { MyContext } from '../../App'
import { useEffect } from 'react'
import { deleteData, deleteMultipleData, editData, fetchDataFromApi } from '../../utils/api'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import toast from 'react-hot-toast'


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const columns = [
    { id: 'image', label: 'IMAGE', minWidth: 150, align: 'left' },
    { id: 'categoryName', label: 'CATEGORY NAME', minWidth: 250, align: 'left' },
    { id: 'action', label: 'ACTION', minWidth: 100, align: 'left' },
];

const CategoryList = () => {

    const context = useContext(MyContext);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);


    // States to manage selected rows and select all functionality
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle Select All
    const handleSelectAll = () => {
        if (!context?.catData || context?.catData.length === 0) {
            console.warn("Home Slide data is empty or undefined.");
            return;
        }

        if (selectAll) {
            setSelectedRows([]); // Uncheck all
        } else {
            const allRows = context?.catData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => item._id); // Correct access to item._id
            setSelectedRows(allRows);
        }
        setSelectAll(!selectAll); // Toggle selectAll state
    };

    // Handle Row Select or Deselect
    const handleRowCheckboxChange = (item) => {
        const isBannerSelected = selectedRows.includes(item._id); // Correct comparison using item._id

        const newSelectedRows = isBannerSelected
            ? selectedRows.filter((id) => id !== item._id)
            : [...selectedRows, item._id];

        setSelectedRows(newSelectedRows);

        // Check if all rows on the page are selected
        const currentPageRows = context?.catData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item) => item._id); // Correct comparison with item._id

        setSelectAll(newSelectedRows.length === currentPageRows.length);
    };

    // Check if a row is selected
    const isRowSelected = (item) => selectedRows.includes(item._id); // Correct comparison with item._id

    const handleChangeCategoryFilterValue = (event) => {
        setCategoryFilterValue(event.target.value);
        setPage(0); // Reset to first page on category change
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };



    const handleEditCategory = (categoryId, categoryName) => {
        console.log("CatListPage - Category ID :", categoryId);
        console.log("CatListPage - Category Name :", categoryName);

        context.setIsOpenFullScreenPanel({
            open: true,
            model: "Category Details",
            categoryId: categoryId,
            categoryName: categoryName,
        });
    };

    const handleDeleteCategory = async (e, categoryId) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await toast.promise(
                deleteData(`/api/category/${categoryId}`),
                {
                    loading: "Deleting category... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            fetchDataFromApi("/api/category").then((updatedData) => {
                                context?.setCatData(updatedData?.data);
                            });
                            return res.message || "Category deleted successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err?.response?.data?.message || err.message || "Failed to delete category. Please try again.";
                    },
                }
            );

            console.log("Delete Result:", result);
        } catch (err) {
            console.error("Error in handleDeleteCategory:", err);
            toast.error(err?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleDeleteSelectedRow = async (e, selectedRows) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log("Selected Rows:", selectedRows);

            // Validate selectedRows
            if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
                throw new Error("Invalid Home Slide IDs.");
            }

            // Convert array to comma-separated string
            const idsQueryParam = selectedRows.join(',');

            // Send DELETE request with IDs as query parameters
            const result = await toast.promise(
                deleteMultipleData(`/api/category/delete-multiple-categories?ids=${idsQueryParam}`),
                {
                    loading: "Deleting category(s)... Please wait.",
                    success: (response) => {
                        if (response.success) {
                            // Update UI to remove the deleted slides
                            context?.setCatData((prevData) =>
                                prevData.filter((category) => !selectedRows.includes(category._id))
                            );
                            setSelectedRows([]); // Clear selected rows after successful deletion
                            setSelectAll(false); // Uncheck "Select All" checkbox
                            return response.message || "Category(s) deleted successfully!";
                        } else {
                            throw new Error(response.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err.message || "Failed to delete category(s). Please try again.";
                    },
                }
            );

            console.log("Delete Result:", result);
        } catch (err) {
            console.error("Error in handleDeleteSelectedRow:", err);
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 mt-14'>
                <h2 className='text-[20px] font-bold'>Category List<span className="font-normal text-[12px]">MUI</span></h2>
                <div className='col w-full sm:w-[150px] ml-auto flex items-center justify-end gap-3'>
                    <Button className='!bg-[var(--bg-primary)] w-full h-auto sm:w-[150px] !px-3 !text-white flex items-center gap-1 !capitalize' onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Category Details' })}><GoPlus className='text-[20px] hidden sm:block' />Add Category</Button>
                </div>
            </div>

            <div className="card my-4 bg-white border rounded-md px-1 pt-1">

                <TableContainer className='customScroll overflow-x-scroll max-h-[500px]'>
                    <Table stickyHeader aria-label="sticky table">

                        <TableHead>
                            <TableRow>
                                <TableCell className="px-6 py-2 text-left w-[60px]">
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell
                                        width={column.minWidth}
                                        key={column.id}
                                        align={column.align}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>

                            {
                                context?.catData?.length !== 0 && context?.catData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((item, index) => {
                                    return (
                                        <TableRow key={index} className={`${isRowSelected(item) ? "!bg-blue-100" : ""}`}>
                                            <TableCell>
                                                <Checkbox checked={isRowSelected(item)} onChange={() => handleRowCheckboxChange(item)} />
                                            </TableCell>

                                            <TableCell width={100}>
                                                <div className='shadow w-[80px] h-[80px] p-1 overflow-hidden rounded-md flex items-center justify-center'>
                                                    <Link to="/product/458457" className='w-full h-full overflow-hidden flex items-center justify-center'>
                                                        <LazyLoadImage
                                                            alt="product_img"
                                                            effect="blur"
                                                            src={item.images[0]}
                                                            className='w-full h-full object-contain hover:scale-110 !transition-all !duration-300'
                                                        />
                                                    </Link>
                                                </div>
                                            </TableCell>

                                            <TableCell width={100}>
                                                <span>{item?.name}</span>
                                            </TableCell>

                                            <TableCell width={100}>
                                                <div className='flex items-center gap-2'>
                                                    <Tooltip title="Edit Product" arrow placement="top">
                                                        <Button className='!h-[35px] !w-[35px] !min-w-[35px] !bg-[#f1f1f1] !text-[var(--text-light)] shadow' onClick={() => { handleEditCategory(item?._id, item?.name); }}><MdOutlineEdit className='text-[35px]' /></Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Product" arrow placement="top">
                                                        <Button className='!h-[35px] !w-[35px] !min-w-[35px] !bg-[#f1f1f1] !text-[var(--text-light)] shadow' onClick={(e) => { handleDeleteCategory(e, item?._id) }}><RiDeleteBin6Line className='text-[35px]' /></Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }

                            {
                                context?.catData?.length === 0 &&
                                <TableRow>
                                    <TableCell colSpan={8} align="center" style={{ height: 300 }}>
                                        <span className="text-[var(--text-light)] text-[14px] font-regular flex items-center justify-center gap-2">
                                            &#128193; No Records Available
                                        </span>
                                    </TableCell>
                                </TableRow>
                            }



                        </TableBody>
                    </Table>
                </TableContainer>


                {
                    selectedRows.length > 0 &&

                    <div className='sticky bottom-0 left-0 z-10 mt-2.5 flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4'>
                        {selectedRows.length > 0 && (
                            <span>
                                <span className='font-bold'>{selectedRows.length}</span> banner{selectedRows.length > 1 ? 's' : ''} selected
                            </span>
                        )}
                        <Button
                            type="reset"
                            onClick={(e) => handleDeleteSelectedRow(e, selectedRows)}
                            className='!bg-red-500 !text-white w-[150px] h-[40px] flex items-center justify-center gap-2'
                        >
                            <RiDeleteBin6Line className='text-[20px]' />Delete
                        </Button>
                    </div>

                }


                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={context?.catData?.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    className='customScroll'
                />

            </div>

        </>
    )
}

export default CategoryList
