# PropPilot

## Project Overview

PropPilot is an AI-powered proposal creation system designed for businesses. It aims to streamline the proposal generation process by leveraging AI agents for requirement extraction, content generation, design, compliance validation, and editing.

## Architecture

The system follows a modular architecture with distinct components for the frontend, backend, and AI agents.

### Frontend

*   **Rich Chat Interface:** Provides a user-friendly interface for interacting with the system.
*   **Markdown Support:** Enables users to format proposals using Markdown.
*   **File Upload Capabilities:** Allows users to upload relevant documents and resources.
*   **Real-time Editing:** Supports collaborative editing with real-time updates.
*   **Version History Tracking:** Maintains a history of proposal versions for easy rollback and auditing.
*   **Inline Commenting/Suggestion System:** Facilitates feedback and collaboration through inline comments and suggestions.
*   **Mobile-Responsive Design:** Ensures accessibility across various devices.
*   **Technology:** React/Next.js (recommended)

### Backend

*   **API Endpoints:** Provides RESTful APIs for the frontend to interact with the system.
*   **Vector Database Integration:** Connects to a vector database (Pinecone/Chroma) for storing and retrieving proposal content.
*   **Authentication:** Implements user authentication using Auth0/Clerk.
*   **Real-time Communication:** Supports real-time updates using WebSockets.
*   **Technology:** Python (FastAPI)

### Agent Workflow Architecture

The system utilizes a family of conversation agents to automate various aspects of proposal creation.

*   **Requirement Extraction Agent:** Extracts key requirements from user input and project documentation.
*   **Research & Content Generation Agent:** Conducts research and generates relevant content for the proposal.
*   **Design & Layout Agent:** Creates visually appealing and professional proposal layouts.
*   **Compliance & Validation Agent:** Ensures that the proposal complies with relevant regulations and standards.
*   **Editing & Refinement Agent:** Edits and refines the proposal content for clarity and accuracy.

### Temporal Workflow Characteristics

*   **Stateful Conversation Preservation:** Preserves the context of conversations between users and agents.
*   **Ability to Branch and Explore Alternative Proposal Paths:** Allows users to explore different proposal options and scenarios.
*   **Granular Undo/Redo Functionality:** Provides fine-grained control over changes made to the proposal.
*   **Persistent Context Management:** Maintains a consistent context throughout the proposal creation process.

## Technical Stack

*   **Frontend:** React/Next.js
*   **Backend:** Python (FastAPI)
*   **LLM:** LiteLLM, smolagents, MCP
*   **Vector Database:** Pinecone/Chroma
*   **Authentication:** Auth0/Clerk
*   **Real-time Infrastructure:** WebSockets
*   **Deployment:** Kubernetes/Docker

## Setup Instructions

1.  Clone the repository: `git clone <repository_url>`
2.  Install the backend dependencies: `cd backend && pip install -r requirements.txt`
3.  Configure the environment variables:
    *   `VECTOR_DB`: Choose between "pinecone" or "chroma" (default: "chroma")
    *   `PINECONE_API_KEY`: (Required if using Pinecone) Your Pinecone API key
    *   `PINECONE_ENVIRONMENT`: (Required if using Pinecone) Your Pinecone environment
    *   `AUTH0_DOMAIN`: Your Auth0 domain
    *   `API_IDENTIFIER`: Your Auth0 API identifier
4.  Run the backend: `uvicorn backend.main:app --host 0.0.0.0 --port 51251 --reload`
5.  Set up the frontend (instructions to be added later)

## Deployment

The system can be deployed using Docker and Kubernetes. A `Dockerfile` is provided in the root directory for building a Docker image. Kubernetes deployment configurations will be added in the future.

## Roadmap

**Current State:** Backend core structure established with FastAPI, vector database integration (ChromaDB), placeholder authentication (Auth0), and a basic Dockerfile.

**Pending Tasks:**

*   **Backend Core Development (Phase 1 - In Progress)**
    *   [ ] Fully integrate and configure LiteLLM for content generation (requires resolving environment issues).
    *   [ ] Implement Auth0 authentication and authorization.
    *   [ ] Develop API endpoints for proposal creation, retrieval, and management.
    *   [ ] Implement WebSocket endpoint for real-time communication.
*   **Agent Workflow Implementation (Phase 2 - To Do)**
    *   [ ] Develop the Requirement Extraction Agent.
    *   [ ] Implement the Research & Content Generation Agent.
    *   [ ] Create the Design & Layout Agent.
    *   [ ] Develop the Compliance & Validation Agent.
    *   [ ] Implement the Editing & Refinement Agent.
*   **Frontend Development (Phase 3 - To Do)**
    *   [ ] Develop the rich chat interface.
    *   [ ] Implement Markdown support and file upload capabilities.
    *   [ ] Integrate real-time editing and version history tracking.
    *   [ ] Create the inline commenting/suggestion system.
    *   [ ] Ensure mobile-responsive design.
*   **Deployment and Scaling (Phase 4 - To Do)**
    *   [ ] Containerize the application using Docker.
    *   [ ] Deploy the application to Kubernetes.
    *   [ ] Implement monitoring and logging.
    *   [ ] Optimize the system for scalability and performance.

## Contributing

Contributions are welcome! Please submit pull requests with detailed descriptions of your changes.
