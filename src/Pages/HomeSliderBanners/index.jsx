import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { RiDeleteBin6Line, RiDownloadCloud2Line } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { MdOutlineEdit } from 'react-icons/md'
import { IoEyeOutline } from 'react-icons/io5'
import { MyContext } from '../../App'
import toast from 'react-hot-toast'
import { deleteData, deleteMultipleData, fetchDataFromApi } from '../../utils/api'
import { LazyLoadImage } from 'react-lazy-load-image-component'


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const columns = [
    { id: 'image', label: 'IMAGE', minWidth: 250, align: 'left' },
    { id: 'action', label: 'ACTION', minWidth: 100, align: 'left' },
];

const HomeSliderBanners = () => {

    const context = useContext(MyContext);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    // States to manage selected rows and select all functionality
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Handle Select All
    const handleSelectAll = () => {
        if (!context?.homeSlideData || context?.homeSlideData.length === 0) {
            console.warn("Home Slide data is empty or undefined.");
            return;
        }

        if (selectAll) {
            setSelectedRows([]); // Uncheck all
        } else {
            const allRows = context?.homeSlideData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((image) => image._id); // Correct access to image._id
            setSelectedRows(allRows);
        }
        setSelectAll(!selectAll); // Toggle selectAll state
    };

    // Handle Row Select or Deselect
    const handleRowCheckboxChange = (image) => {
        const isBannerSelected = selectedRows.includes(image._id); // Correct comparison using image._id

        const newSelectedRows = isBannerSelected
            ? selectedRows.filter((id) => id !== image._id)
            : [...selectedRows, image._id];

        setSelectedRows(newSelectedRows);

        // Check if all rows on the page are selected
        const currentPageRows = context?.homeSlideData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((image) => image._id); // Correct comparison with image._id

        setSelectAll(newSelectedRows.length === currentPageRows.length);
    };

    // Check if a row is selected
    const isRowSelected = (image) => selectedRows.includes(image._id); // Correct comparison with image._id



    // const handleChangeCategoryFilterValue = (event) => {
    //     setCategoryFilterValue(event.target.value);
    //     setPage(0); // Reset to first page on category change
    // };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    useEffect(() => {
        fetchDataFromApi("/api/homeSlides").then((res) => {
            console.log(res?.data);
            context?.setHomeSlideData(res?.data);
        })
    }, [context?.setHomeSlideData, context?.isReducer]);

    const handleEditHomeSLide = (homeSlideId) => {
        console.log("homeSlidePage - HomeSlide ID :", homeSlideId);

        context.setIsOpenFullScreenPanel({
            open: true,
            model: "Home Banner Details",
            homeSlideId: homeSlideId,
        });
    };

    const handleDeleteHomeSlide = async (e, homeSlideId) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await toast.promise(
                deleteData(`/api/homeSlides/${homeSlideId}`),
                {
                    loading: "Deleting homeSlide... Please wait.",
                    success: (res) => {
                        if (res?.success) {
                            fetchDataFromApi("/api/homeSlides").then((updatedData) => {

                                context?.setHomeSlideData(updatedData?.data);

                            });
                            return res.message || "HomeSlide deleted successfully!";
                        } else {
                            throw new Error(res?.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err?.response?.data?.message || err.message || "Failed to delete HomeSlide. Please try again.";
                    },
                }
            );

            console.log("Delete Result:", result);
        } catch (err) {
            console.error("Error in handleDeleteHomeSlide:", err);
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
                deleteMultipleData(`/api/homeSlides/delete-homeSlide-image?ids=${idsQueryParam}`),
                {
                    loading: "Deleting Home Slide(s)... Please wait.",
                    success: (response) => {
                        if (response.success) {
                            // Update UI to remove the deleted slides
                            context?.setHomeSlideData((prevData) =>
                                prevData.filter((slide) => !selectedRows.includes(slide._id))
                            );
                            setSelectedRows([]); // Clear selected rows after successful deletion
                            setSelectAll(false); // Uncheck "Select All" checkbox
                            return response.message || "Home Slide(s) deleted successfully!";
                        } else {
                            throw new Error(response.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err.message || "Failed to delete Home Slide(s). Please try again.";
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
            <div className='grid grid-cols-1 sm:grid-cols-2 items-center my-4 mt-14 gap-2'>
                <h2 className='text-[20px] font-bold'>Home Slider Banners <span className="font-normal text-[12px]">MUI</span></h2>
                <div className='col w-full sm:w-[200px]  ml-auto flex items-center justify-end gap-3'>
                    <Button className='!bg-[var(--bg-primary)] !w-full !h-auto !px-3 !text-white flex items-center gap-1 !capitalize' onClick={() => context.setIsOpenFullScreenPanel({ open: true, model: 'Home Banner Details' })}><GoPlus className='text-[20px]' /><span className="block">Add Home Banner</span></Button>
                </div>
            </div>

            <div className="card my-4 bg-white border rounded-md px-1 pt-1">

                <TableContainer className='max-h-[440px] customScroll'>
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
                                context?.homeSlideData?.length !== 0 && context?.homeSlideData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((image, index) => {
                                    return (
                                        <TableRow key={index} className={`${isRowSelected(image) ? "!bg-blue-100" : ""}`}>
                                            <TableCell>
                                                <Checkbox checked={isRowSelected(image)} onChange={() => handleRowCheckboxChange(image)} />
                                            </TableCell>
                                            <TableCell width={300}>
                                                <div className="flex items-start gap-4 w-[206px] h-[60px] sm:w-[340px] sm:h-[100px]">
                                                    <div className='img w-full h-full overflow-hidden rounded-md shadow-md group'>
                                                        <LazyLoadImage
                                                            alt="homeSlide_img"
                                                            effect="blur"
                                                            src={image.images[0]}
                                                            className='w-full h-full object-cover hover:scale-110 !transition-all !duration-300'
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell width={100}>
                                                <div className='flex items-center gap-2'>
                                                    <Tooltip title="Edit Product" arrow placement="top">
                                                        <Button className='!h-[35px] !w-[35px] !min-w-[35px] !bg-blue-500 !text-white shadow' onClick={() => { handleEditHomeSLide(image?._id,); }}><MdOutlineEdit className='text-[35px]' /></Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Product" arrow placement="top">
                                                        <Button className='!h-[35px] !w-[35px] !min-w-[35px] !bg-red-500 !text-white shadow' onClick={(e) => { handleDeleteHomeSlide(e, image?._id,) }}><RiDeleteBin6Line className='text-[35px]' /></Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }

                            {
                                context?.homeSlideData.length === 0 &&
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
                            className='!capitalize !bg-red-500 !text-white !px-5 w-auto h-[40px] flex items-center justify-center gap-2'
                        >
                            <RiDeleteBin6Line className='text-[18px] hidden sm:block' />Delete
                        </Button>
                    </div>

                }

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    component="div"
                    count={context?.homeSlideData?.length}
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

export default HomeSliderBanners
