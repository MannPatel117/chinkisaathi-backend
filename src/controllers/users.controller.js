import { User } from "../model/users.model.js"; // Adjust the path if necessary
import { ApiResponse } from "../utils/ApiResponse.js";
import { Op } from "sequelize";
import { BillMaster } from "../model/bills.model.js";
import { RewardsPoint } from "../model/rewardPoints.model.js";

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
      customerType
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
      customerType
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
        .status(200)
        .json(new ApiResponse(200, "User not found", "Not Found", false));
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
    const { page, limit, sortField, sortOrder, search, pagination, customerType } = req.query;

    // Pagination setup
    const query ={ }
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * pageSize;
    if (search) {
        query[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { phoneNumber: { [Op.like]: `%${search}%` } }
        ];
      }
      if(customerType){
        query.customerType = customerType;
      }
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
    if(pagination == 'true'){
      const { count, rows } = await User.findAndCountAll({
        offset: offset,
        limit: pageSize,
        where: query,
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
    } else{
      const { count, rows } = await User.findAndCountAll({
        where: query,
        order: order, // Apply sorting if specified, otherwise no sorting
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          
          rows
          ,
          "Users fetched successfully",
          true
        )
      );
    }

    // Fetch paginated and optionally sorted users
    

    
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

const getCustomerBills = async (req, res) => {
  try {
      const { phoneNumber } = req.query;

      if (!phoneNumber) {
          return res.status(400).json({ success: false, message: "Phone number is required." });
      }

      // Fetch all bills where phoneNumber matches
      const bills = await BillMaster.findAll({
          where: { phoneNumber: phoneNumber },
          order: [['createdAt', 'DESC']], // Sort by latest bills first
      });

      if (bills.length === 0) {
        return res
        .status(200)
        .json(new ApiResponse(200, [], "Bills not found", false));
      }

      // Calculate total lifetime amount spent by customer
      const totalSpent = bills.reduce((sum, bill) => sum + bill.finalAmount, 0);

      // Calculate total reward points used by customer
      const totalRewardPointsUsed = bills.reduce((sum, bill) => sum + bill.rewardPointsUsed, 0);
      const data = {
          "totalSpent": totalSpent,
          "totalRewardPointsUsed": totalRewardPointsUsed,
          "bills": bills
        }
        return res
      .status(200)
      .json(new ApiResponse(200, data, "Bills Found", true));
    }
     catch (error) {
      console.error("Error fetching customer bills:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

const getCustomerRewards = async (req, res) => {
  try {
      const { phoneNumber } = req.query;

      if (!phoneNumber) {
          return res.status(400).json({ success: false, message: "Phone number is required." });
      }

      // Fetch all bills where phoneNumber matches
      const rewards = await RewardsPoint.findAll({
          where: { phoneNumber: phoneNumber },
          order: [['createdAt', 'DESC']], // Sort by latest bills first
      });

      if (rewards.length === 0) {
        return res
        .status(200)
        .json(new ApiResponse(200, [], "Reward points history not found", false));
      }

      // Calculate total lifetime amount spent by customer
      let totalEarned = 0;
      let totalRedeemed = 0;
      for(let reward of rewards){
        if(reward.pointsAmount > 0){
          totalEarned = totalEarned + reward.pointsAmount
        } else if(reward.pointsAmount < 0){
          totalRedeemed = totalRedeemed - reward.pointsAmount;
        }
      }
      
      const data = {
          "totalEarned": totalEarned,
          "totalRedeemed": totalRedeemed,
          "rewards": rewards
        }
        return res
      .status(200)
      .json(new ApiResponse(200, data, "Rewards Found", true));
    }
     catch (error) {
      console.error("Error fetching customer Rewards:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  usersStats,
  getCustomerBills,
  getCustomerRewards
};
