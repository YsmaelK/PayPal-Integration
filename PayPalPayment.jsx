import { PayPalButtons } from "@paypal/react-paypal-js";
import { Auth } from 'aws-amplify'; // Import Auth from aws-amplify
import { useNavigate } from 'react-router-dom';
import React, { memo } from 'react';

const PayPalPayment = ({ cart }) => {
  const navigate = useNavigate();
  console.log("Cart in PayPalPayment:PPB", cart);

  // Check if cart or subtotal is missing
  if (!cart || !cart.subtotal || !cart.subtotal.formatted_with_symbol) {
    console.error("Invalid cart structure or missing subtotal", cart);
    return null; // or handle appropriately
  }

  const serverUrl = "https://sicktixs-1.onrender.com";

  const createOrder = async () => {
    console.log("Cart in createOrder:", cart);

    // Retrieve user email from AWS Amplify
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userEmail = user.attributes.email;

      return fetch(`${serverUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: {
            product: {
              description: userEmail, // Replace "WOOD CANDY SOFA" with user email
              cost: cart.subtotal.formatted_with_symbol,
            },
          },
        }),
      })
      .then((response) => response.json())
      .then((order) => order.id);
    } catch (error) {
      console.error("Error getting user email:", error);
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      console.log("Data sent to createOrder:", data);
      const orderId = await createOrder();
  
      return actions.order.capture().then((details) => {
        console.log("Payment successful for order ID:", orderId);
        navigate('/payment-success');
      });
    } catch (error) {
      console.error("Error capturing order:", error);
      throw error;
    }
  };
  
  return (
    <PayPalButtons
      createOrder={() => createOrder()}
      onApprove={(data, actions) => onApprove(data, actions)}
    />
  );
};

export default memo(PayPalPayment);