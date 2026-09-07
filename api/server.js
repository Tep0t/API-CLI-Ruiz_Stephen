const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, 'data');

app.use(express.json());

const resourceRules = {
  products: {
    file: path.join(dataDirectory, 'products.json'),
    requiredFields: ['name', 'price', 'categoryId', 'quantity'],
    validate(record) {
      return typeof record.name === 'string' && record.name.trim() !== ''
        && typeof record.price === 'number' && Number.isFinite(record.price) && record.price >= 0
        && Number.isInteger(record.categoryId) && record.categoryId > 0
        && Number.isInteger(record.quantity) && record.quantity >= 0;
    }
  },
  categories: {
    file: path.join(dataDirectory, 'categories.json'),
    requiredFields: ['name'],
    validate(record) {
      return typeof record.name === 'string' && record.name.trim() !== ''
        && (record.description === undefined || typeof record.description === 'string');
    }
  }
};

async function readRecords(resource) {
  const contents = await fs.readFile(resource.file, 'utf8');
  return JSON.parse(contents);
}

async function writeRecords(resource, records) {
  await fs.writeFile(resource.file, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function missingFields(body, requiredFields) {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  return requiredFields.filter((field) => input[field] === undefined || input[field] === null);
}

function createResourceRoutes(resourceName) {
  const resource = resourceRules[resourceName];
  const route = `/api/${resourceName}`;
  const resourceLabel = resourceName === 'categories' ? 'category' : 'product';

  app.get(route, async (request, response, next) => {
    try {
      response.json(await readRecords(resource));
    } catch (error) {
      next(error);
    }
  });

  app.get(`${route}/:id`, async (request, response, next) => {
    const id = parseId(request.params.id);
    if (id === null) {
      return response.status(400).json({ error: 'ID must be a positive integer.' });
    }

    try {
      const record = (await readRecords(resource)).find((item) => item.id === id);
      if (!record) {
        return response.status(404).json({ error: `${resourceLabel} not found.` });
      }
      return response.json(record);
    } catch (error) {
      return next(error);
    }
  });

  app.post(route, async (request, response, next) => {
    const body = request.body;
    const missing = missingFields(body, resource.requiredFields);
    if (missing.length > 0 || !resource.validate(body)) {
      return response.status(400).json({
        error: 'Validation failed.',
        missingFields: missing
      });
    }

    try {
      const records = await readRecords(resource);
      const nextId = records.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1;
      const newRecord = { id: nextId, ...body };
      records.push(newRecord);
      await writeRecords(resource, records);
      return response.status(201).json(newRecord);
    } catch (error) {
      return next(error);
    }
  });

  app.put(`${route}/:id`, async (request, response, next) => {
    const id = parseId(request.params.id);
    if (id === null) {
      return response.status(400).json({ error: 'ID must be a positive integer.' });
    }

    const missing = missingFields(request.body, resource.requiredFields);
    if (missing.length > 0) {
      return response.status(400).json({ error: 'Validation failed.', missingFields: missing });
    }

    try {
      const records = await readRecords(resource);
      const recordIndex = records.findIndex((item) => item.id === id);
      if (recordIndex === -1) {
        return response.status(404).json({ error: `${resourceLabel} not found.` });
      }

      const updatedRecord = { id, ...request.body };
      if (!resource.validate(updatedRecord)) {
        return response.status(400).json({ error: 'Validation failed.' });
      }
      records[recordIndex] = updatedRecord;
      await writeRecords(resource, records);
      return response.json(updatedRecord);
    } catch (error) {
      return next(error);
    }
  });

  app.delete(`${route}/:id`, async (request, response, next) => {
    const id = parseId(request.params.id);
    if (id === null) {
      return response.status(400).json({ error: 'ID must be a positive integer.' });
    }

    try {
      const records = await readRecords(resource);
      const recordIndex = records.findIndex((item) => item.id === id);
      if (recordIndex === -1) {
        return response.status(404).json({ error: `${resourceLabel} not found.` });
      }

      const deletedRecord = records.splice(recordIndex, 1)[0];
      await writeRecords(resource, records);
      return response.json({ message: 'Record deleted successfully.', record: deletedRecord });
    } catch (error) {
      return next(error);
    }
  });
}

createResourceRoutes('products');
createResourceRoutes('categories');

app.use((request, response) => {
  response.status(404).json({ error: 'Endpoint not found.' });
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body !== undefined) {
    return response.status(400).json({ error: 'Request body contains invalid JSON.' });
  }
  console.error(error);
  return response.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Inventory API running at http://localhost:${PORT}`);
  });
}

module.exports = app;
