# Inventory Management System – REST API CLI

## Description

This is an individual laboratory project for an Inventory Management System. A Node.js CLI client communicates with a Node.js and Express REST API to manage Products and Categories. The API stores data in JSON files and supports CRUD operations: create, read, update, and delete.

## Developer Information

- Developer: Stephen Ruiz
- Course/Program: BSIT
- Project type: Individual Laboratory Activity

## Technologies Used

- Node.js
- JavaScript
- Express.js
- Node.js CLI
- REST API
- JSON
- Node.js built-in Fetch API
- Node.js `readline/promises`

## System Overview

The user interacts with the CLI client. The CLI sends HTTP requests to the REST API, and the API reads or updates the JSON data files. The API returns JSON responses, which the CLI processes and displays in a readable format.

## API Information

- API type: REST API
- Base URL: `http://localhost:3000/api`
- Server technology: Node.js with Express.js
- Data format: JSON

The API provides endpoints for the Products and Categories resources.

## API Endpoints

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/products` | Retrieve all products |
| GET | `/api/products/:id` | Retrieve one product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

### Categories

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/categories` | Retrieve all categories |
| GET | `/api/categories/:id` | Retrieve one category by ID |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |

## Architecture

```text
User
	|
	v
CLI Client
	|
	v
HTTP Requests
	|
	v
REST API
	|
	v
JSON Data Files
	|
	v
JSON Response
	|
	v
CLI Client
	|
	v
User
```

- `api/`: Contains the Express REST API.
- `api/server.js`: Starts the server and defines the resource endpoints, validation, and JSON file operations.
- `api/data/`: Contains `products.json` and `categories.json`.
- `cli/`: Contains the terminal client.
- `cli/index.js`: Displays the menu, accepts user input, sends API requests, and formats responses.

## Project Structure

```text
SYSTEM INTEGRATION - REST API CLI/
|-- api/
|   |-- server.js
|   |-- package.json
|   |-- package-lock.json
|   `-- data/
|       |-- products.json
|       `-- categories.json
|-- cli/
|   |-- index.js
|   `-- package.json
|-- README.md
`-- .gitignore
```

## Features

- Menu-driven CLI
- Product management
- Category management
- GET, POST, PUT, and DELETE requests
- JSON request and response processing
- Input validation
- HTTP error handling
- 404 handling
- API connection error handling
- Delete confirmation
- Continuous menu until Exit

## Installation

1. Open the project folder in VS Code.
2. Open a terminal in the project folder.
3. Install the API dependency:

	 ```powershell
	 cd api
	 npm install
	 ```

4. The CLI has no external dependencies, so no CLI installation command is required.
5. Start the REST API by following the instructions below.

## How to Run the API

From the project folder, open a terminal and run:

	 ```powershell
	 cd api
	 npm start
	 ```

The API runs at `http://localhost:3000`. Leave this terminal running.

## How to Run the CLI

Open a second terminal in the project folder and run:

	 ```powershell
	 cd cli
	 npm start
	 ```

The API must be running before using the CLI.

## How to Use the System

Start the API first in one terminal, then start the CLI in a second terminal.

```text
========================================
				INVENTORY API CLI CLIENT
========================================
PRODUCTS
1. View Products
2. Search Product
3. Add Product
4. Update Product
5. Delete Product

CATEGORIES
6. View Categories
7. Add Category
8. Update Category
9. Delete Category
10. Exit
========================================
Enter choice:
```

- `1. View Products`: Displays all products.
- `2. Search Product`: Finds a product by ID.
- `3. Add Product`: Creates a product after validating its fields.
- `4. Update Product`: Loads a product, accepts updated values, and sends a PUT request.
- `5. Delete Product`: Displays a product and asks for confirmation before deleting it.
- `6. View Categories`: Displays all categories.
- `7. Add Category`: Creates a category after validating its name.
- `8. Update Category`: Loads and updates a category.
- `9. Delete Category`: Displays a category and asks for confirmation before deleting it.
- `10. Exit`: Closes the CLI.

After each operation, the main menu appears again until the user selects Exit.

## JSON Processing

The CLI sends JSON data for POST and PUT requests. It uses `JSON.stringify()` to create request bodies, parses API responses with `response.json()`, and converts those JSON responses into readable product, category, success, and error messages.

## Error Handling and Validation

Input validation is performed by both the CLI and the API. Required text fields cannot be empty, product prices and quantities cannot be negative, product category IDs must be positive whole numbers, and IDs must be positive whole numbers.

The CLI handles:

- Invalid menu choices
- Invalid or non-numeric IDs
- Empty required fields
- Negative price and quantity values
- HTTP 400 validation responses
- HTTP 404 missing-resource responses
- An unavailable API server
- Fetch connection errors and failed requests
- Unexpected API responses
- Cancelled delete operations

Errors are displayed to the user, and the CLI returns to the menu instead of crashing.

## Screenshots

The demonstration screenshots are not currently saved in this project folder. Add the captured images to a `screenshots/` folder before the final submission. The required images are the CLI Main Menu, GET Products, POST Add Product, PUT Update Product or DELETE Product, and Error Handling demonstrations. No image references are included here until the actual files are added.

### CLI Main Menu

`[Screenshot to be added]`

### GET Products

`[Screenshot to be added]`

### POST Add Product

`[Screenshot to be added]`

### PUT Update Product

`[Screenshot to be added]`

### DELETE Product

`[Screenshot to be added]`

### Error Handling

`[Screenshot to be added]`

## Testing

Testing covered:

- GET Products and GET Categories
- Searching for existing and nonexistent products
- Adding Products and Categories with POST
- Updating Products and Categories with PUT
- Deleting Products and Categories with DELETE
- Invalid IDs and invalid input
- HTTP 404 responses
- API connection failure
- Delete cancellation
- Menu continuation after errors

Temporary test records were removed after testing, leaving the sample JSON data clean.

## Limitations

- Runs locally on the developer's computer.
- Uses local JSON files instead of a production database.
- Has no authentication.
- Provides a CLI interface only.

## GitHub Repository

The project can be uploaded to a GitHub repository named `API-CLI-StephenRuiz`. GitHub setup and publishing are separate from the application implementation.
