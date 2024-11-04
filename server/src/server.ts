import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Perceptron } from "./perceptron";
import { Brain } from "./brain";

const PORT = process.env.PORT || 8000;

const application = express();
application.use(express.json());
application.use(morgan('tiny'));
application.use(cors());

const brain = new Brain();

application.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received.');
});
  
process.on('SIGINT', () => {
    console.log('SIGINT signal received.');
});