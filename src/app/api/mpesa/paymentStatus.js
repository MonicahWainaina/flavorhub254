let lastPaymentStatus = null;

export function setPaymentStatus(status) {
  lastPaymentStatus = status;
}

export function getPaymentStatus() {
  return lastPaymentStatus;
}