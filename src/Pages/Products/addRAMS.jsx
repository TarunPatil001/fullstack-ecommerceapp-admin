import { Button, Checkbox, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { RiDeleteBin6Line, RiResetLeftFill } from 'react-icons/ri';
import { MyContext } from '../../App';
import { IoIosSave } from 'react-icons/io';
import { FiEdit } from 'react-icons/fi';
import { MdOutlineEdit } from 'react-icons/md';
import { deleteData, deleteMultipleData, editData, fetchDataFromApi, postData } from '../../utils/api';
import toast from 'react-hot-toast';

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const columns = [
    { id: 'productRams', label: 'PRODUCT RAMS', minWidth: 150, align: 'left' },
    { id: 'action', label: 'ACTION', minWidth: 130, align: 'left' },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: "auto",
        },
    },
};

const AddRAMS = () => {
    const context = useContext(MyContext);
    const [data, setData] = useState([]);
    const [ramId, setRamId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formFields, setFormFields] = useState({ name: '' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    // States to manage selected rows and select all functionality
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [categoryFilterValue, setCategoryFilterValue] = useState('');

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields((prevFields) => ({ ...prevFields, [name]: value }));
    };

    // Handle Select All
    const handleSelectAll = () => {
        if (!data || data.length === 0) {
            console.warn("ProductRams data is empty or undefined.");
            return;
        }

        if (selectAll) {
            setSelectedRows([]); // Uncheck all
        } else {
            const allRows = data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => item._id);
            setSelectedRows(allRows);
        }
        setSelectAll(!selectAll); // Toggle selectAll state
    };

    // Handle Row Select or Deselect
    const handleRowCheckboxChange = (item) => {
        const isProductSelected = selectedRows.includes(item._id);

        const newSelectedRows = isProductSelected
            ? selectedRows.filter((id) => id !== item._id)
            : [...selectedRows, item._id];

        setSelectedRows(newSelectedRows);

        // Check if all rows on the page are selected
        const currentPageProducts = data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item) => item._id);

        setSelectAll(newSelectedRows.length === currentPageProducts.length);
    };

    // Check if a row is selected
    const isRowSelected = (item) => selectedRows.includes(item?._id);


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



    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchDataFromApi('/api/product/productRams/get-all-productRams');
                setData(res?.data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, [context?.isReducer]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formFields.name.trim()) {
            context.openAlertBox('error', 'Please enter product RAM name');
            return;
        }

        setIsLoading(true);
        try {
            const result = await toast.promise(
                postData('/api/product/productRams/create', formFields),
                {
                    loading: 'Adding product RAM... Please wait.',
                    success: 'Product RAM created successfully!',
                    error: 'Failed to add product RAM',
                }
            );

            if (result?.success) {
                setFormFields({ name: '' });
                context.forceUpdate();
            }
        } catch (err) {
            toast.error(err?.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProductRam = (productRamId, productRamName) => {
        setRamId(productRamId);
        setFormFields({ name: productRamName });
    };

    const handleUpdateRams = async (e) => {
        e.preventDefault();

        if (!ramId) return;
        setIsLoading(true);

        try {
            const result = await toast.promise(
                editData(`/api/product/productRams/updateProductRams/${ramId}`, {
                    ...formFields,
                    userId: context?.userData?._id,
                    productRamId: ramId,
                }),
                {
                    loading: 'Updating product RAM... Please wait.',
                    success: 'Product RAM updated successfully!',
                    error: 'Failed to update product RAM',
                }
            );

            if (result?.success) {
                setRamId(null);
                setFormFields({ name: '' });
                context.forceUpdate();
            }
        } catch (err) {
            toast.error(err?.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRams = async (e, id) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await toast.promise(
                deleteData(`/api/product/productRams/${id}`),
                {
                    loading: 'Deleting product RAM... Please wait.',
                    success: 'Product RAM deleted successfully!',
                    error: 'Failed to delete product RAM',
                }
            );

            if (result?.success) {
                setData((prevData) => prevData.filter((item) => item._id !== id));
                setFormFields({ name: '' });
                setRamId(undefined);
            }
        } catch (err) {
            toast.error(err?.message || 'An unexpected error occurred.');
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
                throw new Error("Invalid productRams IDs.");
            }

            // Convert array to comma-separated string
            const idsQueryParam = selectedRows.join(',');

            // Make DELETE request with query parameters
            const result = await toast.promise(
                deleteMultipleData(`/api/product/productRams/delete-multiple-productRams?ids=${idsQueryParam}`),
                {
                    loading: "Deleting product Ram(s)... Please wait.",
                    success: (response) => {  // Removed async from here
                        if (response.success) {
                            // Update UI to remove the deleted products
                            setData((prevData) =>
                                prevData.filter((data) => !selectedRows.includes(data._id))
                            );
                            setSelectedRows([]); // Clear selected rows after successful deletion
                            setSelectAll(false); // Uncheck "Select All" checkbox
                            return response.message || "Product Ram(s) deleted successfully!";
                        } else {
                            throw new Error(response.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err.message || "Failed to delete product Ram(s). Please try again.";
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



    const handleDiscard = () => {
        setRamId(null);
        setFormFields({ name: '' });
    };

    return (
        <>
            <div className='flex items-center justify-between px-5 pt-3 mt-14'>
                <h2 className='text-[20px] font-bold'>Product RAMs</h2>
            </div>

            <div className='card my-4 bg-white border rounded-md px-1 pt-1'>
                <form onSubmit={ramId ? handleUpdateRams : handleSubmit} className='form py-3'>
                    <h3 className='text-[18px] font-bold mb-1 text-gray-700 px-5'>Basic Information</h3>
                    <div className='flex flex-col gap-4 border-2 border-dashed border-gray-200 bg-white rounded-md p-5 mb-5'>
                        <div className='grid grid-cols-1'>
                            <div className='col'>
                                <div className='flex items-center gap-2 mb-1'>
                                    <h3 className='text-[14px] font-medium text-gray-700'>Product RAM Size</h3>
                                    <span className='text-gray-400 text-[14px]'>(for eg. 4GB, 1TB,...)</span>
                                </div>
                                <input
                                    type='text'
                                    className='w-full h-[40px] border border-gray-300 focus:outline-none focus:border-gray-500 rounded-md p-3 text-sm'
                                    placeholder='Product RAM Size'
                                    name='name'
                                    value={formFields.name}
                                    onChange={onChangeInput}
                                />
                                <br /><br />
                                <div className='flex items-center gap-4'>
                                    <Button
                                        type="reset"
                                        onClick={handleDiscard}
                                        className='!capitalize !bg-red-500 !text-white w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2 '
                                    >
                                        <RiResetLeftFill className='text-[18px] hidden sm:block' />Discard
                                    </Button>
                                    <Button
                                        type='submit'
                                        className={`!capitalize w-full sm:w-[150px] !px-5 h-[40px] flex items-center justify-center gap-2 ${ramId ? (isLoading ? "custom-btn-update-disabled" : "custom-btn-update") : (isLoading ? "custom-btn-disabled" : "custom-btn")}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <CircularProgress color='inherit' /> : ramId ? <><FiEdit className='text-[18px] hidden sm:block' /> Update</> : <><IoIosSave className='text-[18px] hidden sm:block' /> Create</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className='card my-4 bg-white border rounded-md px-1 pt-1'>
                <div className='customScroll relative rounded-md mt-5 pb-5'>
                    <TableContainer className='customScroll mt-5'>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className="px-6 py-2 text-left" width={100}>
                                        <Checkbox
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {
                                    data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((item, index) => (
                                        <TableRow key={index} className={`${isRowSelected(item) ? "!bg-blue-100" : ""}`}>
                                            <TableCell scope="row" className="px-6 pr-0 py-3 text-left">
                                                <div className='w-[0px]'>
                                                    <Checkbox
                                                        checked={isRowSelected(item)}
                                                        onChange={() => handleRowCheckboxChange(item)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell scope="row" className="px-0 py-3 text-left">{item?.name}</TableCell>
                                            <TableCell scope="row" className="px-6 py-3 text-left">
                                                <div className="flex items-center gap-2">
                                                    <Tooltip title="Edit Product" arrow placement="top">
                                                        <Button className="!h-[35px] !w-[35px] !min-w-[35px] !bg-blue-500 !text-white shadow" onClick={() => handleEditProductRam(item?._id, item?.name)}>
                                                            <MdOutlineEdit className="text-[35px]" />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Product" arrow placement="top">
                                                        <Button className="!h-[35px] !w-[35px] !min-w-[35px] !bg-red-500 !text-white shadow" onClick={(e) => handleDeleteRams(e, item?._id)}>
                                                            <RiDeleteBin6Line className="text-[35px]" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }

                                {
                                    data.length === 0 &&
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" style={{ height: 150 }}>
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
                                    <span className='font-bold'>{selectedRows.length}</span> product{selectedRows.length > 1 ? 's' : ''} selected
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
                        count={data?.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        MenuProps={MenuProps}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        className='customScroll'
                    />

                </div>
            </div>
        </>
    );
};

export default AddRAMS;
