const readline = require('readline/promises');
const { stdin, stdout } = require('process');

const input = readline.createInterface({ input: stdin, output: stdout });
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

function showMenu() {
	console.log('\n========================================');
	console.log('        INVENTORY API CLI CLIENT');
	console.log('========================================');
	console.log('PRODUCTS');
	console.log('1. View Products');
	console.log('2. Search Product');
	console.log('3. Add Product');
	console.log('4. Update Product');
	console.log('5. Delete Product');
	console.log('\nCATEGORIES');
	console.log('6. View Categories');
	console.log('7. Add Category');
	console.log('8. Update Category');
	console.log('9. Delete Category');
	console.log('10. Exit');
	console.log('========================================');
}

async function requestApi(endpoint, options = {}) {
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
		let data;

		try {
			data = await response.json();
		} catch (error) {
			throw new Error('The API returned an unexpected response.');
		}

		if (!response.ok) {
			const message = data && data.error ? data.error : `Request failed with status ${response.status}.`;
			return { success: false, message };
		}

		return { success: true, data };
	} catch (error) {
		return {
			success: false,
			message: error.message.includes('fetch failed')
				? 'Could not connect to the API. Make sure the API server is running.'
				: error.message
		};
	}
}

function displayError(message) {
	console.log(`\nError: ${message}`);
}

function displayProduct(product) {
	console.log(`ID: ${product.id}`);
	console.log(`Name: ${product.name}`);
	console.log(`Price: $${Number(product.price).toFixed(2)}`);
	console.log(`Quantity: ${product.quantity}`);
	if (product.categoryId !== undefined) {
		console.log(`Category ID: ${product.categoryId}`);
	}
}

function displayProducts(products) {
	if (!Array.isArray(products) || products.length === 0) {
		console.log('\nNo products found.');
		return;
	}

	console.log('\nPRODUCTS');
	products.forEach((product) => {
		console.log('\n--------------------');
		displayProduct(product);
	});
}

function displayCategory(category) {
	console.log(`ID: ${category.id}`);
	console.log(`Name: ${category.name}`);
	if (category.description) {
		console.log(`Description: ${category.description}`);
	}
}

function displayCategories(categories) {
	if (!Array.isArray(categories) || categories.length === 0) {
		console.log('\nNo categories found.');
		return;
	}

	console.log('\nCATEGORIES');
	categories.forEach((category) => {
		console.log('\n--------------------');
		displayCategory(category);
	});
}

async function viewProducts() {
	const result = await requestApi('/products');
	if (result.success) {
		displayProducts(result.data);
	} else {
		displayError(result.message);
	}
}

async function searchProduct() {
	const value = (await input.question('Enter product ID: ')).trim();
	const id = Number(value);
	if (!Number.isInteger(id) || id <= 0) {
		displayError('Product ID must be a positive whole number.');
		return;
	}

	const result = await requestApi(`/products/${id}`);
	if (result.success) {
		console.log('\nPRODUCT FOUND');
		displayProduct(result.data);
	} else {
		displayError(result.message);
	}
}

async function viewCategories() {
	const result = await requestApi('/categories');
	if (result.success) {
		displayCategories(result.data);
	} else {
		displayError(result.message);
	}
}

async function askRequiredText(prompt, fieldName) {
	while (true) {
		const value = (await input.question(prompt)).trim();
		if (value) {
			return value;
		}
		console.log(`${fieldName} cannot be empty.`);
	}
}

async function askRequiredTextWithDefault(prompt, currentValue, fieldName) {
	while (true) {
		const value = (await input.question(`${prompt} [${currentValue}]: `)).trim();
		if (value) {
			return value;
		}
		if (value === '' && currentValue) {
			return currentValue;
		}
		console.log(`${fieldName} cannot be empty.`);
	}
}

async function askNonNegativeNumber(prompt, fieldName, wholeNumber = false) {
	while (true) {
		const value = (await input.question(prompt)).trim();
		const number = Number(value);
		const valid = value !== '' && Number.isFinite(number) && number >= 0
			&& (!wholeNumber || Number.isInteger(number));
		if (valid) {
			return number;
		}
		console.log(`${fieldName} must be a valid ${wholeNumber ? 'whole ' : ''}number that is not negative.`);
	}
}

async function askNonNegativeNumberWithDefault(prompt, currentValue, fieldName, wholeNumber = false) {
	while (true) {
		const value = (await input.question(`${prompt} [${currentValue}]: `)).trim();
		const number = value === '' ? currentValue : Number(value);
		const valid = Number.isFinite(number) && number >= 0
			&& (!wholeNumber || Number.isInteger(number));
		if (valid) {
			return number;
		}
		console.log(`${fieldName} must be a valid ${wholeNumber ? 'whole ' : ''}number that is not negative.`);
	}
}

async function addProduct() {
	const product = {
		name: await askRequiredText('Product name: ', 'Product name'),
		price: await askNonNegativeNumber('Price: ', 'Price'),
		categoryId: await askNonNegativeNumber('Category ID: ', 'Category ID', true),
		quantity: await askNonNegativeNumber('Quantity: ', 'Quantity', true)
	};

	if (product.categoryId === 0) {
		displayError('Category ID must be a positive whole number.');
		return;
	}

	const result = await requestApi('/products', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(product)
	});
	if (result.success) {
		console.log('\nProduct added successfully.');
		displayProduct(result.data);
	} else {
		displayError(result.message);
	}
}

async function addCategory() {
	const category = {
		name: await askRequiredText('Category name: ', 'Category name'),
		description: (await input.question('Description (optional): ')).trim()
	};

	const result = await requestApi('/categories', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(category)
	});
	if (result.success) {
		console.log('\nCategory added successfully.');
		displayCategory(result.data);
	} else {
		displayError(result.message);
	}
}

async function updateProduct() {
	const value = (await input.question('Enter product ID: ')).trim();
	const id = Number(value);
	if (!Number.isInteger(id) || id <= 0) {
		displayError('Product ID must be a positive whole number.');
		return;
	}

	const existingResult = await requestApi(`/products/${id}`);
	if (!existingResult.success) {
		displayError(existingResult.message);
		return;
	}

	const existingProduct = existingResult.data;
	const product = {
		name: await askRequiredTextWithDefault('Product name', existingProduct.name, 'Product name'),
		price: await askNonNegativeNumberWithDefault('Price', existingProduct.price, 'Price'),
		categoryId: await askNonNegativeNumberWithDefault('Category ID', existingProduct.categoryId, 'Category ID', true),
		quantity: await askNonNegativeNumberWithDefault('Quantity', existingProduct.quantity, 'Quantity', true)
	};

	if (product.categoryId === 0) {
		displayError('Category ID must be a positive whole number.');
		return;
	}

	const result = await requestApi(`/products/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(product)
	});
	if (result.success) {
		console.log('\nProduct updated successfully.');
		displayProduct(result.data);
	} else {
		displayError(result.message);
	}
}

async function updateCategory() {
	const value = (await input.question('Enter category ID: ')).trim();
	const id = Number(value);
	if (!Number.isInteger(id) || id <= 0) {
		displayError('Category ID must be a positive whole number.');
		return;
	}

	const existingResult = await requestApi(`/categories/${id}`);
	if (!existingResult.success) {
		displayError(existingResult.message);
		return;
	}

	const existingCategory = existingResult.data;
	const category = {
		name: await askRequiredTextWithDefault('Category name', existingCategory.name, 'Category name'),
		description: (await input.question(`Description [${existingCategory.description || ''}]: `)).trim()
	};

	const result = await requestApi(`/categories/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(category)
	});
	if (result.success) {
		console.log('\nCategory updated successfully.');
		displayCategory(result.data);
	} else {
		displayError(result.message);
	}
}

async function askDeleteConfirmation() {
	while (true) {
		const confirmation = (await input.question('Confirm deletion (y/yes or n/no): ')).trim().toLowerCase();
		if (confirmation === 'y' || confirmation === 'yes') {
			return true;
		}
		if (confirmation === 'n' || confirmation === 'no') {
			return false;
		}
		console.log('Please enter y/yes to continue or n/no to cancel.');
	}
}

async function deleteResource(resourceName, displayRecord) {
	const label = resourceName === 'products' ? 'product' : 'category';
	const value = (await input.question(`Enter ${label} ID: `)).trim();
	const id = Number(value);
	if (!Number.isInteger(id) || id <= 0) {
		displayError(`${label[0].toUpperCase()}${label.slice(1)} ID must be a positive whole number.`);
		return;
	}

	const existingResult = await requestApi(`/${resourceName}/${id}`);
	if (!existingResult.success) {
		displayError(existingResult.message);
		return;
	}

	console.log(`\n${label.toUpperCase()} TO DELETE`);
	displayRecord(existingResult.data);
	if (!await askDeleteConfirmation()) {
		console.log('\nDeletion cancelled.');
		return;
	}

	const result = await requestApi(`/${resourceName}/${id}`, { method: 'DELETE' });
	if (result.success) {
		console.log(`\n${label[0].toUpperCase()}${label.slice(1)} deleted successfully.`);
	} else {
		displayError(result.message);
	}
}

async function deleteProduct() {
	await deleteResource('products', displayProduct);
}

async function deleteCategory() {
	await deleteResource('categories', displayCategory);
}

async function startCli() {
	let running = true;

	while (running) {
		showMenu();
		const choice = (await input.question('Enter choice: ')).trim();

		switch (choice) {
			case '1':
				await viewProducts();
				break;
			case '2':
				await searchProduct();
				break;
			case '3':
				await addProduct();
				break;
			case '4':
				await updateProduct();
				break;
			case '5':
				await deleteProduct();
				break;
			case '6':
				await viewCategories();
				break;
			case '7':
				await addCategory();
				break;
			case '8':
				await updateCategory();
				break;
			case '9':
				await deleteCategory();
				break;
			case '10':
				running = false;
				console.log('\nGoodbye!');
				break;
			default:
				console.log('\nInvalid choice. Please enter a number from 1 to 10.');
		}
	}

	input.close();
}

startCli();
