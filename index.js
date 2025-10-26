require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const authRoutes = require('./routes/UserRoutes');
const taskRoutes = require('./routes/TaskRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(compression());
const option = {
    explorer: true,
    swaggerOptions: {
        url: './openapi.yaml'
    }
}
connectDB(process.env.MONGO_URI);

app.use('/api/auth/v1/users', authRoutes);
app.use('/api/auth/v1/tasks', taskRoutes);

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, option));

app.get('/', (req, res) => {
  res.send('API running. Visit /docs for Swagger UI');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/docs`));
