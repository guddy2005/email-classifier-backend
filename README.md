# AI Email Classifier - Backend

This directory contains the Node.js backend for the AI Email Classifier application. It handles user authentication, integration with the Gmail API, and email classification using a custom-trained machine learning model.

## API Endpoints

### Authentication (`/api/auth`)

-   `POST /register`: Register a new user.
    -   Body: `{ "username", "email", "password" }`
-   `POST /login`: Log in an existing user.
    -   Body: `{ "email", "password" }`
-   `GET /connect/google`: Initiates the Google OAuth 2.0 flow to connect a user's Gmail account. (Redirects to Google)
-   `GET /connect/google/callback`: Callback URL for Google OAuth 2.0.

### Emails (`/api`)

-   `GET /emails`: Fetches and classifies the latest emails for the authenticated user. (Requires JWT)
-   `POST /classify`: Classifies a given email snippet. (Requires JWT)
    -   Body: `{ "subject", "snippet" }`

### Analytics (`/api`)

-   `GET /analytics`: Retrieves analytics data about the user's emails. (Requires JWT)

## Environment Variables

Create a `.env` file in this `Server/` directory with the following variables. For deployment, these should be set in your hosting provider's environment settings.

```env
# Server Configuration
PORT=8080
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY
JWT_EXPIRES_IN=1d

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://your-backend-url.com/api/auth/connect/google/callback
```

## Running the Server

1.  Navigate to the project root directory.
2.  Install dependencies: `npm install`
3.  Run the server in development mode: `npm run dev`

The server will start on the port specified in your `.env` file (or 8080 by default).

## Running Tests

To run the backend tests, execute the following command from the project root:

```bash
npm test
```