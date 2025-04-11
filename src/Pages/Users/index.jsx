import { Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBox from '../../Components/SearchBox'
import { MdOutlineMarkEmailRead, MdPhone } from 'react-icons/md';
import { SlCalender } from "react-icons/sl";
import { deleteData, deleteMultipleData, fetchDataFromApi } from '../../utils/api';
import { MyContext } from '../../App';
import { RiDeleteBin6Line } from 'react-icons/ri';
import toast from 'react-hot-toast';


const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const columns = [
    { id: 'userImg', label: 'USER IMAGE', minWidth: 100, align: 'left' },
    { id: 'userName', label: 'USER NAME', minWidth: 200, align: 'left' },
    {
        id: 'userEmail',
        label: 'USER EMAIL',
        minWidth: 300,
        align: 'left'
    },
    {
        id: 'userPhoneNo',
        label: 'USER PHONE NO',
        minWidth: 200,
        align: 'left',
    },
    {
        id: 'userVerified',
        label: 'USER VERIFIED',
        minWidth: 200,
        align: 'left',
    },
    {
        id: 'createdDate',
        label: 'CREATED ON',
        minWidth: 160,
        align: 'left',
    },
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

const Users = () => {

    const context = useContext(MyContext);
    const [pageOrder, setPageOrder] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('')
    const [userData, setUserData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // Stores search results
    const [isLoading, setIsLoading] = useState(false);

    // States to manage selected rows and select all functionality
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);


    useEffect(() => {
        setIsLoading(true);
        fetchDataFromApi(`/api/user/get-all-user`).then((res) => {
            setUserData(res.data);
            setFilteredUsers(res.data); // Ensure filteredUsers is updated
            setIsLoading(false);
        });

        window.scrollTo(0,0);
    }, []);



    // Handle Select All
    const handleSelectAll = () => {
        console.log("Select All Clicked:", selectAll);

        // Calculate start and end index for the current page
        const startIndex = (pageOrder - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        // Get only the user IDs from the current page
        const allRows = userData.slice(startIndex, endIndex).map(user => user._id);

        if (selectAll) {
            // If already selected, unselect all
            setSelectedRows([]);
            console.log("Unselecting all rows.");
        } else {
            // Select all rows on the current page
            setSelectedRows(allRows);
            console.log("Selecting all rows:", allRows);
        }

        // Toggle selectAll state
        setSelectAll(!selectAll);
    };


    // Handle Row Select or Deselect
    const handleRowCheckboxChange = (user) => {
        console.log("Row Checkbox clicked for user: ", user);
        const isProductSelected = selectedRows.includes(user._id);
        console.log("Is Product Selected? ", isProductSelected);

        const newSelectedRows = isProductSelected
            ? selectedRows.filter(id => id !== user._id) // Remove user _id from selection
            : [...selectedRows, user._id]; // Add user _id to selection

        setSelectedRows(newSelectedRows);
        console.log("Updated selected rows (IDs): ", newSelectedRows);

        // Check if all rows are selected manually
        if (newSelectedRows.length === userData.length) {
            setSelectAll(true); // All rows are selected
            console.log("All rows selected");
        } else {
            setSelectAll(false); // Not all rows selected
            console.log("Not all rows selected");
        }
    };


    // Handle the rendering of individual row checkboxes
    const isRowSelected = (user) => selectedRows.includes(user._id);

    const handleDeleteSelectedUsers = async (e, selectedRows) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log("Selected Users:", selectedRows);

            // Validate selectedRows
            if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
                throw new Error("Invalid user IDs.");
            }

            // Convert array to comma-separated string
            const idsQueryParam = selectedRows.join(',');

            // Make DELETE request with query parameters
            const result = await toast.promise(
                deleteMultipleData(`/api/user/delete-multiple-users?ids=${idsQueryParam}`),
                {
                    loading: "Deleting user(s)... Please wait.",
                    success: (response) => {
                        if (response.success) {
                            // Update UI to remove the deleted users
                            setUserData((prevData) =>
                                prevData.filter((user) => !selectedRows.includes(user._id))
                            );
                            setSelectedRows([]); // Clear selected rows after successful deletion
                            setSelectAll(false); // Uncheck "Select All" checkbox
                            return response.message || "User(s) deleted successfully!";
                        } else {
                            throw new Error(response.message || "An unexpected error occurred.");
                        }
                    },
                    error: (err) => {
                        return err.message || "Failed to delete user(s). Please try again.";
                    },
                }
            );

            console.log("Delete Result:", result);
        } catch (err) {
            console.error("Error in handleDeleteSelectedUsers:", err);
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    // Update displayed users based on pagination
    const paginatedUsers = useMemo(() => {
        if (!filteredUsers) return []; // Prevents error
        const startIndex = (pageOrder - 1) * rowsPerPage;
        return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredUsers, pageOrder, rowsPerPage]);


    // Handle search functionality
    useEffect(() => {
        if (searchQuery.trim() !== "") {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            const filteredResults = userData.filter((user) => {
                const fields = [user?.name, user?.mobile, user?.email, user?.createdAt];

                return fields.some((field) => {
                    if (typeof field === "string") {
                        return field.toLowerCase().includes(lowerCaseQuery);
                    } else if (typeof field === "number") {
                        return field.toString().includes(searchQuery);
                    }
                    return false;
                });
            });

            setFilteredUsers(filteredResults);
            setPageOrder(1); // Reset to first page when filtering
        } else {
            setFilteredUsers(userData);
        }
    }, [searchQuery, userData]);





    return (
        <>
            <div className="card my-4 mt-14 bg-white border rounded-md px-1 pt-5">

                <div className='flex flex-col sm:flex-row items-center gap-2 w-full px-5 justify-between'>
                    <div className='col w-[100%] sm:w-[40%]'>
                        <h2 className='text-[20px] font-bold w-full'>Users List <span className="font-normal text-[12px]">MUI</span></h2>
                    </div>

                    <div className='w-[100%] sm:w-[40%]'>
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

                <TableContainer className='max-h-[440px] customScroll mt-5'>
                    <Table stickyHeader aria-label="sticky table">

                        <TableHead>
                            <TableRow>
                                <TableCell className="px-6 py-2 text-left">
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
                                isLoading === false ? paginatedUsers?.length !== 0 && paginatedUsers?.map((user, index) => {
                                    return (
                                        <TableRow key={index} className={`${isRowSelected(user) ? "!bg-blue-100" : ""}`}>
                                            {/* <TableCell style={{ minWidth: columns.minWidth }}>
                                                <Checkbox {...label} size='small' />
                                            </TableCell> */}
                                            <TableCell style={{ minWidth: columns.minWidth }}>
                                                <Checkbox checked={isRowSelected(user)} onChange={() => handleRowCheckboxChange(user)} />
                                            </TableCell>
                                            <TableCell width={100}>
                                                <div className="flex items-start gap-4 w-[100px]">
                                                    <div className='img w-[45px] h-[45px] overflow-hidden rounded-md shadow-md group'>
                                                        <Link to="">
                                                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name?.replace(/ /g, "+")}`} alt="userAvatar" className="w-full h-full object-cover rounded-md transition-all group-hover:scale-105" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell style={{ minWidth: columns.minWidth }}>
                                                {user?.name}
                                            </TableCell>
                                            <TableCell style={{ minWidth: columns.minWidth }}>
                                                <span className='flex items-center gap-1'><MdOutlineMarkEmailRead className='text-[20px]' />{user?.email}</span>
                                            </TableCell>
                                            <TableCell style={{ minWidth: columns.minWidth }}>
                                                <span className='flex items-center gap-1'><MdPhone className='text-[20px]' />
                                                    {user?.mobile
                                                        ? String(user?.mobile).replace(/^(\d{2})(\d{5})(\d{5})$/, '+$1 $2 $3')
                                                        : 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell style={{ minWidth: columns.minWidth }}>
                                                {user?.verify_email ? <span className='border rounded-full px-2 py-1 bg-green-200'>Verified</span> : <span className='border rounded-full px-2 py-1 bg-red-200'>Not Verified</span>}
                                            </TableCell>
                                            <TableCell style={{ minWidth: columns.minWidth }}>
                                                <span className='flex items-center gap-1'><SlCalender className='text-[18px]' />
                                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}
                                                </span>
                                            </TableCell>

                                        </TableRow>
                                    )
                                })
                                    :
                                    ("")
                            }



                        </TableBody>
                    </Table>
                </TableContainer>

                {
                    selectedRows.length > 0 &&

                    <div className='sticky bottom-0 left-0 z-10 mt-2.5 flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-0 px-5 py-3.5 text-gray-900 shadow bg-white gap-4'>
                        {selectedRows.length > 0 && (
                            <span>
                                <span className='font-bold'>{selectedRows.length}</span> user{selectedRows.length > 1 ? 's' : ''} selected
                            </span>
                        )}
                        <Button
                            type="reset"
                            onClick={(e) => handleDeleteSelectedUsers(e, selectedRows)}
                            className='!bg-red-500 !text-white !capitalize w-auto !px-5 h-[40px] flex items-center justify-center gap-2'
                        >
                            <RiDeleteBin6Line className='text-[18px] hidden sm:block' />Delete
                        </Button>
                    </div>

                }

                {filteredUsers && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={filteredUsers.length}
                        page={pageOrder - 1}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(event, newPage) => setPageOrder(newPage + 1)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPageOrder(1);
                        }}
                        className='customScroll'
                    />
                )}


            </div>

        </>
    )
}

export default Users
