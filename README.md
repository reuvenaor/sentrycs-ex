# Sentrycs Exercise FED

**Issuer: Reuven Naor**
**Date: 25/06/2025**

## Exercise Description:

This exercise involves two main parts. First, you'll implement a custom event listener class based on a provided template, ensuring it can register, remove, and emit events. Second, you will use this event listener to build a Wordle-like game in React, where users can input letters, delete them, and submit a word for validation against a dictionary. The UI should provide feedback on the word's validity by changing the border colors of the input squares.

## Exercise Solution:

- Part 1: Custom Event Listener
- Part 2: Create Event Hook
- Part 3: Connect to Zustand Store
- Part 4: Create Wordle Game UI
- Part 5: Connect UI and Logic
- Part 6: Add Dictionary API Validation (optional)

## Not Included:
- Loading UI
- Better API handling and caching - use react-query or similar
- Unit Tests
- Monitoring and Logging

## Tech Stack

- React Router
- Zustand Store
- TailwindCSS
- Shadcn UI
- Vite

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## Screenshot

![Project Screenshot](./Screenshot.png)