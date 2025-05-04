const swaggerJsdoc = require("swagger-jsdoc");
const tags = require("./tags");

const environment = process.env.NODE_ENV || "development";
const server_url = process.env.SERVER_URL || "http://localhost:3000";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "SkillHub API Documentation",
      version: "1.0.0",
      description: "API documentation for the SkillHub platform",
      contact: {
        name: "SkillHub Support",
      },
    },
    tags: tags,
    servers: [
      {
        url: server_url,
        description: `${capitalizeFirstLetter(environment)} Server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
