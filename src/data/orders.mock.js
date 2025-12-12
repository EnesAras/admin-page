// src/data/orders.mock.js

const methodPool = ["Credit Card", "PayPal", "Bank Transfer", "Apple Pay"];

const firstNames = [
  "cem", "Maria", "David", "Emily", "John", "Sarah", "Mike", "Emma",
  "Luiz", "Rhea", "Noah", "Olivia", "Liam", "Sophia", "Mason", "Mia",
  "Ethan", "Ava", "James", "Isla", "Leo", "Chloe", "Daniel", "Grace",
];
const lastNames = [
  "Turner", "Lopez", "Kim", "Brown", "Doe", "Smith", "Johnson", "Davis",
  "Silva", "Murphy", "Martin", "Garcia", "Wilson", "Taylor", "Anderson",
  "Thomas", "Moore", "Jackson", "White", "Harris",
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateYYYYMMDD(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMoney(min = 12, max = 900) {
  const val = min + Math.random() * (max - min);
  return Math.round(val * 100) / 100;
}

function randomDateWithinDays(daysBack = 900) {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - daysBack);

  const t = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(t);
}

// Özellikle eski tarihler de serpiştirelim
const fixedDates = [
  "2022-11-09", "2023-02-12", "2023-06-29", "2023-12-31",
  "2024-01-05", "2024-07-03", "2024-09-18",
  "2025-02-10", "2025-12-01",
];

function makeFakeOrders(count = 140, daysBack = 1000) {
  return Array.from({ length: count }).map((_, idx) => {
    const first = randomItem(firstNames);
    const last = randomItem(lastNames);

    const date =
      idx < fixedDates.length
        ? fixedDates[idx]
        : formatDateYYYYMMDD(randomDateWithinDays(daysBack));

    // delivered biraz daha sık gelsin istiyorsan küçük bir ağırlık:
    const roll = Math.random();
    const status =
      roll < 0.35 ? "Delivered" :
      roll < 0.55 ? "Shipped" :
      roll < 0.85 ? "Pending" :
      "Cancelled";

    return {
      id: 1000 + idx + 1,
      customer: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 90 + 10)}@example.com`,
      date,
      total: randomMoney(15, 900),
      status,
      method: randomItem(methodPool),
    };
  });
}

const ordersMock = makeFakeOrders(400, 4500);
export default ordersMock;
