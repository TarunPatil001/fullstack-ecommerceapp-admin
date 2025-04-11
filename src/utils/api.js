// import axios from "axios";
// const apiUrl = import.meta.env.VITE_API_URL;

// export const postData = async (url, formData) => {
//   try {
//     const response = await fetch(apiUrl + url, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     if (response.ok) {
//       const data = await response.json();
//       return data;
//     } else {
//       const errorData = await response.json();
//       return errorData;
//     }
//   } catch (error) {
//     console.log("Error: ", error);
//   }
// };


// export const fetchDataFromApi = async (url) => {
//   try {
//     const params = {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         "Content-Type": "application/json",
//       },
//     };

//     const { data } = await axios.get(apiUrl + url, params);
//     return data;
//   } catch (error) {
//     console.error("Error fetching data from API:", error);
//     return error.response ? error.response.data : error.message;
//   }
// };

// export const uploadImage = async (url, updatedData) => {
//   try {
//     const formData = updatedData; // Assuming updatedData is a FormData instance

//     const params = {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         "Content-Type": "multipart/form-data",  // Use multipart/form-data for file upload
//       },
//     };

//     const response = await axios.put(apiUrl + url, formData, params);
//     return response;  // Adjusted to return 'data' based on axios response format
//   } catch (error) {
//     console.error("Error editing data:", error);
//   }
// };

// export const editData = async (url, updatedData) => {
//   try {
//     const formData = updatedData; // Assuming updatedData is a FormData instance

//     const params = {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         "Content-Type": "application/json",  
//       },
//     };

//     const response = await axios.put(apiUrl + url, formData, params);
//     return response;  // Adjusted to return 'data' based on axios response format
//   } catch (error) {
//     console.error("Error editing data:", error);
//   }
// };


// --------------------------------------------------------------------------------------------------------------------------

import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Consistent token key
});

/** POST Request */
// export const postData = async (url, formData) => {
//   try {
//     const response = await axios.post(apiUrl + url, formData, {
//       headers: {
//         ...getAuthHeader(),
//         "Content-Type": "application/json",
//       },
//     });
//     return response.data; // Return response data
//   } catch (error) {
//     console.error("Error in postData:", error);
//     return error.response ? error.response.data : { message: error.message, error: true };
//   }
// };

export const postData = async (url, formData) => {
  try {
    if (!formData) {
      throw new Error("Form data is required.");
    }

    // Check if formData contains files (FormData instance)
    const isMultipart = formData instanceof FormData;

    // Set headers dynamically
    const headers = {
      ...getAuthHeader(),
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    };

    // Make the POST request
    const response = await axios.post(`${apiUrl}${url}`, formData, { headers });

    return response.data; // Return response data on success
  } catch (error) {
    console.error("Error in postData:", error);

    // Handle network errors or backend response errors
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
      error: true,
    };
  }
};



/** GET Request */
export const fetchDataFromApi = async (url) => {
  try {
    const response = await axios.get(apiUrl + url, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return response.data; // Return response data
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return error.response ? error.response.data : { message: error.message, error: true };
  }
};

/** Image Upload (PUT) */
export const uploadImage = async (url, formData) => {
  try {
    const response = await axios.put(apiUrl + url, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });
    return response.data; // Return response data
  } catch (error) {
    console.error("Error uploading image:", error);
    return error.response ? error.response.data : { message: error.message, error: true };
  }
};

/** Image Upload (POST) */
export const uploadImagePost = async (url, formData) => {
  try {
    const response = await axios.post(apiUrl + url, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data", // Required for file uploads
      },
    });
    console.log('Image uploaded:', response.data);
    return response.data; // Return response data (e.g., image URL)
  } catch (error) {
    console.error("Error uploading image:", error);
    return error.response ? error.response.data : { message: error.message, error: true };
  }
};

/** Image delete (DELETE) */
export const deleteImages = async (url, image) => {
  try {
    const response = await axios.delete(apiUrl + url, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json", // Required for file uploads
      },
    });
    console.log('Image removed:', response.data);
    return response.data; // Return response data (e.g., image URL)
  } catch (error) {
    console.error("Error removing image:", error);
    return error.response ? error.response.data : { message: error.message, error: true };
  }
};


/** Edit Data (PUT) */
export const editData = async (url, updatedData) => {
  try {
    if (!updatedData) {
      throw new Error("Updated data is required.");
    }

    // Check if updatedData is a FormData instance
    const isMultipart = updatedData instanceof FormData;

    // Set headers dynamically
    const headers = {
      ...getAuthHeader(),
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    };

    // Make the PUT request
    const response = await axios.put(`${apiUrl}${url}`, updatedData, { headers });

    return response.data; // Return response data on success
  } catch (error) {
    console.error("Error editing data:", error);

    return {
      success: false,
      message: error.response?.data?.message || "An error occurred while updating data",
      error: true,
    };
  }
};


/** Delete Data (DELETE) */
export const deleteData = async (url) => {
  try {
    const response = await axios.delete(apiUrl + url, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",  
      },
    });
    return response.data; // Return response data
  } catch (error) {
    console.error("Error deleting data:", error);
    return error.response ? error.response.data : { message: error.message, error: true };
  }
};


/** Delete Data (POST) for multiple products */
export const deleteMultipleData = async (url) => {
  try {
    const response = await axios.post(apiUrl + url, {}, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json", // Setting content type as JSON
      },
    });

    return response.data; // Return response data
  } catch (error) {
    console.error("Error deleting data:", error);
    return error.response ? error.response.data : { message: error.message, error: true };
  }
};












// --------------------------------------------------------------------------------------------------------------------------