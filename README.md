
# ResQMate | Humanitarian Relief Coordination

A platform connecting NGOs and volunteers for rapid response relief operations.

## SMTP Setup (Admin Portal)

To enable real OTP emails for the Developer Admin Portal using Gmail:

1. **Gmail Setup**:
   - Go to your [Google Account Settings](https://myaccount.google.com/).
   - Navigate to **Security**.
   - Enable **2-Step Verification** (this is mandatory for App Passwords).
   - Search for **"App Passwords"** in the top search bar.
   - Create a new App Password:
     - Name: `ResQMate Admin`
   - Copy the **16-character code** (e.g., `abcd efgh ijkl mnop`).

2. **Environment Variables**:
   Update your `.env` file with these exact values:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_SECURE=true
   ```

## Admin Portal Access
The developer portal is located at `/admin/login`. 
Authorized emails:
- indraneelmandal0387@gmail.com
- tanviacharya569@gmail.com
- krishxtech@gmail.com
