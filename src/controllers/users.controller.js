import { User } from "../model/users.model.js"; // Adjust the path if necessary
import { ApiResponse } from "../utils/ApiResponse.js";

/*
    Function Name - createUser
    Functionality - creates User
*/

const createUser = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      state,
      pincode,
      rewardPoint,
    } = req.body;

    // Validate required fields
    if (!phoneNumber) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "Phone number is required",
            "Validation Error",
            false
          )
        );
    }

    // Check if user with the given phoneNumber already exists
    const existingUser = await User.findOne({
      where: { phoneNumber },
    });
    if (existingUser) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            "User already exists with this phone number",
            "Conflict",
            false
          )
        );
    }

    // Create a new user
    const newUser = await User.create({
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      state,
      pincode,
      rewardPoint,
    });

    // Return a successful response
    return res
      .status(201)
      .json(new ApiResponse(201, newUser, "User created successfully", true));
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "An error occurred while creating the user",
          "Server Error",
          false
        )
      );
  }
};

/*
    Function Name - getUserById
    Functionality - get User by Id
*/

const getUserById = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Find the user by phone number
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(404, "User not found", "Not Found", false));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User fetched successfully", true));
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "An error occurred while fetching the user",
          "Server Error",
          false
        )
      );
  }
};

/*
    Function Name - updateUser
    Functionality - update User
*/

const updateUser = async (req, res) => {
  try {
    const { phoneNumber } = req.params; // Primary key for identifying the user
    const updates = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(404, "User not found", "Not Found", false));
    }

    // Update the user
    await user.update(updates);

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User updated successfully", true));
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "An error occurred while updating the user",
          "Server Error",
          false
        )
      );
  }
};

/*
    Function Name - deleteUser
    Functionality - delete User
*/

const deleteUser = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Check if the user exists
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(404, "User not found", "Not Found", false));
    }

    // Delete the user
    await user.destroy();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User deleted successfully", true));
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "An error occurred while deleting the user",
          "Server Error",
          false
        )
      );
  }
};

/*
    Function Name - getAllUsers
    Functionality - getAllUsers
*/

const getAllUsers = async (req, res) => {
  try {
    const { page, limit, sortField, sortOrder } = req.query;

    // Pagination setup
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * pageSize;

    // Default order, only apply sorting if both sortField and sortOrder are provided
    let order = [];
    if (sortField && sortOrder) {
      const validFields = ["rewardPoint", "createdAt"];
      const validOrders = ["asc", "desc"];

      // Validate the sort field and order
      if (validFields.includes(sortField) && validOrders.includes(sortOrder)) {
        order = [[sortField, sortOrder]];
      }
    }

    // Fetch paginated and optionally sorted users
    const { count, rows } = await User.findAndCountAll({
      offset: offset,
      limit: pageSize,
      order: order, // Apply sorting if specified, otherwise no sorting
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          pagination: {
            totalRecords: count,
            currentPage: pageNumber,
            totalPages: Math.ceil(count / pageSize),
          },
          data: rows,
        },
        "Users fetched successfully",
        true
      )
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "An error occurred while fetching users",
          "Server Error",
          false
        )
      );
  }
};

/*
      Function Name - usersStats
      Functionality - fetches User stats
  */

const usersStats = async (req, res) => {
  try {
    const userCount = await User.count();

    return res
      .status(200)
      .json(new ApiResponse(200, { userCount: userCount }, "User Stats", true));
  } catch (error) {
    console.error("Error fetching stats", error);
    return res
      .status(500)
      .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
  }
};

export {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  usersStats,
};
