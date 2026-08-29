# Contributing to SyncMasters CPSE Material Intelligence Portal

First off, thank you for considering contributing to the SyncMasters project! It's people like you that make this platform robust and scalable.

## Development Workflow

1.  **Fork the repository:** Create your own fork of the code.
2.  **Clone the project:** Clone the fork to your local machine.
3.  **Create a branch:** Create a new feature or bugfix branch (`git checkout -b feature/your-feature-name`).
4.  **Make your changes:** Implement your feature or fix. Ensure you are following the architectural patterns already established in the `frontend` (React), `Backend` (Cloudflare Workers), and `ai_backend` (Python).
5.  **Commit your changes:** Write clear, concise commit messages.
6.  **Push to your fork:** Push the branch to your GitHub fork.
7.  **Submit a Pull Request (PR):** Open a PR against the `main` branch of this repository.

## Setting Up Your Development Environment

Please see the `README.md` for detailed instructions on how to set up the React frontend, Cloudflare Edge API, and the local Python AI server.

### Coding Standards
*   **Frontend:** React with TypeScript (where applicable) and Tailwind CSS for styling. Strictly follow GovTech accessible design principles (high contrast, clear tables).
*   **Backend:** ES Modules exclusively (`import`/`export`). Cloudflare Workers environment. Do not use Node.js specific libraries like `fs` or `multer`.
*   **AI Backend:** Python 3.10+. Keep AI Orchestrator logic modular.

## Reporting Bugs

If you find a bug, please create an Issue on GitHub with:
1. A clear title and description.
2. Steps to reproduce the bug.
3. The expected behavior vs the actual behavior.
4. Screenshots if it is a UI bug.

**Note:** If you find a security vulnerability, do NOT open a public issue. See our `SECURITY.md` for responsible disclosure instructions.

Thank you for contributing!
