# Recipe Generator Backend

This is the backend server for the Recipe Generator application, built with Node.js, Express, and Mongoose for MongoDB integration. It provides APIs for user authentication, recipe management, favorites, ratings, and deals.

## Overview
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Deployment**: Vercel
- **API Endpoints**: /api/auth (login, signup, ratings), /api/recipes, /api/favorites, /api/ratings, /api/deals

## Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB instance (local or cloud, e.g., MongoDB Atlas)
- Vercel CLI (for deployment)

## Setup
1. **Clone the Repository**
   ```bash
   git clone https://github.com/MaozGrama/recipe-generator-backend.git
   cd recipe_generator/backend

Install Dependencies
bash npm install

Configure Environment Variables

Create a .env file in the root directory with the following:
textMONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=your-secure-secret-key
PORT=5000

Replace username, password, cluster, and dbname with your MongoDB Atlas credentials.


Run Locally
bashnpm start

The server will run on http://localhost:5000.



Deployment

Install Vercel CLI
bashnpm install -g vercel

Deploy to Vercel
bashvercel --prod

Set environment variables in the Vercel dashboard under "Settings" > "Environment Variables".



Usage

API Testing: Use Postman or a similar tool to test endpoints
(e.g., POST /api/auth/login with { "email": "user@example.com", "password": "pass123" }).
CORS: Configured for https://recipegeneratorfrontend.vercel.app and http://localhost:5173.

Endpoints

POST /api/auth/login: Authenticate a user.
POST /api/auth/signup: Register a new user.
POST /api/auth/ratings: Update user ratings.
GET /api/test: Health check.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Commit changes (git commit -m "Add feature").
Push to the branch (git push origin feature-name).
Open a pull request.

License
MIT License - See LICENSE file for details.
Contact
For issues, contact the project maintainers via the GitHub issues page.

text#### קובץ README - Backend (עברית)

```markdown
# שרת אחורי של מחולל מתכונים

זהו השרת האחורי של יישום מחולל המתכונים, שבנוי עם Node.js, Express ו-Mongoose לשילוב עם MongoDB. הוא מספק ממשקי API לניהול אימות משתמשים, מתכונים, מועדפים, דירוגים ועסקאות.

## סקירה
- **שפה**: TypeScript
- **מסגרת**: Express.js
- **מסד נתונים**: MongoDB (דרך Mongoose)
- **פריסה**: Vercel
- **נקודות קצה API**: /api/auth (התחברות, הרשמה, דירוגים), /api/recipes, /api/favorites, /api/ratings, /api/deals

## דרישות מוקדמות
- Node.js (גרסה 18 או חדשה יותר)
- npm או yarn
- מופע MongoDB (מקומי או בענן, לדוגמה MongoDB Atlas)
- כלי שורת הפקודה של Vercel (לפריסה)

## התקנה
1. **שכפול המאגר**
   ```bash
   git clone https://github.com/MaozGrama/recipe_generator_backend.git
   cd recipe_generator/backend

התקנת תלויות
bash npm install

הגדרת משתני סביבה

צור קובץ .env בשרשור התיקייה עם התוכן הבא:
textMONGODB_URI=mongodb+srv://שם_משתמש:סיסמה@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=מפתח_סודי_מאובטח
PORT=5000

החלף שם_משתמש, סיסמה, cluster ו-dbname בפרטי הגישה שלך ל-MongoDB Atlas.


הרצה מקומית
bash npm start

השרת ירוץ ב-http://localhost:5000.



פריסה

התקנת כלי שורת הפקודה של Vercel
bash npm install -g vercel

פריסה ל-Vercel
bash vercel --prod

הגדר משתני סביבה בלוח הבקרה של Vercel תחת "הגדרות" > "משתני סביבה".



שימוש

בדיקת API: השתמש בכלי כמו Postman לבדיקת נקודות קצה (לדוגמה, POST /api/auth/login עם { "email": "user@example.com", "password": "pass123" }).
CORS: מוגדר עבור https://recipegeneratorfrontend.vercel.app ו-http://localhost:5173.

נקודות קצה

POST /api/auth/login: אימות משתמש.
POST /api/auth/signup: רישום משתמש חדש.
POST /api/auth/ratings: עדכון דירוגי משתמש.
GET /api/test: בדיקת בריאות.

תרומה

צור ענף חדש במאגר.
צור ענף תכונה (git checkout -b feature-name).
בצע שינויים ורשום אותם (git commit -m "הוספת תכונה").
דחוף את הענף (git push origin feature-name).
פתח בקשת משיכה.

רישיון
רישיון MIT - ראה קובץ LICENSE לפרטים.
יצירת קשר
לבעיות, צור קשר עם אנשי התמיכה של הפרויקט דרך דף הבעיות ב-GitHub.
