const Users = require("../models/user.model");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
// const PreviewImage = require("../models/previewImage.model");
const Order = require("../models/order.model");
const Item = require("../models/item.model");
const Discount = require("../models/discount.model");
const bcrypt = require("bcrypt")

const mailer = require("../utils/mailer");
const { io, getClientOnline } = require("../app");

const mongoose = require("mongoose");

class AdminController {
  // async addPreview(req, res) {
  //   try {
  //     const { idProduct } = req.body;
  //     let foundProduct = await Product.findOne({ _id: idProduct });

  //     req.files.forEach(async (e) => {
  //       let newPreviewImage = new PreviewImage({
  //         src: process.env.HOST_WEB + "uploads/" + e.originalname,
  //       });

  //       await newPreviewImage.save();

  //       foundProduct.previewImage.push(newPreviewImage._id);

  //       foundProduct.save();
  //     });

  //     return res.json({
  //       msg: "Add preview image success",
  //       idProduct: idProduct,
  //       previewImg: foundProduct.previewImage,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({ msg: error.message });
  //   }
  // }

  async addProduct(req, res) {
    try {
      let update = req.body;

      delete update.rate
      
      if (!req.files) {
        return res.status(500).json({ msg: 'Must have img product' });  
      }
      
      update.img = process.env.HOST_WEB + "uploads/" + req.files.img[0].filename;
      

      let previewImage = []
      for (let el of req.files.previewImage) {
        let img = process.env.HOST_WEB + "uploads/" + el.filename
        previewImage.push(img)
      }
      
      let newProduct = new Product({
        ...update,
        previewImage
        
      });
      await newProduct.save();
      return res.json({ msg: "Add product success", product: newProduct });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.message });
    }
  }

  async addCategory(req, res) {
    try {
      const { id, products, name } = req.body;
      let newCategory = new Category({
        id,
        products,
        name,
      });

      await newCategory.save();
      return res.json({ msg: "Add category success", id, products, name });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.message });
    }
  }
  async updateProduct(req, res) {
    try {
      let update = req.body;
      delete update.rate

      if (req.files) {
        if (req.files.previewImage) {
          update.previewImage = []
          for (let el of req.files.previewImage) {
            let img = process.env.HOST_WEB + "uploads/" + el.filename
            update.previewImage.push(img)
          }
        }
        if (req.files.img) {
          update.img = process.env.HOST_WEB + "uploads/" + req.files.img[0].filename;

        }
      }

      // console.log(update);
      const foundProduct = await Product.updateOne(
        { id: (update.idProduct) },
        { $set: update }
      );
      if (foundProduct.matchedCount === 1)
        return res.json({ msg: "Update product success", update });
      else return res.status(500).json({ msg: "Cant find productid" });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.message });
    }
  }
  async updateCategory(req, res) {
    try {
      const { idCategory, update } = req.body;
      delete update.id
      const foundCategory = await Category.updateOne(
        { _id: mongoose.Types.ObjectId(idCategory) },
        { $set: { ...update } }
      );

      if (foundCategory.matchedCount === 1)
        return res.json({ msg: "Update category success", idCategory, update });
      else 
        return res.status(500).json({msg: "Cant find category"})
      } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getAllUser(req, res) {
    try {
      const allUser = await Users.find({}, "-password -cart");

      return res.json({ allUser });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getAllOrder(req, res) {
    try {
      const allOrder = await Order.find({});

      return res.json({ allOrder });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async sendMailWishList(req, res) {
    try {
      const { idProduct, price } = req.body;
      const subject = "Your wishlist product has changed in price";

      const foundProduct = await Product.findOne({
        _id: mongoose.Types.ObjectId(idProduct),
      });

      const body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
              <title>Email Template for Order Confirmation Email</title>
              
              <!-- Start Common CSS -->
              <style type="text/css">
                  #outlook a {padding:0;}
                  body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; font-family: Helvetica, arial, sans-serif;}
                  .ExternalClass {width:100%;}
                  .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
                  .backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}
                  .main-temp table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family: Helvetica, arial, sans-serif;}
                  .main-temp table td {border-collapse: collapse;}
              </style>
              <!-- End Common CSS -->
          </head>
          <body>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" class="backgroundTable main-temp" style="background-color: #d5d5d5;">
                  <tbody>
                      <tr>
                          <td>
                              <table width="600" align="center" cellpadding="15" cellspacing="0" border="0" class="devicewidth" style="background-color: #ffffff;">
                                  <tbody>
                                      <!-- Start header Section -->
                                      <tr>
                                          <td style="padding-top: 30px;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #eeeeee; text-align: center;">
                                                  <tbody>
                                                      <tr>
                                                          <td style="padding-bottom: 10px;">
                                                              <a href="https://htmlcodex.com"><img src="" alt="PapaChina" /></a>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666;">
                                                              3828 Mall Road
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666;">
                                                              Los Angeles, California, 90017
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666;">
                                                              Phone: 310-807-6672 | Email: info@example.com
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 25px;">
                                                              <strong>Order Number:</strong> 001 | <strong>Order Date:</strong> 21-Nov-19
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End header Section -->
                                      
                                      <!-- Start address Section -->
                                      <tr>
                                          <td style="padding-top: 0;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #bbbbbb;">
                                                  <tbody>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 16px; font-weight: bold; color: #666666; padding-bottom: 5px;">
                                                              Delivery Adderss
                                                          </td>
                                                          <td style="width: 45%; font-size: 16px; font-weight: bold; color: #666666; padding-bottom: 5px;">
                                                              Billing Address
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              James C Painter
                                                          </td>
                                                          <td style="width: 45%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              James C Painter
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              3939  Charles Street, Farmington Hills
                                                          </td>
                                                          <td style="width: 45%; font-size: 14px; line-height: 18px; color: #666666;">
                                                              3939  Charles Street, Farmington Hills
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="width: 55%; font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 10px;">
                                                              Michigan, 48335
                                                          </td>
                                                          <td style="width: 45%; font-size: 14px; line-height: 18px; color: #666666; padding-bottom: 10px;">
                                                              Michigan, 48335
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End address Section -->
                                      
                                      <!-- Start product Section -->
                                      <tr>
                                          <td style="padding-top: 0;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner" style="border-bottom: 1px solid #eeeeee;">
                                                  <tbody>
                                                      <tr>
                                                          <td rowspan="4" style="padding-right: 10px; padding-bottom: 10px;">
                                                              <img style="height: 80px;" src=${foundProduct.img} alt="Product Image" />
                                                          </td>
                                                          <td colspan="2" style="font-size: 14px; font-weight: bold; color: #666666; padding-bottom: 5px;">
                                                              ${foundProduct.title}
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575; width: 440px;">
                                                              rate: ${foundProduct.rate}
                                                          </td>
                                                          <td style="width: 130px;"></td>
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575;">
                                                              Description: ${foundProduct.description}
                                                          </td>
                                                          
                                                      </tr>
                                                      <tr>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575; padding-bottom: 10px;">
                                                              Price:
                                                          </td>
                                                          <td style="font-size: 14px; line-height: 18px; color: #757575; text-align: right; padding-bottom: 10px;">
                                                              <b style="color: #666666;">${foundProduct.price}</b> Total
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      
                                      <!-- End product Section -->
                                      
                                      <!-- Start calculation Section -->
                                      
                                      <!-- End calculation Section -->
                                      
                                      <!-- Start payment method Section -->
                                      <tr>
                                          <td style="padding: 0 10px;">
                                              <table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner">
                                                  <tbody>
                                                      
                                                      <tr>
                                                          <td colspan="2" style="width: 100%; text-align: center; font-style: italic; font-size: 13px; font-weight: 600; color: #666666; padding: 15px 0; border-top: 1px solid #eeeeee;">
                                                              <b style="font-size: 14px;">Note:</b> Shop bán theme và template siêu cấp vip pro :v
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                      <!-- End payment method Section -->
                                  </tbody>
                              </table>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </body>
      </html>`;

      const foundWishlist = await Users.find(
        { wishlist: mongoose.Types.ObjectId(idProduct) },
        "email"
      );

      Promise.all(
        foundWishlist.map(async (user) => {
          await mailer.sendMail(user.email, subject, body);
        })
      );

      return res.json({
        msg: "Send Mail WishList",
        foundWishlist,
        foundProduct,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async sendPromotion(req, res) {
    try {
      const { content } = req.body;

      io.emit("Server-sent-notification", { content: content });
      return res.json({ msg: "Send promotion success", content });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async getAllClientOnline(req, res) {
    try {
      const list = getClientOnline();
      return res.json({ client: list });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async sendNotification(req, res) {
    try {
      const { listUser, content } = req.body;

      const listOnline = getClientOnline();
      listUser.forEach(async (e) => {
        const foundUser = listOnline.filter((el) => {
          if (el.userId === e) return el;
        });

        if (foundUser) {
          foundUser.map(async (ell) => {
            io.to(ell.socketId).emit("Server-sent-notify", {
              content: content,
            });
          });
        }
        await Users.updateOne(
          { _id: mongoose.Types.ObjectId(e) },
          {
            $push: {
              notification: {
                content: content,
                Date: Date().toLocaleString("en-US", {
                  timeZone: "Asia/Ho_Chi_Minh",
                }),
              },
            },
          }
        );
      });
      return res.json({ msg: "Send notification", listUser, content });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async sendNotificationBanner(req, res) {
    try {
      const { content } = req.body;
      io.emit("Server-sent-notification", {
        content: content,
      });
      return res.json({ msg: "Send notification", content });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.message });
    }
  }
  // async removeNotify(req, res) {
  //   try {

  //   } catch (error) {
  //     return res.status(500).json({ msg: error.message });

  //   }
  // }
  async uploadRar(req, res) {
    try {
      const { idProduct } = req.body;
      const source = "/uploads_rar/" + req.file.filename;
      await Product.updateOne({ _id: idProduct }, { $set: { source: source } });

      return res.json({
        msg: "Add preview image success",
        idProduct,
        source,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async removeProduct(req, res) {
    try {
      const { idProduct } = req.body;
      const foundProduct = await Product.deleteOne({
        _id: mongoose.Types.ObjectId(idProduct),
      });
      if (foundProduct.deletedCount === 1)
        return res.json({ msg: "Delete productId #" + idProduct + " success" });
      else {
        return res.status(500).json({ msg: "Can't find productid" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async removeCategory(req, res) {
    try {
      const { idCategory } = req.body;
      const foundCategory = await Category.deleteOne({
        _id: mongoose.Types.ObjectId(idCategory),
      });
      if (foundCategory.deletedCount === 1)
        return res.json({ msg: "Delete category #" + idCategory + " success" });
      else {
        return res.status(500).json({ msg: "Can't find categoryid" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async updateUser(req, res) {
    try {
      const { idUser, update } = req.body;

      delete update.password;
      delete update._id;
      delete update.wishlist;
      delete update.cart;
      delete update.notification;
      delete update.role;
      delete update.status;

      const foundUser = await Users.updateOne(
        { _id: mongoose.Types.ObjectId(idUser) },
        { $set: update }
      );
      

      if (foundUser.matchedCount === 1)
        return res.json({ msg: "Update userid #" + idUser + " success" });
      else return res.status(500).json({ msg: "Cant find userid" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async deleteUser(req, res) {
    try {
      const { idUser } = req.body;
      const foundUser = await Users.deleteOne({
        _id: mongoose.Types.ObjectId(idUser),
      });
      if (foundUser.deletedCount === 1)
        return res.json({ msg: "Delete userid #" + idUser + " success" });
      else return res.status(500).json({ msg: "Cant find userid" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async removeOrder(req, res) {
    try {
      const { idOrder } = req.body;
      const foundOrder = await Order.deleteOne({
        _id: mongoose.Types.ObjectId(idOrder),
      });
      if (foundOrder.deletedCount === 1)
        return res.json({ msg: "Delete orderid #" + idOrder + " success" });
      else return res.status(500).json({ msg: "Cant find orderid" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async addDiscount(req, res) {
    try {
      let { code,expireDate, startDate, amount } =
        req.body;

      // expireDate = new Date(expireDate).toLocaleString("en-US", {
      //   timeZone: "Asia/Ho_Chi_Minh",
      // });
      // startDate = new Date(startDate).toLocaleString("en-US", {
      //   timeZone: "Asia/Ho_Chi_Minh",
      // });
      // console.log(expireDate);
      // console.log(startDate);
      if (amount < 0) {
        return res.status(500).json({ msg: "Amount must >= 0" });
      }

      if (amount > 100) {
        return res.status(500).json({ msg: "Amount must < 100" });
      }

      const foundDiscount = await Discount.findOne({code}).lean()

      if (foundDiscount) 
        return res.status(500).json({msg: "Discount code has already exist"})

      let newDiscount = new Discount({
        code,
        expireDate,
        startDate,
        amount
      });

      await newDiscount.save();
      return res.json({ msg: "New discount: " + code });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
  async removeDiscount(req, res) {
    try {
      const {code} = req.body
      const foundDiscount = await Discount.deleteOne({
        code: code
      });
      if (foundDiscount.deletedCount === 1)
        return res.json({ msg: "Delete discount " + code + " success" });
      else return res.status(500).json({ msg: "Cant find discount" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
      
    }
  }
  async addUser(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role,
        gender,
        DOB,
        phonenumber,
      } = req.body;

      const foundEmail = await Users.findOne({ email: email });
      if (foundEmail)
        return res.status(400).json({ msg: "This email already registered. " });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      const passwordHash = await bcrypt.hash(password, 12);

      let role1 = "user";
      if (req.user) {
        if (req.user.role === "admin") {
          if (role) {
            role1 = role;
          }
        }
      }

      const newUser = new Users({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: passwordHash,
        role: role1,
        DOB,
        gender,
        phonenumber,
      });

      await newUser.save();

      return res.json({
        msg: "Add User Success! ",
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
      
    }
  }
  async getDiscount(req, res) {
    try {
      const foundDiscount = await Discount.find().lean()

      return res.json({foundDiscount})
    } catch (error) {
      return res.status(500).json({ msg: error.message });
      
    }
  }
  async updateDiscount(req, res) {
    try {
      const {code, startDate, expireDate, amount} = req.body
      
      if (startDate && expireDate) {
        if (new Date(startDate) <= new Date(expireDate)) {
          return res.status(500).json({msg: "startDate must > expireDate"})
        }
      }

      if (!code || code === '') {
        return res.status(500).json({msg: "Must have code"})
      }

      if (amount > 100) {
        return res.status(500).json({msg: "Amount must < 100"})
      }

      const foundDiscount = await Discount.updateOne({code: code}, {$set: {startDate, expireDate, amount}})

      if (foundDiscount.matchedCount === 1) {
        return res.json({msg: "Update success", code, startDate, expireDate, amount})
      }
      else {
        return res.status(500).json({msg: "Cant find discount"})
      }
      
    } catch (error) {
      return res.status(500).json({ msg: error.message });
      
    }
  }
}

module.exports = new AdminController();
