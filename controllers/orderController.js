import Order from "../models/order.js";
import Product from "../models/product.js";

function isAdmin(req) {
    return req.user && req.user.role === "admin";
}

export async function createOrder(req, res) {
	
    if (req.user == null) {
        console.log(req.user)
        res.status(401).json({ message: "" });
        return;
    }

	try {
		const orderData = {
			orderId: "ORD000001",
            items: [],
			firstName: req.body.firstName,
			lastName: req.body.lastName,
            email: req.user.email,
			addressLine1: req.body.addressLine1,
			addressLine2: req.body.addressLine2,
			city: req.body.city,
            postalCode: req.body.postalCode, 
			phone: req.body.phone,
            total: 0,
		};

        if(orderData.firstName == ""){
            orderData.firstName = req.user.firstName
        }
        if(orderData.lastName == ""){
            orderData.lastName = req.user.lastName
        }

        if(orderData.addressLine1 == ""){
            res.status(400).json({ message : "Address Line 1 is required" })
            return
        }
        if(orderData.addressLine2 == ""){
            res.status(400).json({ message : "Address Line 2 is required" })
            return
        }
        if(orderData.city == ""){
            res.status(400).json({ message : "City is required" })
            return
        }
        if(orderData.postalCode == ""){
            res.status(400).json({ message : "Postal Code is required" })
            return
        }

		const lastOrder = await Order.findOne().sort({ date: -1 });

		if (lastOrder != null) {
			const lastOrderId = lastOrder.orderId; 
			const lastOrderNumberInString = lastOrderId.replace("ORD", ""); 
			const lastOrderNumber = parseInt(lastOrderNumberInString); 
			const newOrderNumber = lastOrderNumber + 1; 
			const newOrderNumberInString = newOrderNumber.toString().padStart(6, "0"); 
			orderData.orderId = "ORD" + newOrderNumberInString; 


		}

        for(let i = 0; i< req.body.items.length; i++){
            const item = req.body.items[i]
            const product = await Product.findOne({ productId : item.productId })
            if(product == null){
                res.status(404).json({ message : "Product with id " + item.productId + " not found. Please remove it from your cart and try again." })
                return
            }

            if(product.isVisible == false){
                res.status(404).json({ message : "Product with id " + item.productId + " is not available. Please remove it from your cart and try again." })
                return
            }

            // if(product.qty < item.qty){

            //     res.status(404).json({ message : "Only " + product.qty + " items available for product with id " + item.productId + ". Please adjust the quantity in your cart and try again." })
            //     return
            // }

            orderData.items.push({
                productId : product.productId,
                name : product.name,
                price : product.price,
                labelledPrice : product.labeledPrice,
                image: (product.image && product.image.length > 0) ? product.image[0] : "/images/default.png",
                qty : item.qty
            })

            orderData.total += product.price * item.qty
        }
        
        const order = new Order(orderData);
        await order.save();

        //reduce the qty from the products collection
        // for(let i = 0; i< orderData.items.length; i++){

        //     const item = orderData.items[i]
        //     await Product.updateOne({ productId : item.productId }, { $inc : { qty : -item.qty } })
        // }

        res.status(201).json({ message: "Order created successfully", orderId : orderData.orderId });

	} catch (error) {
		console.log("Error creating order", error);
		res.status(500).json({ message: "Error creating order", error: error });
	}
}

export async function getAllOrders(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Forbidden. Only admins can view all orders." });
    }

    const pageSize = parseInt(req.params.pageSize || "10");
    const pageNumber = parseInt(req.params.pageNumber || "1");

    try {
        const numberOfOrders = await Order.countDocuments();
        const numberOfPages = Math.ceil(numberOfOrders / pageSize);
        const orders = await Order.find().sort({ date: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);

        res.json({ orders: orders, totalPages: numberOfPages });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all orders", error: error });
    }
}

export async function getMyOrders(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Unauthorized. Please log in to view your orders." });
    }

    const pageSize = parseInt(req.params.pageSize || "10");
    const pageNumber = parseInt(req.params.pageNumber || "1");

    try {
        const numberOfOrders = await Order.countDocuments({ email: req.user.email });
        const numberOfPages = Math.ceil(numberOfOrders / pageSize);

        const orders = await Order.find({ email: req.user.email }).sort({ date: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);

        res.json({ orders: orders, totalPages: numberOfPages });
    } catch (error) {
        res.status(500).json({ message: "Error fetching your orders", error: error });
    }
}

export async function updateOrderStatusAndNotes(req, res) {

    console.log("Logged in User Data:", req.user);

  if (isAdmin(req)) {
    
    const orderId = req.params.orderId;

    try {
      await Order.updateOne(
        { orderId: orderId }, 
        { status: req.body.status, notes: req.body.notes }
      );
      res.json({ message: "Order status and notes updated successfully" });

    } catch (error) {
      console.log("Error updating order status and notes", error);
      res.status(500).json({ 
        message: "Error updating order status and notes", 
        error: error 
      });
      return;
    }

  } else {
    res.status(403).json({ 
      message: "Forbidden. Only admins can update order status and notes." 
    });
  }
}