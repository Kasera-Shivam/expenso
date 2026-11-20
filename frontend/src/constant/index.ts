const AMOUNT_INPUT = /^\d{0,8}(\.\d{0,2})?$/;

const PAYMENT_METHOD = ["cash", "upi", "card", "other"] as const;

const constant = { AMOUNT_INPUT, PAYMENT_METHOD };

export default constant;
