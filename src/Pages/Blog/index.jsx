import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { MdOutlineEdit } from 'react-icons/md'
import { MyContext } from '../../App'
import toast from 'react-hot-toast'
import { deleteData, deleteMultipleData, fetchDataFromApi } from '../../utils/api'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import DOMPurify from 'dompurify';


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const columns = [
    { id: 'image', label: 'IMAGE', minWidth: 100, align: 'left' },
    { id: 'title', label: 'TITLE', minWidth: 300, align: 'left' },
    { id: 'description', label: 'DESCRIPTION', minWidth: 400, align: 'left' },
    { id: 'action', label: 'Action', minWidth: 100, align: 'left' },
];

const BlogList = () => {

    const context = useContext(MyContext);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    // States to manage selected rows and select all functionality
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle Select All
    const handleSelectAll = () => {
        if (!context?.blogData || context?.blogData.length === 0) {
            console.warn("Blog data is empty or undefined.");
            return;
        }

        if (selectAll) {
            setSelectedRows([]); // Uncheck all
        } else {
            const allRows = context?.blogData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((blog) => blog._id); // Access blog._id correctly
            setSelectedRows(allRows);
        }
        setSelectAll(!selectAll); // Toggle selectAll state
    };

    // Handle Row Select or Deselect
    const handleRowCheckboxChange = (blog) => {
        const isBannerSelected = selectedRows.includes(blog._id); // Check with blog._id

        const newSelectedRows = isBannerSelected
            ? selectedRows.filter((id) => id !== blog._id)
            : [...selectedRows, blog._id];

        setSelectedRows(newSelectedRows);

        // Check if all rows on the page are selected
        const currentPageRows = context?.blogData // ✅ FIXED: Use blogData, not setBlogData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((blog) => blog._id); // Compare using blog._id

        setSelectAll(newSelectedRows.length === currentPageRows.length);
    };

    // Check if a row is selected
    const isRowSelected = (blog) => selectedRows.includes(blog._id); // Compare using blog._id


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        fetchDataFromApi("/api/blog").then((res) => {
            console.log(res?.data);
            context?.setBlogData(res?.data);
        })
    }, [context?.setBlogData, context.isReducer]);

    const handleEditBlog = (blogId) => {
        console.log("blogPage - Blog ID :", blogId);

        context.setIsOpenFullScreenPanel({
            open: true,
            model: "Blog Details",
            blogId: blogId,
        });
    };

    const handleDeleteBlog = async (e, blogId) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await toast.promise(
                deleteData(`/api/blog/${blogId}`),
                {
                    loading: "Deleting blog... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            fetchDataFromApi("/api/blog").then((updatedData) => {

                                context?.setBlogData(updatedData?.data);

                            });
                            return res.message || "Blog deleted successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err?.response?.data?.message || err.message || "Failed to delete blog. Please try again.";
                    },
                }
            );

            console.log("Delete Result:", result);
        } catch (err) {
            console.error("Error in handleDeleteBlog:", err);
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
                throw new Error("Invalid blog IDs.");
            }

            // Convert array to comma-separated string
            const idsQueryParam = selectedRows.join(',');

            // Send DELETE request with IDs as query parameters
            const result = await toast.promise(
                deleteMultipleData(`/api/blog/delete-multiple-blogs?ids=${idsQueryParam}`),
                {
                    loading: "Deleting blog(s)... Please wait.",
                    success: (response) => {
                        if (response.success) {
                            // Update UI to remove the deleted slides
                            context?.setBlogData((prevData) =>
                                prevData.filter((slide) => !selectedRows.includes(slide._id))
                            );
                            setSelectedRows([]); // Clear selected rows after successful deletion
                            setSelectAll(false); // Uncheck "Select All" checkbox
                            return response.message || "Blog(s) deleted successfully!";
                        } else {
                            throw new Error(response.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err.message || "Failed to delete blog(s). Please try again.";
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
                <h2 className='text-[20px] font-bold'>Blog List <span className="font-normal text-[12px]">MUI</span></h2>
                <div className='col w-full sm:w-[150px] ml-auto flex items-center justify-end gap-3'>
                    <Button className='!bg-[var(--bg-primary)] !text-white flex items-center gap-1 !capitalize w-full !px-5' onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Blog Details' })}><GoPlus className='text-[20px] hidden sm:block' />Add Blog</Button>
                </div>
            </div>

            {/* <div className="card my-4 bg-white border rounded-md px-1 pt-1 w-full">
                <TableContainer className="customScroll overflow-x-auto">
                    <Table sx={{ minWidth: 800 }} stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="px-6 py-2 text-left w-[60px]">
                                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth, whiteSpace: 'nowrap' }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {context?.blogData?.length !== 0 &&
                                context?.blogData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((item, index) => {
                                    return (
                                        <TableRow key={index} className={`${isRowSelected(item) ? "!bg-blue-100" : ""}`}>
                                            <TableCell>
                                                <Checkbox checked={isRowSelected(item)} onChange={() => handleRowCheckboxChange(item)} />
                                            </TableCell>
                                            <TableCell style={{ minWidth: 250 }}>
                                                <div className="flex items-start gap-4 w-[176px] h-[100px] sm:w-[250px] sm:h-[142px]">
                                                    <div className="img w-full h-full overflow-hidden rounded-md shadow-md group">
                                                        <LazyLoadImage
                                                            alt="homeSlide_img"
                                                            effect="blur"
                                                            src={item.images[0]}
                                                            className="w-full h-full object-contain hover:scale-110 transition-all duration-300"
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell style={{ minWidth: 300 }}>
                                                <span className="text-[15px] font-medium">{item?.title}</span>
                                            </TableCell>

                                            <TableCell style={{ minWidth: 400 }}>
                                                <span className="text-[15px] font-medium text-justify">
                                                    {item?.description?.replace(/<[^>]+>/g, '').substr(0, 150) +
                                                        (item?.description?.length > 150 ? '...' : '')}
                                                </span>
                                            </TableCell>

                                            <TableCell style={{ minWidth: 100 }}>
                                                <div className="flex items-center gap-2">
                                                    <Tooltip title="Edit Product" arrow placement="top">
                                                        <Button
                                                            className="!h-[35px] !w-[35px] !min-w-[35px] !bg-blue-500 !text-white shadow"
                                                            onClick={() => {
                                                                handleEditBlog(item?._id);
                                                            }}
                                                        >
                                                            <MdOutlineEdit className="text-[35px]" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Product" arrow placement="top">
                                                        <Button
                                                            className="!h-[35px] !w-[35px] !min-w-[35px] !bg-red-500 !text-white shadow"
                                                            onClick={(e) => {
                                                                handleDeleteBlog(e, item?._id);
                                                            }}
                                                        >
                                                            <RiDeleteBin6Line className="text-[35px]" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                            {(context?.blogData?.length === 0 || !context?.blogData) && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" style={{ height: 300 }}>
                                        <span className="text-[var(--text-light)] text-[14px] font-regular flex items-center justify-center gap-2">
                                            &#128193; No Records Available
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {selectedRows.length > 0 && (
                    <div className="!sticky !bottom-0 !left-0 z-10 mt-2.5 flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4">
                        <span>
                            <span className="font-bold">{selectedRows.length}</span> blog{selectedRows.length > 1 ? 's' : ''} selected
                        </span>
                        <Button
                            type="reset"
                            onClick={(e) => handleDeleteSelectedRow(e, selectedRows)}
                            className="!bg-red-500 !text-white !capitalize w-auto !px-5 h-[40px] flex items-center justify-center gap-2"
                        >
                            <RiDeleteBin6Line className="text-[18px] hidden sm:block" />
                            Delete
                        </Button>
                    </div>
                )}

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={context?.blogData?.length || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    className='customScroll'
                />
            </div> */}

            <div className="card my-4 bg-white border rounded-md px-1 pt-1 w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: 'calc(100vh - 200px)' }}>
                <TableContainer className="customScroll overflow-x-auto flex-grow">
                    <Table sx={{ minWidth: 800 }} stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                <TableCell className="px-6 py-2 text-left w-[60px]">
                                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth, whiteSpace: 'nowrap' }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {context?.blogData?.length !== 0 &&
                                context?.blogData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((item, index) => {
                                    return (
                                        <TableRow key={index} className={`${isRowSelected(item) ? "!bg-blue-100" : ""}`}>
                                            <TableCell>
                                                <Checkbox checked={isRowSelected(item)} onChange={() => handleRowCheckboxChange(item)} />
                                            </TableCell>
                                            <TableCell style={{ minWidth: 250 }}>
                                                <div className="flex items-start gap-4 w-[176px] h-[100px] sm:w-[250px] sm:h-[142px]">
                                                    <div className="img w-full h-full overflow-hidden rounded-md shadow-md group">
                                                        <LazyLoadImage
                                                            alt="homeSlide_img"
                                                            effect="blur"
                                                            src={item.images[0]}
                                                            className="w-full h-full object-contain hover:scale-110 transition-all duration-300"
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell style={{ minWidth: 300 }}>
                                                <span className="text-[15px] font-medium">{item?.title}</span>
                                            </TableCell>

                                            <TableCell style={{ minWidth: 400 }}>
                                                <span className="text-[15px] font-medium text-justify">
                                                    {item?.description?.replace(/<[^>]+>/g, '').substr(0, 150) +
                                                        (item?.description?.length > 150 ? '...' : '')}
                                                </span>
                                            </TableCell>

                                            <TableCell style={{ minWidth: 100 }}>
                                                <div className="flex items-center gap-2">
                                                    <Tooltip title="Edit Product" arrow placement="top">
                                                        <Button
                                                            className="!h-[35px] !w-[35px] !min-w-[35px] !bg-blue-500 !text-white shadow"
                                                            onClick={() => {
                                                                handleEditBlog(item?._id);
                                                            }}
                                                        >
                                                            <MdOutlineEdit className="text-[35px]" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Product" arrow placement="top">
                                                        <Button
                                                            className="!h-[35px] !w-[35px] !min-w-[35px] !bg-red-500 !text-white shadow"
                                                            onClick={(e) => {
                                                                handleDeleteBlog(e, item?._id);
                                                            }}
                                                        >
                                                            <RiDeleteBin6Line className="text-[35px]" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                            {(context?.blogData?.length === 0 || !context?.blogData) && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" style={{ height: 300 }}>
                                        <span className="text-[var(--text-light)] text-[14px] font-regular flex items-center justify-center gap-2">
                                            &#128193; No Records Available
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <div className="sticky bottom-0 bg-white border-t z-10">
                    {selectedRows.length > 0 && (
                        <div className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4">
                            <span>
                                <span className="font-bold">{selectedRows.length}</span> blog{selectedRows.length > 1 ? 's' : ''} selected
                            </span>
                            <Button
                                type="reset"
                                onClick={(e) => handleDeleteSelectedRow(e, selectedRows)}
                                className="!bg-red-500 !text-white !capitalize w-auto !px-5 h-[40px] flex items-center justify-center gap-2"
                            >
                                <RiDeleteBin6Line className="text-[18px] hidden sm:block" />
                                Delete
                            </Button>
                        </div>
                    )}

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={context?.blogData?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        className='customScroll'
                    />
                </div>
            </div>
        </>
    )
}

export default BlogList
