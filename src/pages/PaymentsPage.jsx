import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserData } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const PaymentsPage = () => {
  const { user } = UserData();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const endpoint = user.role === "hirer" ? "/sent" : "/received";
        const response = await axios.get(
          `http://localhost:5000/api/payment${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPayments(response.data);
      } catch (err) {
        setError("Failed to load payments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, navigate]);

  if (loading) {
    return (
      <p className="text-center text-gray-600 text-lg mt-10">Loading...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-6">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        {user.role === "hirer" ? "Sent Payments" : "Received Payments"}
      </h1>
      {payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Project</th>
                <th className="py-3 px-4 text-left">
                  {user.role === "hirer" ? "Freelancer" : "Hirer"}
                </th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Payment Method</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b">
                  <td className="py-3 px-4">
                    {payment.project?.title || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {user.role === "hirer"
                      ? `${payment.freelancer?.firstName} ${payment.freelancer?.lastName}`
                      : `${payment.hirer?.firstName} ${payment.hirer?.lastName}`}
                  </td>
                  <td className="py-3 px-4">NPR {payment.amount}</td>
                  <td className="py-3 px-4">{payment.paymentMethod}</td>
                  <td className="py-3 px-4">{payment.status}</td>
                  <td className="py-3 px-4">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
