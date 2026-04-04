# Campus Hub Backend

Node.js + Express API for the Campus Hub app.

## Setup

1. Install dependencies
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/campus_hub
   JWT_SECRET=super-secret-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

3. Run migrations from the `databases/migrations` folder.

4. Start the server
   ```bash
   npm run dev
   ```

## Main endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users/notifications`
- `PATCH /api/users/notifications/:id/read`
- `GET /api/campuses`
- `GET /api/campuses/:id`
- `POST /api/campuses`
- `PUT /api/campuses/:id`
- `DELETE /api/campuses/:id`
