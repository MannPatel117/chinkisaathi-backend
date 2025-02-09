import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../model/account.model.js";
import { Op } from "sequelize";

/*
    Function Name - createAccount
    Functionality - Creates Account
*/

const createAccount = async (req, res) => {
  try {
    // Destructure the fields from the request body
    const {
      accountName,
      aliasName,
      phone_Number,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      subGroup,
      underGroup,
      paymentTerm,
      gstNumber,
      openingBalanceCredit,
      openingBalanceDebit,
      email,
    } = req.body;

    // Validate required fields
    if (!accountName || !aliasName || !phone_Number) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "accountName, aliasName, and phone_Number are required",
            "Invalid Action",
            false
          )
        );
    }

    // Check for existing account with the same aliasName
    const existingAccount = await Account.findOne({
      where: { aliasName: aliasName },
    });

    if (existingAccount) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            "Account with this aliasName already exists",
            "Invalid Action",
            false
          )
        );
    }

    // Create a new account
    const newAccount = await Account.create({
      accountName,
      aliasName,
      phone_Number,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      subGroup,
      underGroup,
      paymentTerm,
      gstNumber,
      openingBalanceCredit,
      openingBalanceDebit,
      email,
    });

    // Respond with the created account
    return res
      .status(201)
      .json(
        new ApiResponse(201, newAccount, "Account created successfully", true)
      );
  } catch (error) {
    console.error("Error creating account:", error);

    // Handle Sequelize unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            "Account with this aliasName already exists",
            "Invalid Action",
            false
          )
        );
    }

    // Catch-all error handler
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          `Could not create account, please try again later: ${error.message}`,
          "Action Failed",
          false
        )
      );
  }
};

/*
    Function Name - getAccount
    Functionality - fetches Account by id
*/

const getAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      // Fetch account by ID
      const account = await Account.findByPk(id);
      if (!account) {
        return res
          .status(404)
          .json(
            new ApiResponse(
              404,
              `Account with ID ${id} not found`,
              "Invalid Action",
              false
            )
          );
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, account, "Account retrieved successfully", true)
        );
    }

    // Fetch all accounts
    const accounts = await Account.findAll();
    return res
      .status(200)
      .json(
        new ApiResponse(200, accounts, "Accounts retrieved successfully", true)
      );
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          `Could not fetch accounts: ${error.message}`,
          "Action Failed",
          false
        )
      );
  }
};

/*
    Function Name - updateAccount
    Functionality - updates Account by id
*/

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account exists
    const account = await Account.findByPk(id);
    if (!account) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            `Account with ID ${id} not found`,
            "Invalid Action",
            false
          )
        );
    }

    // Update account details
    const updatedAccount = await account.update(req.body);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedAccount,
          "Account updated successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error updating account:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json(
        new ApiResponse(
          400,
          error.errors.map((e) => e.message),
          "Invalid Action",
          false
        )
      );
    }

    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          `Could not update account: ${error.message}`,
          "Action Failed",
          false
        )
      );
  }
};

/*
    Function Name - deleteAccount
    Functionality - delete Account by id
*/

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account exists
    const account = await Account.findByPk(id);
    if (!account) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            `Account not found`,
            "Invalid Action",
            false
          )
        );
    }

    // Soft delete (paranoid: true in the model enables soft deletes)
    await account.destroy();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `Account deleted successfully`,
          true
        )
      );
  } catch (error) {
    console.error("Error deleting account:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          `Could not delete account: ${error.message}`,
          "Action Failed",
          false
        )
      );
  }
};

/*
    Function Name - getBasicAccountDetails
    Functionality - fetches only the necessary details
*/


const getBasicAccountDetails = async (req, res) => {
  try {
    // Fetch only the specified fields from all accounts
    const accounts = await Account.findAll({
      attributes: ['supplierID', 'accountName', 'aliasName', 'phone_Number'],
    });

    // Check if accounts exist
    if (!accounts || accounts.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            "No accounts found",
            "Invalid Action",
            false
          )
        );
    }

    // Return the accounts
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accounts,
          "Accounts retrieved successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error fetching account details:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          `Could not fetch account details: ${error.message}`,
          "Action Failed",
          false
        )
      );
  }
};

/*
    Function Name - allAccount
    Functionality - fetches all Accounts
*/


const allAccount = async (req, res) => {
  try {
    const { pagination, page, limit, subGroup, search } = req.query;

    if (pagination === 'true') {
      // Parse page and limit parameters or set defaults
      const pageNumber = parseInt(page, 10) || 1; // Default to page 1
      const pageSize = parseInt(limit, 10) || 10; // Default to 10 items per page
      const offset = (pageNumber - 1) * pageSize;

      // Build query with filters
      const query = { deletedAt: null };

      if (subGroup) {
        query.subGroup = subGroup;
      }

      if (search) {
              query[Op.or] = [
                { phone_Number: { [Op.like]: `%${search}%` } },
                { accountName: { [Op.like]: `%${search}%` } },
                { aliasName: { [Op.like]: `%${search}%` } },
              ];
      }
      // Fetch paginated data
      const { count, rows } = await Account.findAndCountAll({
        offset: offset,
        limit: pageSize,
        where: query,
      });

      return res
        .status(200)
        .json(
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
            "Accounts fetched successfully",
            true
          )
        );
    } else {
      // Build query with filters for non-paginated request
      const query = { deletedAt: null };

      if (subGroup) {
        query.subGroup = subGroup;
      }

      const allAccounts = await Account.findAll({
        where: query,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, allAccounts, "All accounts fetched successfully", true));
    }
  } catch (error) {
    console.error("Error fetching accounts", error);
    return res
      .status(500)
      .json(new ApiResponse(500, "Please contact support", "Server Error", false));
  }
};


/*
    Function Name - accountStats
    Functionality - fetches Accounts status
*/

const accountStats = async (req, res) => {
    try {
        const creditorsCount = await Account.count({
            where: { subGroup: 'Sundry Creditors' },
        });

        // Count products that are not deleted (assuming 'deletedAt' field is used for soft deletes)
        const debtorsCount = await Account.count({
          where: { subGroup: 'Sundry Debtors' },
        });

        return res
                .status(200)
                .json(new ApiResponse(200, 
                    {"creditorsCount": creditorsCount, "debtorsCount": debtorsCount}, "Accounts Stats", true));
    } catch (error) {
        console.error('Error fetching stats', error);
              return res
              .status(500)
              .json(new ApiResponse(500, "Please contact Mann", "Server Error", false));
    }
  };



export { createAccount, getAccount, updateAccount, deleteAccount, getBasicAccountDetails, allAccount, accountStats};
