# RailSeva

This is a Next.js project for a Railway Complaint Management System, enhanced with AI capabilities for auto-categorization and priority scoring.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js (version 18 or later) and npm installed on your system.

### Installation & Setup

1.  **Clone the repository or download the source code.**

2.  **Install dependencies:**
    Open your terminal in the project's root directory and run the following command:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    The project uses Genkit to interact with the Google Gemini API for its AI features. You'll need to provide an API key.

    Create a new file named `.env` in the root of your project and add the following line:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    Replace `YOUR_GEMINI_API_KEY` with your actual Google AI Gemini API key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the Development Server:**
    Once the dependencies are installed and the environment variable is set, you can start the Next.js development server:
    ```bash
    npm run dev
    ```

5.  **Open the application:**
    Open your browser and navigate to [http://localhost:9002](http://localhost:9002) (or the URL shown in your terminal) to see the application running.
