import * as dotenv from 'dotenv';

dotenv.config();
export const user = process.env.DB_USER;
export const password = process.env.DB_PASSWORD;
export const name = process.env.DB_NAME;
export const secret = process.env.JWT_SECRET;
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'shoemmelier-e1df9.firebaseapp.com',
  projectId: 'shoemmelier-e1df9',
  storageBucket: 'shoemmelier-e1df9.appspot.com',
  messagingSenderId: '793911458763',
  appId: '1:793911458763:web:b183b69957aaaf04bad44e',
};
