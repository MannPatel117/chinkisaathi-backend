import { ApiResponse } from "../utils/ApiResponse.js";
import { adminUsers } from '../model/adminUser.model.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"

  /*
    Function Name - createAdmin
    Functionality - Creates record for Admin Users
  */

    const createAdmin = async (req, res) => {
        const key= req.header("adminKey");
        try {
          const {
            userName,
            firstName,
            lastName,
            password,
            role,
            branch,
            phnnumber,
            emailid,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            photo,
            dateOfJoining,
            designation,
            employeeId,
          } = req.body;
          

          if(key != process.env.MANN_SECRET_PASSWORD){
            return res
            .status(403)
            .json(new ApiResponse(403, "User does not have permissions", "Forbidden", false));
          }

          // Validate mandatory fields
          if (!userName || !firstName || !lastName || !password || !branch) {
            return res
            .status(400)
            .json(new ApiResponse(400, "Some fields are missing", "Invalid Action", false));
          }
      
          // Check if username already exists
          const existingUser = await adminUsers.findOne({ where: { userName } });
          if (existingUser) {
            return res
            .status(409)
            .json(new ApiResponse(409, "Username already exists", "Invalid Action", false));
          }
      
          // Create a new admin user
          const newUser = await adminUsers.create({
            userName,
            firstName,
            lastName,
            password,
            role,
            branch,
            phnnumber,
            emailid,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            photo,
            dateOfJoining,
            designation,
            employeeId,
          });
      
        return res
          .status(201)
          .json(new ApiResponse(201, newUser, "User created", true));
        } catch (error) {
          console.error('Error adding admin user:', error);
          return res
            .status(409)
            .json(
              new ApiResponse(409, "Error - Contact Support", "Action Failed",false)
         );
        }
    };
   
  /*
    Function Name - loginAdmin
    Functionality - Function to login user
  */

    const loginAdmin = async (req, res) => {
        try {
          const { userName, password } = req.body;
      
          // Check if user exists
          const user = await adminUsers.findOne({
            where: {
              userName: userName,
            }
          });
          console.log(user)
          if (!user) {
            return res
            .status(401)
            .json(new ApiResponse(401, "User not found", "Invalid Credentials", false));
          }
      
          // Compare password
          const passwordMatch = await bcrypt.compare(password, user.password);
      
          if (!passwordMatch) {
            return res
            .status(401)
            .json(new ApiResponse(401, "Incorrect Password", "Invalid Credentials", false));
          }
      
          // If password matches, generate a JWT token
          const token = jwt.sign({ userName: user.userName, branch: user.branch, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
          return res
            .status(200)
            .json(new ApiResponse(200, 
                {
                    token: token, user: 
                    {
                        userName: user.userName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        inventory: user.inventory
                    }
                }, "Login Successful", true));
      
        } catch (error) {
          console.log(error)
          return res
          .status(500)
          .json(new ApiResponse(500, "Please contact support", "Server Error", false));;
        }
    };

  /*
    Function Name - getAdmin
    Functionality - Function to fetch user by username
  */

    const getAdmin = async (req, res) => {
        try {
          let username= req.params.username;
          const user = await adminUsers.findOne({
            where: {
              userName: username,
            }
          });
      
          if (!user) {
            return res
            .status(401)
            .json(new ApiResponse(401, "User does not exist", "User not found", false));
          }
      
          return res
            .status(200)
            .json(new ApiResponse(200, 
                user, "User found", true));
      
        } catch (error) {
          return res
          .status(500)
          .json(new ApiResponse(500, "Please contact support", "Server Error", false));
        }
    };

  /*
    Function Name - updateAdmin
    Functionality - Function to fetch user by username and update details
  */

    const updateAdmin = async (req, res) => {
        try {
          const  userName  = req.params.username; // Extract the unique identifier (e.g., userName) from the Req
          const updates = req.body; // JSON body containing the fields to update
      
          // Perform the update
          await adminUsers.update(updates, {
            where: { userName: userName }
          });
      
          // Fetch the updated user to return in response
          const updatedUser = await adminUsers.findOne({
            where: { userName: userName }
          });
      
          return res
            .status(200)
            .json(new ApiResponse(200, 
                updatedUser, "User updated", true));
        } catch (error) {
          return res
          .status(500)
          .json(new ApiResponse(500, "Please contact support", "Server Error", false));
        }
    };

  /*
    Function Name - deleteAdmin
    Functionality - Function to fetch user by username and delete it
  */

    const deleteAdmin = async (req, res) => {
        try {
        const userName  = req.params.username; // Extract the unique identifier (e.g., userName) from the URL
        const role = req.user.role;
        // Check if the user exists
        const user = await adminUsers.findOne({
          where: { userName: userName }
        });
    
        if (!user) {
            return res
            .status(401)
            .json(new ApiResponse(401, "User does not exist", "User not found", false));
        }

        if(role!='superadmin'){
            return res
            .status(403)
            .json(new ApiResponse(403, "User does not have permissions", "Forbidden", false));
        }

        await adminUsers.destroy({
            where: { userName: userName }
        });
      
        return res
          .status(200)
          .json(new ApiResponse(200, 
              `${userName} is successfully deleted`, "User deleted", true));
        } catch (error) {
          return res
          .status(500)
          .json(new ApiResponse(500, "Please contact support", "Server Error", false));
        }
    };

  /*
    Function Name - getAdminUsers
    Functionality - Function to fetch all user
  */

    const getAdminUsers = async (req, res) => {
        try {
          const { pagination, page, limit } = req.query;
      
          if (pagination === 'true') {
            // Parse page and limit parameters or set defaults
            const pageNumber = parseInt(page, 10) || 1; // Default to page 1
            const pageSize = parseInt(limit, 10) || 10; // Default to 10 items per page
            const offset = (pageNumber - 1) * pageSize;
      
            // Fetch paginated data
            const { count, rows } = await adminUsers.findAndCountAll({
              offset: offset,
              limit: pageSize,
              where: { deletedAt: null }, // Ensure soft-deleted users are excluded
            });
      
            return res
            .status(200)
            .json(new ApiResponse(200, 
              { 
                pagination: {
                    totalRecords: count,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(count / pageSize),
                },
                data: rows
               }, "Admin User fetched", true));
          } else {
            // Fetch all data without pagination
            const allUsers = await adminUsers.findAll({
              where: { deletedAt: null }, // Ensure soft-deleted users are excluded
            });
      
            return res
            .status(200)
            .json(new ApiResponse(200, 
              allUsers, "All Admin User fetched", true));
          }
        } catch (error) {
          return res
          .status(500)
          .json(new ApiResponse(500, "Please contact support", "Server Error", false));
        }
    };


    /*
    Function Name - verifySession
    Functionality - Function to check Admin session validity
  */
  

  const verifySession = asyncHandler(async(req, res) => {
    try { 
      const role = req.query.role;
      const token = req.header("Authorization")?.replace("Bearer ", "");
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      if (decodedToken && decodedToken.role == role) {
          return res.status(200).json(
              new ApiResponse(200, "", "Success", "Success")
          )
      } else{
        return res.status(404).json(
          new ApiResponse(404, error, "Unauthorized", "Invalid Role")
       )
      }
      
    } catch (error) {
      return res.status(201).json(
          new ApiResponse(201, error, "Failed Action", "Token Error")
      )
    }
  })

export { createAdmin, loginAdmin, getAdmin, updateAdmin, deleteAdmin, getAdminUsers, verifySession }
