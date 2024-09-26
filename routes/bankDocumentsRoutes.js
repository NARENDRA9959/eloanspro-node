// const express = require("express");
// const {
//   getBankDocumentsCount,
//   getBankDocuments,
//   getBankDocumentsById,
//   createBankDocuments,
//   updateBankDocuments,
//   changeBankDocumentsStatus,
//   deleteBankDocuments,
// } = require("../controllers/bankDocumentsController");

// const validateToken = require("../middleware/validateTokenHandler");

// const router = express.Router();

// router
//   .route("/")
//   .get(validateToken, getBankDocuments)
//   .post(validateToken, createBankDocuments);

// router.route("/total").get(validateToken, getBankDocumentsCount);

// router
//   .route("/:bankDocumentsId/changestatus/:statusId")
//   .put(validateToken, changeBankDocumentsStatus);

// router
//   .route("/:id")
//   .get(validateToken, getBankDocumentsById)
//   .put(validateToken, updateBankDocuments)
//   .delete(validateToken, deleteBankDocuments);

// module.exports = router;
