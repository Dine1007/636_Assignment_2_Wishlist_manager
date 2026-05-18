require('dotenv').config();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');
const User = require('../models/User');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Collect unique reserver emails for all reserved/purchased items in a wishlist
async function getReserverEmails(wishlistId) {
  const items = await WishlistItem.find({
    wishlist: wishlistId,
    reservedBy: { $ne: null },          // has a reserver
    status: { $in: ['reserved', 'purchased'] },
  }).populate('reservedBy', 'email');   // grab email directly

  const emails = new Set();
  for (const item of items) {
    if (item.reservedBy?.email) emails.add(item.reservedBy.email);
  }
  return emails;
}

async function sendReminderEmail(email, wishlistName, daysLeft, dueDate) {
  await transporter.sendMail({
    from: `"Gift Wishlist Manager" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⏰ Reminder: "${wishlistName}" is due in ${daysLeft} day(s)!`,
    html: `
      <h2>Gift Wishlist Reminder</h2>
      <p>Hi there!</p>
      <p>You have reserved an item in <strong>${wishlistName}</strong>,
         which is due in <strong>${daysLeft} day(s)</strong>
         on <strong>${dueDate.toDateString()}</strong>.</p>
      <p>Please make sure to complete your purchase in time!</p>
      <br/>
      <p>— Gift Wishlist Manager</p>
    `,
  });
}

async function sendExpiryReminders() {
  const now = new Date();

  const windows = [
  {
    label:    '7-day',
    flag:     'reminder7DaySent',
    from:     new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000),
    to:       new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000),
    daysLeft: 7,
  },
  {
    label:    '1-day',
    flag:     'reminder1DaySent',
    from:     new Date(now.getTime() + 0.5 * 24 * 60 * 60 * 1000),
    to:       new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000),
    daysLeft: 1,
  },
];

  for (const window of windows) {
    try {
      const wishlists = await Wishlist.find({
        dueDate:       { $gte: window.from, $lte: window.to },
        [window.flag]: false,
      });

      for (const wishlist of wishlists) {
        const emails = await getReserverEmails(wishlist._id);

        for (const email of emails) {
          await sendReminderEmail(email, wishlist.name, window.daysLeft, wishlist.dueDate);
          console.log(`[Reminder] Sent ${window.label} reminder → ${email} for "${wishlist.name}"`);
        }

        // Mark as sent even if no reservers, so we don't keep querying it
        wishlist[window.flag] = true;
        await wishlist.save();
      }

      console.log(`[Reminder] ${window.label} window: processed ${wishlists.length} wishlist(s).`);
    } catch (err) {
      console.error(`[Reminder] Error in ${window.label} window:`, err);
    }
  }
}

function startReminderJob() {
  cron.schedule('0 22 * * *', () => {
    console.log('[Reminder] Running daily expiry check...');
    sendExpiryReminders();
  });
  console.log('[Reminder] Scheduled daily reminder job at 8:00 AM.');
}

module.exports = { startReminderJob, sendExpiryReminders };