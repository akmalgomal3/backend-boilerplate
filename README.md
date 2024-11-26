# Project Name

## Description

This project is a NestJS application designed to manage and interact with various data and services. It uses TypeScript and several industry-standard tools to streamline development, testing, and deployment processes.


## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.ntx-technology.com/backend/backend-boilerplate.git
git branch -M master
git push -uf origin master
```

## Features

- **NestJS Framework** for building scalable server-side applications.
- **Prettier** for consistent code formatting.
- **ESLint** for linting and maintaining code quality.
- **Jest** for unit and end-to-end testing.
- **File Upload Handling** with `FileInterceptor` in NestJS.
- **JWT Authentication** for secure API access with role-based authorization.

## Installation

To install dependencies, run the following command:

```bash
npm install
```

## Available Scripts

This project comes with several predefined scripts to assist with development, testing, and production workflows.

### Development

- `npm run build`: Compiles the project for production.
- `npm run format`: Automatically formats the TypeScript files using Prettier.
- `npm run start`: Starts the application in normal mode.
- `npm run start:dev`: Starts the application in watch mode (for development).
- `npm run start:debug`: Starts the application in debug mode with watch enabled.
- `npm run start:prod`: Runs the compiled production build.

### Linting

- `npm run lint`: Lints the code using ESLint, with automatic fixes applied.

### Testing

- `npm run test`: Runs the unit tests with Jest.
- `npm run test:watch`: Runs Jest in watch mode to automatically re-run tests on file changes.
- `npm run test:cov`: Runs tests and provides a code coverage report.
- `npm run test:debug`: Runs Jest with debugging enabled.
- `npm run test:e2e`: Runs end-to-end tests with Jest using the specified configuration.

## Environment Variables

This application reads environment variables from the operating system or Docker Compose environment. Make sure to configure the necessary variables to ensure the application functions correctly.


## Folder Structure

- `src/`: Contains the main application code, including modules, controllers, and services.
- `test/`: Contains test files, both unit and end-to-end tests.
- `libs/`: Contains shared libraries or utilities.

## Contributing

If you'd like to contribute to this project, please fork the repository and create a pull request with your changes. Be sure to run the linting and tests before submitting your changes.

## License

This project is licensed under the MIT License.
```

### Key Points:
1. **Installation and Setup**: The `README` includes instructions for setting up the project with `npm install`.
2. **Scripts Section**: Each script provided (such as `build`, `start`, `test`, etc.) is explained.
3. **Testing & Debugging**: Instructions for running tests with Jest and debugging with `test:debug`.
4. **Folder Structure**: A general explanation of where key project files are located.
5. **Contributing**: Guidelines for contributing to the project.

You can customize and expand this template according to the project's specifics, such as adding details about specific routes, services, or any special configurations needed.