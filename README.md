<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Prerequisites

Ensure you have the following versions installed:

- Node.js: v24.0 or higher
- npm: 10.0 or higher
- Nest CLI: 11.0 or higher

To check your versions, run:

```bash
node -v
npm -v
nest -v
```

## Installation

1. Clone the repository in your local system:

   ```bash
   git clone https://github.com/eddysantiagoo/wizy-ai
   cd wizy-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # edit .env with the API KEYS and port
   ```

4. Run the application:
   ```bash
   npm run start:dev
   ```

5. Go to Swagger to test the api with the tools:
   ```bash
   http://localhost:3000/docs
   ```

## Optional
If you want to validate the types and build errors
   ```bash
   npm run build
   ```


