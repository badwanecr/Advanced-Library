import { Modal, message } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Subscribe } from "../../apicalls/ebooks";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import Button from "../../components/Button";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/**
 * The one common control above the ebook grid. Staff see nothing to buy, a patron with no
 * plan sees Subscribe, a monthly patron sees Upgrade priced with their unused days credited,
 * and a yearly patron just sees how long they are covered for.
 */
function SubscriptionBar({ access, onChanged }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  if (!access) return null;

  if (access.unlimitedByRole) {
    return (
      <div className="card subscription-bar">
        <div>
          <h2 className="subscription-bar-title">Full access</h2>
          <span className="text-sm text-muted">
            As {access.role === "admin" ? "an admin" : "a librarian"} you can open every ebook.
          </span>
        </div>
      </div>
    );
  }

  const subscription = access.subscription;

  const buy = async (plan) => {
    try {
      dispatch(ShowLoading());
      const response = await Subscribe({ plan });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setOpen(false);
        onChanged();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <div className="card subscription-bar">
        <div>
          <h2 className="subscription-bar-title">
            {subscription ? `${subscription.plan === "yearly" ? "Yearly" : "Monthly"} plan active` : "Read every ebook"}
          </h2>
          <span className="text-sm text-muted">
            {subscription
              ? `Covered until ${formatDate(subscription.endDate)}`
              : `Subscribe from ₹${access.monthlyPrice}/month, or rent single books by the month.`}
          </span>
        </div>

        {access.action === "subscribe" && <Button title="Subscribe" onClick={() => setOpen(true)} />}
        {access.action === "upgrade" && (
          <Button title={`Upgrade to yearly · ₹${access.upgradePrice}`} onClick={() => setOpen(true)} />
        )}
      </div>

      <Modal
        title={access.action === "upgrade" ? "Upgrade your plan" : "Choose a plan"}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
      >
        {access.action === "upgrade" ? (
          <div className="plan-list">
            <div className="plan-card">
              <div className="flex justify-between items-center">
                <h3 className="plan-title">Yearly</h3>
                <span className="plan-price">₹{access.upgradePrice}</span>
              </div>
              <span className="text-sm text-muted">
                ₹{access.yearlyPrice} for 12 months, less ₹{access.upgradeCredit} credit for the days left on your
                monthly plan. Your new year starts today.
              </span>
              <Button title="Confirm upgrade" onClick={() => buy("yearly")} />
            </div>
          </div>
        ) : (
          <div className="plan-list">
            <div className="plan-card">
              <div className="flex justify-between items-center">
                <h3 className="plan-title">Monthly</h3>
                <span className="plan-price">₹{access.monthlyPrice}</span>
              </div>
              <span className="text-sm text-muted">Every ebook for 1 month.</span>
              <Button title="Subscribe monthly" variant="outlined" onClick={() => buy("monthly")} />
            </div>
            <div className="plan-card">
              <div className="flex justify-between items-center">
                <h3 className="plan-title">Yearly</h3>
                <span className="plan-price">₹{access.yearlyPrice}</span>
              </div>
              <span className="text-sm text-muted">Every ebook for 12 months.</span>
              <Button title="Subscribe yearly" onClick={() => buy("yearly")} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default SubscriptionBar;
