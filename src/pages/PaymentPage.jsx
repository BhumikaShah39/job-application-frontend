// PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserData } from "../context/UserContext";
import { toast } from "react-hot-toast";
import {
  FaRegCreditCard,
  FaCalendarAlt,
  FaLock,
  FaUser,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";

const stripePromise = loadStripe(
  "pk_test_51RBwkS4ERPs70rNrlWi7xFEyIitr8ANpsVWPYfXQ0Urav38HLPKKf8Jcj6kbcgOJpnDvHl0476MH4BRpkP3nqQoh00ImNwgLuB"
);

const StripePaymentForm = ({
  amount,
  projectTitle,
  jobId,
  projectId,
  onSuccessNavigate,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleStripePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to proceed with payment.");
        setLoading(false);
        return;
      }

      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-payment-intent",
        { amount, jobId, projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!stripe || !elements) {
        setError("Stripe or elements not initialized.");
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardNumberElement);
      if (!cardElement) {
        setError("Card details are missing.");
        setLoading(false);
        return;
      }

      const paymentResult = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: "Test User" },
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
      } else {
        // Confirm the payment on the backend
        await axios.post(
          "http://localhost:5000/api/payment/confirm-stripe-payment",
          { paymentId: data.paymentId, projectId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(true);
        toast.success(
          "Payment Successful! Project status updated to Completed."
        );
        setTimeout(() => onSuccessNavigate(), 3000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Payment failed. Please try again.";
      setError(errorMessage);
      console.error("Payment error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleStripePayment} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">Card Number</label>
          <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
            <FaRegCreditCard className="text-gray-500 mr-3" />
            <CardNumberElement className="flex-1 text-gray-800" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label className="block text-gray-700 font-medium">
              Expiry Date
            </label>
            <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
              <FaCalendarAlt className="text-gray-500 mr-3" />
              <CardExpiryElement className="flex-1 text-gray-800" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="block text-gray-700 font-medium">CVC</label>
            <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-gray-50">
              <FaLock className="text-gray-500 mr-3" />
              <CardCvcElement className="flex-1 text-gray-800" />
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 font-medium"
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay NPR ${amount}`}
        </button>
      </form>
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
            <h2 className="text-green-600 text-2xl font-bold mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-700 mb-4">
              The project <strong>{projectTitle}</strong> has been marked as
              completed.
            </p>
            <button
              onClick={onSuccessNavigate}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentPage = () => {
  const { id } = useParams(); // This will be undefined for /payment-callback
  const { user } = UserData();
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [khaltiError, setKhaltiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || `/hirer/${user._id}/projects`;

  useEffect(() => {
    const fetchProjectDetails = async (projectId) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjectDetails(response.data);
      } catch (err) {
        setError("Failed to load project details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Get projectId from either useParams or query parameters
    const query = new URLSearchParams(location.search);
    const projectIdFromQuery = query.get("projectId");
    const projectId = id || projectIdFromQuery; // Use id from URL or query parameter

    if (projectId) {
      fetchProjectDetails(projectId);
    } else {
      setError("Project ID not found.");
      setLoading(false);
    }
  }, [id, navigate, location]);

  useEffect(() => {
    // Load Khalti Checkout script dynamically
    const script = document.createElement("script");
    script.src = "https://khalti.com/static/khalti-checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleKhaltiPayment = async () => {
    setPaymentMethod("khalti");
    setKhaltiError(null);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/initiate-khalti-payment",
        {
          amount: projectDetails.payment,
          projectId: projectDetails._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.href = data.payment_url;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to initiate Khalti payment";
      const errorDetails = error.response?.data?.details || error.message;
      setKhaltiError(
        `${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`
      );
      console.error(
        "Khalti payment error:",
        error.response?.data || error.message
      );
    }
  };

  const handleBack = () => {
    navigate(from);
  };

  const handleSuccessNavigate = () => {
    navigate(from);
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("payment") === "success") {
      setSuccess(true);
      toast.success("Payment Successful! Project status updated to Completed.");
      setTimeout(() => navigate(from), 3000);
    }
  }, [location, navigate, from]);

  if (loading) {
    return (
      <p className="text-center text-gray-600 text-lg mt-10">Loading...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-6">{error}</p>;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-6 pt-20">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition duration-300"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Payment for {projectDetails.title}
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Price: NPR {projectDetails.payment}
        </p>
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Project Details
          </h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center">
              <FaUser className="text-[#58A6FF] mr-2" />
              <p>
                <span className="font-medium">Freelancer:</span>{" "}
                {projectDetails.freelancer?.firstName || "Not specified"}{" "}
                {projectDetails.freelancer?.lastName || ""}
              </p>
            </div>
            <div className="flex items-center">
              <FaClock className="text-[#58A6FF] mr-2" />
              <p>
                <span className="font-medium">Duration:</span>{" "}
                {projectDetails.duration
                  ? `${projectDetails.duration} day${
                      projectDetails.duration > 1 ? "s" : ""
                    }`
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
        {!paymentMethod && (
          <div className="flex flex-col items-center my-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Select Payment Method
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
              <button
                onClick={() => setPaymentMethod("stripe")}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-medium w-full sm:w-auto"
              >
                Pay with Stripe
              </button>
              <button
                onClick={handleKhaltiPayment}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-medium w-full sm:w-auto"
              >
                Pay with Khalti
              </button>
            </div>
          </div>
        )}
        {paymentMethod === "stripe" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Pay with Stripe
              </h3>
              <button
                onClick={() => setPaymentMethod(null)}
                className="text-[#58A6FF] hover:underline text-sm"
              >
                Change Method
              </button>
            </div>
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                amount={projectDetails.payment}
                projectTitle={projectDetails.title}
                jobId={projectDetails.applicationId?.jobId?._id}
                projectId={projectDetails._id}
                onSuccessNavigate={handleSuccessNavigate}
              />
            </Elements>
          </div>
        )}
        {paymentMethod === "khalti" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Pay with Khalti
              </h3>
              <button
                onClick={() => {
                  setPaymentMethod(null);
                  setKhaltiError(null);
                }}
                className="text-[#58A6FF] hover:underline text-sm"
              >
                Change Method
              </button>
            </div>
            {khaltiError ? (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
                <p>{khaltiError}</p>
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="mt-2 text-[#58A6FF] hover:underline text-sm"
                >
                  Try Another Payment Method
                </button>
              </div>
            ) : (
              <div className="text-center p-4 text-gray-600">
                <p>Processing your Khalti payment...</p>
              </div>
            )}
          </div>
        )}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
              <h2 className="text-green-600 text-2xl font-bold mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-700 mb-4">
                The project <strong>{projectDetails.title}</strong> has been
                marked as completed.
              </p>
              <button
                onClick={handleSuccessNavigate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
